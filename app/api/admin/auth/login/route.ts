import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string; otp?: string };

    if (!email || !password) {
      return NextResponse.json({ error: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
    }

    // (선택) IP 화이트리스트 체크 — 설정에 값이 있을 때만 적용
    const settings = db.getSettings();
    const allowlist = (settings.admin_ip_allowlist || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (allowlist.length > 0) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        "";
      if (!allowlist.includes(ip)) {
        return NextResponse.json({ error: "허용되지 않은 네트워크입니다." }, { status: 403 });
      }
    }

    const user = db.getUserByEmail(email);
    if (!user || user.role !== "admin") {
      // 일반 사용자 계정 노출 방지 — 동일한 메시지 반환
      return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    if (user.status && user.status !== "active") {
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
      role: "admin",
    });

    db.logAdmin({
      admin_id: user.id,
      admin_email: user.email,
      action: "admin.login",
      detail: request.headers.get("user-agent") ?? undefined,
    });

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
