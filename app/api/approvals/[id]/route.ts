import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resumeAgentAfterApproval } from "@/lib/agents/runner";
import { ApprovalActionSchema, formatZodError } from "@/lib/validation/schemas";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) {
    return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:approvals:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` },
      rateLimitResponseInit(rl.retryAfterSec)
    );
  }

  const { id } = params;
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 }); }

  const parsed = ApprovalActionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const { action, reason } = parsed.data;

  try {
    await resumeAgentAfterApproval(id, session.userId, action === "approve", reason);
    return NextResponse.json({
      success: true,
      message: action === "approve"
        ? "승인되었습니다. 에이전트가 작업을 재개합니다."
        : "거절되었습니다. 에이전트에게 통보했습니다.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "처리 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
