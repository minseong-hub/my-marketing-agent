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
  if (["open", "pending", "closed"].includes(body.status)) patch.status = body.status;
  if (["low", "normal", "high"].includes(body.priority)) patch.priority = body.priority;
  db.updateTicket(id, patch);
  db.logAdmin({
    admin_id: admin.userId,
    admin_email: admin.email,
    action: "ticket.update",
    target_type: "ticket",
    target_id: id,
    detail: JSON.stringify(patch),
  });
  return NextResponse.json({ ok: true });
}
