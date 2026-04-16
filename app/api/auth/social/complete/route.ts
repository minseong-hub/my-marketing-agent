import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import {
  PENDING_COOKIE,
  verifySocialPending,
  setCookieOptions,
} from "@/lib/social-auth";

const PHONE_RE = /^010-\d{4}-\d{4}$/;

export async function POST(request: NextRequest) {
  // Read and verify pending token from cookie
  const pendingToken = request.cookies.get(PENDING_COOKIE)?.value;
  if (!pendingToken) {
    return NextResponse.json({ error: "소셜 로그인 세션이 만료되었습니다. 다시 시도해주세요." }, { status: 401 });
  }
  const pending = await verifySocialPending(pendingToken);
  if (!pending) {
    return NextResponse.json({ error: "소셜 로그인 세션이 유효하지 않습니다." }, { status: 401 });
  }

  const body = await request.json();
  const {
    phone,
    businessName,
    brandDisplayName,
    businessType,
    industry,
    salesChannels,
    productCategories,
    termsAgreed,
    privacyAgreed,
    marketingConsent,
  } = body;

  // Validate required fields
  if (!phone || !businessName || !brandDisplayName || !businessType || !industry) {
    return NextResponse.json({ error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
  }
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "올바른 휴대폰 번호 형식(010-0000-0000)으로 입력해주세요." }, { status: 400 });
  }
  if (!termsAgreed || !privacyAgreed) {
    return NextResponse.json({ error: "이용약관 및 개인정보처리방침 동의는 필수입니다." }, { status: 400 });
  }

  // Duplicate email check (pending token might be stale)
  const existing = pending.email ? db.getUserByEmail(pending.email) : null;
  if (existing) {
    return NextResponse.json({ error: "이미 가입된 이메일입니다. 로그인 페이지에서 계정을 연결하세요." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const user = db.createUser({
    id: randomUUID(),
    name: pending.name,
    email: pending.email,
    password_hash: "",
    business_name: businessName,
    brand_display_name: brandDisplayName,
    industry,
    phone,
    business_type: businessType,
    sales_channels: JSON.stringify(Array.isArray(salesChannels) ? salesChannels : []),
    product_categories: JSON.stringify(Array.isArray(productCategories) ? productCategories : []),
    auth_provider: pending.provider,
    provider_id: pending.providerId,
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
    role: "user",
  });

  const response = NextResponse.json({ message: "가입이 완료되었습니다." }, { status: 201 });
  response.cookies.set(COOKIE_NAME, token, setCookieOptions(60 * 60 * 24 * 7));
  response.cookies.delete(PENDING_COOKIE);
  return response;
}
