import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";

/**
 * /api/plans/[id]
 *  - GET    : 본인 기획서 상세 (input/spec/thinking/cost/executionLog 풀 데이터)
 *  - PATCH  : 즐겨찾기 토글
 *  - DELETE : 소프트 삭제 (status=deleted)
 *
 * 보안: getPlanRun/togglePlanRunFavorite/softDeletePlanRun 모두 (id AND user_id) 페어로 격리.
 */

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:plan-get:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  const row = db.getPlanRun(session.userId, params.id);
  if (!row) return NextResponse.json({ error: "기획서를 찾을 수 없습니다." }, { status: 404 });

  let input: unknown = {};
  let spec: unknown = {};
  let thinking: unknown[] = [];
  let cost: unknown = {};
  let executionLog: unknown[] = [];
  let selfLearning: unknown = {};
  try { input = JSON.parse(row.input_json); } catch {}
  try { spec = JSON.parse(row.spec_json); } catch {}
  try { thinking = JSON.parse(row.thinking_json); if (!Array.isArray(thinking)) thinking = []; } catch {}
  try { cost = JSON.parse(row.cost_json); } catch {}
  try { executionLog = JSON.parse(row.execution_log); if (!Array.isArray(executionLog)) executionLog = []; } catch {}
  try { selfLearning = JSON.parse(row.self_learning); } catch {}

  return NextResponse.json({
    ok: true,
    plan: {
      id: row.id,
      scope: row.scope,
      input,
      spec,
      thinking,
      cost,
      executionLog,
      selfLearning,
      isFavorite: row.is_favorite === 1,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
  });
}

const PatchSchema = z.object({
  isFavorite: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:plan-patch:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식" }, { status: 400 }); }
  const parsed = PatchSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });

  if (parsed.data.isFavorite !== undefined) {
    const ok = db.togglePlanRunFavorite(session.userId, params.id, parsed.data.isFavorite);
    if (!ok) return NextResponse.json({ error: "기획서를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:plan-delete:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  const ok = db.softDeletePlanRun(session.userId, params.id);
  if (!ok) return NextResponse.json({ error: "기획서를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
