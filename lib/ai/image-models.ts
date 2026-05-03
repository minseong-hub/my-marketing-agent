/**
 * 이미지 생성 모델 카탈로그 (fal.ai).
 *
 * 품질 티어:
 *  - draft  : Flux Schnell — 1~3초, 빠른 미리보기, ~$0.003
 *  - design : Recraft v3   — 디자인성·텍스트 렌더링 강함, 카드뉴스/일러스트 적합, ~$0.04
 *  - photo  : Flux Pro 1.1 — 사진 같은 photorealistic, 광고/제품 후크 이미지 적합, ~$0.04
 *
 * Replicate fallback은 모든 티어에서 Flux Schnell으로만 동작 (호환성).
 */

export type ImageQuality = "draft" | "design" | "photo";

export interface FalImageConfig {
  /** fal.ai 모델 endpoint URL */
  endpoint: string;
  /** 입력 페이로드 빌더 — prompt + 비율 → 모델별 입력 변환 */
  buildPayload: (prompt: string, aspect: "1:1" | "4:5" | "9:16") => Record<string, unknown>;
  /** 응답에서 이미지 URL 추출 — 모델마다 다름 */
  extractImageUrl: (data: unknown) => string | null;
  /** 사용자 표시용 라벨 */
  label: string;
}

function getImageUrlFromImages(data: unknown): string | null {
  // fal.ai 표준: { images: [{ url: ... }] }
  const d = data as { images?: Array<{ url?: string }> };
  return d?.images?.[0]?.url ?? null;
}

export const FAL_IMAGE_MODELS: Record<ImageQuality, FalImageConfig> = {
  draft: {
    endpoint: "https://fal.run/fal-ai/flux/schnell",
    label: "Flux Schnell (드래프트)",
    buildPayload: (prompt, aspect) => ({
      prompt,
      image_size: aspect === "1:1" ? "square_hd" : aspect === "4:5" ? "portrait_4_3" : "portrait_16_9",
      num_inference_steps: 4,
      num_images: 1,
    }),
    extractImageUrl: getImageUrlFromImages,
  },
  design: {
    endpoint: "https://fal.run/fal-ai/recraft-v3",
    label: "Recraft v3 (디자인)",
    buildPayload: (prompt, aspect) => ({
      prompt,
      image_size: aspect === "1:1" ? "square_hd" : aspect === "4:5" ? "portrait_4_3" : "portrait_16_9",
      // recraft 스타일 — digital_illustration이 카드뉴스/일러스트에 적합
      style: "digital_illustration",
    }),
    extractImageUrl: getImageUrlFromImages,
  },
  photo: {
    endpoint: "https://fal.run/fal-ai/flux-pro/v1.1",
    label: "Flux Pro 1.1 (포토)",
    buildPayload: (prompt, aspect) => ({
      prompt,
      image_size: aspect === "1:1" ? "square_hd" : aspect === "4:5" ? "portrait_4_3" : "portrait_16_9",
      num_images: 1,
      safety_tolerance: "2",
    }),
    extractImageUrl: getImageUrlFromImages,
  },
};

export function isImageQuality(v: unknown): v is ImageQuality {
  return v === "draft" || v === "design" || v === "photo";
}
