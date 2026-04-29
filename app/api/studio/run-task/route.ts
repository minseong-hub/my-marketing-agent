import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { checkQuotaForRun } from "@/lib/security/quota";
import { recordAuthEvent, extractRequestMeta } from "@/lib/security/audit";
import { getClaudeClient, MODEL } from "@/lib/claude/client";
import { SYSTEM_PROMPTS } from "@/lib/claude/prompts";
import { buildUserContextBlock, buildReferencePackBlock } from "@/lib/agents/context";
import type Anthropic from "@anthropic-ai/sdk";

/**
 * 비서별 데스크 탭에서 사용하는 단일 호출 작업 엔드포인트.
 *  - agentType + 작업 prompt → Claude 동기 호출 → 텍스트 결과 + 보관함 자동 저장
 *  - 결과를 SSE로 흘리지 않고 한 번에 응답 (간단한 작업 위젯용)
 */

const Schema = z.object({
  agentType: z.enum(["marketing", "detail_page", "ads", "finance"]),
  taskTitle: z.string().min(1).max(120),
  prompt: z.string().min(10).max(8000),
  /** 보관함에 저장할 분류 */
  kind: z.string().max(40).default("agent_response"),
  /** 결과를 보관함에 자동 저장할지 (기본 true) */
  saveToLibrary: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:studio-run:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` },
      rateLimitResponseInit(rl.retryAfterSec)
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
      detail: `studio-run usage=${quota.usage}/${quota.limit ?? "∞"}`,
    });
    return NextResponse.json({ error: quota.reason, usage: quota.usage, limit: quota.limit }, { status: 402 });
  }

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 }); }
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });

  const { agentType, taskTitle, prompt, kind, saveToLibrary } = parsed.data;

  const claude = getClaudeClient();
  const userContext = buildUserContextBlock(session.userId, { agentType });
  const referencePack = buildReferencePackBlock(session.userId, { agentType });
  const systemBlocks: Anthropic.TextBlockParam[] = [
    { type: "text", text: SYSTEM_PROMPTS[agentType] || "", cache_control: { type: "ephemeral" } },
    ...(referencePack ? [{ type: "text" as const, text: referencePack, cache_control: { type: "ephemeral" as const } }] : []),
    ...(userContext ? [{ type: "text" as const, text: userContext }] : []),
  ];

  let response: Anthropic.Message;
  try {
    response = await claude.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: systemBlocks,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Claude 호출 실패";
    return NextResponse.json({ error: `AI 호출 오류: ${msg}` }, { status: 502 });
  }

  // 토큰 기록
  try {
    db.recordTokenUsage({
      user_id: session.userId,
      session_id: null,
      agent_type: agentType,
      model: MODEL,
      input_tokens: response.usage.input_tokens || 0,
      output_tokens: response.usage.output_tokens || 0,
      cache_read_tokens: (response.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens || 0,
      cache_creation_tokens: (response.usage as { cache_creation_input_tokens?: number }).cache_creation_input_tokens || 0,
    });
  } catch {}

  const result = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as Anthropic.TextBlock).text)
    .join("\n")
    .trim();

  if (!result) {
    return NextResponse.json({ error: "AI 응답이 비어 있습니다. 입력을 더 구체적으로 작성해 주세요." }, { status: 422 });
  }

  let libraryId: string | null = null;
  if (saveToLibrary) {
    try {
      const item = db.createLibraryItem(session.userId, {
        agent_type: agentType,
        kind,
        title: taskTitle,
        content: result,
        metadata: JSON.stringify({ generated_at: new Date().toISOString() }),
        is_favorite: 0,
      });
      libraryId = item.id;
    } catch {}
  }

  return NextResponse.json({ ok: true, result, libraryId });
}
