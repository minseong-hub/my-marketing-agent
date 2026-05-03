/**
 * 편집 가능한 카드뉴스 결과물 타입.
 *
 * 기존 lib/studio/templates.ts의 CardSlot은 "AI 생성 시점의 정해진 6장" 모델이지만,
 * 새 워크스페이스는 6~10장 동적 + 사람이 자유롭게 편집 가능한 모델이 필요해서
 * EditableCard로 분리한다.
 *
 * 보관함의 cards_json은 EditableCard[]를 직렬화한 값.
 */

export type EditableCardKind =
  | "cover"
  | "hook"
  | "problem"
  | "solution"
  | "feature"
  | "stat"
  | "compare"
  | "quote"
  | "story"
  | "tip"
  | "cta"
  | "outro";

export interface EditableCard {
  id: string;
  kind: EditableCardKind;
  /** 1부터 시작하는 페이지 번호 (생성 시점 — 사람이 카드를 추가/삭제하면 갱신) */
  page: number;
  text: {
    headline: string;
    sub?: string;
    body?: string;
    /** 통계 카드용 */
    stat?: { value: string; unit?: string; caption?: string };
    /** 비교 카드용 */
    compare?: { left: string; right: string; leftLabel?: string; rightLabel?: string };
    /** 인용 카드용 */
    quote?: { text: string; attribution?: string };
    /** CTA 카드용 */
    cta?: { headline: string; sub?: string; button?: string };
  };
  design: {
    /** 5종 레이아웃 */
    layout: "centered" | "left_align" | "split_top" | "split_bottom" | "fullbleed";
    /** 색상 토큰 (BrandTemplate.tokens.palette에서 시작 — 카드별 오버라이드 가능) */
    palette: {
      bg: string;
      surface: string;
      text: string;
      accent: string;
      muted: string;
    };
    /** 폰트 크기 배율 (0.7~1.4, 1.0이 기본) */
    fontScale: number;
  };
  /** 효과 스택 — 글로우/스트로크/그라데이션 */
  effects: {
    glow?: { color: string; intensity: number };       // intensity 0~1
    stroke?: { color: string; width: number };         // width px
    gradient?: { from: string; to: string; angle: number };
    pattern?: "none" | "dots" | "grid" | "noise" | "gradient_mesh";
  };
  /** 배경 (이미지 또는 색상) */
  background: {
    kind: "color" | "gradient" | "image";
    color?: string;
    gradientFrom?: string;
    gradientTo?: string;
    image?: string;       // base64 또는 외부 URL
    imageOverlay?: number;  // 어두운 오버레이 강도 0~1
    /** 이미지 생성 시 사용된 prompt (재생성 시 컨텍스트로 활용) */
    imagePrompt?: string;
  };
}

/** 자기검수 결과 — 가독성/금기어/길이 등 */
export interface AutoFlag {
  cardIndex?: number;
  kind: "low_contrast" | "forbidden_word" | "headline_too_long" | "headline_too_short" | "body_too_long" | "no_cta" | "duplicate_headline";
  severity: "info" | "warn" | "error";
  message: string;
}

export const EDITABLE_LAYOUTS: Array<{ id: EditableCard["design"]["layout"]; label: string; hint: string }> = [
  { id: "centered",     label: "센터",        hint: "정중앙 정렬 — 단순·강조" },
  { id: "left_align",   label: "좌측 정렬",   hint: "긴 본문에 적합" },
  { id: "split_top",    label: "상단 헤드라인", hint: "헤드라인 위 / 본문 아래" },
  { id: "split_bottom", label: "하단 헤드라인", hint: "이미지 위 / 헤드라인 아래" },
  { id: "fullbleed",    label: "풀 블리드",   hint: "이미지 전면 + 텍스트 오버레이" },
];

export const EDITABLE_KIND_LABELS: Record<EditableCardKind, string> = {
  cover:    "커버",
  hook:     "후킹",
  problem:  "문제 제기",
  solution: "해결책",
  feature:  "특징",
  stat:     "통계·수치",
  compare:  "비교",
  quote:    "인용",
  story:    "스토리",
  tip:      "팁·체크리스트",
  cta:      "CTA",
  outro:    "마무리",
};
