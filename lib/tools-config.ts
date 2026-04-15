import {
  Store, TrendingUp, Layers, Layout, Megaphone, Users, Package,
  LayoutDashboard, CalendarDays, FileText, PlusCircle, LayoutTemplate, Radio,
  ListChecks, ClipboardList, Tag, CheckSquare, AlertCircle, Archive,
  Calculator, BarChart2, PieChart, Folder, PenLine, Palette,
  Target, Star, MessageCircle, RefreshCcw, FileImage,
  CalendarCheck, Tv2, BookOpen, Inbox, ShieldAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  group?: string;
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
  group: "운영 코어" | "성장 & 전환";
  chips: string[];
  features: string[];
  navItems: NavItem[];
}

export const TOOLS: ToolDefinition[] = [
  // ── 운영 코어
  {
    id: "store-ops",
    name: "온라인스토어 운영 자동화",
    nameEn: "Store Operations",
    description: "일정, 할 일, 오픈 준비를 한 번에 관리",
    href: "/app/tools/store-ops",
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: Store,
    status: "beta",
    group: "운영 코어",
    chips: ["런칭 체크리스트", "프로모 플래닝", "태스크보드"],
    features: ["런칭 체크리스트", "프로모 플래닝", "운영 태스크보드"],
    navItems: [
      { href: "/app/tools/store-ops", label: "홈", icon: LayoutDashboard, exact: true, group: "개요" },
      { href: "/app/tools/store-ops/board", label: "운영 보드", icon: ClipboardList, group: "운영" },
      { href: "/app/tools/store-ops/products", label: "상품 관리", icon: Package, group: "상품" },
      { href: "/app/tools/store-ops/inventory", label: "재고 관리", icon: BarChart2, group: "상품" },
      { href: "/app/tools/store-ops/uploads", label: "상품 업로드 관리", icon: Layout, group: "상품" },
      { href: "/app/tools/store-ops/promotions", label: "프로모션 관리", icon: Tag, group: "성장" },
      { href: "/app/tools/store-ops/checklist", label: "체크리스트", icon: CheckSquare, group: "준비" },
      { href: "/app/tools/store-ops/issues", label: "이슈 / 알림", icon: AlertCircle, group: "운영" },
      { href: "/app/tools/store-ops/history", label: "운영 기록", icon: Archive, group: "기록" },
    ],
  },
  {
    id: "margin",
    name: "마진 / 수익흐름 분석 자동화",
    nameEn: "Margin & Revenue",
    description: "남는 상품과 새는 비용을 한눈에 확인",
    href: "/app/tools/margin",
    gradient: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: TrendingUp,
    status: "beta",
    group: "운영 코어",
    chips: ["마진 계산", "수익 분석", "비용 추적"],
    features: ["마진 계산", "수익 분석", "비용 추적"],
    navItems: [
      { href: "/app/tools/margin", label: "홈", icon: LayoutDashboard, exact: true, group: "개요" },
      { href: "/app/tools/margin/calculator", label: "마진 계산기", icon: Calculator, group: "분석" },
      { href: "/app/tools/margin/products", label: "상품별 수익성", icon: BarChart2, group: "분석" },
      { href: "/app/tools/margin/channels", label: "채널별 성과", icon: Layers, group: "분석" },
      { href: "/app/tools/margin/flow", label: "흐름 분석", icon: TrendingUp, group: "분석" },
      { href: "/app/tools/margin/costs", label: "비용 구조 분석", icon: PieChart, group: "리포트" },
      { href: "/app/tools/margin/reports", label: "리포트 / 인사이트", icon: FileText, group: "리포트" },
    ],
  },

  // ── 성장 & 전환
  {
    id: "sns",
    name: "SNS 마케팅 자동화",
    nameEn: "SNS Marketing",
    description: "콘텐츠 일정과 업로드 흐름을 체계적으로 관리",
    href: "/app/tools/sns",
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Layers,
    status: "available",
    group: "성장 & 전환",
    chips: ["캘린더 스케줄링", "초안 자동화", "채널 관리"],
    features: ["캘린더 스케줄링", "플랫폼별 초안 자동 생성", "발행 현황 추적"],
    navItems: [
      { href: "/app/tools/sns", label: "홈", icon: LayoutDashboard, exact: true, group: "개요" },
      { href: "/app/tools/sns/calendar", label: "콘텐츠 캘린더", icon: CalendarDays, group: "콘텐츠" },
      { href: "/app/tools/sns/daily", label: "일자별 관리", icon: CalendarCheck, group: "콘텐츠" },
      { href: "/app/tools/sns/contents", label: "콘텐츠 목록", icon: FileText, group: "콘텐츠" },
      { href: "/app/tools/sns/create", label: "새 콘텐츠 등록", icon: PlusCircle, group: "콘텐츠" },
      { href: "/app/tools/sns/openchat", label: "채널별 관리", icon: Radio, group: "채널" },
      { href: "/app/tools/sns/templates", label: "템플릿 / 문구 자산", icon: LayoutTemplate, group: "자산" },
      { href: "/app/tools/sns/results", label: "업로드 결과 기록", icon: BarChart2, group: "자산" },
    ],
  },
  {
    id: "detail-page",
    name: "상세페이지 기획 자동화",
    nameEn: "Detail Page Studio",
    description: "상세페이지 구조, 카피, 레퍼런스를 빠르게 정리",
    href: "/app/tools/detail-page",
    gradient: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    borderColor: "border-violet-200",
    icon: Layout,
    status: "beta",
    group: "성장 & 전환",
    chips: ["섹션 구성", "카피 생성", "레퍼런스"],
    features: ["섹션 플래닝", "카피 블록 생성", "레퍼런스 정리"],
    navItems: [
      { href: "/app/tools/detail-page", label: "홈", icon: LayoutDashboard, exact: true, group: "개요" },
      { href: "/app/tools/detail-page/projects", label: "프로젝트 관리", icon: Folder, group: "기획" },
      { href: "/app/tools/detail-page/sections", label: "섹션 기획", icon: Layers, group: "기획" },
      { href: "/app/tools/detail-page/copy", label: "카피 작성", icon: PenLine, group: "기획" },
      { href: "/app/tools/detail-page/design", label: "레퍼런스", icon: Palette, group: "기획" },
      { href: "/app/tools/detail-page/templates", label: "템플릿 / 베스트 구조", icon: LayoutTemplate, group: "자산" },
      { href: "/app/tools/detail-page/archive", label: "완료본 / 아카이브", icon: Archive, group: "자산" },
    ],
  },
  {
    id: "ads",
    name: "광고 자동화",
    nameEn: "Ad Automation",
    description: "광고 문구, 캠페인, 소재 흐름을 효율적으로 관리",
    href: "/app/tools/ads",
    gradient: "from-rose-500 to-pink-500",
    bgLight: "bg-rose-50",
    borderColor: "border-rose-200",
    icon: Megaphone,
    status: "beta",
    group: "성장 & 전환",
    chips: ["광고 카피", "캠페인 관리", "소재 정리"],
    features: ["광고 카피", "캠페인 관리", "소재 정리"],
    navItems: [
      { href: "/app/tools/ads", label: "홈", icon: LayoutDashboard, exact: true, group: "개요" },
      { href: "/app/tools/ads/copy", label: "광고 문구 생성", icon: PenLine, group: "광고" },
      { href: "/app/tools/ads/campaigns", label: "캠페인 관리", icon: Target, group: "광고" },
      { href: "/app/tools/ads/assets", label: "소재 아이디어", icon: FileImage, group: "광고" },
      { href: "/app/tools/ads/channels", label: "매체별 관리", icon: Tv2, group: "분석" },
      { href: "/app/tools/ads/performance", label: "성과 기록", icon: BarChart2, group: "분석" },
      { href: "/app/tools/ads/vault", label: "자산 보관함", icon: Archive, group: "자산" },
    ],
  },
  {
    id: "crm",
    name: "고객응대 / CRM 자동화",
    nameEn: "CRM & Reviews",
    description: "리뷰, 문의, 고객관리와 재구매 흐름을 정리",
    href: "/app/tools/crm",
    gradient: "from-sky-500 to-cyan-600",
    bgLight: "bg-sky-50",
    borderColor: "border-sky-200",
    icon: Users,
    status: "beta",
    group: "성장 & 전환",
    chips: ["리뷰 답변", "CS 템플릿", "고객 세그먼트"],
    features: ["리뷰 답변 AI", "고객 세그먼트", "CS 템플릿"],
    navItems: [
      { href: "/app/tools/crm", label: "홈", icon: LayoutDashboard, exact: true, group: "개요" },
      { href: "/app/tools/crm/reviews", label: "리뷰 관리", icon: Star, group: "고객응대" },
      { href: "/app/tools/crm/cs", label: "CS 응답", icon: MessageCircle, group: "고객응대" },
      { href: "/app/tools/crm/segments", label: "고객 세그먼트", icon: Users, group: "고객응대" },
      { href: "/app/tools/crm/reorder", label: "재구매 캠페인", icon: RefreshCcw, group: "운영" },
      { href: "/app/tools/crm/issues", label: "고객 이슈 로그", icon: ShieldAlert, group: "운영" },
      { href: "/app/tools/crm/templates", label: "CS 템플릿", icon: FileText, group: "운영" },
    ],
  },
];

export interface IndustryProfile {
  industry: string;
  businessType: string;
  targetCustomer: string;
  brandTone: string;
  coreSellingPoints: string[];
  mainChannels: string[];
  pricingTier: "premium" | "mid" | "budget";
  productServiceType: string;
}
