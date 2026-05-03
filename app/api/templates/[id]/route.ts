import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import type { BrandTemplate } from "@/lib/studio/templates";

function rowToTemplate(r: ReturnType<typeof db.getBrandTemplate> & object): BrandTemplate {
  let tokens: BrandTemplate["tokens"];
  let toneProfile: BrandTemplate["toneProfile"];
  let referenceMeta: BrandTemplate["referenceMeta"];
  try { tokens = JSON.parse(r.tokens_json); } catch { tokens = {} as BrandTemplate["tokens"]; }
  try { toneProfile = JSON.parse(r.tone_profile); } catch { toneProfile = {} as BrandTemplate["toneProfile"]; }
  try { referenceMeta = JSON.parse(r.reference_meta); } catch { referenceMeta = {}; }
  return {
    id: r.id, userId: r.user_id, name: r.name,
    source: r.source as BrandTemplate["source"],
    tokens, toneProfile, referenceMeta,
    previewImage: r.preview_image,
    isActive: r.is_active === 1, isFavorite: r.is_favorite === 1,
    usageCount: r.usage_count,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = consume(`api:tpl-get:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  const row = db.getBrandTemplate(session.userId, params.id);
  if (!row) return NextResponse.json({ error: "템플릿을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true, template: rowToTemplate(row as ReturnType<typeof db.getBrandTemplate> & object) });
}

const PatchSchema = z.object({
  isActive: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = consume(`api:tpl-patch:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식" }, { status: 400 }); }
  const parsed = PatchSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });

  if (parsed.data.isActive === true) {
    const ok = db.activateBrandTemplate(session.userId, params.id);
    if (!ok) return NextResponse.json({ error: "템플릿을 찾을 수 없습니다." }, { status: 404 });
  }
  if (parsed.data.isFavorite !== undefined) {
    const ok = db.toggleBrandTemplateFavorite(session.userId, params.id, parsed.data.isFavorite);
    if (!ok) return NextResponse.json({ error: "템플릿을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = consume(`api:tpl-delete:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));
  try {
    const ok = db.softDeleteBrandTemplate(session.userId, params.id);
    if (!ok) return NextResponse.json({ error: "템플릿을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "삭제 실패" }, { status: 400 });
  }
}
