import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";

const ReferenceSampleSchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().max(80).optional(),
  source: z.string().max(40).optional(),
  source_url: z.string().max(2000).optional(),
  text: z.string().min(10).max(8000),
  hashtags: z.array(z.string().max(60)).max(40).optional(),
  added_at: z.string(),
});

const StyleGuideSchema = z.object({
  sentence_length: z.enum(["short","medium","long","mixed"]).optional(),
  emoji_policy: z.enum(["none","minimal","moderate","rich"]).optional(),
  tone_keywords: z.array(z.string().max(30)).max(10).optional(),
  formality: z.enum(["casual","polite","formal"]).optional(),
  paragraph_pattern: z.string().max(300).optional(),
  signature_phrases: z.array(z.string().max(120)).max(10).optional(),
});

const StructureTemplateSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(1).max(80),
  agent_type: z.string().max(40).optional(),
  body: z.string().min(10).max(4000),
  added_at: z.string(),
});

const VisualRefSchema = z.object({
  id: z.string().min(1).max(40),
  url: z.string().max(2000).optional(),
  description: z.string().min(1).max(400),
  keywords: z.array(z.string().max(40)).max(15).optional(),
  added_at: z.string(),
});

const BrandSchema = z.object({
  brand_voice: z.string().max(500).optional(),
  target_audience: z.string().max(500).optional(),
  unique_value: z.string().max(500).optional(),
  brand_story: z.string().max(2000).optional(),
  do_not_use: z.string().max(500).optional(),
  hashtag_library: z.array(z.string().max(60)).max(50).optional(),
  competitor_urls: z.array(z.string().max(300)).max(20).optional(),
  reference_samples: z.array(ReferenceSampleSchema).max(20).optional(),
  style_guide: StyleGuideSchema.optional(),
  structure_templates: z.array(StructureTemplateSchema).max(15).optional(),
  visual_refs: z.array(VisualRefSchema).max(20).optional(),
});

function parseJsonField<T>(s: string | undefined, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

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
      reference_samples: [],
      style_guide: {},
      structure_templates: [],
      visual_refs: [],
    });
  }
  return NextResponse.json({
    brand_voice: profile.brand_voice,
    target_audience: profile.target_audience,
    unique_value: profile.unique_value,
    brand_story: profile.brand_story,
    do_not_use: profile.do_not_use,
    hashtag_library: parseJsonField<string[]>(profile.hashtag_library, []),
    competitor_urls: parseJsonField<string[]>(profile.competitor_urls, []),
    reference_samples: parseJsonField<unknown[]>(profile.reference_samples, []),
    style_guide: parseJsonField<Record<string, unknown>>(profile.style_guide, {}),
    structure_templates: parseJsonField<unknown[]>(profile.structure_templates, []),
    visual_refs: parseJsonField<unknown[]>(profile.visual_refs, []),
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
    reference_samples: data.reference_samples ? JSON.stringify(data.reference_samples) : undefined,
    style_guide: data.style_guide ? JSON.stringify(data.style_guide) : undefined,
    structure_templates: data.structure_templates ? JSON.stringify(data.structure_templates) : undefined,
    visual_refs: data.visual_refs ? JSON.stringify(data.visual_refs) : undefined,
  });
  return NextResponse.json({ ok: true });
}
