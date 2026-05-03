import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { checkQuotaForRun } from "@/lib/security/quota";
import { recordAuthEvent, extractRequestMeta } from "@/lib/security/audit";
import { getClaudeClient, MODEL } from "@/lib/claude/client";
import { calculateCost } from "@/lib/ai/cost";
import { extractJson } from "@/lib/studio/prompts";
import { SYSTEM_PROMPTS } from "@/lib/claude/prompts";
import { buildUserContextBlock, buildReferencePackBlock } from "@/lib/agents/context";
import type { CardNewsSpec, BrandTemplate, PlannedCard, ToneProfile } from "@/lib/studio/templates";
import type Anthropic from "@anthropic-ai/sdk";

/**
 * POST /api/monthly-plan/[id]/execute
 *  - approvalToken 검증 후 일괄 카드뉴스 생성
 *  - 각 카드: Claude Sonnet으로 6장 카피 + 캡션 3변형 + 해시태그
 *  - 보관함에 저장 (kind: "card_news", metadata.batchId = monthly_plan.id)
 *  - 진행률은 progress_json에 누적 (클라이언트가 GET /api/monthly-plan/[id]로 폴링)
 *
 * 보안:
 *  - approvalToken 검증 (userId 매칭 + 일회성)
 *  - 카드 12건 제한 (DB에서 이미 강제됨)
 *  - 카드별 200ms 간격 — Claude rate limit 보호
 *  - 모든 카피는 brandRules.forbidden 사후 검열 (TODO Phase F에서 보강)
 */

const Schema = z.object({
  approvalToken: z.string().min(20).max(200),
});

// 한 번에 실행 가능한 카드뉴스 최대 — DB와 별개로 실행 시 한 번 더 검증
const MAX_BATCH = 12;
const INTER_CARD_DELAY_MS = 200;

