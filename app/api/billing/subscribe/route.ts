import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { activateSubscription } from "@/lib/billing";
import { PLAN_DEFINITIONS, PlanSlug } from "@/lib/plans";
import { BillingSubscribeSchema, formatZodError } from "@/lib/validation/schemas";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";

/**
 * 모의 결제 라우트.
 * NODE_ENV=production에서는 PG 연동이 완료되기 전까지 503으로 차단합니다.
 * 실서비스 오픈 시 토스/포트원/Stripe 등 PG 웹훅 흐름으로 교체해야 합니다.
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production" && process.env.PAYMENTS_PROVIDER !== "live") {
    return NextResponse.json(
      { error: "결제 시스템이 아직 연동되지 않았습니다. 운영 오픈 전 설정이 필요합니다." },
      { status: 503 }
    );
  }

  const csrf = verifySameOrigin(request);
  if (!csrf.ok) {
    return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const rl = consume(`api:billing:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` },
      rateLimitResponseInit(rl.retryAfterSec)
    );
  }

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 }); }

  const parsed = BillingSubscribeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const plan = parsed.data.plan;
  if (!PLAN_DEFINITIONS[plan as PlanSlug]) {
    return NextResponse.json({ error: "유효한 플랜을 선택하세요." }, { status: 400 });
  }
  if (plan === "free") {
    return NextResponse.json({ error: "무료 플랜은 결제가 필요하지 않습니다." }, { status: 400 });
  }

  // NOTE: Mock payment — real PG integration replaces this block.
  activateSubscription(session.userId, plan as PlanSlug);
  return NextResponse.json({ ok: true });
}
