// ─────────────────────────────────────────────────────────
// Seasonal Product — single source of truth for store-ops
//
// All store-ops pages (home / products / inventory / uploads /
// checklist) derive counts from this module so summary cards
// and destination page counts always stay in sync.
//
// This is mock data for the demo. Wire to DB later by replacing
// PRODUCTS with a fetcher that returns the same shape.
// ─────────────────────────────────────────────────────────

export type Season = "spring" | "summer" | "autumn" | "winter" | "year-round";

export type ProductStatus =
  | "판매중"
  | "시즌 준비중"
  | "시즌 오픈 예정"
  | "시즌 종료 예정"
  | "종료"
  | "숨김";

export type SaleStatus = "판매" | "중지" | "예약";

export type UploadStatus = "미등록" | "등록 준비중" | "등록 완료" | "수정 필요" | "검토 필요";

export type StockStatus = "정상" | "부족" | "품절임박" | "품절" | "재입고예정";

export interface SeasonalProduct {
  id: string;
  name: string;
  category: string;
  sku?: string;
  // Seasonal axis
  season: Season;
  seasonYear: number;
  isRecurring: boolean; // appears every year
  // Lifecycle
  status: ProductStatus;
  saleStatus: SaleStatus;
  launchDate?: string;       // YYYY-MM-DD
  endDate?: string;          // YYYY-MM-DD
  // Pricing
  price: number;
  discount?: number;
  cost?: number;
  // Channels (also used to drive uploads page row.channels)
  channels: string[];
  // Stock
  currentStock: number;
  safetyStock: number;
  restockAt?: string;
  // Upload progress
  uploadStatus: UploadStatus;
  thumbReady: boolean;
  detailReady: boolean;
  ownMall: boolean;
  smartStore: boolean;
  updatedAt: string;
  // Launch checklist (9 steps — same order as checklist page)
  // [name, price, thumb, detail, ownMall, smartStore, sns, ads, notice]
  checklist: boolean[];
  // Backdata for season operations
  prevSeasonNote?: string;
  prevSeasonSales?: string;
  // Optional discount price
  discountedPrice?: number;
  // General memo
  note?: string;
}

// ─────────────────────────────────────────────────────────
// Reference "today" — frozen so demo numbers stay deterministic
// ─────────────────────────────────────────────────────────
export const TODAY = new Date(2026, 3, 15); // 2026-04-15

export function currentSeason(d: Date = TODAY): Season {
  const m = d.getMonth() + 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}

export const SEASON_LABEL: Record<Season, string> = {
  spring: "봄",
  summer: "여름",
  autumn: "가을",
  winter: "겨울",
  "year-round": "연중",
};

// ─────────────────────────────────────────────────────────
// Master product list
// ─────────────────────────────────────────────────────────

