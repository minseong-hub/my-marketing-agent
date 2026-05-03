import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { generatePlannedCards, plannedCardsFromContentSeeds } from "@/lib/studio/monthly-planner";

/**
 * POST /api/monthly-plan
 *  - month + brandTemplateId + (totalCards + categoryMix) → 카드 시드 생성 → DB 저장
 *  - 또는 planRunId가 있으면 contentSeeds에서 변환
 *
 * GET /api/monthly-plan — 사용자 본인 모든 월간 계획
 */

const FromSeedsSchema = z.object({
  source: z.literal("from_plan_run"),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  brandTemplateId: z.string().min(1).max(100),
  planRunId: z.string().min(1).max(100),
  channel: z.string().min(1).max(40).default("instagram"),
});

const FromInputSchema = z.object({
  source: z.literal("manual"),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  brandTemplateId: z.string().min(1).max(100),
  totalCards: z.number().int().min(1).max(12),
  categoryMix: z.array(z.object({
    category: z.string().trim().min(1).max(40),
    ratio: z.number().min(0).max(1),
  })).min(1).max(8),
  preferredWeekdays: z.array(z.number().int().min(0).max(6)).max(7).optional(),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

const Schema = z.discriminatedUnion("source", [FromSeedsSchema, FromInputSchema]);

export async function GET(_request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = consume(`api:mplan-list:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  const rows = db.listMonthlyPlans(session.userId, 50);
  const items = rows.map((r) => {
    let cards: unknown = [];
    let progress: unknown = {};
    let autoMeta: { rationale?: string; confidence?: number; recommendedMix?: unknown; recommendedSchedule?: unknown } = {};
    try { cards = JSON.parse(r.cards_json); } catch {}
    try { progress = JSON.parse(r.progress_json); } catch {}
    try { autoMeta = JSON.parse((r as { auto_meta?: string }).auto_meta || "{}"); } catch {}
    return {
      id: r.id,
      month: r.month,
      planRunId: r.plan_run_id,
      brandTemplateId: r.brand_template_id,
      brandId: (r as { brand_id?: string | null }).brand_id ?? null,
      source: (r as { source?: string }).source ?? "manual",
      rationale: autoMeta.rationale,
      confidence: autoMeta.confidence,
      cards,
      progress,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:mplan-create:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식" }, { status: 400 }); }
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(" / ") }, { status: 400 });

  // brand_template 소유 확인
  const tpl = db.getBrandTemplate(session.userId, parsed.data.brandTemplateId);
  if (!tpl) return NextResponse.json({ error: "브랜드 템플릿을 찾을 수 없습니다." }, { status: 404 });

  let cards;
  let planRunId: string | null = null;
  if (parsed.data.source === "from_plan_run") {
    const planRow = db.getPlanRun(session.userId, parsed.data.planRunId);
    if (!planRow) return NextResponse.json({ error: "기획 코어 결과를 찾을 수 없습니다." }, { status: 404 });
    let seeds: unknown[] = [];
    try {
      const spec = JSON.parse(planRow.spec_json);
      seeds = Array.isArray(spec.contentSeeds) ? spec.contentSeeds : [];
    } catch {}
    cards = plannedCardsFromContentSeeds(seeds as never, { channel: parsed.data.channel });
    planRunId = planRow.id;
  } else {
    let tokens: { palette?: { accent?: string } } = {};
    try { tokens = JSON.parse(tpl.tokens_json); } catch {}
    cards = generatePlannedCards({
      month: parsed.data.month,
      totalCards: parsed.data.totalCards,
      categoryMix: parsed.data.categoryMix,
      preferredWeekdays: parsed.data.preferredWeekdays,
      preferredTime: parsed.data.preferredTime,
      brandAccentColor: tokens.palette?.accent,
    });
  }

  if (cards.length === 0) {
    return NextResponse.json({ error: "카드 시드를 생성할 수 없습니다. 입력값을 확인해주세요." }, { status: 422 });
  }

  try {
    const row = db.createMonthlyPlan(session.userId, {
      month: parsed.data.month,
      plan_run_id: planRunId,
      brand_template_id: parsed.data.brandTemplateId,
      cards_json: JSON.stringify(cards),
    });
    return NextResponse.json({
      ok: true,
      plan: {
        id: row.id,
        month: row.month,
        planRunId: row.plan_run_id,
        brandTemplateId: row.brand_template_id,
        cards,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "저장 실패" }, { status: 400 });
  }
}
