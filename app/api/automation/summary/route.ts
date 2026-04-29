import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserBillingState } from "@/lib/billing";
import { getPlanDef } from "@/lib/plans";

/**
 * GET /api/automation/summary
 * 자동화 허브용 요약 데이터
 *  - 플랜 호출 한도 / 이번 달 사용량
 *  - 크루별 누적 실행 수, 최근 실행 시각
 *  - 승인 대기 건수
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const billing = getUserBillingState(session.userId);
  const planDef = getPlanDef(billing.planSlug ?? "free");

  const agentTypes = ["marketing", "detail_page", "ads", "finance"];
  const stats: Record<string, {
    totalRuns: number;
    monthlyRuns: number;
    lastRunAt: string | null;
    pendingApprovals: number;
    status: string;
  }> = {};

  let monthlyTotal = 0;
  for (const at of agentTypes) {
    const totalRuns = db.countAgentSessionsForUser(session.userId, at);
    const monthlyRuns = db.countAgentSessionsForUser(session.userId, at, 30);
    const last = db.getAgentSession(session.userId, at);
    const pendingApprovals = db.listPendingApprovals(session.userId).filter((a) => a.agent_type === at).length;
    monthlyTotal += monthlyRuns;
    stats[at] = {
      totalRuns,
      monthlyRuns,
      lastRunAt: last?.last_reported_at ?? null,
      pendingApprovals,
      status: last?.status ?? "idle",
    };
  }

  return NextResponse.json({
    plan: planDef
      ? {
          slug: planDef.slug,
          name: planDef.name,
          stageLabel: planDef.stageLabel,
          monthly_generation_limit: planDef.monthly_generation_limit,
        }
      : null,
    monthlyTotal,
    stats,
    pendingTotal: db.listPendingApprovals(session.userId).length,
  });
}
