import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { runAutoFlags, reviewStateFromFlags } from "@/lib/studio/auto-flags";
import type { EditableCard } from "@/lib/studio/card-types";

/**
 * 카드뉴스 결과물 보관함 — 편집 가능한 카드 묶음.
 *
 * 기존 /api/library는 일반 텍스트 결과물용이라, 카드뉴스 워크스페이스는 별도 엔드포인트.
 *
 * GET  /api/card-library   목록 (브랜드/검수상태 필터)
 * POST /api/card-library   신규 적재 (카드뉴스 자동 생성 결과를 받음)
 */

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = consume(`api:clib-list:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  const url = new URL(request.url);
  const brandId = url.searchParams.get("brandId");
  const reviewState = url.searchParams.get("reviewState") || undefined;
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "80", 10) || 80, 200);

  const opts: { brandId?: string | null; reviewState?: string; limit?: number } = { reviewState, limit };
  if (brandId !== null) opts.brandId = brandId === "" ? null : brandId;

  const rows = db.listCardLibrary(session.userId, opts);
  const items = rows.map((r) => ({
    id: r.id,
    brandId: r.brand_id,
    monthlyPlanId: r.monthly_plan_id,
    title: r.title,
    category: r.category,
    cardCount: (() => { try { return (JSON.parse(r.cards_json) as unknown[]).length; } catch { return 0; } })(),
    reviewState: r.review_state,
    autoFlags: JSON.parse(r.auto_flags || "[]"),
    thumb: r.thumb,
    isFavorite: r.is_favorite === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
  return NextResponse.json({ ok: true, items });
}

const CreateSchema = z.object({
  brandId: z.string().max(100).nullable().optional(),
  monthlyPlanId: z.string().max(100).nullable().optional(),
  cardId: z.string().max(100).nullable().optional(),
  title: z.string().min(1).max(200),
  category: z.string().max(60).optional(),
  cards: z.array(z.unknown()).min(1).max(20),
  caption: z.object({ variants: z.array(z.string()).min(1).max(5) }).optional(),
  hashtags: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  templateId: z.string().max(100).nullable().optional(),
  templateSnapshot: z.record(z.string(), z.unknown()).optional(),
  thumb: z.string().max(2_500_000).optional(),
  costKrw: z.number().int().min(0).max(100000).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!verifySameOrigin(request).ok) return NextResponse.json({ error: "Forbidden (CSRF)" }, { status: 403 });

  const rl = consume(`api:clib-create:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });

  // auto-flags 자동 검사
  const cardsArr = parsed.data.cards as EditableCard[];
  const flags = runAutoFlags(cardsArr);
  const review = reviewStateFromFlags(flags);

  const created = db.createCardLibrary(session.userId, {
    brand_id: parsed.data.brandId ?? null,
    monthly_plan_id: parsed.data.monthlyPlanId ?? null,
    card_id: parsed.data.cardId ?? null,
    title: parsed.data.title,
    category: parsed.data.category,
    cards_json: JSON.stringify(cardsArr),
    caption_json: JSON.stringify(parsed.data.caption ?? {}),
    hashtags: parsed.data.hashtags,
    template_id: parsed.data.templateId ?? null,
    template_snapshot: parsed.data.templateSnapshot ?? {},
    auto_flags: flags,
    thumb: parsed.data.thumb ?? null,
    cost_krw: parsed.data.costKrw ?? 0,
  });
  // review_state 적용
  db.updateCardLibrary(session.userId, created.id, { review_state: review });

  return NextResponse.json({ ok: true, id: created.id, autoFlags: flags, reviewState: review });
}
