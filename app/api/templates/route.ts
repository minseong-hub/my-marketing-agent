import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import type { BrandTemplate } from "@/lib/studio/templates";

/**
 * GET /api/templates — 사용자 본인의 BrandTemplate 리스트.
 * POST /api/templates — 수동 생성 (tokens 직접 입력).
 *
 * 추출(레퍼런스 기반)은 /api/templates/extract.
 */

const ListSchema = z.object({
  favorite: z.enum(["true","false"]).optional(),
  activeOnly: z.enum(["true","false"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

function rowToTemplate(r: ReturnType<typeof db.getBrandTemplate> & object): BrandTemplate {
  let tokens: BrandTemplate["tokens"];
  let toneProfile: BrandTemplate["toneProfile"];
  let referenceMeta: BrandTemplate["referenceMeta"];
  try { tokens = JSON.parse(r.tokens_json); } catch { tokens = {} as BrandTemplate["tokens"]; }
  try { toneProfile = JSON.parse(r.tone_profile); } catch { toneProfile = {} as BrandTemplate["toneProfile"]; }
  try { referenceMeta = JSON.parse(r.reference_meta); } catch { referenceMeta = {}; }
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    source: r.source as BrandTemplate["source"],
    tokens,
    toneProfile,
    referenceMeta,
    previewImage: r.preview_image,
    isActive: r.is_active === 1,
    isFavorite: r.is_favorite === 1,
    usageCount: r.usage_count,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:tpl-list:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  const url = new URL(request.url);
  const parsed = ListSchema.safeParse({
    favorite: url.searchParams.get("favorite") || undefined,
    activeOnly: url.searchParams.get("activeOnly") || undefined,
    limit: url.searchParams.get("limit") || undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });

  const rows = db.listBrandTemplates(session.userId, {
    favorite: parsed.data.favorite === "true",
    activeOnly: parsed.data.activeOnly === "true",
    limit: parsed.data.limit,
  });
  const items = rows.map((r) => rowToTemplate(r as ReturnType<typeof db.getBrandTemplate> & object));
  const activeCount = db.countActiveBrandTemplates(session.userId);
  return NextResponse.json({ ok: true, items, activeCount, limit: 30 });
}

const CreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  tokens: z.record(z.string(), z.unknown()),
  toneProfile: z.record(z.string(), z.unknown()).optional(),
  source: z.enum(["manual","ai_generated","preset"]).default("manual"),
});

export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:tpl-create:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식" }, { status: 400 }); }
  const parsed = CreateSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });

  try {
    const row = db.createBrandTemplate(session.userId, {
      name: parsed.data.name,
      source: parsed.data.source,
      tokens_json: JSON.stringify(parsed.data.tokens),
      tone_profile: JSON.stringify(parsed.data.toneProfile ?? {}),
    });
    return NextResponse.json({ ok: true, template: rowToTemplate(row as ReturnType<typeof db.getBrandTemplate> & object) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "생성 실패" }, { status: 400 });
  }
}
