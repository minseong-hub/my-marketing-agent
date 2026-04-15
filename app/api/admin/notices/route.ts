import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  const body = await request.json();
  const { title, body: content, kind } = body;
  if (!title) return NextResponse.json({ error: "제목 필요" }, { status: 400 });
  const notice = db.createNotice(String(title), String(content ?? ""), String(kind ?? "notice"));
  db.logAdmin({
    admin_id: admin.userId,
    admin_email: admin.email,
    action: "notice.create",
    target_type: "notice",
    target_id: notice.id,
  });
  return NextResponse.json({ ok: true, notice });
}
