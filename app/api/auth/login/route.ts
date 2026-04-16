import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // Social-only accounts have no password
    if (!user.password_hash) {
      const providerLabel: Record<string, string> = { google: "Google", kakao: "카카오" };
      const label = providerLabel[user.auth_provider] ?? user.auth_provider;
      return NextResponse.json(
        { error: `이 계정은 ${label} 로그인으로 가입되었습니다. ${label} 로그인을 이용해주세요.` },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    if (user.status && user.status !== "active") {
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
