import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import {
  PENDING_COOKIE,
  verifySocialPending,
  setCookieOptions,
} from "@/lib/social-auth";

export async function POST(request: NextRequest) {
  const pendingToken = request.cookies.get(PENDING_COOKIE)?.value;
  if (!pendingToken) {
    return NextResponse.json({ error: "소셜 로그인 세션이 만료되었습니다." }, { status: 401 });
  }
  const pending = await verifySocialPending(pendingToken);
  if (!pending) {
    return NextResponse.json({ error: "소셜 로그인 세션이 유효하지 않습니다." }, { status: 401 });
  }

  const body = await request.json();
  const { password } = body as { password: string };
  if (!password) {
    return NextResponse.json({ error: "비밀번호를 입력해주세요." }, { status: 400 });
  }

  // Find the existing account by email
  const existing = pending.email ? db.getUserByEmail(pending.email) : undefined;
  if (!existing) {
    return NextResponse.json({ error: "해당 이메일로 가입된 계정이 없습니다." }, { status: 404 });
  }

  // Only email-based accounts can be linked via password verification
  if (!existing.password_hash) {
    return NextResponse.json(
      { error: "이 계정은 다른 소셜 로그인으로 가입되었습니다. 해당 방법으로 로그인 후 계정을 연결하세요." },
      { status: 400 }
    );
  }

  const isValid = await bcrypt.compare(password, existing.password_hash);
  if (!isValid) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  if (existing.status !== "active") {
    return NextResponse.json({ error: "정지되었거나 사용할 수 없는 계정입니다." }, { status: 403 });
  }

  // Link the social provider to the existing account
  db.linkProviderToUser(existing.id, pending.provider, pending.providerId);

  const token = await signToken({
    userId: existing.id,
    email: existing.email,
    name: existing.name,
    businessName: existing.business_name,
    brandDisplayName: existing.brand_display_name,
    role: (existing.role as "user" | "admin") ?? "user",
  });

  const response = NextResponse.json({ message: "계정이 연결되었습니다." });
  response.cookies.set(COOKIE_NAME, token, setCookieOptions(60 * 60 * 24 * 7));
  response.cookies.delete(PENDING_COOKIE);
  return response;
}
