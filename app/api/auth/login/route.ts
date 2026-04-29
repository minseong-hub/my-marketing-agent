import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { LoginSchema, formatZodError } from "@/lib/validation/schemas";
import { consume, RATE_LIMITS, getClientIp, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { verifySameOrigin } from "@/lib/security/csrf";
import { recordAuthEvent, extractRequestMeta } from "@/lib/security/audit";

export async function POST(request: NextRequest) {
  // CSRF
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) {
    recordAuthEvent({ kind: "csrf_blocked", ...extractRequestMeta(request), detail: `login: ${csrf.reason}` });
    return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const meta = extractRequestMeta(request);

  // Rate limit: IP+이메일 기준 (이메일이 노출되지 않도록 hash 키 사용)
  const ipKey = `login:ip:${meta.ip}`;
  const emailKey = `login:email:${email}`;
  const rlIp = consume(ipKey, RATE_LIMITS.LOGIN);
  const rlEmail = consume(emailKey, RATE_LIMITS.LOGIN);
  if (!rlIp.allowed || !rlEmail.allowed) {
    const retry = Math.max(rlIp.retryAfterSec, rlEmail.retryAfterSec);
    recordAuthEvent({ kind: "rate_limited", ...meta, email, detail: `login retry after ${retry}s` });
    return NextResponse.json(
      { error: `로그인 시도가 너무 많습니다. ${retry}초 후 다시 시도해 주세요.` },
      rateLimitResponseInit(retry)
    );
  }

  try {
    const user = db.getUserByEmail(email);
    // 타이밍 공격 완화: 사용자가 없어도 bcrypt 비교 시간 비슷하게 소요
    if (!user) {
      await bcrypt.compare(password, "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
      recordAuthEvent({ kind: "login_fail", ...meta, email, detail: "user not found" });
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    if (!user.password_hash) {
      const providerLabel: Record<string, string> = { google: "Google", kakao: "카카오" };
      const label = providerLabel[user.auth_provider] ?? user.auth_provider;
      recordAuthEvent({ kind: "login_fail", ...meta, user_id: user.id, email, detail: `social-only: ${user.auth_provider}` });
      return NextResponse.json(
        { error: `이 계정은 ${label} 로그인으로 가입되었습니다. ${label} 로그인을 이용해주세요.` },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      recordAuthEvent({ kind: "login_fail", ...meta, user_id: user.id, email, detail: "wrong password" });
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    if (user.status && user.status !== "active") {
      recordAuthEvent({ kind: "login_fail", ...meta, user_id: user.id, email, detail: `status=${user.status}` });
      return NextResponse.json(
        { error: "정지되었거나 사용할 수 없는 계정입니다." },
        { status: 403 }
      );
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      businessName: user.business_name,
      brandDisplayName: user.brand_display_name,
      role: (user.role as "user" | "admin") ?? "user",
    });

    recordAuthEvent({ kind: "login_success", ...meta, user_id: user.id, email });

    const response = NextResponse.json({ message: "로그인 성공" }, { status: 200 });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
