import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db, getDb } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { decideCardCount, decideStructure, seedDesignTokens, buildCopyPrompt } from "@/lib/studio/card-composer";
import { runAutoFlags, reviewStateFromFlags } from "@/lib/studio/auto-flags";
import { getClaudeClient } from "@/lib/claude/client";
import { WORKER_MODEL } from "@/lib/ai/models";
import type { BrandTemplate } from "@/lib/studio/templates";
import type { EditableCard } from "@/lib/studio/card-types";

/**
 * POST /api/monthly-plan/[id]/auto-execute-card
 *
 * 인박스에서 단일 카드(PlannedCard)에 대해 AI 자동 생성.
 *  1) 활성 BrandTemplate (옵션) 로드 → 디자인 토큰 시드
 *  2) angle 분석 → 6~10장 동적 결정 + 카드 구조 결정
 *  3) Claude Sonnet으로 카드별 텍스트 채우기
 *  4) 자기검수(auto-flags) → review_state 결정
 *  5) card_library에 적재 → 보관함에서 확인 가능
 */

const Schema = z.object({
  cardId: z.string().min(1).max(100),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!verifySameOrigin(request).ok) return NextResponse.json({ error: "Forbidden (CSRF)" }, { status: 403 });

  const rl = consume(`api:auto-card:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  // 월간계획 + 카드 로드
  const plan = db.getMonthlyPlan(session.userId, params.id);
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  let cardsArr: any[];
  try { cardsArr = JSON.parse(plan.cards_json); } catch { return NextResponse.json({ error: "Plan cards parse error" }, { status: 500 }); }
  const card = cardsArr.find((c: any) => c.id === parsed.data.cardId);
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  // 활성 템플릿 로드 (옵션)
  let template: BrandTemplate | null = null;
  if (plan.brand_template_id && plan.brand_template_id !== "none") {
    const t = db.getBrandTemplate(session.userId, plan.brand_template_id);
    if (t) {
      try {
        template = {
          id: t.id, userId: t.user_id, name: t.name, source: t.source as any,
          tokens: JSON.parse(t.tokens_json),
          toneProfile: JSON.parse(t.tone_profile || "{}"),
          referenceMeta: JSON.parse(t.reference_meta || "{}"),
          previewImage: t.preview_image, isActive: t.is_active === 1, isFavorite: t.is_favorite === 1,
          usageCount: t.usage_count, createdAt: t.created_at, updatedAt: t.updated_at,
        };
      } catch {}
    }
  }

  // 카드 구조 결정
  const count = decideCardCount(card.angle || "", { category: card.category });
  const structure = decideStructure(card.angle || "", card.category || "", count);
  const seeded: EditableCard[] = seedDesignTokens(count, structure, { template });

  // 브랜드 프로필 가져오기
  const profileRow = getDb().prepare("SELECT * FROM brand_profiles WHERE user_id = ?").get(session.userId) as any;
  const userRow = db.getUserById(session.userId);
  const brandName = userRow?.brand_display_name || userRow?.business_name || "내 브랜드";

  // Claude로 텍스트 채우기 (실패해도 안전 fallback)
  let totalCostKrw = 0;
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { system, user } = buildCopyPrompt({
        brandName,
        category: card.category || "일반",
        angle: card.angle || card.title || "",
        cards: seeded,
        toneProfile: template?.toneProfile,
        brandVoice: profileRow?.brand_voice,
      });
      const client = getClaudeClient();
      const resp = await client.messages.create({
        model: WORKER_MODEL,
        max_tokens: 3500,
        system,
        messages: [{ role: "user", content: user }],
      });
      const text = resp.content.filter((b) => b.type === "text").map((b: any) => b.text).join("");
      const m = text.match(/\[[\s\S]*\]/);
      if (m) {
        const arr = JSON.parse(m[0]) as Array<EditableCard["text"]>;
        for (let i = 0; i < seeded.length && i < arr.length; i++) {
          seeded[i].text = { ...seeded[i].text, ...arr[i] };
        }
      }
      // 비용 추정 (대략 — input 1.5K + output 2.5K Sonnet @ ~₩4/K input + ~₩20/K output)
      totalCostKrw = Math.round((resp.usage.input_tokens / 1000) * 4 + (resp.usage.output_tokens / 1000) * 20);
    } catch {
      // fallback — 텍스트 비워둔 채로 적재 (사용자가 워크스페이스에서 직접 채움)
      seeded[0].text.headline = card.title || "헤드라인";
    }
  } else {
    seeded[0].text.headline = card.title || "헤드라인";
  }

  // 자기검수
  const flags = runAutoFlags(seeded);
  const review = reviewStateFromFlags(flags);

  // 보관함 적재
  const created = db.createCardLibrary(session.userId, {
    brand_id: (plan as any).brand_id ?? null,
    monthly_plan_id: plan.id,
    card_id: card.id,
    title: card.title || "제목 없음",
    category: card.category,
    cards_json: JSON.stringify(seeded),
    caption_json: JSON.stringify({ variants: card.captionVariants || [] }),
    hashtags: card.hashtags,
    template_id: template?.id ?? null,
    template_snapshot: template ? { tokens: template.tokens } : {},
    auto_flags: flags,
    cost_krw: totalCostKrw,
  });
  db.updateCardLibrary(session.userId, created.id, { review_state: review });

  // 카드 상태를 plan에 반영 (status='done', resultLibraryId)
  cardsArr = cardsArr.map((c: any) => c.id === card.id ? { ...c, status: "done", resultLibraryId: created.id } : c);
  db.updateMonthlyPlan(session.userId, plan.id, { cards_json: JSON.stringify(cardsArr) });

  return NextResponse.json({ ok: true, libraryId: created.id, autoFlags: flags, reviewState: review, costKrw: totalCostKrw });
}
