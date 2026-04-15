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
  if (["active", "paused", "canceled", "past_due"].includes(body.status)) patch.status = body.status;
  if (typeof body.amount === "number") patch.amount = body.amount;
  if (typeof body.note === "string") patch.note = body.note;
  if (typeof body.next_billing_at === "string") patch.next_billing_at = body.next_billing_at;
  db.updateSubscription(id, patch);
  db.logAdmin({
    admin_id: admin.userId,
    admin_email: admin.email,
    action: "subscription.update",
    target_type: "subscription",
    target_id: id,
    detail: JSON.stringify(patch),
  });
  return NextResponse.json({ ok: true });
}
