import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { computeInsights } from "@/lib/references/board-insights";

/** GET /api/references/board-insights?brandId=... — 브랜드 DNA 분석 결과 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = consume(`api:ref-insights:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  const url = new URL(request.url);
  const brandId = url.searchParams.get("brandId");

  const opts: { brandId?: string | null } = {};
  if (brandId !== null) opts.brandId = brandId === "" ? null : brandId;

  const rows = db.listReferenceBoard(session.userId, { ...opts, limit: 200 });
  const insights = computeInsights(rows);
  return NextResponse.json({ ok: true, insights });
}
