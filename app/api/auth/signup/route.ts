import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { randomUUID } from "crypto";
import { SignupSchema, formatZodError } from "@/lib/validation/schemas";
import { passwordContainsIdentity } from "@/lib/security/password";
import { consume, RATE_LIMITS, getClientIp, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { verifySameOrigin } from "@/lib/security/csrf";
import { recordAuthEvent, extractRequestMeta } from "@/lib/security/audit";

const MIN_FORM_RENDER_MS = 1500; // 봇 빠른 제출 차단

export async function POST(request: NextRequest) {
  // CSRF
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) {
    recordAuthEvent({
      kind: "csrf_blocked",
      ...extractRequestMeta(request),
      detail: `signup: ${csrf.reason}`,
    });
    return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  }

  // Rate limit (IP 기준)
  const ip = getClientIp(request);
  const rl = consume(`signup:${ip}`, RATE_LIMITS.SIGNUP);
  if (!rl.allowed) {
    recordAuthEvent({
      kind: "rate_limited",
      ip,
      user_agent: request.headers.get("user-agent"),
      detail: `signup IP: retry after ${rl.retryAfterSec}s`,
    });
    return NextResponse.json(
      { error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` },
      rateLimitResponseInit(rl.retryAfterSec)
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const parsed = SignupSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  // Honeypot — 채워져 있으면 봇으로 간주, 아무 일도 일어나지 않은 척 응답
  if (data.hp_company && data.hp_company.length > 0) {
    recordAuthEvent({
      kind: "rate_limited",
      ip,
      user_agent: request.headers.get("user-agent"),
      email: data.email,
      detail: "honeypot triggered",
    });
    // 일관된 응답 시간을 유지하기 위해 일부러 약간 지연
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ message: "회원가입이 완료되었습니다." }, { status: 201 });
  }

  // 폼 노출 시간 검증 (봇은 즉시 제출)
  if (data.rendered_at) {
    const elapsed = Date.now() - data.rendered_at;
    if (elapsed >= 0 && elapsed < MIN_FORM_RENDER_MS) {
      recordAuthEvent({
        kind: "rate_limited",
        ip,
        user_agent: request.headers.get("user-agent"),
        email: data.email,
        detail: `form submitted too fast: ${elapsed}ms`,
      });
      return NextResponse.json(
        { error: "잠시 후 다시 시도해 주세요." },
        { status: 400 }
      );
    }
  }

  // 비밀번호가 이메일/이름과 동일/포함 차단
  if (passwordContainsIdentity(data.password, [data.email.split("@")[0]!, data.name])) {
    return NextResponse.json(
      { error: "비밀번호에 이메일이나 이름을 그대로 사용할 수 없습니다." },
      { status: 400 }
    );
  }

  try {
    const existing = db.getUserByEmail(data.email);
    if (existing) {
      recordAuthEvent({
        kind: "signup",
        ...extractRequestMeta(request),
        email: data.email,
        detail: "duplicate email",
      });
      return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const now = new Date().toISOString();
    const user = db.createUser({
      id: randomUUID(),
      name: data.name,
      email: data.email,
      password_hash: passwordHash,
      business_name: data.businessName,
      brand_display_name: data.brandDisplayName,
      industry: data.industry,
      phone: data.phone,
      business_type: data.businessType,
      sales_channels: JSON.stringify(data.salesChannels),
      product_categories: JSON.stringify(data.productCategories),
      auth_provider: "email",
      terms_agreed_at: now,
      privacy_agreed_at: now,
      marketing_consent: data.marketingConsent ? 1 : 0,
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      businessName: user.business_name,
      brandDisplayName: user.brand_display_name,
      role: (user.role as "user" | "admin") ?? "user",
    });

    recordAuthEvent({
      kind: "signup",
      ...extractRequestMeta(request),
      user_id: user.id,
      email: user.email,
      detail: "success",
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
