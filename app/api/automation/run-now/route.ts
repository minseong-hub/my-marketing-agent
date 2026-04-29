import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runAgent } from "@/lib/agents/runner";
import { pickRandomTask } from "@/lib/scheduler/auto-tasks";
import type { AutoAgentType } from "@/lib/scheduler/auto-tasks";
import { AutomationRunNowSchema, formatZodError } from "@/lib/validation/schemas";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { checkQuotaForRun } from "@/lib/security/quota";
import { recordAuthEvent, extractRequestMeta } from "@/lib/security/audit";

/**
 * POST /api/automation/run-now
 * 로그인한 사용자가 본인 계정에서 1회 자동 임무를 즉시 실행
 */
export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) {
    return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = consume(`api:auto-run:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` },
      rateLimitResponseInit(rl.retryAfterSec)
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY 미설정" }, { status: 503 });
  }

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 }); }

  const parsed = AutomationRunNowSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const at = parsed.data.agentType as AutoAgentType;

  // 자동 트리거이므로 무료 플랜 차단 + 한도 검증
  const quota = checkQuotaForRun(session.userId, { trigger: "user_manual_auto_trigger" });
  if (!quota.ok) {
    recordAuthEvent({
      kind: "quota_exceeded",
      ...extractRequestMeta(request),
      user_id: session.userId,
      email: session.email,
      detail: `auto-run agentType=${at} usage=${quota.usage}/${quota.limit ?? "∞"} plan=${quota.planSlug}`,
    });
    return NextResponse.json(
      {
        error: quota.reason,
        usage: quota.usage,
        limit: quota.limit,
        planSlug: quota.planSlug,
      },
      { status: 402 }
    );
  }

  try {
    const task = pickRandomTask(at);
    const sessionId = await runAgent({
      userId: session.userId,
      agentType: at,
      task: `[AUTO · 즉시 실행] ${task}`,
      context: { trigger: "user_manual_auto_trigger", scheduledAt: new Date().toISOString() },
    });
    return NextResponse.json({ ok: true, sessionId, agentType: at });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
