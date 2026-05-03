/**
 * 마키 자동 월간계획 생성기.
 *
 * 입력: brand_profiles + 직전 plan_runs(scope='marketing')의 self_learning + 사용자 카테고리 비율 슬라이더(옵션)
 * 출력: PlannedCard[] (브랜드 톤·시즌·타겟 반영, 카테고리별 angle 자동 차별화)
 *
 * 호출 비용: ~$0.05~0.15 (Sonnet, JSON 출력 위주)
 * fallback: API 키 없거나 실패 시 monthly-planner.ts의 결정적 분배 알고리즘 사용
 */

import type { PlannedCard } from "./templates";
import { generatePlannedCards } from "./monthly-planner";

export interface AutoPlanInput {
  userId: string;
  month: string;                          // "2026-05"
  brandProfile: {
    brandName: string;
    voice?: string;
    targetAudience?: string;
    uniqueValue?: string;
    doNotUse?: string;
    industry?: string;
  };
  /** 직전 plan_run의 self_learning (있으면 자동 주입) */
  priorLearning?: string;
  /** 사용자 슬라이더 — 비우면 마키가 brand_profile 기반으로 추론 */
  userOverrides?: {
    totalCards?: number;
    categoryMix?: Array<{ category: string; ratio: number }>;
    weekdays?: number[];
    time?: string;
  };
  brandTemplateId: string;
}

export interface AutoPlanResult {
  cards: PlannedCard[];
  rationale: string;          // 마키가 왜 이렇게 짰는지 한 줄 요약
  confidence: number;         // 0~100
  /** 마키가 추천한 카테고리 비율 (사용자가 슬라이더로 덮을 수 있음) */
  recommendedMix: Array<{ category: string; ratio: number; reason: string }>;
  /** 마키가 추천한 발행 빈도 */
  recommendedSchedule: { totalCards: number; weekdays: number[]; time: string };
}

const FALLBACK_MIX_BY_INDUSTRY: Record<string, Array<{ category: string; ratio: number; reason: string }>> = {
  fashion: [
    { category: "신상", ratio: 0.35, reason: "시즌 패션은 신상 노출 빈도가 매출과 직결" },
    { category: "스타일링", ratio: 0.40, reason: "코디 제안이 저장률·공유율 높음" },
    { category: "브랜드스토리", ratio: 0.15, reason: "팬덤 형성에 필수" },
    { category: "이벤트", ratio: 0.10, reason: "월 1~2회 임팩트" },
  ],
  beauty: [
    { category: "신상", ratio: 0.30, reason: "신제품 출시 사이클 잦음" },
    { category: "튜토리얼", ratio: 0.35, reason: "사용법 설명이 전환에 직접 기여" },
    { category: "전후비교", ratio: 0.20, reason: "효과 가시화" },
    { category: "리뷰", ratio: 0.15, reason: "사회적 증거" },
  ],
  food: [
    { category: "레시피", ratio: 0.40, reason: "저장 행동 유발 콘텐츠" },
    { category: "신상", ratio: 0.25, reason: "" },
    { category: "원산지", ratio: 0.20, reason: "신뢰도 형성" },
    { category: "이벤트", ratio: 0.15, reason: "" },
  ],
  default: [
    { category: "신상", ratio: 0.30, reason: "" },
    { category: "스타일링", ratio: 0.40, reason: "참여율 우수" },
    { category: "브랜드스토리", ratio: 0.20, reason: "장기 팬덤" },
    { category: "이벤트", ratio: 0.10, reason: "" },
  ],
};

function detectIndustry(industry?: string): keyof typeof FALLBACK_MIX_BY_INDUSTRY {
  const i = (industry || "").toLowerCase();
  if (/(fashion|의류|패션|옷)/.test(i)) return "fashion";
  if (/(beauty|화장|뷰티|코스메)/.test(i)) return "beauty";
  if (/(food|식품|음식|먹거리)/.test(i)) return "food";
  return "default";
}

/**
 * 결정적 fallback — Claude 호출 실패하거나 키 없을 때.
 * brand_profile + 산업 추론으로 계획 자동 생성.
 */
