import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  const body = await request.json();
  const { name, price_monthly, features } = body;
  if (!name) return NextResponse.json({ error: "이름 필요" }, { status: 400 });
  const plan = db.createPlan(
    String(name),
    Number(price_monthly) || 0,
    Array.isArray(features) ? features.map(String) : []
  );
  db.logAdmin({
    admin_id: admin.userId,
    admin_email: admin.email,
    action: "plan.create",
    target_type: "plan",
    target_id: plan.id,
  });
  return NextResponse.json({ ok: true, plan });
}
