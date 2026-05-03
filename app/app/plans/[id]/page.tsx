import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlanDetailClient } from "./PlanDetailClient";

export const dynamic = "force-dynamic";

export default async function PlanDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect(`/login?from=/app/plans/${params.id}`);

  const row = db.getPlanRun(session.userId, params.id);
  if (!row) notFound();

  let input: Record<string, unknown> = {};
  let spec: Record<string, unknown> = {};
  let thinking: { text: string }[] = [];
  let cost: Record<string, unknown> = {};
  let executionLog: Record<string, unknown>[] = [];
  try { input = JSON.parse(row.input_json); } catch {}
  try { spec = JSON.parse(row.spec_json); } catch {}
  try {
    const t = JSON.parse(row.thinking_json);
    if (Array.isArray(t)) thinking = t.filter((x) => x && typeof x.text === "string");
  } catch {}
  try { cost = JSON.parse(row.cost_json); } catch {}
  try {
    const log = JSON.parse(row.execution_log);
    if (Array.isArray(log)) executionLog = log;
  } catch {}

  return (
    <PlanDetailClient
      id={row.id}
      scope={row.scope}
      input={input}
      spec={spec}
      thinking={thinking}
      cost={cost}
      executionLog={executionLog}
      isFavorite={row.is_favorite === 1}
      createdAt={row.created_at}
      updatedAt={row.updated_at}
    />
  );
}
