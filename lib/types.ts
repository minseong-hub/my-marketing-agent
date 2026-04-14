export type Platform = "blog" | "instagram" | "threads" | "tiktok" | "openchat";

export type ContentStatus =
  | "idea"
  | "drafting"
  | "review"
  | "scheduled"
  | "published";

export type TemplateType =
  | "new_product"
  | "review"
  | "info"
  | "comparison"
  | "member_benefit"
  | "season_end"
  | "flash_offer"
  | "repurchase";

export interface ChannelDrafts {
  blog?: string;
  instagram?: string;
  threads?: string;
  tiktok?: string;
  openchat?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  templateType: TemplateType;
  productName: string;
  category: string;
  coreMessage: string;
  supportPoints: string[];
  audience: string;
  hook: string;
  cta: string;
  link: string;
  scheduledDate: string;
  status: ContentStatus;
  platforms: Platform[];
  channelDrafts: ChannelDrafts;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  description: string;
  purpose: string;
  blogTemplate: string;
  instagramTemplate: string;
  threadsTemplate: string;
  tiktokTemplate: string;
  openchatTemplate: string;
  usageCount: number;
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  blog: "블로그",
  instagram: "인스타그램",
  threads: "스레드",
  tiktok: "틱톡",
  openchat: "오픈채팅",
};

export const STATUS_LABELS: Record<ContentStatus, string> = {
  idea: "아이디어",
  drafting: "작성중",
  review: "검토완료",
  scheduled: "예약됨",
  published: "업로드완료",
};

export const TEMPLATE_LABELS: Record<TemplateType, string> = {
  new_product: "신상품 오픈형",
  review: "후기 공유형",
  info: "정보형",
  comparison: "비교형",
  member_benefit: "회원 혜택형",
  season_end: "시즌 마감형",
  flash_offer: "돌발특가형",
  repurchase: "재구매 유도형",
};

// Toss-style 상태 배지 — 배경 연한 색 + 텍스트 진한 색
export const STATUS_COLORS: Record<ContentStatus, string> = {
  idea: "bg-slate-100 text-slate-600",
  drafting: "bg-amber-50 text-amber-700",
  review: "bg-blue-50 text-blue-700",
  scheduled: "bg-violet-50 text-violet-700",
  published: "bg-emerald-50 text-emerald-700",
};

export const STATUS_DOT_COLORS: Record<ContentStatus, string> = {
  idea: "bg-slate-400",
  drafting: "bg-amber-500",
  review: "bg-blue-500",
  scheduled: "bg-violet-500",
  published: "bg-emerald-500",
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  blog: "bg-orange-50 text-orange-700",
  instagram: "bg-fuchsia-50 text-fuchsia-700",
  threads: "bg-slate-100 text-slate-600",
  tiktok: "bg-rose-50 text-rose-700",
  openchat: "bg-amber-50 text-amber-700",
};
