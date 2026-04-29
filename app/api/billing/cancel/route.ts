import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { cancelSubscription } from "@/lib/billing";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production" && process.env.PAYMENTS_PROVIDER !== "live") {
    return NextResponse.json(
      { error: "결제 시스템이 아직 연동되지 않았습니다." },
      { status: 503 }
    );
  }

  const csrf = verifySameOrigin(request);
  if (!csrf.ok) {
    return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const rl = consume(`api:billing-cancel:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` },
      rateLimitResponseInit(rl.retryAfterSec)
    );
  }

  cancelSubscription(session.userId);
  return NextResponse.json({ ok: true });
}
