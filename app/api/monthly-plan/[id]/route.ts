import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import type { PlannedCard } from "@/lib/studio/templates";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = consume(`api:mplan-get:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  const row = db.getMonthlyPlan(session.userId, params.id);
  if (!row) return NextResponse.json({ error: "월간 계획을 찾을 수 없습니다." }, { status: 404 });

  let cards: unknown = [];
  let progress: unknown = {};
  try { cards = JSON.parse(row.cards_json); } catch {}
  try { progress = JSON.parse(row.progress_json); } catch {}

  return NextResponse.json({
    ok: true,
    plan: {
      id: row.id,
      month: row.month,
      planRunId: row.plan_run_id,
      brandTemplateId: row.brand_template_id,
      cards,
      progress,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
  });
}

const PatchSchema = z.object({
  cards: z.array(z.record(z.string(), z.unknown())).max(12).optional(),
  status: z.enum(["planning","approved","generating","done"]).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = consume(`api:mplan-patch:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  const row = db.getMonthlyPlan(session.userId, params.id);
  if (!row) return NextResponse.json({ error: "월간 계획을 찾을 수 없습니다." }, { status: 404 });

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식" }, { status: 400 }); }
  const parsed = PatchSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });

  const patch: { cards_json?: string; status?: string } = {};

  if (parsed.data.cards) {
    // 카드 배열 sanitize — title/angle/category/planDate 등 안전 길이 제한
    const cleaned: PlannedCard[] = parsed.data.cards.map((c, i) => {
      const r = c as Record<string, unknown>;
      return {
        id: typeof r.id === "string" ? r.id.slice(0, 50) : `pc_${i}`,
        seedId: typeof r.seedId === "string" ? r.seedId.slice(0, 50) : undefined,
        planDate: typeof r.planDate === "string" ? r.planDate.slice(0, 10) : "",
        planTime: typeof r.planTime === "string" ? r.planTime.slice(0, 5) : "19:00",
        title: typeof r.title === "string" ? r.title.slice(0, 100) : "",
        angle: typeof r.angle === "string" ? r.angle.slice(0, 300) : "",
        cardKinds: Array.isArray(r.cardKinds) ? (r.cardKinds as string[]).slice(0, 8) : ["hook","problem","solution","proof","compare","cta"],
        hashtags: Array.isArray(r.hashtags) ? (r.hashtags as string[]).slice(0, 15).map((h) => String(h).slice(0, 40)) : [],
        category: typeof r.category === "string" ? r.category.slice(0, 40) : "기타",
        previewColor: typeof r.previewColor === "string" ? r.previewColor.slice(0, 9) : "#5ce5ff",
        thumbnailType: ["stat","photo","quote","color_block"].includes(String(r.thumbnailType)) ? r.thumbnailType as PlannedCard["thumbnailType"] : "color_block",
        excluded: Boolean(r.excluded),
        status: ["planned","approved","generating","done","failed"].includes(String(r.status)) ? r.status as PlannedCard["status"] : "planned",
      };
    });
    patch.cards_json = JSON.stringify(cleaned);
  }

  if (parsed.data.status) patch.status = parsed.data.status;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: true, noop: true });
  }

  const ok = db.updateMonthlyPlan(session.userId, params.id, patch);
  if (!ok) return NextResponse.json({ error: "업데이트 실패" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = consume(`api:mplan-delete:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  const ok = db.deleteMonthlyPlan(session.userId, params.id);
  if (!ok) return NextResponse.json({ error: "월간 계획을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
