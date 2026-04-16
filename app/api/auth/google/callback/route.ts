import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import {
  PENDING_COOKIE,
  STATE_COOKIE,
  signSocialPending,
  setCookieOptions,
} from "@/lib/social-auth";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_cancelled`);
  }

  // Verify state (CSRF protection)
  const savedState = request.cookies.get(STATE_COOKIE)?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${baseUrl}/login?error=invalid_state`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

  // Exchange code for tokens
  let accessToken: string;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) throw new Error("token exchange failed");
    accessToken = tokenData.access_token;
  } catch {
    return NextResponse.redirect(`${baseUrl}/login?error=google_token_failed`);
  }

  // Fetch user info
  let googleUser: { sub: string; email: string; name: string };
  try {
    const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const info = await infoRes.json();
    if (!infoRes.ok || !info.sub) throw new Error("userinfo failed");
    googleUser = { sub: info.sub, email: info.email || "", name: info.name || "" };
  } catch {
    return NextResponse.redirect(`${baseUrl}/login?error=google_userinfo_failed`);
  }

  const clearState = (res: NextResponse) => {
    res.cookies.delete(STATE_COOKIE);
    return res;
  };

  // Check for existing account with this Google provider
  const existingByProvider = db.getUserByProvider("google", googleUser.sub);
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
    const res = NextResponse.redirect(`${baseUrl}/app/select-tool`);
    res.cookies.set(COOKIE_NAME, token, setCookieOptions(60 * 60 * 24 * 7));
    return clearState(res);
  }

  // Check for existing account by email (different provider)
  const existingByEmail = googleUser.email ? db.getUserByEmail(googleUser.email) : undefined;
  const pendingToken = await signSocialPending({
    type: "social-pending",
    provider: "google",
    providerId: googleUser.sub,
    email: googleUser.email,
    name: googleUser.name,
  });

  if (existingByEmail) {
    // Email already registered with a different method — show conflict page
    const res = NextResponse.redirect(`${baseUrl}/account-conflict`);
    res.cookies.set(PENDING_COOKIE, pendingToken, setCookieOptions(600));
    return clearState(res);
  }

  // New user — complete profile
  const res = NextResponse.redirect(`${baseUrl}/social-complete`);
  res.cookies.set(PENDING_COOKIE, pendingToken, setCookieOptions(600));
  return clearState(res);
}
