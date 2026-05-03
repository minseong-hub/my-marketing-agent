import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";

/**
 * GET /api/plans — 사용자 본인의 기획서 리스트.
 *  - 멀티테넌트: 모든 쿼리 user_id 격리.
 *  - 응답에는 spec_json/thinking_json 풀 데이터를 포함하지 않고 요약만 (상세는 [id] 라우트).
 */

const ListSchema = z.object({
  scope: z.enum(["marketing", "detail_page", "ads", "finance"]).optional(),
  favorite: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:plans-list:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));
  }

  const url = new URL(request.url);
  const parsed = ListSchema.safeParse({
    scope: url.searchParams.get("scope") || undefined,
    favorite: url.searchParams.get("favorite") || undefined,
    limit: url.searchParams.get("limit") || undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });

  const rows = db.listPlanRuns(session.userId, {
    scope: parsed.data.scope,
    favorite: parsed.data.favorite === "true",
    limit: parsed.data.limit,
  });

  // 리스트는 요약만 반환 — spec/thinking 풀 데이터는 [id] 라우트에서.
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
      cost: { costUsd: cost.costUsd, costKrw: cost.costKrw, model: cost.model },
      isFavorite: r.is_favorite === 1,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  });

  const counts = db.countPlanRuns(session.userId);

  return NextResponse.json({ ok: true, items, counts });
}
