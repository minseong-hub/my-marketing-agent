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
