import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { checkQuotaForRun } from "@/lib/security/quota";
import { recordAuthEvent, extractRequestMeta } from "@/lib/security/audit";
import { getClaudeClient } from "@/lib/claude/client";
import { PLANNER_MODEL, PLANNER_MAX_TOKENS, PLANNER_THINKING_EFFORT } from "@/lib/ai/models";
import { calculateCost } from "@/lib/ai/cost";
import { SYSTEM_PROMPTS } from "@/lib/claude/prompts";
import { buildUserContextBlock, buildReferencePackBlock } from "@/lib/agents/context";
import { buildPlanV2Prompt, extractJson } from "@/lib/studio/prompts";
import type {
  PlanInputV2,
  PlanSpecV2,
  AutomationHook,
  ContentSeed,
} from "@/lib/studio/templates";
import type Anthropic from "@anthropic-ai/sdk";

/**
 * 기획 코어 v2 — 비서 자동화 룰북 생성.
 *
 * 보안 가드:
 *  - CSRF (verifySameOrigin) → Auth (getSession) → Rate Limit → Quota
 *  - Zod 입력 검증 (4 비서 scope별 discriminated union)
 *  - 멀티테넌트 격리 (모든 DB 쿼리 user_id 필터)
 *  - automationHooks의 발행/송신/결제 액션은 requiresApproval=true 강제 (서버 측 검증)
 *  - 응답에는 시스템 프롬프트 절대 노출하지 않음
 *  - thinking blocks는 사용자 본인의 기획서에만 표시 (다른 user 접근 불가)
 */

const SCOPE_TO_AGENT: Record<PlanInputV2["scope"], "marketing" | "detail_page" | "ads" | "finance"> = {
  marketing: "marketing",
  detail_page: "detail_page",
  ads: "ads",
  finance: "finance",
};

// 4 비서 입력 Zod 스키마 (discriminated union)
const FoundationSchema = {
  brandIdentity: z.string().trim().min(5).max(300),
  targetPersona: z.string().trim().min(5).max(500),
  voiceTone: z.string().trim().min(3).max(300),
  forbidden: z.array(z.string().trim().max(60)).max(30),
};

const Schema = z.discriminatedUnion("scope", [
  z.object({
    ...FoundationSchema,
    scope: z.literal("marketing"),
    channelsAndCadence: z.string().trim().min(3).max(300),
    contentMixHint: z.string().trim().min(3).max(300),
    quarterlyAnchors: z.string().trim().min(3).max(500),
    operationalConstraints: z.string().trim().max(500).optional(),
  }),
  z.object({
    ...FoundationSchema,
    scope: z.literal("detail_page"),
    sectionStructurePreference: z.string().trim().min(3).max(500),
    trustElements: z.string().trim().min(3).max(500),
    seoKeywordPool: z.string().trim().min(3).max(500),
    abTestPriority: z.string().trim().max(300).optional(),
  }),
  z.object({
    ...FoundationSchema,
    scope: z.literal("ads"),
    channelPriority: z.string().trim().min(3).max(300),
    dailyBudget: z.string().trim().min(1).max(100),
    biddingStrategy: z.string().trim().min(3).max(500),
    forbiddenAdPatterns: z.string().trim().max(500).optional(),
    retargetingWindows: z.string().trim().max(300).optional(),
  }),
  z.object({
    ...FoundationSchema,
    scope: z.literal("finance"),
    settlementCycle: z.string().trim().min(3).max(500),
    categoryRules: z.string().trim().min(3).max(500),
    profitThresholds: z.string().trim().min(3).max(500),
    adBudgetLimit: z.string().trim().max(300).optional(),
    alertRules: z.string().trim().max(500).optional(),
  }),
]);

/**
 * automationHook 보안 강제 — 발행/송신/결제 액션은 사용자 승인 강제.
 * AI가 requiresApproval: false로 만든 위험 액션도 서버에서 true로 강제 변경.
 */
const HIGH_RISK_ACTIONS = new Set([
  "publish",
  "send_dm",
  "send_email",
  "send_sms",
  "transfer_funds",
  "pause_campaign",
  "increase_budget",
  "post_to_channel",
  "send_reply",
]);
function enforceApprovalGuards(hooks: AutomationHook[] | undefined): AutomationHook[] {
  if (!Array.isArray(hooks)) return [];
  return hooks.map((h) => {
    const action = String(h.action || "").toLowerCase();
    const isHighRisk = Array.from(HIGH_RISK_ACTIONS).some((kw) => action.includes(kw));
    return {
      ...h,
      action: String(h.action || ""),
      params: (h.params && typeof h.params === "object") ? h.params : {},
      requiresApproval: isHighRisk ? true : Boolean(h.requiresApproval),
    };
  });
}

