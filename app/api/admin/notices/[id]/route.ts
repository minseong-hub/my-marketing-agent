import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  const { id } = params;
  const body = await request.json();
  const patch: any = {};
  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.body === "string") patch.body = body.body;
  if (typeof body.kind === "string") patch.kind = body.kind;
  if (body.active === 0 || body.active === 1) patch.active = body.active;
  db.updateNotice(id, patch);
  db.logAdmin({
    admin_id: admin.userId,
    admin_email: admin.email,
    action: "notice.update",
    target_type: "notice",
    target_id: id,
    detail: JSON.stringify(patch),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  const { id } = params;
  db.deleteNotice(id);
  db.logAdmin({
    admin_id: admin.userId,
    admin_email: admin.email,
    action: "notice.delete",
    target_type: "notice",
    target_id: id,
  });
  return NextResponse.json({ ok: true });
}
