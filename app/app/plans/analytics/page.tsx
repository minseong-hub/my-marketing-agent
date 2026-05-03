import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlansAnalyticsClient } from "./PlansAnalyticsClient";

export const dynamic = "force-dynamic";

export default async function PlansAnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/app/plans/analytics");

  const rows = db.listPlanRuns(session.userId, { limit: 200 });

  const items = rows.map((r) => {
    let cost = { costUsd: 0, costKrw: 0, model: "", inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0 };
    let summary: { headline?: string; hookInsight?: string; nextSevenDaysCount?: number } = {};
    let seedsCount = 0;
    let autoExecutableCount = 0;
    let logCount = 0;
    try {
      const c = JSON.parse(r.cost_json);
      cost = { ...cost, ...c };
    } catch {}
    try {
      const spec = JSON.parse(r.spec_json);
      summary = spec.summary || {};
      seedsCount = Array.isArray(spec.contentSeeds) ? spec.contentSeeds.length : 0;
      autoExecutableCount = Array.isArray(spec.contentSeeds) ? spec.contentSeeds.filter((s: { autoExecutable?: boolean }) => s.autoExecutable).length : 0;
    } catch {}
    try { const log = JSON.parse(r.execution_log); if (Array.isArray(log)) logCount = log.length; } catch {}
    return {
      id: r.id,
      scope: r.scope,
      cost,
      summary,
      seedsCount,
      autoExecutableCount,
      executionLogCount: logCount,
      createdAt: r.created_at,
    };
  });

  return <PlansAnalyticsClient items={items} />;
}
