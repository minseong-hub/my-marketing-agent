import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { STATE_COOKIE, setCookieOptions } from "@/lib/social-auth";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Google OAuth가 설정되지 않았습니다." }, { status: 503 });
  }

  const state = randomBytes(16).toString("hex");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${baseUrl}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );
  response.cookies.set(STATE_COOKIE, state, setCookieOptions(300));
  return response;
}
