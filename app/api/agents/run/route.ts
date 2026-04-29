import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runAgent } from "@/lib/agents/runner";
import { AgentRunSchema, formatZodError } from "@/lib/validation/schemas";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { checkQuotaForRun } from "@/lib/security/quota";
import { recordAuthEvent, extractRequestMeta } from "@/lib/security/audit";

export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) {
    return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 사용자별 API 부하 보호
  const rl = consume(`api:agent-run:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` },
      rateLimitResponseInit(rl.retryAfterSec)
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const parsed = AgentRunSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const { agentType, task, context } = parsed.data;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요." }, { status: 503 });
  }

  // 호출 한도 강제
  const triggerKind = (context?.trigger as string | undefined) ?? "manual";
  const quota = checkQuotaForRun(session.userId, { trigger: triggerKind as "manual" });
  if (!quota.ok) {
    recordAuthEvent({
      kind: "quota_exceeded",
      ...extractRequestMeta(request),
      user_id: session.userId,
      email: session.email,
      detail: `agentType=${agentType} usage=${quota.usage}/${quota.limit ?? "∞"} plan=${quota.planSlug}`,
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
    const sessionId = await runAgent({ userId: session.userId, agentType, task, context });
    return NextResponse.json({ sessionId, status: "running", message: "에이전트가 작업을 시작했습니다." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "실행 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