export const PRODUCTS: SeasonalProduct[] = [
  // ── WINTER 2026 (current) ──
  {
    id: "p_gam_pre",
    name: "감귤 선물세트 프리미엄",
    category: "선물/세트",
    sku: "GFT-PRE",
    season: "winter",
    seasonYear: 2026,
    isRecurring: true,
    status: "판매중",
    saleStatus: "판매",
    launchDate: "2026-01-08",
    endDate: "2026-04-30",
    price: 58000,
    discount: 5,
    discountedPrice: 55100,
    cost: 31000,
    channels: ["스마트스토어", "자사몰"],
    currentStock: 124,
    safetyStock: 80,
    uploadStatus: "등록 완료",
    thumbReady: true, detailReady: true, ownMall: true, smartStore: true,
    updatedAt: "2026-04-11",
    checklist: [true, true, true, true, true, true, true, true, true],
    prevSeasonNote: "전년 4월 둘째 주부터 매출 급감 → 종료시점 앞당김",
    prevSeasonSales: "1,840만원",
  },
  {
    id: "p_gam_std",
    name: "감귤 선물세트 스탠다드",
    category: "선물/세트",
    sku: "GFT-STD",
    season: "winter",
    seasonYear: 2026,
    isRecurring: true,
    status: "판매중",
    saleStatus: "판매",
    launchDate: "2026-01-08",
    endDate: "2026-04-30",
    price: 38000,
    cost: 21000,
    channels: ["스마트스토어", "자사몰"],
    currentStock: 8,
    safetyStock: 40,
    restockAt: "2026-04-19",
    uploadStatus: "수정 필요",
    thumbReady: true, detailReady: true, ownMall: true, smartStore: false,
    updatedAt: "2026-04-13",
    checklist: [true, true, true, true, true, false, true, true, true],
    note: "스마트스토어 가격 불일치 — 4/16까지 수정",
  },
  {
    id: "p_winter_apple",
    name: "겨울 사과 5kg",
    category: "과일/사과",
    sku: "WT-APL-5KG",
    season: "winter",
    seasonYear: 2026,
    isRecurring: true,
    status: "시즌 종료 예정",
    saleStatus: "판매",
    launchDate: "2025-11-15",
    endDate: "2026-04-30",
    price: 42000,
    cost: 22000,
    channels: ["전채널"],
    currentStock: 87,
    safetyStock: 50,
    uploadStatus: "등록 완료",
    thumbReady: true, detailReady: true, ownMall: true, smartStore: true,
    updatedAt: "2026-03-01",
    checklist: [true, true, true, true, true, true, true, true, true],
    note: "잔여 87box 소진 임박",
  },

  // ── SPRING 2026 (active prep + launching now) ──
  {
    id: "p_chamoe",
    name: "성주참외 3kg",
    category: "과일/참외",
    sku: "SM-CHM-3KG",
    season: "spring",
    seasonYear: 2026,
    isRecurring: true,
    status: "시즌 오픈 예정",
    saleStatus: "예약",
    launchDate: "2026-04-18",
    endDate: "2026-06-30",
    price: 32000,
    discount: 10,
    discountedPrice: 28800,
    cost: 18000,
    channels: ["스마트스토어"],
    currentStock: 32,
    safetyStock: 60,
    uploadStatus: "등록 완료",
    thumbReady: true, detailReady: true, ownMall: true, smartStore: true,
    updatedAt: "2026-04-15",
    checklist: [true, true, true, true, true, true, false, true, false],
    prevSeasonNote: "전년 동기 판매 가속 — 안전재고 90 권장",
    prevSeasonSales: "920만원",
    note: "이미지 11컷 교체 진행",
  },
  {
    id: "p_hallabong",
    name: "제주 한라봉 5kg",
    category: "과일/감귤",
    sku: "JJ-HRB-5KG",
    season: "spring",
    seasonYear: 2026,
    isRecurring: true,
    status: "시즌 오픈 예정",
    saleStatus: "예약",
    launchDate: "2026-04-25",
    endDate: "2026-07-15",
    price: 49000,
    cost: 26000,
    channels: ["쿠팡"],
    currentStock: 0,
    safetyStock: 40,
    restockAt: "2026-04-25",
    uploadStatus: "등록 준비중",
    thumbReady: false, detailReady: false, ownMall: false, smartStore: true,
    updatedAt: "2026-04-14",
    checklist: [true, true, false, false, false, true, false, false, false],
    prevSeasonNote: "쿠팡 노출 부진 → 광고 비중 늘릴 것",
    note: "상세 카피 검수 대기",
  },
  {
    id: "p_strawberry",
    name: "청정 딸기 2kg",
    category: "과일/딸기",
    sku: "ST-2KG",
    season: "spring",
    seasonYear: 2026,
    isRecurring: true,
    status: "시즌 준비중",
    saleStatus: "예약",
    launchDate: "2026-05-06",
    endDate: "2026-06-15",
    price: 36000,
    channels: [],
    currentStock: 18,
    safetyStock: 25,
    uploadStatus: "미등록",
    thumbReady: false, detailReady: false, ownMall: false, smartStore: false,
    updatedAt: "2026-04-08",
    checklist: [true, false, false, false, false, false, false, false, false],
    prevSeasonNote: "전년 5/9 라이브 전환율 4.6% — 라이브 일정 확보",
  },

  // ── SUMMER 2026 (early prep) ──
  {
    id: "p_peach",
    name: "여름 복숭아 3kg",
    category: "과일/복숭아",
    sku: "SU-PCH-3KG",
    season: "summer",
    seasonYear: 2026,
    isRecurring: true,
    status: "시즌 준비중",
    saleStatus: "예약",
    launchDate: "2026-06-15",
    endDate: "2026-08-15",
    price: 39000,
    cost: 21000,
    channels: ["스마트스토어"],
    currentStock: 0,
    safetyStock: 50,
    uploadStatus: "검토 필요",
    thumbReady: true, detailReady: true, ownMall: true, smartStore: true,
    updatedAt: "2026-04-15",
    checklist: [true, true, true, true, false, false, false, false, false],
    prevSeasonNote: "가격/할인 정책 재검토 필요",
    prevSeasonSales: "1,120만원",
  },
  {
    id: "p_plum",
    name: "햇 자두 2kg",
    category: "과일/자두",
    sku: "PLM-2KG",
    season: "summer",
    seasonYear: 2026,
    isRecurring: true,
    status: "시즌 준비중",
    saleStatus: "예약",
    launchDate: "2026-06-25",
    endDate: "2026-08-10",
    price: 32000,
    cost: 17000,
    channels: ["스마트스토어", "쿠팡"],
    currentStock: 0,
    safetyStock: 30,
    restockAt: "2026-04-22",
    uploadStatus: "등록 준비중",
    thumbReady: false, detailReady: false, ownMall: false, smartStore: false,
    updatedAt: "2026-04-10",
    checklist: [true, true, false, false, false, false, false, false, false],
    note: "산지 입고 대기",
  },
  {
    id: "p_watermelon",
    name: "시원 수박",
    category: "과일/수박",
    sku: "WTM-1EA",
    season: "summer",
    seasonYear: 2026,
    isRecurring: true,
    status: "시즌 준비중",
    saleStatus: "예약",
    launchDate: "2026-07-01",
    endDate: "2026-08-31",
    price: 28000,
    channels: [],
    currentStock: 0,
    safetyStock: 40,
    uploadStatus: "미등록",
    thumbReady: false, detailReady: false, ownMall: false, smartStore: false,
    updatedAt: "2026-04-05",
    checklist: [true, false, false, false, false, false, false, false, false],
  },

  // ── AUTUMN 2026 (long-lead prep) ──
  {
    id: "p_apple",
    name: "햇 사과 5kg",
    category: "과일/사과",
    sku: "FA-APL-5KG",
    season: "autumn",
    seasonYear: 2026,
    isRecurring: true,
    status: "시즌 준비중",
    saleStatus: "예약",
    launchDate: "2026-09-20",
    price: 42000,
    channels: [],
    currentStock: 0,
    safetyStock: 60,
    uploadStatus: "미등록",
    thumbReady: false, detailReady: false, ownMall: false, smartStore: false,
    updatedAt: "2026-04-01",
    checklist: [true, false, false, false, false, false, false, false, false],
    prevSeasonNote: "추석 사전예약 8월 말 시작 권장",
  },

  // ── YEAR-ROUND ──
  {
    id: "p_nuts",
    name: "친환경 견과 믹스",
    category: "건강/견과",
    sku: "NUT-MIX",
    season: "year-round",
    seasonYear: 2026,
    isRecurring: false,
    status: "판매중",
    saleStatus: "판매",
    launchDate: "2025-09-01",
    price: 22000,
    cost: 11000,
    channels: ["스마트스토어", "자사몰", "쿠팡"],
    currentStock: 220,
    safetyStock: 100,
    uploadStatus: "등록 완료",
    thumbReady: true, detailReady: true, ownMall: true, smartStore: true,
    updatedAt: "2026-02-15",
    checklist: [true, true, true, true, true, true, true, true, true],
  },

  // ── ENDED ──
  {
    id: "p_old_peach",
    name: "단종 천도복숭아",
    category: "과일/복숭아",
    sku: "PCH-DAN",
    season: "summer",
    seasonYear: 2025,
    isRecurring: false,
    status: "종료",
    saleStatus: "중지",
    price: 28000,
    channels: ["스마트스토어"],
    currentStock: 0,
    safetyStock: 0,
    uploadStatus: "등록 완료",
    thumbReady: true, detailReady: true, ownMall: false, smartStore: true,
    updatedAt: "2025-09-01",
    checklist: [true, true, true, true, false, true, true, true, true],
  },
];

