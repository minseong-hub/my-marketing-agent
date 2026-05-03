import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db, getDb } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { scoutOnce, persistCandidates } from "@/lib/references/auto-scout";

/**
 * POST /api/references/scout
 *
 * 마키 자동 스카우트 1회 실행. brand_profile + 사용자 입력 힌트로 외부 검색·후보 적재.
 *
 * 비용: 검색 API 사용 시 ~$0.001/호출, vision 분석은 별표 누를 때 lazy.
 */

const Schema = z.object({
  brandId: z.string().max(100).nullable().optional(),
  category: z.string().trim().min(1).max(60),
  voice: z.string().trim().max(60).optional(),
  hints: z.array(z.string().trim().min(1).max(40)).max(6).optional(),
  limit: z.number().int().min(1).max(10).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!verifySameOrigin(request).ok) return NextResponse.json({ error: "Forbidden (CSRF)" }, { status: 403 });

  const rl = consume(`api:scout:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });

  const userRow = db.getUserById(session.userId);
  const brandName = userRow?.brand_display_name || userRow?.business_name || "내 브랜드";

  const candidates = await scoutOnce(session.userId, {
    brandName,
    category: parsed.data.category,
    voice: parsed.data.voice,
    hints: parsed.data.hints,
    limit: parsed.data.limit ?? 5,
  });

  const inserted = persistCandidates(session.userId, parsed.data.brandId ?? null, candidates);

  return NextResponse.json({
    ok: true,
    inserted,
    candidates: candidates.map((c) => ({ domain: c.domain, title: c.title, fitScore: c.fitScore, query: c.query, reason: c.reason })),
    apiKeyMissing: !process.env.BRAVE_API_KEY,
  });
}
