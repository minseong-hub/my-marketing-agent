import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { FAL_IMAGE_MODELS, type ImageQuality } from "@/lib/ai/image-models";

/**
 * 외부 이미지 생성 프록시 (디자인 코어).
 *
 * quality 티어:
 *  - draft  : Flux Schnell  — 빠른 미리보기 (기본값)
 *  - design : Recraft v3    — 카드뉴스/일러스트, 텍스트 렌더링 강함
 *  - photo  : Flux Pro 1.1  — 사진 같은 photorealistic, 광고/제품 후크
 *
 * fal.ai (FAL_KEY) 우선. Replicate (REPLICATE_API_TOKEN) 는 호환성 fallback (Schnell만).
 * 모두 미설정 시 imageUrl: null + reason 반환 → 클라이언트 그라디언트 폴백.
 */

const Schema = z.object({
  prompt: z.string().min(3).max(500),
  ratio: z.enum(["1:1", "4:5", "9:16"]).default("1:1"),
  count: z.number().int().min(1).max(4).default(1),
  quality: z.enum(["draft", "design", "photo"]).default("draft"),
});

export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:studio-image:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) {
    return NextResponse.json({ error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` }, rateLimitResponseInit(rl.retryAfterSec));
  }

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 }); }
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });

  const { prompt, ratio, quality } = parsed.data;
  const replicate = process.env.REPLICATE_API_TOKEN;
  const fal = process.env.FAL_KEY;

  if (!replicate && !fal) {
    return NextResponse.json({
      ok: true,
      imageUrl: null,
      provider: "none",
      quality,
      reason: "이미지 생성 API 키가 설정되지 않았습니다. 그라디언트 배경으로 폴백합니다. (FAL_KEY 또는 REPLICATE_API_TOKEN 설정 시 자동 활성화)",
    });
  }

  // fal.ai 우선 — 디자인 코어의 모든 quality 티어가 fal.ai 모델 카탈로그에 등록되어 있음
  if (fal) {
    const config = FAL_IMAGE_MODELS[quality as ImageQuality];
    try {
      const r = await fetch(config.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Key ${fal}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config.buildPayload(prompt, ratio)),
      });
      const data = await r.json();
      const url = config.extractImageUrl(data);
      if (url) return NextResponse.json({ ok: true, imageUrl: url, provider: "fal", quality, model: config.label });
      return NextResponse.json({
        ok: true,
        imageUrl: null,
        provider: "fal",
        quality,
        model: config.label,
        reason: `${config.label} 응답 형식 오류`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json({
        ok: true,
        imageUrl: null,
        provider: "fal",
        quality,
        model: config.label,
        reason: `${config.label} 오류: ${msg}`,
      });
    }
  }

  // Replicate fallback (호환성) — Schnell만. design/photo 요청해도 Schnell로 실행되며 reason에 안내.
  if (replicate) {
    try {
      const startRes = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Token ${replicate}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // black-forest-labs/flux-schnell
          version: "f2ab8a5bfe79f02f0789a146cf5e73d2a4ff2684a98c2b303d1e1ff3814271db",
          input: { prompt, aspect_ratio: ratio, num_outputs: 1, output_format: "png" },
        }),
      });
      const start = await startRes.json();
      const pollUrl = start?.urls?.get;
      if (!pollUrl) return NextResponse.json({ ok: true, imageUrl: null, provider: "replicate", quality, reason: "Replicate 응답 형식 오류" });

      const deadline = Date.now() + 30_000;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 1500));
        const r = await fetch(pollUrl, { headers: { Authorization: `Token ${replicate}` } });
        const data = await r.json();
        if (data.status === "succeeded") {
          const url = Array.isArray(data.output) ? data.output[0] : data.output;
          const downgraded = quality !== "draft";
          return NextResponse.json({
            ok: true,
            imageUrl: url,
            provider: "replicate",
            quality,
            ...(downgraded ? { reason: `Replicate fallback은 Flux Schnell만 지원합니다. ${quality} 품질이 필요하면 FAL_KEY를 설정하세요.` } : {}),
          });
        }
        if (data.status === "failed" || data.status === "canceled") {
          return NextResponse.json({ ok: true, imageUrl: null, provider: "replicate", quality, reason: data.error || "Replicate 실패" });
        }
      }
      return NextResponse.json({ ok: true, imageUrl: null, provider: "replicate", quality, reason: "Replicate 타임아웃 (30초)" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ ok: true, imageUrl: null, provider: "replicate", quality, reason: `Replicate 오류: ${msg}` });
    }
  }

  return NextResponse.json({ ok: true, imageUrl: null, provider: "none", quality });
}