// ─────────────────────────────────────────────────────────
// Derived selectors — used by every store-ops page
// ─────────────────────────────────────────────────────────

const daysFromToday = (iso?: string) => {
  if (!iso) return Number.POSITIVE_INFINITY;
  const d = new Date(iso);
  return Math.ceil((d.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
};

export const isVisibleProduct = (p: SeasonalProduct) => p.status !== "숨김" && p.status !== "종료";

export const filters = {
  selling:        (p: SeasonalProduct) => p.status === "판매중",
  prepping:       (p: SeasonalProduct) => p.status === "시즌 준비중",
  upcoming:       (p: SeasonalProduct) => p.status === "시즌 오픈 예정",
  endingSoon:     (p: SeasonalProduct) => p.status === "시즌 종료 예정"
                                          || (p.endDate != null && daysFromToday(p.endDate) <= 30 && daysFromToday(p.endDate) >= 0 && p.status === "판매중"),
  lowStock:       (p: SeasonalProduct) => isVisibleProduct(p)
                                          && p.safetyStock > 0
                                          && (p.currentStock < p.safetyStock || p.currentStock === 0),
  pendingUpload:  (p: SeasonalProduct) => p.uploadStatus === "미등록" || p.uploadStatus === "등록 준비중",
  needsFix:       (p: SeasonalProduct) => p.uploadStatus === "수정 필요" || p.uploadStatus === "검토 필요",
  recurring:      (p: SeasonalProduct) => p.isRecurring && p.prevSeasonNote != null,
};

export type SummaryKey = keyof typeof filters;

export function countBy(key: SummaryKey): number {
  return PRODUCTS.filter(filters[key]).length;
}

export function listBy(key: SummaryKey): SeasonalProduct[] {
  return PRODUCTS.filter(filters[key]);
}

export function getProduct(id: string): SeasonalProduct | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

// Stock derivation
export function deriveStockStatus(p: SeasonalProduct): StockStatus {
  if (p.currentStock === 0 && p.restockAt) return "재입고예정";
  if (p.currentStock === 0) return "품절";
  if (p.safetyStock > 0 && p.currentStock < p.safetyStock * 0.3) return "품절임박";
  if (p.safetyStock > 0 && p.currentStock < p.safetyStock) return "부족";
  return "정상";
}