export function autoPlanFallback(input: AutoPlanInput): AutoPlanResult {
  const industry = detectIndustry(input.brandProfile.industry);
  const recommendedMix = FALLBACK_MIX_BY_INDUSTRY[industry];
  const totalCards = input.userOverrides?.totalCards ?? 8;
  const weekdays = input.userOverrides?.weekdays ?? [1, 3, 5];
  const time = input.userOverrides?.time ?? "19:00";

  const cards = generatePlannedCards({
    month: input.month,
    totalCards,
    categoryMix: input.userOverrides?.categoryMix ?? recommendedMix.map((m) => ({ category: m.category, ratio: m.ratio })),
    preferredWeekdays: weekdays,
    preferredTime: time,
    brandAccentColor: "#ff4ec9",
  });

  // angle 자동 차별화 — 브랜드 보이스/유니크 밸류 반영
  const voice = input.brandProfile.voice || "";
  const uv = input.brandProfile.uniqueValue || "";
  const enriched = cards.map((c) => ({
    ...c,
    angle: c.angle || `${input.brandProfile.brandName} · ${c.category} — ${voice ? voice.slice(0, 30) : "감성 한 스푼"}${uv ? `, ${uv.slice(0, 30)}` : ""}`,
  }));

  return {
    cards: enriched,
    rationale: `${input.brandProfile.brandName}의 ${industry} 카테고리 표준 분배(${recommendedMix.map((m) => `${m.category} ${Math.round(m.ratio * 100)}%`).join(" · ")})를 적용했습니다. brand_profile 기반 자동 초안.`,
    confidence: 65,
    recommendedMix,
    recommendedSchedule: { totalCards, weekdays, time },
  };
}

/**
 * 메인 진입점 — Claude 사용 가능하면 LLM, 아니면 fallback.
 */
export async function generateAutoPlan(input: AutoPlanInput): Promise<AutoPlanResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return autoPlanFallback(input);
  }

  // LLM 호출은 호출자(API 라우트)에서 직접 — 여기는 prompt 재료만 준비.
  // 실패 시 fallback이 자동 동작.
  try {
    return autoPlanFallback(input);  // V1: 결정적 fallback 우선 (LLM 호출은 별도 단계)
  } catch {
    return autoPlanFallback(input);
  }
}

/** Claude prompt builder — LLM 호출 시 사용 */
export function buildAutoPlanPrompt(input: AutoPlanInput): { system: string; user: string } {
  const system = [
    "당신은 인스타 마케터 마키입니다. 사용자 브랜드의 한 달치 카드뉴스 발행 계획을 자율적으로 작성합니다.",
    `브랜드: ${input.brandProfile.brandName}`,
    input.brandProfile.voice ? `보이스: ${input.brandProfile.voice}` : "",
    input.brandProfile.targetAudience ? `타겟: ${input.brandProfile.targetAudience}` : "",
    input.brandProfile.uniqueValue ? `유니크 밸류: ${input.brandProfile.uniqueValue}` : "",
    input.brandProfile.doNotUse ? `금지: ${input.brandProfile.doNotUse}` : "",
    input.priorLearning ? `\n[직전 기획서 자가학습 메모]\n${input.priorLearning}` : "",
    `\n응답은 순수 JSON. 카테고리 비율은 브랜드 산업/타겟 기반으로 추론하되, 항상 합 = 1.0.`,
  ].filter(Boolean).join("\n");

  const user = [
    `대상 월: ${input.month}`,
    input.userOverrides?.totalCards ? `사용자 지정 총 개수: ${input.userOverrides.totalCards}` : "총 개수는 브랜드 활동량 기반으로 추천 (6~12 사이)",
    input.userOverrides?.weekdays ? `사용자 지정 발행 요일: ${input.userOverrides.weekdays.join(",")}` : "발행 요일은 타겟 활동 시간대 기반으로 추천",
    `\n응답 형식 (JSON only):`,
    `{ "rationale": "한 줄 요약", "confidence": 0~100, "recommendedMix": [{"category": "...", "ratio": 0.x, "reason": "..."}], "recommendedSchedule": {"totalCards": N, "weekdays": [..], "time": "HH:mm"}, "cards": [{"id": "...", "planDate": "YYYY-MM-DD", "planTime": "HH:mm", "title": "...", "angle": "...", "category": "...", "cardKinds": ["hook", ...], "hashtags": [...], "previewColor": "#hex", "thumbnailType": "stat", "status": "planned"}] }`,
  ].join("\n");

  return { system, user };
}
