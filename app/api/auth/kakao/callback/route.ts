import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import {
  PENDING_COOKIE,
  STATE_COOKIE,
  signSocialPending,
  setCookieOptions,
} from "@/lib/social-auth";
import { consume, RATE_LIMITS, getClientIp, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { recordAuthEvent, extractRequestMeta } from "@/lib/security/audit";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = consume(`oauth:kakao:cb:${ip}`, RATE_LIMITS.OAUTH);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` },
      rateLimitResponseInit(rl.retryAfterSec)
    );
  }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    recordAuthEvent({ kind: "social_login_fail", ...extractRequestMeta(request), detail: `kakao: ${error || "no code"}` });
    return NextResponse.redirect(`${baseUrl}/login?error=kakao_cancelled`);
  }

  // Verify state
  const savedState = request.cookies.get(STATE_COOKIE)?.value;
  if (!savedState || savedState !== state) {
    recordAuthEvent({ kind: "csrf_blocked", ...extractRequestMeta(request), detail: "kakao: state mismatch" });
    return NextResponse.redirect(`${baseUrl}/login?error=invalid_state`);
  }

  const clientId = process.env.KAKAO_CLIENT_ID!;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET || "";

  // Exchange code for tokens
  let accessToken: string;
  try {
    const tokenBody = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: `${baseUrl}/api/auth/kakao/callback`,
      code,
    });
    if (clientSecret) tokenBody.set("client_secret", clientSecret);

    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody,
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) throw new Error("token exchange failed");
    accessToken = tokenData.access_token;
  } catch {
    return NextResponse.redirect(`${baseUrl}/login?error=kakao_token_failed`);
  }

  // Fetch user info
  let kakaoUser: { id: string; email: string; name: string };
  try {
    const infoRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const info = await infoRes.json();
    if (!infoRes.ok || !info.id) throw new Error("userinfo failed");
    const account = info.kakao_account ?? {};
    kakaoUser = {
      id: String(info.id),
      email: account.email || "",
      name: account.profile?.nickname || account.name || "",
    };
  } catch {
    return NextResponse.redirect(`${baseUrl}/login?error=kakao_userinfo_failed`);
  }

  const clearState = (res: NextResponse) => {
    res.cookies.delete(STATE_COOKIE);
    return res;
  };

  // Check for existing account with this Kakao provider
  const existingByProvider = db.getUserByProvider("kakao", kakaoUser.id);
  if (existingByProvider) {
    if (existingByProvider.status !== "active") {
      return clearState(NextResponse.redirect(`${baseUrl}/login?error=account_suspended`));
    }
    const token = await signToken({
      userId: existingByProvider.id,
      email: existingByProvider.email,
      name: existingByProvider.name,
      businessName: existingByProvider.business_name,
      brandDisplayName: existingByProvider.brand_display_name,
      role: (existingByProvider.role as "user" | "admin") ?? "user",
    });
    const res = NextResponse.redirect(`${baseUrl}/desk/marky`);
    res.cookies.set(COOKIE_NAME, token, setCookieOptions(60 * 60 * 24 * 7));
    return clearState(res);
  }

  // Check for existing account by email (different provider)
  const existingByEmail = kakaoUser.email ? db.getUserByEmail(kakaoUser.email) : undefined;
  const pendingToken = await signSocialPending({
    type: "social-pending",
    provider: "kakao",
    providerId: kakaoUser.id,
    email: kakaoUser.email,
    name: kakaoUser.name,
  });

  if (existingByEmail) {
    const res = NextResponse.redirect(`${baseUrl}/account-conflict`);
    res.cookies.set(PENDING_COOKIE, pendingToken, setCookieOptions(600));
    return clearState(res);
  }

  // New user — complete profile
  const res = NextResponse.redirect(`${baseUrl}/social-complete`);
  res.cookies.set(PENDING_COOKIE, pendingToken, setCookieOptions(600));
  return clearState(res);
}
