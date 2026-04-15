import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";

const ALLOWED = new Set([
  "brand_name",
  "support_email",
  "maintenance_mode",
  "signup_enabled",
  "two_factor_required",
  "admin_ip_allowlist",
  "owner_email",
]);

export async function PUT(request: NextRequest) {
  const admin = await requireOwner();
  const body = await request.json();
  const updated: string[] = [];
  for (const [k, v] of Object.entries(body)) {
    if (!ALLOWED.has(k)) continue;
    db.setSetting(k, String(v));
    updated.push(k);
  }
  db.logAdmin({
    admin_id: admin.userId,
    admin_email: admin.email,
    action: "settings.update",
    detail: updated.join(","),
  });
  return NextResponse.json({ ok: true });
}
