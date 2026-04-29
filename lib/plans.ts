export type PlanSlug = "free" | "starter" | "growth" | "pro";

export const PLAN_TOOL_META: Record<string, { label: string; short: string }> = {
  marketing: { label: "마케팅 어시스턴트", short: "마케팅" },
  detail_page: { label: "상세페이지 어시스턴트", short: "상세페이지" },
  ads: { label: "광고 전문가", short: "광고" },
  finance: { label: "재무 어시스턴트", short: "재무" },
};

export type AssistantId = "marketing" | "detail_page" | "ads" | "finance";

export interface PlanDefinition {
  slug: PlanSlug;
  name: string;
  stageLabel: string;
  tagline: string;
  price_monthly: number;
  first_payment_amount: number | null;
  first_payment_note: string | null;
  trial_days: number;
  tools: string[];
  monthly_generation_limit: number | null;
  highlights: string[];
  cta: string;
  recommended?: boolean;
}

export const PLAN_DEFINITIONS: Record<PlanSlug, PlanDefinition> = {
  free: {
    slug: "free",
    name: "FREE",
    stageLabel: "무료",
    tagline: "AI 비서 1명을 가볍게 체험",
    price_monthly: 0,
    first_payment_amount: null,
    first_payment_note: null,
    trial_days: 0,
    tools: ["marketing"],
    monthly_generation_limit: 30,
    highlights: [
      "마키 1명 (마케팅 비서)",
      "월 30회 AI 작업",
      "수동 임무 지시 전용",
      "커뮤니티 지원",
    ],
    cta: "무료로 시작",
  },
  starter: {
    slug: "starter",
    name: "STARTER",
    stageLabel: "유료 1단계",
    tagline: "온라인 셀러를 위한 AI 비서 2명",
    price_monthly: 19900,
    first_payment_amount: null,
    first_payment_note: null,
    trial_days: 0,
    tools: ["marketing", "finance"],
    monthly_generation_limit: 500,
    highlights: [
      "마키 (마케팅) + 페니 (재무)",
      "월 500회 AI 작업",
      "자동 임무 1일 1회",
      "이메일 지원",
    ],
    cta: "스타터 시작",
  },
  growth: {
    slug: "growth",
    name: "GROWTH",
    stageLabel: "유료 2단계",
    tagline: "매출 확장을 위한 AI 비서 3명",
    price_monthly: 59000,
    first_payment_amount: null,
    first_payment_note: null,
    trial_days: 0,
    tools: ["marketing", "detail_page", "finance"],
    monthly_generation_limit: 2000,
    highlights: [
      "마키 + 데일리(상세) + 페니",
      "월 2,000회 AI 작업",
      "자동 임무 시간당 1회",
      "우선 채팅 지원",
    ],
    cta: "그로스 시작",
    recommended: true,
  },
  pro: {
    slug: "pro",
    name: "PRO",
    stageLabel: "유료 3단계",
    tagline: "풀크루 4명 + 광고 자동 운영",
    price_monthly: 149000,
    first_payment_amount: null,
    first_payment_note: null,
    trial_days: 0,
    tools: ["marketing", "detail_page", "ads", "finance"],
    monthly_generation_limit: 10000,
    highlights: [
      "마키 · 데일리 · 애디(광고) · 페니",
      "월 10,000회 AI 작업",
      "자동 임무 무제한",
      "전담 매니저 · API 액세스",
    ],
    cta: "프로 시작",
  },
};

export const PLAN_ORDER: PlanSlug[] = ["free", "starter", "growth", "pro"];

export function getPlanDef(slug: string | null | undefined): PlanDefinition | null {
  if (!slug) return null;
  return (PLAN_DEFINITIONS as Record<string, PlanDefinition>)[slug] ?? null;
}

export function formatKRW(amount: number): string {
  if (amount === 0) return "₩0";
  return `₩${amount.toLocaleString("ko-KR")}`;
}