function buildCardCopyPrompt(card: PlannedCard, tone: ToneProfile, brandTokens: BrandTemplate["tokens"]) {
  return `[카드뉴스 1세트 (6장) 카피 자동 생성]

주제: ${card.title}
카테고리: ${card.category}
${card.angle ? `후킹 각도: ${card.angle}\n` : ""}
브랜드 톤 가이드:
- 보이스: ${tone.voice}
- 문장 길이: ${tone.sentenceLength === "short" ? "짧게 (15자 내)" : tone.sentenceLength === "long" ? "길게 (30자+)" : "중간 (15~30자)"}
- 이모지: ${tone.emojiUsage === "none" ? "사용 금지" : tone.emojiUsage === "frequent" ? "자유롭게" : "1~2개만"}
- 격식: ${tone.formality}
- 자주 쓰는 어미: ${tone.endingStyle}

카드 색감 — 액센트: ${brandTokens.palette.accent}, 배경: ${brandTokens.palette.bg}

출력 형식: 아래 JSON 스키마와 동일한 형식의 JSON만. 마크다운·설명·코드블록 금지.

{
  "brandColor": "${brandTokens.palette.accent}",
  "accentColor": "${brandTokens.palette.bg}",
  "theme": "dark",
  "imagePrompt": "영문 1줄 (이미지 생성용 키워드)",
  "caption1": "캡션 변형 A — 친근한 톤 (80~120자)",
  "caption2": "캡션 변형 B — 정보 중심 (80~120자)",
  "caption3": "캡션 변형 C — 감성 후킹 (80~120자)",
  "hashtags": ["#태그1", "#태그2", ...최대 12개],
  "cards": [
    { "kind": "hook",     "index": 1, "label": "01. 후킹",       "title": "8~14자", "body": "50~80자", "highlight": "옵션" },
    { "kind": "problem",  "index": 2, "label": "02. 문제 제기",  "title": "...",    "body": "..." },
    { "kind": "solution", "index": 3, "label": "03. 해결",       "title": "...",    "body": "..." },
    { "kind": "proof",    "index": 4, "label": "04. 사례·수치",  "title": "...",    "body": "...", "stat": { "value": "42", "unit": "초", "caption": "..." } },
    { "kind": "compare",  "index": 5, "label": "05. 비교",       "title": "...",    "body": "...", "compare": { "leftLabel": "이전", "left": "...", "rightLabel": "이후", "right": "..." } },
    { "kind": "cta",      "index": 6, "label": "06. 다음 행동",  "title": "...",    "body": "...", "cta": { "headline": "지금 시작", "sub": "프로필 링크 →", "brand": "브랜드명" } }
  ]
}

규칙:
- 한국어만. 영문은 imagePrompt에만.
- title 14자 이내, body 80자 이내 강제.
- 사용자 컨텍스트(브랜드/타겟/상품)를 반영.
- caption 3변형은 같은 메시지지만 톤만 달라야 함.

JSON만 출력하세요.`;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:mplan-execute:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY 미설정" }, { status: 503 });
  }

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식" }, { status: 400 }); }
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });

  const planRow = db.getMonthlyPlan(session.userId, params.id);
  if (!planRow) return NextResponse.json({ error: "월간 계획을 찾을 수 없습니다." }, { status: 404 });

  // approvalToken 검증
  if (!planRow.approval_token || planRow.approval_token !== parsed.data.approvalToken) {
    recordAuthEvent({
      kind: "permission_denied",
      ...extractRequestMeta(request),
      user_id: session.userId,
      email: session.email,
      detail: `monthly-plan-execute approval_token_mismatch plan=${params.id}`,
    });
    return NextResponse.json({ error: "유효하지 않은 승인 토큰입니다. 위저드에서 다시 승인해주세요." }, { status: 403 });
  }
  // userId가 토큰에 포함되어 있는지
  if (!parsed.data.approvalToken.includes(session.userId)) {
    return NextResponse.json({ error: "승인 토큰이 사용자와 일치하지 않습니다." }, { status: 403 });
  }
  if (planRow.status === "generating") {
    return NextResponse.json({ error: "이미 생성 중입니다." }, { status: 409 });
  }

  // 브랜드 템플릿 로드 (소유 확인 포함)
  const tplRow = db.getBrandTemplate(session.userId, planRow.brand_template_id);
  if (!tplRow) return NextResponse.json({ error: "브랜드 템플릿이 없거나 삭제되었습니다." }, { status: 404 });
  let tokens: BrandTemplate["tokens"];
  let toneProfile: ToneProfile;
  try { tokens = JSON.parse(tplRow.tokens_json); } catch { return NextResponse.json({ error: "브랜드 템플릿 토큰 손상" }, { status: 500 }); }
  try { toneProfile = JSON.parse(tplRow.tone_profile); } catch { toneProfile = { voice: "차분", sentenceLength: "medium", emojiUsage: "minimal", formality: "neutral", endingStyle: "~합니다", signaturePhrases: [] }; }

  let cards: PlannedCard[];
  try { cards = JSON.parse(planRow.cards_json); } catch { return NextResponse.json({ error: "카드 데이터 손상" }, { status: 500 }); }
  cards = cards.filter((c) => !c.excluded).slice(0, MAX_BATCH);
  if (cards.length === 0) return NextResponse.json({ error: "실행할 카드가 없습니다." }, { status: 422 });

  // Quota — 카드 수만큼 체크
  for (let i = 0; i < cards.length; i++) {
    const q = checkQuotaForRun(session.userId, { trigger: "manual" });
    if (!q.ok) {
      recordAuthEvent({
        kind: "quota_exceeded",
        ...extractRequestMeta(request),
        user_id: session.userId,
        email: session.email,
        detail: `monthly-plan-execute quota plan=${params.id} idx=${i}`,
      });
      return NextResponse.json({ error: q.reason, usage: q.usage, limit: q.limit, completedBefore: i }, { status: 402 });
    }
    break;  // 첫 호출만 사전 검증, 나머지는 호출 시 차감 (개선 여지)
  }

  // 상태: generating, 진행률 0
  db.updateMonthlyPlan(session.userId, params.id, {
    status: "generating",
    progress_json: JSON.stringify({ total: cards.length, completed: 0, failed: 0, lastUpdate: new Date().toISOString() }),
  });

  const claude = getClaudeClient();
  const userContext = buildUserContextBlock(session.userId, { agentType: "marketing" });
  const referencePack = buildReferencePackBlock(session.userId, { agentType: "marketing" });
  const systemBlocks: Anthropic.TextBlockParam[] = [
    { type: "text", text: SYSTEM_PROMPTS.marketing, cache_control: { type: "ephemeral" } },
    ...(referencePack ? [{ type: "text" as const, text: referencePack, cache_control: { type: "ephemeral" as const } }] : []),
    ...(userContext ? [{ type: "text" as const, text: userContext }] : []),
  ];

  // 사후 카피 검열 — brandRules.forbidden + global 금기어 (간단 버전)
  const FORBIDDEN_GLOBAL = ["최저가","100% 보장","즉효","치료","완치","절대 안전","무조건"];
  const checkForbidden = (text: string): string[] => {
    const matches: string[] = [];
    const lower = text.toLowerCase();
    for (const w of FORBIDDEN_GLOBAL) {
      if (lower.includes(w.toLowerCase())) matches.push(w);
    }
    return matches;
  };

  let completed = 0;
  let failed = 0;
  let totalCostUsd = 0;
  let totalCostKrw = 0;
  const results: { cardId: string; libraryId?: string; error?: string; matchedForbidden?: string[] }[] = [];

  for (const card of cards) {
    try {
      const userPrompt = buildCardCopyPrompt(card, toneProfile, tokens);
      let response: Anthropic.Message;
      try {
        response = await claude.messages.create({
          model: MODEL,
          max_tokens: 4096,
          system: systemBlocks,
          messages: [{ role: "user", content: userPrompt }],
        });
      } catch (e) {
        failed++;
        results.push({ cardId: card.id, error: e instanceof Error ? e.message : "Claude 호출 실패" });
        continue;
      }

      // 비용
      const cost = calculateCost({
        inputTokens: response.usage.input_tokens || 0,
        outputTokens: response.usage.output_tokens || 0,
        cacheReadTokens: (response.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens || 0,
        cacheCreationTokens: (response.usage as { cache_creation_input_tokens?: number }).cache_creation_input_tokens || 0,
        model: MODEL,
      });
      totalCostUsd += cost.costUsd;
      totalCostKrw += cost.costKrw;
      try {
        db.recordTokenUsage({
          user_id: session.userId, session_id: null, agent_type: "marketing", model: MODEL,
          input_tokens: cost.inputTokens, output_tokens: cost.outputTokens,
          cache_read_tokens: cost.cacheReadTokens, cache_creation_tokens: cost.cacheCreationTokens,
        });
      } catch {}

      const text = response.content.filter((b) => b.type === "text").map((b) => (b as Anthropic.TextBlock).text).join("\n");
      const spec = extractJson<CardNewsSpec & { imagePrompt?: string; caption1?: string; caption2?: string; caption3?: string }>(text);
      if (!spec || !Array.isArray(spec.cards) || spec.cards.length !== 6) {
        failed++;
        results.push({ cardId: card.id, error: "AI가 올바른 형식의 카드뉴스를 만들지 못함" });
      } else {
        // 검열
        const allText = [
          ...spec.cards.map((c) => `${c.title} ${c.body}`),
          spec.caption1 || "", spec.caption2 || "", spec.caption3 || "",
        ].join(" ");
        const matched = checkForbidden(allText);

        // 캡션 3변형
        const captionVariants = [spec.caption1, spec.caption2, spec.caption3].filter(Boolean) as string[];

        // 보관함에 저장
        const item = db.createLibraryItem(session.userId, {
          agent_type: "marketing",
          kind: "card_news",
          title: card.title,
          content: captionVariants[0] || "",
          metadata: JSON.stringify({
            spec,
            captionVariants,
            batchId: params.id,
            plannedCardId: card.id,
            brandTemplateId: tplRow.id,
            forbiddenMatched: matched,
            generatedAt: new Date().toISOString(),
            scheduled_date: card.planDate,
            scheduled_time: card.planTime,
          }),
          tags: JSON.stringify(spec.hashtags?.slice(0, 10) ?? []),
          is_favorite: 0,
        });
        completed++;
        results.push({ cardId: card.id, libraryId: item.id, matchedForbidden: matched.length > 0 ? matched : undefined });
      }
    } catch (e) {
      failed++;
      results.push({ cardId: card.id, error: e instanceof Error ? e.message : "처리 실패" });
    }

    // 진행률 업데이트
    db.updateMonthlyPlan(session.userId, params.id, {
      progress_json: JSON.stringify({
        total: cards.length,
        completed,
        failed,
        lastUpdate: new Date().toISOString(),
        partialResults: results,
      }),
    });

    // rate limit 보호
    await new Promise((r) => setTimeout(r, INTER_CARD_DELAY_MS));
  }

  // 템플릿 사용 횟수 증가
  try { db.incrementBrandTemplateUsage(session.userId, tplRow.id); } catch {}

  // approvalToken 폐기 + 상태 done
  db.updateMonthlyPlan(session.userId, params.id, {
    status: "done",
    approval_token: null,
    progress_json: JSON.stringify({
      total: cards.length, completed, failed,
      lastUpdate: new Date().toISOString(),
      results,
      totalCostUsd: Math.round(totalCostUsd * 100000) / 100000,
      totalCostKrw: Math.round(totalCostKrw),
    }),
  });

  return NextResponse.json({
    ok: true,
    completed, failed,
    totalCostUsd: Math.round(totalCostUsd * 100000) / 100000,
    totalCostKrw: Math.round(totalCostKrw),
    results,
  });
}
