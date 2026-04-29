import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { LoginSchema, formatZodError } from "@/lib/validation/schemas";
import { consume, RATE_LIMITS, getClientIp, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { verifySameOrigin } from "@/lib/security/csrf";
import { recordAuthEvent, extractRequestMeta } from "@/lib/security/audit";

export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) {
    recordAuthEvent({ kind: "csrf_blocked", ...extractRequestMeta(request), detail: `admin login: ${csrf.reason}` });
    return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  }

  const meta = extractRequestMeta(request);
  // 관리자 로그인은 더 엄격하게: IP 기준 5회/15분
  const rl = consume(`admin-login:${meta.ip}`, RATE_LIMITS.LOGIN);
  if (!rl.allowed) {
    recordAuthEvent({ kind: "rate_limited", ...meta, detail: `admin login retry after ${rl.retryAfterSec}s` });
    return NextResponse.json(
      { error: `로그인 시도가 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` },
      rateLimitResponseInit(rl.retryAfterSec)
    );
  }

  try {
    let raw: unknown;
    try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 }); }

    const parsed = LoginSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { email, password } = parsed.data;

    // (선택) IP 화이트리스트 체크 — 설정에 값이 있을 때만 적용
    const settings = db.getSettings();
    const allowlist = (settings.admin_ip_allowlist || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (allowlist.length > 0) {
      const ip = getClientIp(request);
      if (!allowlist.includes(ip)) {
        recordAuthEvent({ kind: "permission_denied", ip, user_agent: meta.user_agent, detail: "admin: IP not allowed" });
        return NextResponse.json({ error: "허용되지 않은 네트워크입니다." }, { status: 403 });
      }
    }

    const user = db.getUserByEmail(email);
    const adminRoles = new Set(["admin", "owner", "support"]);
    if (!user || !adminRoles.has(user.role)) {
      // 사용자 없을 때도 bcrypt 시간 비슷하게
      await bcrypt.compare(password, "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
      recordAuthEvent({ kind: "login_fail", ...meta, email, detail: "admin: not authorized" });
      return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    if (!user.password_hash) {
      recordAuthEvent({ kind: "login_fail", ...meta, user_id: user.id, email, detail: "admin: no password (social-only)" });
      return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      recordAuthEvent({ kind: "login_fail", ...meta, user_id: user.id, email, detail: "admin: wrong password" });
      return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    if (user.status && user.status !== "active") {
      recordAuthEvent({ kind: "login_fail", ...meta, user_id: user.id, email, detail: `admin: status=${user.status}` });
      return NextResponse.json({ error: "사용할 수 없는 관리자 계정입니다." }, { status: 403 });
    }

    // 2FA 훅 — two_factor_required=true 이고 OTP 미구현이면 요구만 표시
    if (settings.two_factor_required === "true") {
      // TODO: OTP 검증 연결 (TOTP)
      // 현재는 placeholder — 프로덕션 전 반드시 검증 연결 필요
    }

    const token = await signAdminToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      businessName: user.business_name,
      brandDisplayName: user.brand_display_name,
      role: (user.role as "user" | "admin") ?? "admin",
    });

    db.logAdmin({
      admin_id: user.id,
      admin_email: user.email,
      action: "admin.login",
      detail: `${meta.ip} ${meta.user_agent.slice(0, 200)}`,
    });
    recordAuthEvent({ kind: "login_success", ...meta, user_id: user.id, email, detail: `admin role=${user.role}` });

    const response = NextResponse.json({ message: "ok" }, { status: 200 });
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 12,
      path: "/",
    });
    return response;
  } catch (e) {
    console.error("Admin login error", e);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
