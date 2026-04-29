import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";

const ProductSchema = z.object({
  name: z.string().trim().min(1).max(120),
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

function serialize(p: ReturnType<typeof db.listProducts>[number]) {
  const safeJson = (s: string, fallback: unknown) => { try { return JSON.parse(s); } catch { return fallback; } };
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    cost: p.cost,
    features: safeJson(p.features, []),
    selling_points: safeJson(p.selling_points, []),
    target_keywords: safeJson(p.target_keywords, []),
    image_urls: safeJson(p.image_urls, []),
    external_url: p.external_url,
    notes: p.notes,
    is_active: !!p.is_active,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = db.listProducts(session.userId, true).map(serialize);
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = consume(`api:products:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` }, rateLimitResponseInit(rl.retryAfterSec));

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 }); }
  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });
  const d = parsed.data;
  const created = db.createProduct(session.userId, {
    name: d.name,
    category: d.category ?? "",
    price: d.price ?? null,
    cost: d.cost ?? null,
    features: JSON.stringify(d.features ?? []),
    selling_points: JSON.stringify(d.selling_points ?? []),
    target_keywords: JSON.stringify(d.target_keywords ?? []),
    image_urls: JSON.stringify(d.image_urls ?? []),
    external_url: d.external_url ?? null,
    notes: d.notes ?? null,
    is_active: d.is_active === false ? 0 : 1,
  });
  return NextResponse.json({ product: serialize(created) }, { status: 201 });
}
