import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlansListClient } from "./PlansListClient";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/app/plans");

  // 서버 사이드에서 1차 데이터 — 클라이언트는 필터/페이징만 담당
  const rows = db.listPlanRuns(session.userId, { limit: 100 });
  const counts = db.countPlanRuns(session.userId);

  const items = rows.map((r) => {
    let summary: Record<string, unknown> = {};
    let cost: Record<string, unknown> = {};
    let seedsCount = 0;
    let autoExecutableCount = 0;
    try {
      const spec = JSON.parse(r.spec_json);
      summary = spec.summary || {};
      seedsCount = Array.isArray(spec.contentSeeds) ? spec.contentSeeds.length : 0;
      autoExecutableCount = Array.isArray(spec.contentSeeds) ? spec.contentSeeds.filter((s: { autoExecutable?: boolean }) => s.autoExecutable).length : 0;
    } catch {}
    try { cost = JSON.parse(r.cost_json); } catch {}
    let logCount = 0;
    try { const log = JSON.parse(r.execution_log); if (Array.isArray(log)) logCount = log.length; } catch {}
    return {
      id: r.id,
      scope: r.scope,
      summary,
      seedsCount,
      autoExecutableCount,
      executionLogCount: logCount,
      cost: { costUsd: (cost.costUsd as number) || 0, costKrw: (cost.costKrw as number) || 0, model: String(cost.model || "") },
      isFavorite: r.is_favorite === 1,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  });

  return <PlansListClient initialItems={items} initialCounts={counts} />;
}
