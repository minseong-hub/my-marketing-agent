import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";

// 최초 1회만 동작 — admin 이 1명도 없을 때 관리자 계정 생성 허용
// 프로덕션에서는 배포 직후 첫 부팅에서 호출하고 삭제/비활성화 권장
export async function POST(request: NextRequest) {
  try {
    const existing = db.listUsers(undefined, "admin");
    if (existing.length > 0) {
      return NextResponse.json({ error: "이미 관리자 계정이 존재합니다." }, { status: 409 });
    }

    const body = await request.json();
    const { email, password, name } = body as { email: string; password: string; name?: string };
    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "이메일/비밀번호(8자 이상)를 입력해주세요." },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 12);
    const user = db.createUser({
      id: randomUUID(),
      name: name ?? "Owner",
      email,
      password_hash: hash,
      business_name: "Owner",
      brand_display_name: "Owner",
      industry: "",
      role: "admin",
      status: "active",
      plan_id: null,
    });

    db.logAdmin({
      admin_id: user.id,
      admin_email: user.email,
      action: "admin.bootstrap",
      detail: "초기 관리자 계정 생성",
    });

    return NextResponse.json({ ok: true, email: user.email });
  } catch (e) {
    console.error("bootstrap error", e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
