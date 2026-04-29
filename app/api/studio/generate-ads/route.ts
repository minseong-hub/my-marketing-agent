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
import { buildUserContextBlock } from "@/lib/agents/context";
import { buildAdCreativePrompt, extractJson } from "@/lib/studio/prompts";
import type { AdCreativeSpec } from "@/lib/studio/templates";
import type Anthropic from "@anthropic-ai/sdk";

const Schema = z.object({
  topic: z.string().trim().min(1).max(400),
  goal: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:studio-ads:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) {
    return NextResponse.json({ error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` }, rateLimitResponseInit(rl.retryAfterSec));
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
      detail: `studio-ads usage=${quota.usage}/${quota.limit ?? "∞"}`,
    });
    return NextResponse.json({ error: quota.reason, usage: quota.usage, limit: quota.limit }, { status: 402 });
  }

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 }); }
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });

  const claude = getClaudeClient();
  const userContext = buildUserContextBlock(session.userId);
  const systemBlocks: Anthropic.TextBlockParam[] = [
    { type: "text", text: SYSTEM_PROMPTS.ads, cache_control: { type: "ephemeral" } },
    ...(userContext ? [{ type: "text" as const, text: userContext }] : []),
  ];

  const prompt = buildAdCreativePrompt(parsed.data);

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

  try {
    db.recordTokenUsage({
      user_id: session.userId,
      session_id: null,
      agent_type: "ads",
      model: MODEL,
      input_tokens: response.usage.input_tokens || 0,
      output_tokens: response.usage.output_tokens || 0,
      cache_read_tokens: (response.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens || 0,
      cache_creation_tokens: (response.usage as { cache_creation_input_tokens?: number }).cache_creation_input_tokens || 0,
    });
  } catch {}

  const text = response.content.filter((b) => b.type === "text").map((b) => (b as Anthropic.TextBlock).text).join("\n");
  const spec = extractJson<AdCreativeSpec & { imagePrompt?: string }>(text);
  if (!spec || !Array.isArray(spec.variants) || spec.variants.length === 0) {
    return NextResponse.json(
      { error: "AI가 올바른 형식의 결과를 만들지 못했습니다. 주제를 더 구체적으로 입력해 주세요.", raw: text.slice(0, 600) },
      { status: 422 }
    );
  }

  // 글자수 클램프 (모델이 가끔 초과)
  spec.variants = spec.variants.map((v) => ({
    ...v,
    headline: (v.headline || "").slice(0, 30),
    body: (v.body || "").slice(0, 100),
    hook: v.hook ? v.hook.slice(0, 14) : v.hook,
  }));

  let libraryId: string | null = null;
  try {
    const item = db.createLibraryItem(session.userId, {
      agent_type: "ads",
      kind: "ad_creative",
      title: `광고 소재: ${parsed.data.topic.slice(0, 60)}`,
      content: spec.variants.map((v) => `[${v.ratio}] ${v.headline}\n${v.body}`).join("\n\n"),
      metadata: JSON.stringify({ spec, topic: parsed.data.topic, goal: parsed.data.goal }),
      tags: JSON.stringify(["광고", "메타", parsed.data.goal || "매출"]),
      is_favorite: 0,
    });
    libraryId = item.id;
  } catch {}

  return NextResponse.json({ ok: true, spec, libraryId });
}
