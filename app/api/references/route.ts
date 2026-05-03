import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";

/** GET /api/references — 사용자 보드 목록. ?brandId=... &starredOnly=true 지원 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = consume(`api:ref-list:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  const url = new URL(request.url);
  const brandId = url.searchParams.get("brandId");
  const starredOnly = url.searchParams.get("starredOnly") === "true";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "60", 10) || 60, 200);

  const opts: { brandId?: string | null; starredOnly?: boolean; limit?: number } = { starredOnly, limit };
  if (brandId !== null) opts.brandId = brandId === "" ? null : brandId;

  const rows = db.listReferenceBoard(session.userId, opts);
  const items = rows.map((r) => ({
    id: r.id,
    brandId: r.brand_id,
    source: r.source,
    domain: r.domain,
    title: r.title,
    memo: r.memo,
    tags: JSON.parse(r.tags || "[]"),
    previewImage: r.preview_image,
    designTokens: JSON.parse(r.design_tokens || "{}"),
    fitScore: r.fit_score,
    query: r.query,
    isStarred: r.is_starred === 1,
    promotedTemplateId: r.promoted_template_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
  return NextResponse.json({ ok: true, items });
}

const PostSchema = z.object({
  brandId: z.string().max(100).nullable().optional(),
  source: z.enum(["user_url", "user_upload"]),
  url: z.string().url().max(500).optional(),
  title: z.string().max(200).optional(),
  memo: z.string().max(1000).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
  previewImage: z.string().max(2_000_000).optional(),  // base64 dataURL — 1.5MB 정도까지
});

const ALLOW_DOMAINS = ["instagram.com", "www.instagram.com", "pinterest.com", "www.pinterest.com", "blog.naver.com", "tistory.com", "behance.net"];

/** POST /api/references — 사용자 수동 추가 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!verifySameOrigin(request).ok) return NextResponse.json({ error: "Forbidden (CSRF)" }, { status: 403 });

  const rl = consume(`api:ref-create:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });

  let domain: string | null = null;
  if (parsed.data.url) {
    try {
      const u = new URL(parsed.data.url);
      const allowed = ALLOW_DOMAINS.some((d) => u.hostname === d || u.hostname.endsWith("." + d));
      if (!allowed) return NextResponse.json({ error: `허용되지 않은 도메인: ${u.hostname}` }, { status: 400 });
      domain = u.hostname;
    } catch {
      return NextResponse.json({ error: "URL 파싱 실패" }, { status: 400 });
    }
  }

  if (parsed.data.previewImage) {
    if (!parsed.data.previewImage.startsWith("data:image/")) return NextResponse.json({ error: "이미지 형식 오류" }, { status: 400 });
    if (parsed.data.previewImage.length > 2_000_000) return NextResponse.json({ error: "이미지 1.5MB 초과" }, { status: 400 });
  }

  try {
    const ref = db.createReference(session.userId, {
      brand_id: parsed.data.brandId ?? null,
      source: parsed.data.source,
      domain,
      title: parsed.data.title || domain || "레퍼런스",
      memo: parsed.data.memo,
      tags: parsed.data.tags,
      preview_image: parsed.data.previewImage ?? null,
      fit_score: parsed.data.source === "user_url" ? 70 : 60,
    });
    return NextResponse.json({
      ok: true,
      reference: {
        id: ref.id,
        domain: ref.domain,
        title: ref.title,
        memo: ref.memo,
        tags: JSON.parse(ref.tags || "[]"),
        fitScore: ref.fit_score,
        isStarred: false,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "저장 실패" }, { status: 400 });
  }
}
