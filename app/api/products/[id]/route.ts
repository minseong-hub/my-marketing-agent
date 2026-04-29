import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";

const ProductPatchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  category: z.string().max(60).optional(),
  price: z.number().int().nullable().optional(),
  cost: z.number().int().nullable().optional(),
  features: z.array(z.string().max(100)).max(20).optional(),
  selling_points: z.array(z.string().max(100)).max(10).optional(),
  target_keywords: z.array(z.string().max(60)).max(20).optional(),
  image_urls: z.array(z.string().max(500)).max(10).optional(),
  external_url: z.string().max(500).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  is_active: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = consume(`api:products-edit:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` }, rateLimitResponseInit(rl.retryAfterSec));

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 }); }
  const parsed = ProductPatchSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });
  const d = parsed.data;
  const patch: Record<string, unknown> = {};
  if (d.name !== undefined) patch.name = d.name;
  if (d.category !== undefined) patch.category = d.category;
  if (d.price !== undefined) patch.price = d.price;
  if (d.cost !== undefined) patch.cost = d.cost;
  if (d.features !== undefined) patch.features = JSON.stringify(d.features);
  if (d.selling_points !== undefined) patch.selling_points = JSON.stringify(d.selling_points);
  if (d.target_keywords !== undefined) patch.target_keywords = JSON.stringify(d.target_keywords);
  if (d.image_urls !== undefined) patch.image_urls = JSON.stringify(d.image_urls);
  if (d.external_url !== undefined) patch.external_url = d.external_url;
  if (d.notes !== undefined) patch.notes = d.notes;
  if (d.is_active !== undefined) patch.is_active = d.is_active ? 1 : 0;
  db.updateProduct(session.userId, params.id, patch);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  db.deleteProduct(session.userId, params.id);
  return NextResponse.json({ ok: true });
}