/**
 * contentSeeds 안전 보정 — date 형식, autoExecutable 강제 false 처리 (민감주제).
 */
function sanitizeContentSeeds(seeds: ContentSeed[] | undefined): ContentSeed[] {
  if (!Array.isArray(seeds)) return [];
  const SENSITIVE_KEYWORDS = ["정치", "종교", "성", "투자권유", "의료효과", "100%", "최고", "최저"];
  return seeds
    .filter((s) => s && typeof s === "object")
    .map((s) => {
      const title = String(s.title || "").slice(0, 80);
      const angle = String(s.angle || "").slice(0, 300);
      const sensitive = SENSITIVE_KEYWORDS.some((kw) => title.includes(kw) || angle.includes(kw));
      return {
        week: Number.isFinite(s.week) ? Math.max(1, Math.min(8, Math.trunc(s.week))) : 1,
        date: typeof s.date === "string" ? s.date.slice(0, 10) : "",
        channel: String(s.channel || "").slice(0, 40),
        category: String(s.category || "").slice(0, 60),
        title,
        angle,
        hashtags: Array.isArray(s.hashtags) ? s.hashtags.slice(0, 15).map((h) => String(h).slice(0, 40)) : [],
        autoExecutable: sensitive ? false : Boolean(s.autoExecutable),
      };
    });
}

export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:studio-plan:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` },
      rateLimitResponseInit(rl.retryAfterSec),
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY 미설정" }, { status: 503 });
  }

  const quota = checkQuotaForRun(session.userId, { trigger: "manual" });
  if (!quota.ok) {
    recordAuthEvent({
      kind: "quota_exceeded",
      ...extractRequestMeta(request),
      user_id: session.userId,
      email: session.email,
      detail: `studio-plan-v2 usage=${quota.usage}/${quota.limit ?? "∞"}`,
    });
    return NextResponse.json({ error: quota.reason, usage: quota.usage, limit: quota.limit }, { status: 402 });
  }

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 }); }
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(" / ") },
      { status: 400 },
    );
  }
  const input = parsed.data as PlanInputV2;

  const claude = getClaudeClient();
  const agentTypeForContext = SCOPE_TO_AGENT[input.scope];
  const userContext = buildUserContextBlock(session.userId, { agentType: agentTypeForContext });
  const referencePack = buildReferencePackBlock(session.userId, { agentType: agentTypeForContext });
  const baseSystem = SYSTEM_PROMPTS[agentTypeForContext] || "";

  // 자가 학습 메모 — 같은 scope의 이전 기획서 1건의 self_learning을 컨텍스트로 주입
  let selfLearningHint = "";
  try {
    const recent = db.listPlanRuns(session.userId, { scope: input.scope, limit: 1 });
    if (recent.length > 0 && recent[0].self_learning) {
      const prev = JSON.parse(recent[0].self_learning) as Record<string, unknown>;
      if (prev && Object.keys(prev).length > 0) {
        selfLearningHint = `\n\n[이전 기획서로부터의 학습 메모]\n${JSON.stringify(prev).slice(0, 1500)}`;
      }
    }
  } catch {}

  const strategyPreamble = `당신은 지금 "기획 코어 v2" 모드입니다. 이 산출물은 보고서가 아니라 비서가 4주 동안 자동 운영할 룰북입니다.
