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
  if (typeof body.name === "string") patch.name = body.name;
  if (body.role === "user" || body.role === "admin") patch.role = body.role;
  if (body.status === "active" || body.status === "suspended") patch.status = body.status;
  if (body.plan_id === null || typeof body.plan_id === "string") patch.plan_id = body.plan_id;

  db.updateUser(id, patch);
  db.logAdmin({
    admin_id: admin.userId,
    admin_email: admin.email,
    action: "user.update",
    target_type: "user",
    target_id: id,
    detail: JSON.stringify(patch),
  });
  return NextResponse.json({ ok: true });
}
