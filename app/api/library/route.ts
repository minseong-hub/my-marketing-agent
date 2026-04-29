import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";

const CreateSchema = z.object({
  agent_type: z.enum(["marketing", "detail_page", "ads", "finance", "user"]).default("user"),
  kind: z.string().min(1).max(40),
  title: z.string().min(1).max(200),
  content: z.string().max(20000).default(""),
  metadata: z.record(z.string(), z.unknown()).optional(),
  product_id: z.string().max(60).optional().nullable(),
  tags: z.array(z.string().max(60)).max(20).optional(),
  is_favorite: z.boolean().optional(),
});

function serialize(r: ReturnType<typeof db.listLibraryItems>[number]) {
  const safe = (s: string, fb: unknown) => { try { return JSON.parse(s); } catch { return fb; } };
  return {
    id: r.id,
    agent_type: r.agent_type,
    kind: r.kind,
    title: r.title,
    content: r.content,
    metadata: safe(r.metadata, {}),
    product_id: r.product_id,
    source_session_id: r.source_session_id,
    tags: safe(r.tags, []),
    is_favorite: !!r.is_favorite,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const items = db.listLibraryItems(session.userId, {
    kind: searchParams.get("kind") || undefined,
    agent_type: searchParams.get("agent_type") || undefined,
    favorite: searchParams.get("favorite") === "1" ? true : undefined,
    q: searchParams.get("q") || undefined,
    limit: 200,
  }).map(serialize);
  const counts = db.countLibraryItems(session.userId);
  return NextResponse.json({ items, counts });
}

export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = consume(`api:library:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` }, rateLimitResponseInit(rl.retryAfterSec));

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 }); }
  const parsed = CreateSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });
  const d = parsed.data;
  const created = db.createLibraryItem(session.userId, {
    agent_type: d.agent_type,
    kind: d.kind,
    title: d.title,
    content: d.content,
    metadata: JSON.stringify(d.metadata ?? {}),
    product_id: d.product_id ?? null,
    tags: JSON.stringify(d.tags ?? []),
    is_favorite: d.is_favorite ? 1 : 0,
  });
  return NextResponse.json({ item: serialize(created) }, { status: 201 });
}
