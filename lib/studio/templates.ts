/**
 * 인스타 카드뉴스 + 메타 광고 소재 템플릿 정의.
 * 클라이언트 사이드 렌더링용 데이터 모델.
 */

export type CardKind = "hook" | "problem" | "solution" | "proof" | "compare" | "cta";

export interface CardSlot {
  kind: CardKind;
  /** 카드 1번부터 6번까지 순서 */
  index: number;
  /** 위 작은 라벨 — 예: "01. 후킹" */
  label: string;
  /** 큰 제목 (8~14자) */
  title: string;
  /** 본문 (50~120자) */
  body: string;
  /** 강조어 (제목에서 컬러로 칠할 부분, 옵션) */
  highlight?: string;
  /** 통계나 숫자 강조 (옵션) */
  stat?: { value: string; unit: string; caption: string };
  /** 비교 카드용 좌/우 */
  compare?: { left: string; right: string; leftLabel: string; rightLabel: string };
  /** CTA 카드용 액션 */
  cta?: { headline: string; sub: string; brand: string };
}

export interface CardNewsSpec {
  /** 브랜드 컬러 (액센트) */
  brandColor: string;
  /** 보조 컬러 (그라디언트 끝) */
  accentColor: string;
  /** 다크/라이트 */
  theme: "dark" | "light";
  /** 6장 카드 슬롯 */
  cards: CardSlot[];
  /** 발행 캡션 */
  caption: string;
  /** 해시태그 */
  hashtags: string[];
  /** 배경 이미지 URL (외부 이미지 API 결과 또는 null) */
  imageUrl?: string | null;
}

/**
 * 카드 종류별 가이드 (마키 프롬프트에 사용)
 */
export const CARD_KIND_SPEC: Record<CardKind, { label: string; instruction: string }> = {
  hook:     { label: "01. 후킹",        instruction: "스크롤을 멈추는 1~2초 카피. 질문형 또는 충격적 통계." },
  problem:  { label: "02. 문제 제기",   instruction: "타겟이 공감하는 페인 포인트 또는 잘못된 통념." },
  solution: { label: "03. 해결",        instruction: "우리 상품/방법이 그 문제를 어떻게 해결하는지." },
  proof:    { label: "04. 사례·수치",   instruction: "구체적 수치 또는 셀러/고객 사례 1건. stat 필드 활용." },
  compare:  { label: "05. 비교",        instruction: "우리 상품 vs 일반/경쟁. compare 필드 활용." },
  cta:      { label: "06. 다음 행동",   instruction: "지금 무엇을 하면 되는지 명확한 한 마디. cta 필드 활용." },
};

export const CARD_KIND_ORDER: CardKind[] = ["hook", "problem", "solution", "proof", "compare", "cta"];

// ===== 메타 광고 =====

export type AdRatio = "1:1" | "4:5" | "9:16";

export interface AdVariant {
  ratio: AdRatio;
  /** 메타 정책 권장: 헤드라인 30자 이내 */
  headline: string;
  /** 본문 100자 이내 */
  body: string;
  /** CTA 버튼 라벨 — 예: "지금 구매" "더 알아보기" */
  cta: string;
  /** 부가 강조 (할인/혜택) */
  badge?: string;
  /** 한 줄 후킹 (이미지 위 큰 글자) */
  hook?: string;
}

export interface AdCreativeSpec {
  brandName: string;
  brandColor: string;
  accentColor: string;
  theme: "dark" | "light";
  /** 3 비율 변형 */
  variants: AdVariant[];
  imageUrl?: string | null;
}

export const AD_RATIO_PIXELS: Record<AdRatio, { w: number; h: number; label: string }> = {
  "1:1":  { w: 1080, h: 1080, label: "피드 정방형 (1080×1080)" },
  "4:5":  { w: 1080, h: 1350, label: "피드 세로 (1080×1350)" },
  "9:16": { w: 1080, h: 1920, label: "스토리·릴스 (1080×1920)" },
};

// ===== 기획 코어 (Strategy Core) =====

/**
 * 기획 코어 — 4 비서가 작업 시작 전 호출하는 고지능 추론 산출물.
 * Claude Opus 4.7 + extended thinking으로 생성.
 */

