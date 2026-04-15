import {
  Layers, FileImage, Store, MessageSquare, BarChart3,
  LayoutDashboard, CalendarDays, FileText, PlusCircle, LayoutTemplate, Radio,
  FileImage as FileImageSub, ListChecks, ClipboardList, Users, Star, BarChart2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export interface ToolDefinition {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  href: string;
  gradient: string;
  bgLight: string;
  borderColor: string;
  icon: LucideIcon;
  status: "available" | "beta" | "coming-soon";
  features: string[];
  navItems: NavItem[];
}

export const TOOLS: ToolDefinition[] = [
  {
    id: "sns",
    name: "SNS 마케팅 콘텐츠",
    nameEn: "Content Manager",
    description: "블로그, 인스타, 스레드 등 SNS 채널 콘텐츠를 통합 기획·관리합니다.",
    href: "/app/tools/sns",
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Layers,
    status: "available",
    features: ["캘린더 스케줄링", "플랫폼별 초안 자동 생성", "발행 현황 추적"],
    navItems: [
      { href: "/app/tools/sns", label: "대시보드", icon: LayoutDashboard, exact: true },
      { href: "/app/tools/sns/calendar", label: "콘텐츠 캘린더", icon: CalendarDays },
      { href: "/app/tools/sns/contents", label: "콘텐츠 목록", icon: FileText },
      { href: "/app/tools/sns/create", label: "새 콘텐츠 등록", icon: PlusCircle },
      { href: "/app/tools/sns/templates", label: "템플릿 관리", icon: LayoutTemplate },
      { href: "/app/tools/sns/openchat", label: "채널 관리", icon: Radio },
    ],
  },
  {
    id: "detail-page",
    name: "상세페이지 기획",
    nameEn: "Detail Page Studio",
    description: "상품 상세페이지 섹션 구성과 카피, 디자인 방향을 체계적으로 기획합니다.",
    href: "/app/tools/detail-page",
    gradient: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    borderColor: "border-violet-200",
    icon: FileImage,
    status: "beta",
    features: ["섹션 플래닝", "카피 블록 생성", "레퍼런스 정리"],
    navItems: [
      { href: "/app/tools/detail-page", label: "상세페이지 기획", icon: FileImageSub, exact: true },
    ],
  },
  {
    id: "store-ops",
    name: "스토어 운영 자동화",
    nameEn: "Store Operations",
    description: "상품 런칭, 프로모션, 재고·일정 관리를 체계적으로 운영합니다.",
    href: "/app/tools/store-ops",
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: Store,
    status: "beta",
    features: ["런칭 체크리스트", "프로모 플래닝", "운영 태스크보드"],
    navItems: [
      { href: "/app/tools/store-ops", label: "스토어 운영", icon: ListChecks, exact: true },
    ],
  },
  {
    id: "crm",
    name: "CRM · 고객 자동화",
    nameEn: "CRM & Reviews",
    description: "리뷰 답변 자동화, 고객 세그먼트 관리, CS 템플릿을 통합 운영합니다.",
    href: "/app/tools/crm",
    gradient: "from-rose-500 to-pink-600",
    bgLight: "bg-rose-50",
    borderColor: "border-rose-200",
    icon: MessageSquare,
    status: "beta",
    features: ["리뷰 답변 AI", "고객 세그먼트", "CS 템플릿"],
    navItems: [
      { href: "/app/tools/crm", label: "CRM · 고객 자동화", icon: Users, exact: true },
    ],
  },
  {
    id: "analytics",
    name: "성과 분석 대시보드",
    nameEn: "Analytics",
    description: "콘텐츠 성과, 채널별 현황, 캠페인 결과를 한눈에 파악합니다.",
    href: "/app/tools/analytics",
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: BarChart3,
    status: "coming-soon",
    features: ["성과 리포트", "채널 요약", "주간 하이라이트"],
    navItems: [
      { href: "/app/tools/analytics", label: "성과 분석", icon: BarChart2, exact: true },
    ],
  },
];

// ── 업종 프로필 스키마 (향후 AI 생성 로직용)
export interface IndustryProfile {
  industry: string;           // 예: "식품/농산물", "뷰티", "패션", "인테리어"
  businessType: string;       // 예: "온라인 쇼핑몰", "오프라인 매장", "D2C 브랜드"
  targetCustomer: string;     // 예: "30~50대 주부", "20대 여성"
  brandTone: string;          // 예: "친근하고 신뢰감 있는", "프리미엄 감성적인"
  coreSellingPoints: string[];
  mainChannels: string[];
  pricingTier: "premium" | "mid" | "budget";
  productServiceType: string; // 예: "제철 농산물", "기능성 화장품"
}
