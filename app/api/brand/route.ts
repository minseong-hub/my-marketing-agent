import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";

const BrandSchema = z.object({
  brand_voice: z.string().max(500).optional(),
  target_audience: z.string().max(500).optional(),
  unique_value: z.string().max(500).optional(),
  brand_story: z.string().max(2000).optional(),
  do_not_use: z.string().max(500).optional(),
  hashtag_library: z.array(z.string().max(60)).max(50).optional(),
  competitor_urls: z.array(z.string().max(300)).max(20).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = db.getBrandProfile(session.userId);
  if (!profile) {
    return NextResponse.json({
      brand_voice: "",
      target_audience: "",
      unique_value: "",
      brand_story: "",
      do_not_use: "",
      hashtag_library: [],
      competitor_urls: [],
    });
  }
  let hashtagLibrary: string[] = [];
  let competitorUrls: string[] = [];
  try { hashtagLibrary = JSON.parse(profile.hashtag_library || "[]"); } catch {}
  try { competitorUrls = JSON.parse(profile.competitor_urls || "[]"); } catch {}
  return NextResponse.json({
    brand_voice: profile.brand_voice,
    target_audience: profile.target_audience,
    unique_value: profile.unique_value,
    brand_story: profile.brand_story,
    do_not_use: profile.do_not_use,
    hashtag_library: hashtagLibrary,
    competitor_urls: competitorUrls,
    updated_at: profile.updated_at,
  });
}

export async function PUT(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = consume(`api:brand:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) {
    return NextResponse.json({ error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` }, rateLimitResponseInit(rl.retryAfterSec));
  }
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 }); }
  const parsed = BrandSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });
  }
  const data = parsed.data;
  db.upsertBrandProfile(session.userId, {
    brand_voice: data.brand_voice,
    target_audience: data.target_audience,
    unique_value: data.unique_value,
    brand_story: data.brand_story,
    do_not_use: data.do_not_use,
    hashtag_library: data.hashtag_library ? JSON.stringify(data.hashtag_library) : undefined,
    competitor_urls: data.competitor_urls ? JSON.stringify(data.competitor_urls) : undefined,
  });
  return NextResponse.json({ ok: true });
}