export type PlanScope = "marketing" | "detail_page" | "ads" | "finance" | "general";

export interface PlanPhase {
  /** 단계명 — 예: "1주차: 인지 확보" */
  name: string;
  /** 단계 설명 — 무엇을 왜 한다 */
  description: string;
  /** 산출물 — 이 단계에서 나오는 결과물 */
  deliverables: string[];
  /** 예상 기간 — 예: "5일", "주말 1회" */
  estimatedDuration: string;
  /** 담당 비서 — 이 단계를 위임할 크루 */
  ownerAgent: "marky" | "dali" | "addy" | "penny" | "user";
}

export interface PlanAction {
  /** 즉시 실행 가능한 다음 작업 — 데스크의 작업 메뉴와 매칭 */
  title: string;
  /** 어떤 비서가 어떤 탭에서 실행할지 가이드 */
  agentHint: "marky" | "dali" | "addy" | "penny";
  /** 권장 입력 — 비서에게 그대로 전달 가능한 주제·메모 */
  promptHint: string;
}

export interface PlanSpec {
  /** 한 줄 목표 요약 */
  objective: string;
  /** 타겟 분석 — WHO + 인사이트 */
  targetAudience: string;
  /** 핵심 인사이트 — WHY 이 전략이 이긴다 */
  insight: string;
  /** 단계별 로드맵 (3~5단계) */
  phases: PlanPhase[];
  /** 최종 산출물 (전체 기간 후 갖게 될 것) */
  deliverables: string[];
  /** 성과 측정 지표 (KPI) */
  successMetrics: string[];
  /** 주요 리스크 + 대응 */
  risks: string[];
  /** 즉시 실행 가능한 다음 작업 (3~6건) — 데스크에서 바로 시킬 수 있도록 */
  nextActions: PlanAction[];
  /** 예산·리소스 가이드 (옵션) */
  estimatedBudget?: string;
}

// ===== 기획 코어 v2 (Strategy Core v2) =====
// v1과 별도. v2는 비서 자동화 엔진의 운영 룰북 역할.
// 입력은 비서별로 다르고, 출력은 4 비서 공통 PlanSpecV2.

/** 4 비서 공통 — 브랜드 정체성/타겟/톤 (모든 scope에서 공통 사용) */
export interface BrandFoundation {
  /** 브랜드 한 줄 정체성 — "30대 직장인을 위한 미니멀 골드 주얼리" */
  brandIdentity: string;
  /** 타겟 페르소나 — 인구통계 + 심리/행동 패턴 */
  targetPersona: string;
  /** 콘텐츠/카피 톤 — "친근하고 솔직" 등 */
  voiceTone: string;
  /** 금지 표현/주제 — 자동 검열 룰 */
  forbidden: string[];
}

/** 마키 (마케팅) 입력 */
export interface MarketingPlanInput extends BrandFoundation {
  scope: "marketing";
  /** 주력 채널 + 발행 빈도 — "인스타 주 5회 / 블로그 주 1회" */
  channelsAndCadence: string;
  /** 카테고리 비율 — "신상 30% / 스타일링 40% / 브랜드스토리 20% / 이벤트 10%" */
  contentMixHint: string;
  /** 이번 분기 핵심 메시지 3개 */
  quarterlyAnchors: string;
  /** 운영 제약 — "주말 발행 X, 평일 19시 ±1h" */
  operationalConstraints?: string;
}

/** 데일리 (상세페이지) 입력 */
export interface DetailPagePlanInput extends BrandFoundation {
  scope: "detail_page";
  /** 5섹션 구조 선호 + 예외 — "기본 5섹션, 의류는 사이즈 가이드 추가" */
  sectionStructurePreference: string;
  /** 신뢰 요소 (리뷰·인증·수상) */
  trustElements: string;
  /** SEO 타겟 키워드 풀 */
  seoKeywordPool: string;
  /** A/B 테스트 우선순위 — "후킹 카피 > 메인 이미지 > CTA" */
  abTestPriority?: string;
}

