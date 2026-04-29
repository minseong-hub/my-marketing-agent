import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";

/**
 * 외부 이미지 생성 프록시.
 *  - REPLICATE_API_TOKEN 또는 FAL_KEY 가 ENV에 있으면 호출 → 이미지 URL 반환
 *  - 미설정 시 imageUrl: null + reason 반환 (클라이언트가 그라디언트 fallback)
 *
 * 두 서비스 모두 비동기 작업이라 polling이 필요하지만, 이 프록시는 단순화를 위해
 * 동기 결과를 시도하고 timeout 시 null을 반환합니다. 운영용 정식 통합은 PROPOSAL 문서 참고.
 */

const Schema = z.object({
  prompt: z.string().min(3).max(500),
  ratio: z.enum(["1:1", "4:5", "9:16"]).default("1:1"),
  count: z.number().int().min(1).max(4).default(1),
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

  const { prompt, ratio } = parsed.data;
  const replicate = process.env.REPLICATE_API_TOKEN;
  const fal = process.env.FAL_KEY;

  if (!replicate && !fal) {
    return NextResponse.json({
      ok: true,
      imageUrl: null,
      provider: "none",
      reason: "이미지 생성 API 키가 설정되지 않았습니다. 그라디언트 배경으로 폴백합니다. (REPLICATE_API_TOKEN 또는 FAL_KEY 설정 시 자동 활성화)",
    });
  }

  // 비율 → aspect_ratio 매핑
  const aspectMap: Record<string, string> = { "1:1": "1:1", "4:5": "4:5", "9:16": "9:16" };
  const aspect = aspectMap[ratio] || "1:1";

  // fal.ai 우선 (단일 동기 호출 지원)
  if (fal) {
    try {
      const r = await fetch("https://fal.run/fal-ai/flux/schnell", {
        method: "POST",
        headers: {
          Authorization: `Key ${fal}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          image_size: aspect === "1:1" ? "square_hd" : aspect === "4:5" ? "portrait_4_3" : "portrait_16_9",
          num_inference_steps: 4,
          num_images: 1,
        }),
      });
      const data = await r.json();
      const url = data?.images?.[0]?.url;
      if (url) return NextResponse.json({ ok: true, imageUrl: url, provider: "fal" });
      return NextResponse.json({ ok: true, imageUrl: null, provider: "fal", reason: "fal.ai 응답 형식 오류" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ ok: true, imageUrl: null, provider: "fal", reason: `fal.ai 오류: ${msg}` });
    }
  }

  // Replicate fallback (비동기 polling — 30초 timeout)
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
          input: { prompt, aspect_ratio: aspect, num_outputs: 1, output_format: "png" },
        }),
      });
      const start = await startRes.json();
      let pollUrl = start?.urls?.get;
      if (!pollUrl) return NextResponse.json({ ok: true, imageUrl: null, provider: "replicate", reason: "Replicate 응답 형식 오류" });

      const deadline = Date.now() + 30_000;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 1500));
        const r = await fetch(pollUrl, { headers: { Authorization: `Token ${replicate}` } });
        const data = await r.json();
        if (data.status === "succeeded") {
          const url = Array.isArray(data.output) ? data.output[0] : data.output;
          return NextResponse.json({ ok: true, imageUrl: url, provider: "replicate" });
        }
        if (data.status === "failed" || data.status === "canceled") {
          return NextResponse.json({ ok: true, imageUrl: null, provider: "replicate", reason: data.error || "Replicate 실패" });
        }
      }
      return NextResponse.json({ ok: true, imageUrl: null, provider: "replicate", reason: "Replicate 타임아웃 (30초)" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ ok: true, imageUrl: null, provider: "replicate", reason: `Replicate 오류: ${msg}` });
    }
  }

  return NextResponse.json({ ok: true, imageUrl: null, provider: "none" });
}
