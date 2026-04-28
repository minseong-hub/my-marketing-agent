import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const approvals = db.listPendingApprovals(session.userId);
  return NextResponse.json({
    approvals: approvals.map((a) => ({
      ...a,
      payload: JSON.parse(a.payload),
      preview_data: JSON.parse(a.preview_data),
      resume_data: JSON.parse(a.resume_data),
    })),
    total: approvals.length,
  });
}
