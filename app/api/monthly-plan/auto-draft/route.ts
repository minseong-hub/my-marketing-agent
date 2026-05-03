import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db, getDb } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { generateAutoPlan } from "@/lib/studio/monthly-plan-auto";

/**
 * POST /api/monthly-plan/auto-draft
 *
 * 마키가 brand_profile + 직전 plan_run의 self_learning을 읽어 자동으로
 * 한 달치 PlannedCard를 생성한다. 사용자 슬라이더 입력은 옵션.
 *
 * 요청 body:
 *  { month, brandTemplateId, brandId?, userOverrides? }
 */

const Schema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  brandTemplateId: z.string().min(1).max(100),
  brandId: z.string().max(100).nullable().optional(),
  userOverrides: z.object({
    totalCards: z.number().int().min(1).max(12).optional(),
    categoryMix: z.array(z.object({
      category: z.string().trim().min(1).max(40),
      ratio: z.number().min(0).max(1),
    })).max(8).optional(),
    weekdays: z.array(z.number().int().min(0).max(6)).max(7).optional(),
    time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!verifySameOrigin(request).ok) return NextResponse.json({ error: "Forbidden (CSRF)" }, { status: 403 });

  const rl = consume(`api:mplan-auto:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });

  const data = parsed.data;

  // brand_profile 읽기
  const profileRow = getDb().prepare("SELECT * FROM brand_profiles WHERE user_id = ?").get(session.userId) as {
    brand_voice?: string;
    target_audience?: string;
    unique_value?: string;
    do_not_use?: string;
  } | undefined;

  const userRow = db.getUserById(session.userId);

  // 직전 marketing scope plan_run의 self_learning 읽기
  const lastRun = getDb().prepare(
    "SELECT self_learning FROM plan_runs WHERE user_id = ? AND scope = 'marketing' AND status = 'active' ORDER BY updated_at DESC LIMIT 1"
  ).get(session.userId) as { self_learning?: string } | undefined;
  let priorLearning: string | undefined;
  if (lastRun?.self_learning) {
    try {
      const obj = JSON.parse(lastRun.self_learning);
      priorLearning = typeof obj === "string" ? obj : JSON.stringify(obj).slice(0, 1500);
    } catch {}
  }

  const result = await generateAutoPlan({
    userId: session.userId,
    month: data.month,
    brandTemplateId: data.brandTemplateId,
    brandProfile: {
      brandName: userRow?.brand_display_name || userRow?.business_name || "내 브랜드",
      voice: profileRow?.brand_voice,
      targetAudience: profileRow?.target_audience,
      uniqueValue: profileRow?.unique_value,
      doNotUse: profileRow?.do_not_use,
      industry: userRow?.industry,
    },
    priorLearning,
    userOverrides: data.userOverrides,
  });

  // 저장 (source = 'auto')
  let plan;
  try {
    plan = db.createMonthlyPlan(session.userId, {
      month: data.month,
      brand_template_id: data.brandTemplateId,
      cards_json: JSON.stringify(result.cards),
    });
    // brand_id, source, auto_meta 업데이트
    getDb().prepare(
      "UPDATE monthly_card_plans SET brand_id = ?, source = 'auto', auto_meta = ? WHERE id = ? AND user_id = ?"
    ).run(
      data.brandId ?? null,
      JSON.stringify({
        rationale: result.rationale,
        confidence: result.confidence,
        recommendedMix: result.recommendedMix,
        recommendedSchedule: result.recommendedSchedule,
        generatedAt: new Date().toISOString(),
      }),
      plan.id,
      session.userId,
    );
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "저장 실패" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    plan: {
      id: plan.id,
      month: plan.month,
      cards: result.cards,
      rationale: result.rationale,
      confidence: result.confidence,
      recommendedMix: result.recommendedMix,
      recommendedSchedule: result.recommendedSchedule,
      status: plan.status,
    },
  });
}
