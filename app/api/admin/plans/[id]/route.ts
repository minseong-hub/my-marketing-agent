import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireOwner();
  const { id } = params;
  const body = await request.json();
  const patch: any = {};
  if (typeof body.name === "string") patch.name = body.name;
  if (typeof body.price_monthly === "number") patch.price_monthly = body.price_monthly;
  if (Array.isArray(body.features)) patch.features = body.features.map(String);
  if (body.archived === 0 || body.archived === 1) patch.archived = body.archived;
  if (typeof body.trial_days === "number") patch.trial_days = body.trial_days;
  if (body.first_payment_amount === null || typeof body.first_payment_amount === "number") {
    patch.first_payment_amount = body.first_payment_amount;
  }
  if (Array.isArray(body.tools)) patch.tools = body.tools.map(String);
  db.updatePlan(id, patch);
  db.logAdmin({
    admin_id: admin.userId,
    admin_email: admin.email,
    action: "plan.update",
    target_type: "plan",
    target_id: id,
    detail: JSON.stringify(patch),
  });
  return NextResponse.json({ ok: true });
}
