import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { checkQuotaForRun } from "@/lib/security/quota";
import { recordAuthEvent, extractRequestMeta } from "@/lib/security/audit";
import {
  extractFromPostUrl,
  extractFromAccountHandle,
  wrapUploadedImages,
  type InstagramExtractResult,
} from "@/lib/references/instagram-extractor";
import { analyzeDesignFromImages } from "@/lib/ai/design-vision";
import type { BrandTemplate } from "@/lib/studio/templates";

/**
 * POST /api/templates/extract
 *  - 인스타 URL / 계정 핸들 / 사용자 업로드 이미지에서 디자인 토큰 추출
 *  - Claude vision으로 분석 → BrandTemplate 생성
 *  - 보안: instagram.com만 화이트리스트, 이미지 업로드 5MB 제한, 분석 후 원본 폐기
 */

const Schema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("instagram_url"),
    instagramUrl: z.string().trim().url().max(500),
    name: z.string().trim().min(1).max(100).optional(),
    brandHint: z.string().trim().max(300).optional(),
  }),
  z.object({
    source: z.literal("instagram_account"),
    instagramHandle: z.string().trim().min(1).max(40),
    name: z.string().trim().min(1).max(100).optional(),
    brandHint: z.string().trim().max(300).optional(),
  }),
  z.object({
    source: z.literal("image_upload"),
    images: z.array(z.string().trim().min(50).max(5_500_000)).min(1).max(6),  // base64 data URL — 5MB ≈ 6.7M chars, 안전 버퍼
    name: z.string().trim().min(1).max(100).optional(),
    brandHint: z.string().trim().max(300).optional(),
  }),
]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

function validateUploadedImages(images: string[]): { ok: boolean; reason?: string } {
  for (const img of images) {
    const m = img.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
    if (!m) return { ok: false, reason: "이미지는 data:image/...;base64,... 형식이어야 합니다." };
    if (!ALLOWED_MIME.includes(m[1])) return { ok: false, reason: `허용되지 않은 MIME: ${m[1]} (jpeg/png/webp만)` };
    // base64 길이로 대략적인 바이트 수 추정
    const approxBytes = Math.floor((m[2].length * 3) / 4);
    if (approxBytes > MAX_IMAGE_BYTES) return { ok: false, reason: `이미지 한 장당 5MB 초과 (~${Math.round(approxBytes / 1024 / 1024)}MB)` };
  }
  return { ok: true };
}

export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:tpl-extract:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` },
      rateLimitResponseInit(rl.retryAfterSec),
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY 미설정" }, { status: 503 });
  }

  // Quota — vision 호출은 비용 발생
  const quota = checkQuotaForRun(session.userId, { trigger: "manual" });
  if (!quota.ok) {
    recordAuthEvent({
      kind: "quota_exceeded",
      ...extractRequestMeta(request),
      user_id: session.userId,
      email: session.email,
      detail: `templates-extract usage=${quota.usage}/${quota.limit ?? "∞"}`,
    });
    return NextResponse.json({ error: quota.reason, usage: quota.usage, limit: quota.limit }, { status: 402 });
  }

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식" }, { status: 400 }); }
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(" / ") }, { status: 400 });

  // 추출
  let extracted: InstagramExtractResult;
  try {
    if (parsed.data.source === "instagram_url") {
      extracted = await extractFromPostUrl(parsed.data.instagramUrl);
    } else if (parsed.data.source === "instagram_account") {
      extracted = await extractFromAccountHandle(parsed.data.instagramHandle);
    } else {
      const v = validateUploadedImages(parsed.data.images);
      if (!v.ok) return NextResponse.json({ error: v.reason }, { status: 400 });
      extracted = wrapUploadedImages(parsed.data.images);
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "추출 실패" }, { status: 422 });
  }

  // 분석
  let analyzed;
  try {
    analyzed = await analyzeDesignFromImages({
      images: extracted.images,
      brandHint: parsed.data.brandHint,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[templates/extract] vision 실패:", msg, "이미지 수:", extracted.images.length);
    // 사용자에게 친절한 메시지
    let userHint = "";
    if (msg.includes("HTTP 403") || msg.includes("HTTP 401")) {
      userHint = " (인스타가 봇 접근을 차단함 — 이미지 직접 업로드 모드를 사용해주세요)";
    } else if (msg.includes("HTTP 404")) {
      userHint = " (이미지 URL이 만료되었거나 비공개입니다)";
    } else if (msg.includes("aborted") || msg.includes("timeout")) {
      userHint = " (이미지 다운로드 타임아웃 — 이미지 직접 업로드를 권장합니다)";
    } else if (msg.includes("invalid_request") || msg.includes("invalid image")) {
      userHint = " (Anthropic이 이미지를 처리하지 못함 — 다른 이미지로 시도해주세요)";
    }
    return NextResponse.json({ error: `이미지 분석 실패: ${msg}${userHint}` }, { status: 502 });
  }

  // 토큰 사용량 기록
  try {
    db.recordTokenUsage({
      user_id: session.userId,
      session_id: null,
      agent_type: "marketing",
      model: analyzed.cost.model,
      input_tokens: analyzed.cost.inputTokens,
      output_tokens: analyzed.cost.outputTokens,
      cache_read_tokens: analyzed.cost.cacheReadTokens,
      cache_creation_tokens: analyzed.cost.cacheCreationTokens,
    });
  } catch {}

  // 저장 — 원본 URL은 referenceMeta에 저장하지 않고 도메인/메타만
  const sourceTypeMap = {
    instagram_url: "reference_url" as const,
    instagram_account: "reference_account" as const,
    image_upload: "reference_image" as const,
  };
  const refMeta = {
    sourceDomain: extracted.meta.sourceDomain,
    extractedAt: extracted.meta.extractedAt,
    sampleCount: extracted.meta.sampleCount,
    notes: analyzed.notes || extracted.meta.note,
  };

  let row;
  try {
    row = db.createBrandTemplate(session.userId, {
      name: parsed.data.name?.trim() || analyzed.suggestedName,
      source: sourceTypeMap[parsed.data.source],
      tokens_json: JSON.stringify(analyzed.tokens),
      tone_profile: JSON.stringify(analyzed.toneProfile),
      reference_meta: JSON.stringify(refMeta),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "저장 실패" }, { status: 400 });
  }

  // 활성 템플릿이 없으면 자동 활성화
  const active = db.getActiveBrandTemplate(session.userId);
  if (!active) {
    db.activateBrandTemplate(session.userId, row.id);
  }

  // 응답: 원본 이미지 URL은 노출하지 않음 (저작권/재배포 방지)
  const template: BrandTemplate = {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    source: row.source as BrandTemplate["source"],
    tokens: analyzed.tokens,
    toneProfile: analyzed.toneProfile,
    referenceMeta: refMeta,
    previewImage: row.preview_image,
    isActive: !active,  // 방금 활성화 여부
    isFavorite: false,
    usageCount: 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  return NextResponse.json({
    ok: true,
    template,
    cost: analyzed.cost,
    sampleCount: extracted.meta.sampleCount,
    note: extracted.meta.note,
  });
}
