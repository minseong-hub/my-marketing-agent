import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agentTypes = ["marketing", "detail_page", "ads", "finance"];
  const result: Record<string, unknown> = {};

  for (const agentType of agentTypes) {
    const s = db.getAgentSession(session.userId, agentType);
    const pendingApprovals = db.listPendingApprovals(session.userId).filter((a) => a.agent_type === agentType);
    const recentLogs = s ? db.listAgentLogs(s.id, 5) : [];

    result[agentType] = {
      sessionId: s?.id ?? null,
      status: s?.status ?? "idle",
      currentTask: s?.current_task ?? null,
      lastReportedAt: s?.last_reported_at ?? null,
      pendingApprovals: pendingApprovals.length,
      lastLog: recentLogs[0]?.message ?? null,
    };
  }

  const totalPending = db.listPendingApprovals(session.userId).length;

  return NextResponse.json({ agents: result, totalPendingApprovals: totalPending });
}
