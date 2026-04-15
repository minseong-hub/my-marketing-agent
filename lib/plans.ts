export type PlanSlug = "starter" | "growth" | "pro";

export type ToolId = "store-ops" | "margin" | "sns" | "detail-page" | "ads" | "crm";

export interface PlanDefinition {
  slug: PlanSlug;
  name: string;
  tagline: string;
  price_monthly: number;
  first_payment_amount: number | null;
  first_payment_note: string | null;
  trial_days: number;
  tools: ToolId[];
  monthly_generation_limit: number | null;
  highlights: string[];
  cta: string;
  recommended?: boolean;
}

export const PLAN_TOOL_META: Record<ToolId, { label: string; short: string }> = {
  "store-ops": { label: "온라인스토어 운영 자동화", short: "운영" },
  margin: { label: "마진/수익흐름 분석 자동화", short: "마진" },
  sns: { label: "SNS 마케팅 자동화", short: "SNS" },
  "detail-page": { label: "상세페이지 기획 자동화", short: "상세페이지" },
  ads: { label: "광고 자동화", short: "광고" },
  crm: { label: "고객응대/CRM 자동화", short: "CRM" },
};

export const PLAN_DEFINITIONS: Record<PlanSlug, PlanDefinition> = {
  starter: {
    slug: "starter",
    name: "Starter",
    tagline: "시작하는 셀러를 위한 핵심 운영 세트",
    price_monthly: 19900,
    first_payment_amount: 9900,
    first_payment_note: "첫 결제 50% 할인",
    trial_days: 7,
    tools: ["store-ops", "margin"],
    monthly_generation_limit: 300,
    highlights: [
      "온라인스토어 운영 자동화",
      "마진/수익흐름 분석 자동화",
      "월 300회 AI 생성",
      "이메일 지원",
    ],
    cta: "7일 무료로 시작",
  },
  growth: {
    slug: "growth",
    name: "Growth",
    tagline: "매출 확장을 위한 마케팅 성장 패키지",
    price_monthly: 59000,
    first_payment_amount: null,
    first_payment_note: null,
    trial_days: 7,
    tools: ["store-ops", "margin", "sns", "detail-page"],
    monthly_generation_limit: 1500,
    highlights: [
      "Starter 기능 전체",
      "SNS 마케팅 자동화",
      "상세페이지 기획 자동화",
      "월 1,500회 AI 생성",
      "우선 지원",
    ],
    cta: "7일 무료로 시작",
    recommended: true,
  },
  pro: {
    slug: "pro",
    name: "Pro",
    tagline: "전사 마케팅을 자동화하는 프리미엄 플랜",
    price_monthly: 149000,
    first_payment_amount: null,
    first_payment_note: null,
    trial_days: 7,
    tools: ["store-ops", "margin", "sns", "detail-page", "ads", "crm"],
    monthly_generation_limit: null,
    highlights: [
      "6개 모든 도구 이용",
      "광고 자동화 · CRM 자동화 포함",
      "무제한 AI 생성",
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

export function planAllowsTool(slug: string | null | undefined, tool: ToolId): boolean {
  const def = getPlanDef(slug);
  if (!def) return false;
  return def.tools.includes(tool);
}

export function formatKRW(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}