/** 애디 (광고) 입력 */
export interface AdsPlanInput extends BrandFoundation {
  scope: "ads";
  /** 채널 우선순위 — "메타 > 네이버 SA > 구글" */
  channelPriority: string;
  /** 일평균 예산 (KRW) */
  dailyBudget: string;
  /** 입찰/타겟팅 전략 — "관심사 + 룩얼라이크 1%" */
  biddingStrategy: string;
  /** 금지 카피 패턴 — "최저가/최고/즉효" 등 */
  forbiddenAdPatterns?: string;
  /** 리타겟 윈도우 — "장바구니 7일, 페이지뷰 14일" */
  retargetingWindows?: string;
}

/** 페니 (재무) 입력 */
export interface FinancePlanInput extends BrandFoundation {
  scope: "finance";
  /** 정산 주기 채널별 — "스마트스토어 D+8, 카페24 즉시" */
  settlementCycle: string;
  /** 카테고리 분류 룰 — "외주 디자인=COGS, 광고=마케팅비" */
  categoryRules: string;
  /** 손익 임계값 — "월 순이익 ₩300만 미만 시 경보" */
  profitThresholds: string;
  /** 광고비 한도 — "매출의 12% 초과 금지" */
  adBudgetLimit?: string;
  /** 알림 룰 — "정산 미매칭 ≥3건 시 즉시 알림" */
  alertRules?: string;
}

export type PlanInputV2 =
  | MarketingPlanInput
  | DetailPagePlanInput
  | AdsPlanInput
  | FinancePlanInput;

/** 4주치 캘린더 셀 — 비서가 그대로 발행 큐에 등록할 수 있는 형식 */
export interface PublishingPlan {
  /** "instagram" / "blog" / "threads" / "smartstore" 등 */
  channel: string;
  /** "weekly_5" / "daily_1" / "manual" */
  frequency: string;
  /** 권장 발행 슬롯 — "mon_19", "wed_19", "fri_19" */
  bestSlots: string[];
  /** 카테고리 비율 */
  contentMix: { category: string; ratio: number }[];
}

/** 4주치 콘텐츠 시드 — 자동화 엔진이 받아서 실제 콘텐츠 생성 */
export interface ContentSeed {
  /** 주차 1~4 */
  week: number;
  /** 발행 예정일 ISO date — "2026-05-06" */
  date: string;
  /** 채널 */
  channel: string;
  /** 카테고리 (publishingPlan.contentMix와 매칭) */
  category: string;
  /** 가제 */
  title: string;
  /** 후킹 각도 — "데일리 코디에 진주 한 알 더하기" */
  angle: string;
  /** 권장 해시태그 (10개 이내) */
  hashtags: string[];
  /** 사용자 승인 후 비서가 자동 생성/발행 가능한지 */
  autoExecutable: boolean;
}

/** 자동화 트리거 — 코드가 아닌 데이터로만 저장 (안전성) */
export interface AutomationHook {
  /** "schedule.daily_19h" / "review.detected" / "cart_abandoned" */
  triggerEvent: string;
  /** "generate_card_news" / "draft_caption" / "send_reply" */
  action: string;
  /** 액션 파라미터 (실행 시 검증 필수) */
  params: Record<string, unknown>;
  /** 실행 전 사용자 승인 필수 여부 (기본 true — 보안) */
  requiresApproval: boolean;
}

export interface PlanSpecV2 {
  /** v 식별자 */
  version: 2;
  /** 어느 비서 영역 */
  scope: "marketing" | "detail_page" | "ads" | "finance";

  /** 결과 카드용 짧은 요약 — 누적 리스트에 표시 */
  summary: {
    /** 한 줄 헤드라인 */
    headline: string;
    /** 한 줄 핵심 인사이트 */
    hookInsight: string;
    /** 발행 운영 한 줄 — "주 5회 인스타 + 주 1회 블로그" */
    cadenceSummary: string;
    /** 7일 안 발행 예정 건수 */
    nextSevenDaysCount: number;
  };

  /** 브랜드 룰 — 모든 자동 콘텐츠 호출의 system 프롬프트에 자동 주입 */
  brandRules: {
    voice: string;
    forbidden: string[];
    requiredElements: string[];
  };

