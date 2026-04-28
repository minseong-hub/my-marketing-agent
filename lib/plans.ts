export type PlanSlug = "starter" | "growth" | "pro";

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
  starter: {
    slug: "starter",
    name: "Starter",
    tagline: "시작하는 셀러를 위한 AI 비서 2명",
    price_monthly: 19900,
    first_payment_amount: 9900,
    first_payment_note: "첫 결제 50% 할인",
    trial_days: 7,
    tools: ["marketing", "finance"],
    monthly_generation_limit: 300,
    highlights: [
      "마케팅 어시스턴트",
      "재무 어시스턴트",
      "월 300회 AI 작업",
      "이메일 지원",
    ],
    cta: "7일 무료로 시작",
  },
  growth: {
    slug: "growth",
    name: "Growth",
    tagline: "매출 확장을 위한 AI 비서 3명",
    price_monthly: 59000,
    first_payment_amount: null,
    first_payment_note: null,
    trial_days: 7,
    tools: ["marketing", "detail_page", "finance"],
    monthly_generation_limit: 1500,
    highlights: [
      "Starter 기능 전체",
      "상세페이지 어시스턴트 추가",
      "월 1,500회 AI 작업",
      "우선 지원",
    ],
    cta: "7일 무료로 시작",
    recommended: true,
  },
  pro: {
    slug: "pro",
    name: "Pro",
    tagline: "모든 AI 비서 4명 풀 패키지",
    price_monthly: 149000,
    first_payment_amount: null,
    first_payment_note: null,
    trial_days: 7,
    tools: ["marketing", "detail_page", "ads", "finance"],
    monthly_generation_limit: null,
    highlights: [
      "AI 비서 4명 전원",
      "광고 전문가 포함",
      "무제한 AI 작업",
      "전담 매니저 · SLA 응답",
    ],
    cta: "7일 무료로 시작",
  },
};

export const PLAN_ORDER: PlanSlug[] = ["starter", "growth", "pro"];

export function getPlanDef(slug: string | null | undefined): PlanDefinition | null {
  if (!slug) return null;
  return (PLAN_DEFINITIONS as Record<string, PlanDefinition>)[slug] ?? null;
}

export function formatKRW(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}
