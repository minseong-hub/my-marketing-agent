import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const agentType = searchParams.get("agentType");
  const limit = parseInt(searchParams.get("limit") || "50");

  if (agentType) {
    const s = db.getAgentSession(session.userId, agentType);
    if (!s) return NextResponse.json({ logs: [] });
    const logs = db.listAgentLogs(s.id, Math.min(limit, 100));
    return NextResponse.json({ logs, sessionId: s.id, status: s.status });
  }

  // 전체 최근 로그
  const logs = db.listRecentAgentLogs(session.userId, Math.min(limit, 100));
  return NextResponse.json({ logs });
}