  /** 채널별 발행 운영 룰 */
  publishingPlan: PublishingPlan[];

  /** 4주치 콘텐츠 시드 */
  contentSeeds: ContentSeed[];

  /** 단계별 로드맵 (3~5단계) — v1 PlanPhase 재사용 */
  phases: PlanPhase[];

  /** 성과 측정 지표 */
  successMetrics: string[];

  /** 주요 리스크 + 대응 */
  risks: string[];

  /** 자동화 훅 — 데이터로만 저장, 실행 시 별도 검증 */
  automationHooks: AutomationHook[];

  /** 예산 가이드 (옵션) */
  estimatedBudget?: string;
}

/** 비용 계산 결과 — plan_runs 저장용 */
export interface PlanCostBreakdown {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  /** 사고(thinking) 토큰 — output_tokens에 포함되지만 별도 추적 */
  thinkingTokens?: number;
  /** USD */
  costUsd: number;
  /** KRW (환율 1300 가정) */
  costKrw: number;
  /** 캐시 절감률 0~1 */
  cacheSavingRatio: number;
  model: string;
}

/** 실행 로그 한 항목 — 기획서가 트리거한 후속 작업 추적 */
export interface PlanExecutionEntry {
  ts: string;
  action: string;
  /** 후속 작업 결과물 ID (library_item id 등) */
  resultId?: string;
  /** 채널 (발행 시) */
  channel?: string;
  /** 사용자 승인 여부 */
  approved?: boolean;
  /** 성공 여부 */
  success?: boolean;
  /** 추가 메타 */
  meta?: Record<string, unknown>;
}

// ===== 브랜드 카드뉴스 디자인 템플릿 =====

/** 디자인 토큰 — CardRenderer가 직접 사용 */
export interface BrandTemplateTokens {
  palette: {
    /** 배경 메인 색 */
    bg: string;
    /** 카드 표면 (블록·박스) */
    surface: string;
    /** 본문 텍스트 색 */
    text: string;
    /** 강조/액센트 (CTA·하이라이트) */
    accent: string;
    /** 보조 (덜 강조된 텍스트·라인) */
    muted: string;
  };
  typography: {
    /** "sans" | "serif" | "mono" | "display" */
    titleFamily: "sans" | "serif" | "mono" | "display";
    /** 100~900 */
    titleWeight: number;
    /** 카드 높이 대비 제목 폰트 크기 비율 (예: 0.09 = 1080px의 ~97px) */
    titleSizeRatio: number;
    bodyFamily: "sans" | "serif" | "mono";
    bodyLineHeight: number;
  };
  layout: {
    /** 카드 가장자리 padding (px, 1080 기준) */
    padding: number;
    /** 정보 정렬 — top/center/bottom */
    contentAlign: "top" | "center" | "bottom";
    /** 텍스트 정렬 — left/center */
    textAlign: "left" | "center";
  };
  decorations: {
    /** sharp(픽셀) | soft(둥근) | hard(반원) */
    cornerStyle: "sharp" | "soft" | "hard";
    /** 0~6 */
    borderWidth: number;
    /** none | solid | dashed | double */
    borderStyle: "none" | "solid" | "dashed" | "double";
    /** none | dots | grid | noise | gradient_mesh */
    patternOverlay: "none" | "dots" | "grid" | "noise" | "gradient_mesh";
    /** 0~3 */
    shadowDepth: number;
    /** 페이지 인디케이터/브랜딩 표시 여부 */
    showBranding: boolean;
    showPageIndicator: boolean;
  };
  imagery: {
    /** photo_realistic | illustration | abstract | minimal_icon */
    preferredImageStyle: "photo_realistic" | "illustration" | "abstract" | "minimal_icon";
    /** 디자인 코어(이미지 생성 API)에 자동 prefix로 들어감 */
    stylePrompt: string;
    /** 이미지 위 어두운 오버레이 강도 (0~1) */
    overlayDarkness: number;
  };
}

