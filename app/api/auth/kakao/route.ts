import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { STATE_COOKIE, setCookieOptions } from "@/lib/social-auth";
import { consume, RATE_LIMITS, getClientIp, rateLimitResponseInit } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = consume(`oauth:kakao:${ip}`, RATE_LIMITS.OAUTH);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` },
      rateLimitResponseInit(rl.retryAfterSec)
    );
  }

  const clientId = process.env.KAKAO_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Kakao OAuth가 설정되지 않았습니다." }, { status: 503 });
  }

  const state = randomBytes(16).toString("hex");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${baseUrl}/api/auth/kakao/callback`,
    response_type: "code",
    state,
    scope: "profile_nickname account_email",
  });

  const response = NextResponse.redirect(
    `https://kauth.kakao.com/oauth/authorize?${params}`
  );
  response.cookies.set(STATE_COOKIE, state, setCookieOptions(300));
  return response;
}
