import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { randomUUID } from "crypto";

const PHONE_RE = /^010-\d{4}-\d{4}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, email, password,
      phone, businessName, brandDisplayName, businessType, industry,
      salesChannels, productCategories,
      termsAgreed, privacyAgreed, marketingConsent,
    } = body;

    if (!name || !email || !password || !phone || !businessName || !brandDisplayName || !businessType || !industry) {
      return NextResponse.json({ error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
    }
    if (!PHONE_RE.test(phone)) {
      return NextResponse.json(
        { error: "올바른 휴대폰 번호 형식(010-0000-0000)으로 입력해주세요." },
        { status: 400 }
      );
    }
    if (!termsAgreed || !privacyAgreed) {
      return NextResponse.json(
        { error: "이용약관 및 개인정보처리방침에 동의해주세요." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();
    const user = db.createUser({
      id: randomUUID(),
      name,
      email,
      password_hash: passwordHash,
      business_name: businessName,
      brand_display_name: brandDisplayName,
      industry,
      phone,
      business_type: businessType,
      sales_channels: JSON.stringify(Array.isArray(salesChannels) ? salesChannels : []),
      product_categories: JSON.stringify(Array.isArray(productCategories) ? productCategories : []),
      auth_provider: "email",
      terms_agreed_at: termsAgreed ? now : null,
      privacy_agreed_at: privacyAgreed ? now : null,
      marketing_consent: marketingConsent ? 1 : 0,
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      businessName: user.business_name,
      brandDisplayName: user.brand_display_name,
      role: (user.role as "user" | "admin") ?? "user",
    });

    const response = NextResponse.json({ message: "회원가입이 완료되었습니다." }, { status: 201 });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