브랜드 정체성·타겟·콘텐츠 운영 룰을 깊이 반영해서, 사용자가 클릭 한 번에 자동화 큐에 등록할 수 있는 형식의 PlanSpecV2 JSON을 만드세요.${selfLearningHint}`;

  const systemBlocks: Anthropic.TextBlockParam[] = [
    { type: "text", text: strategyPreamble + "\n\n" + baseSystem, cache_control: { type: "ephemeral" } },
    ...(referencePack ? [{ type: "text" as const, text: referencePack, cache_control: { type: "ephemeral" as const } }] : []),
    ...(userContext ? [{ type: "text" as const, text: userContext }] : []),
  ];

  const userPrompt = buildPlanV2Prompt(input);

  let response: Anthropic.Message;
  try {
    response = await claude.messages.create({
      model: PLANNER_MODEL,
      max_tokens: PLANNER_MAX_TOKENS,
      thinking: { type: "adaptive" },
      output_config: { effort: PLANNER_THINKING_EFFORT },
      system: systemBlocks,
      messages: [{ role: "user", content: userPrompt }],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Claude 호출 실패";
    return NextResponse.json({ error: `AI 호출 오류: ${msg}` }, { status: 502 });
  }

  // 비용 계산
  const usage = response.usage;
  const cost = calculateCost({
    inputTokens: usage.input_tokens || 0,
    outputTokens: usage.output_tokens || 0,
    cacheReadTokens: (usage as { cache_read_input_tokens?: number }).cache_read_input_tokens || 0,
    cacheCreationTokens: (usage as { cache_creation_input_tokens?: number }).cache_creation_input_tokens || 0,
    model: PLANNER_MODEL,
  });

  // 토큰 기록 (전역 집계용)
  try {
    db.recordTokenUsage({
      user_id: session.userId,
      session_id: null,
      agent_type: agentTypeForContext,
      model: PLANNER_MODEL,
      input_tokens: cost.inputTokens,
      output_tokens: cost.outputTokens,
      cache_read_tokens: cost.cacheReadTokens,
      cache_creation_tokens: cost.cacheCreationTokens,
    });
  } catch {}

  // thinking blocks 추출 (보고서 상세 페이지에서 표시)
  const thinkingBlocks: { text: string }[] = [];
  for (const b of response.content) {
    if (b.type === "thinking") {
      const text = (b as { thinking?: string }).thinking || "";
      if (text) thinkingBlocks.push({ text });
    }
  }

  // text 응답에서 JSON 추출
  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as Anthropic.TextBlock).text)
    .join("\n");

  const spec = extractJson<PlanSpecV2>(text);
  if (!spec || !spec.summary || !Array.isArray(spec.contentSeeds) || !Array.isArray(spec.publishingPlan)) {
    return NextResponse.json(
      { error: "기획 코어가 올바른 형식의 룰북을 만들지 못했습니다. 입력을 더 구체적으로 작성해 주세요.", raw: text.slice(0, 600) },
      { status: 422 },
    );
  }

  // 보안 보정 — AI가 만든 결과를 신뢰하지 않고 서버에서 강제 검증
  spec.version = 2;
  spec.scope = input.scope;
  spec.automationHooks = enforceApprovalGuards(spec.automationHooks);
  spec.contentSeeds = sanitizeContentSeeds(spec.contentSeeds);
  // brandRules.forbidden — 사용자 입력 forbidden과 합치고 중복 제거
  if (spec.brandRules) {
    const merged = new Set<string>([
      ...input.forbidden.map((s) => s.trim()).filter(Boolean),
      ...(Array.isArray(spec.brandRules.forbidden) ? spec.brandRules.forbidden : []).map((s) => String(s).trim()).filter(Boolean),
    ]);
    spec.brandRules.forbidden = Array.from(merged).slice(0, 60);
  }
  // summary.nextSevenDaysCount 재계산 (AI 신뢰 X)
  const today = new Date(); today.setHours(0,0,0,0);
  const sevenDays = new Date(today.getTime() + 7 * 24 * 3600 * 1000);
  let count7 = 0;
  for (const s of spec.contentSeeds) {
    const d = new Date(s.date);
    if (!isNaN(d.getTime()) && d >= today && d <= sevenDays) count7++;
  }
  if (spec.summary) spec.summary.nextSevenDaysCount = count7;

  // 저장
  let runId: string | null = null;
  try {
    const row = db.createPlanRun(session.userId, {
      scope: input.scope,
      input_json: JSON.stringify(input),
      spec_json: JSON.stringify(spec),
      thinking_json: JSON.stringify(thinkingBlocks),
      cost_json: JSON.stringify(cost),
      self_learning: JSON.stringify({
        createdAt: new Date().toISOString(),
        inputBrandIdentity: input.brandIdentity,
        seedsCount: spec.contentSeeds.length,
        autoExecutableCount: spec.contentSeeds.filter((s) => s.autoExecutable).length,
      }),
    });
    runId = row.id;
  } catch (e) {
    return NextResponse.json({ error: `기획서 저장 실패: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
  }

  // 응답: 요약 카드용 + 전체 spec + cost. thinking은 포함하지 않음 (상세 페이지에서 별도 GET).
  return NextResponse.json({
    ok: true,
    runId,
    summary: spec.summary,
    spec,
    cost,
    securityNotes: {
      automationHooksGuarded: spec.automationHooks.filter((h) => h.requiresApproval).length,
      autoExecutableSeeds: spec.contentSeeds.filter((s) => s.autoExecutable).length,
      forbiddenCount: spec.brandRules?.forbidden?.length || 0,
    },
  });
}