/** 카피 톤 가이드 — 카드뉴스 본문 생성 시 자동 주입 */
export interface ToneProfile {
  /** "친근/솔직/감성/포멀/POP" 등 한 줄 묘사 */
  voice: string;
  /** 평균 문장 길이 — short(15자내) / medium(15~30) / long(30+) */
  sentenceLength: "short" | "medium" | "long";
  /** 이모지 사용 — none / minimal(1~2) / frequent(3+) */
  emojiUsage: "none" | "minimal" | "frequent";
  /** 격식 — casual / neutral / formal */
  formality: "casual" | "neutral" | "formal";
  /** 자주 쓰는 말투/엔딩 — "~예요", "~라구요", "~합니다" */
  endingStyle: string;
  /** 시그니처 표현 (있으면) */
  signaturePhrases: string[];
}

export interface BrandTemplate {
  id: string;
  userId: string;
  name: string;
  source: "reference_url" | "reference_image" | "reference_account" | "ai_generated" | "preset" | "manual";
  tokens: BrandTemplateTokens;
  toneProfile: ToneProfile;
  /** 출처 메타 — 도메인/추출 시각만 (URL은 저장 X) */
  referenceMeta: {
    sourceDomain?: string;       // "instagram.com"
    extractedAt?: string;        // ISO 시각
    sampleCount?: number;        // 분석한 이미지 수
    notes?: string;              // AI가 추출한 디자인 특징 메모
  };
  previewImage?: string | null;
  isActive: boolean;
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// ===== 월간 카드뉴스 발행 계획 =====

/** 위저드 2단계 — 한 카드뉴스 한 단위 */
export interface PlannedCard {
  /** 위저드 내부 ID */
  id: string;
  /** 기획 코어 contentSeed.id (있으면) */
  seedId?: string;
  /** 발행 예정일 ISO date */
  planDate: string;
  /** 추천 발행 시간 (HH:mm) */
  planTime?: string;
  /** 가제 */
  title: string;
  /** 후킹 각도 */
  angle: string;
  /** 카드 6장 종류 */
  cardKinds: string[];
  /** 권장 해시태그 */
  hashtags: string[];
  /** 카테고리 (피드 그리드 색감 분류용) */
  category: string;
  /** 피드 미리보기 색감 — palette.accent에서 파생 또는 카테고리별 */
  previewColor: string;
  /** 썸네일 타입 */
  thumbnailType: "stat" | "photo" | "quote" | "color_block";
  /** 사용자가 제외했는지 */
  excluded?: boolean;
  /** 상태 */
  status: "planned" | "approved" | "generating" | "done" | "failed";
  /** 생성 후 결과 — library_item id */
  resultLibraryId?: string;
  /** 생성된 캡션 후보 (3개) */
  captionVariants?: string[];
  /** 실패 사유 */
  errorReason?: string;
}

export interface MonthlyCardPlan {
  id: string;
  userId: string;
  /** "2026-05" */
  month: string;
  planRunId?: string | null;
  brandTemplateId: string;
  cards: PlannedCard[];
  status: "planning" | "approved" | "generating" | "done";
  approvalToken?: string | null;
  progress: {
    total: number;
    completed: number;
    failed: number;
    /** 마지막 업데이트 시각 */
    lastUpdate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/** 8 종 프리셋 — 사용자 첫 진입 시 시드. user_id 없이 메모리 상수. */
export const BRAND_TEMPLATE_PRESETS: Array<Omit<BrandTemplate, "id" | "userId" | "createdAt" | "updatedAt" | "usageCount" | "isActive" | "isFavorite" | "previewImage">> = [
  {
    name: "미니멀 화이트",
    source: "preset",
    tokens: {
      palette: { bg: "#fafafa", surface: "#ffffff", text: "#1a1a1a", accent: "#000000", muted: "#9ca3af" },
      typography: { titleFamily: "sans", titleWeight: 800, titleSizeRatio: 0.085, bodyFamily: "sans", bodyLineHeight: 1.6 },
      layout: { padding: 80, contentAlign: "center", textAlign: "left" },
      decorations: { cornerStyle: "sharp", borderWidth: 0, borderStyle: "none", patternOverlay: "none", shadowDepth: 0, showBranding: true, showPageIndicator: true },
      imagery: { preferredImageStyle: "photo_realistic", stylePrompt: "minimal clean photography, soft natural light, white background", overlayDarkness: 0.3 },
    },
    toneProfile: { voice: "차분하고 명료", sentenceLength: "short", emojiUsage: "none", formality: "neutral", endingStyle: "~합니다", signaturePhrases: [] },
    referenceMeta: { notes: "정제된 화이트 베이스 — 의류/뷰티/리빙에 적합" },
  },
  {
    name: "감성 파스텔",
    source: "preset",
    tokens: {
      palette: { bg: "#fff5f1", surface: "#ffe6dc", text: "#5b3d2e", accent: "#ff8c66", muted: "#bfa191" },
      typography: { titleFamily: "serif", titleWeight: 700, titleSizeRatio: 0.085, bodyFamily: "sans", bodyLineHeight: 1.7 },
      layout: { padding: 80, contentAlign: "center", textAlign: "left" },
      decorations: { cornerStyle: "soft", borderWidth: 0, borderStyle: "none", patternOverlay: "none", shadowDepth: 1, showBranding: true, showPageIndicator: true },
      imagery: { preferredImageStyle: "photo_realistic", stylePrompt: "warm pastel color photography, golden hour, dreamy soft focus", overlayDarkness: 0.2 },
    },
    toneProfile: { voice: "다정하고 감성적", sentenceLength: "medium", emojiUsage: "minimal", formality: "casual", endingStyle: "~예요", signaturePhrases: [] },
    referenceMeta: { notes: "여성 의류/뷰티/카페/플라워에 적합" },
  },
  {
    name: "POP 비비드",
    source: "preset",
    tokens: {
      palette: { bg: "#0a0a0a", surface: "#1a1a1a", text: "#ffffff", accent: "#ff4ec9", muted: "#7e94c8" },
      typography: { titleFamily: "display", titleWeight: 900, titleSizeRatio: 0.10, bodyFamily: "sans", bodyLineHeight: 1.5 },
      layout: { padding: 64, contentAlign: "center", textAlign: "left" },
      decorations: { cornerStyle: "sharp", borderWidth: 4, borderStyle: "solid", patternOverlay: "dots", shadowDepth: 0, showBranding: true, showPageIndicator: true },
      imagery: { preferredImageStyle: "abstract", stylePrompt: "vibrant neon abstract pop art, high contrast", overlayDarkness: 0.5 },
    },
    toneProfile: { voice: "강렬하고 직설적", sentenceLength: "short", emojiUsage: "frequent", formality: "casual", endingStyle: "!", signaturePhrases: [] },
    referenceMeta: { notes: "Z세대 대상 / 셀프리워드/팬덤/엔터테인먼트에 적합" },
  },
  {
    name: "뉴스풍 정보",
    source: "preset",
    tokens: {
      palette: { bg: "#f0f4f8", surface: "#ffffff", text: "#0f172a", accent: "#1e40af", muted: "#64748b" },
      typography: { titleFamily: "sans", titleWeight: 800, titleSizeRatio: 0.075, bodyFamily: "sans", bodyLineHeight: 1.65 },
      layout: { padding: 72, contentAlign: "top", textAlign: "left" },
      decorations: { cornerStyle: "sharp", borderWidth: 2, borderStyle: "solid", patternOverlay: "none", shadowDepth: 1, showBranding: true, showPageIndicator: true },
      imagery: { preferredImageStyle: "photo_realistic", stylePrompt: "editorial photography, journalistic, sharp detail", overlayDarkness: 0.3 },
    },
    toneProfile: { voice: "신뢰감 있고 정보 중심", sentenceLength: "medium", emojiUsage: "none", formality: "formal", endingStyle: "~다", signaturePhrases: [] },
    referenceMeta: { notes: "지식/금융/뉴스/B2B에 적합" },
  },
  {
    name: "매거진 에디토리얼",
    source: "preset",
    tokens: {
      palette: { bg: "#f8f5ef", surface: "#efe9dc", text: "#2a2520", accent: "#a17f3a", muted: "#8a8170" },
      typography: { titleFamily: "serif", titleWeight: 800, titleSizeRatio: 0.095, bodyFamily: "serif", bodyLineHeight: 1.7 },
      layout: { padding: 96, contentAlign: "center", textAlign: "left" },
      decorations: { cornerStyle: "sharp", borderWidth: 1, borderStyle: "solid", patternOverlay: "none", shadowDepth: 0, showBranding: true, showPageIndicator: false },
      imagery: { preferredImageStyle: "photo_realistic", stylePrompt: "editorial fashion photography, film grain, warm tones", overlayDarkness: 0.35 },
    },
    toneProfile: { voice: "고급스럽고 시적", sentenceLength: "long", emojiUsage: "none", formality: "neutral", endingStyle: "~다", signaturePhrases: [] },
    referenceMeta: { notes: "패션/주얼리/하이엔드 라이프스타일에 적합" },
  },
  {
    name: "픽셀 레트로",
    source: "preset",
    tokens: {
      palette: { bg: "#060920", surface: "#0a0e27", text: "#cfe9ff", accent: "#ff4ec9", muted: "#7e94c8" },
      typography: { titleFamily: "mono", titleWeight: 700, titleSizeRatio: 0.08, bodyFamily: "mono", bodyLineHeight: 1.6 },
      layout: { padding: 72, contentAlign: "center", textAlign: "left" },
      decorations: { cornerStyle: "sharp", borderWidth: 4, borderStyle: "solid", patternOverlay: "grid", shadowDepth: 2, showBranding: true, showPageIndicator: true },
      imagery: { preferredImageStyle: "abstract", stylePrompt: "pixel art retro game style, 16-bit, vivid synthwave", overlayDarkness: 0.5 },
    },
    toneProfile: { voice: "장난기 있고 컬트적", sentenceLength: "short", emojiUsage: "minimal", formality: "casual", endingStyle: "ㅋㅋ", signaturePhrases: [] },
    referenceMeta: { notes: "게임/팬덤/IT 커뮤니티에 적합" },
  },
  {
    name: "네온 글로우",
    source: "preset",
    tokens: {
      palette: { bg: "#0d0221", surface: "#190a3a", text: "#ffffff", accent: "#00ffd1", muted: "#a288c8" },
      typography: { titleFamily: "display", titleWeight: 900, titleSizeRatio: 0.10, bodyFamily: "sans", bodyLineHeight: 1.55 },
      layout: { padding: 72, contentAlign: "center", textAlign: "center" },
      decorations: { cornerStyle: "soft", borderWidth: 2, borderStyle: "solid", patternOverlay: "gradient_mesh", shadowDepth: 3, showBranding: true, showPageIndicator: true },
      imagery: { preferredImageStyle: "abstract", stylePrompt: "neon glow synthwave aesthetic, deep purple and cyan", overlayDarkness: 0.55 },
    },
    toneProfile: { voice: "임팩트 있고 미래적", sentenceLength: "short", emojiUsage: "minimal", formality: "casual", endingStyle: "!", signaturePhrases: [] },
    referenceMeta: { notes: "Tech/Crypto/엔터/이벤트에 적합" },
  },
  {
    name: "모노 블랙",
    source: "preset",
    tokens: {
      palette: { bg: "#000000", surface: "#0a0a0a", text: "#ffffff", accent: "#ffffff", muted: "#525252" },
      typography: { titleFamily: "sans", titleWeight: 900, titleSizeRatio: 0.11, bodyFamily: "sans", bodyLineHeight: 1.5 },
      layout: { padding: 80, contentAlign: "center", textAlign: "left" },
      decorations: { cornerStyle: "sharp", borderWidth: 0, borderStyle: "none", patternOverlay: "none", shadowDepth: 0, showBranding: true, showPageIndicator: true },
      imagery: { preferredImageStyle: "photo_realistic", stylePrompt: "high contrast black and white photography, dramatic shadows", overlayDarkness: 0.6 },
    },
    toneProfile: { voice: "단호하고 명료", sentenceLength: "short", emojiUsage: "none", formality: "neutral", endingStyle: ".", signaturePhrases: [] },
    referenceMeta: { notes: "프리미엄 브랜드/스트릿/디자인 스튜디오에 적합" },
  },
];

