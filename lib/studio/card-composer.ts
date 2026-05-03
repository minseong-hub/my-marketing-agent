import type { BrandTemplate, BrandTemplateTokens, ToneProfile } from "./templates";
import type { EditableCard, EditableCardKind } from "./card-types";

/**
 * 디자인 자동 설계 엔진.
 *
 * - BrandTemplate이 있으면 그 토큰을 베이스로 사용.
 * - 없으면 brandHint + 카테고리 + (옵션) 레퍼런스 보드 DNA에서 토큰을 추론.
 *
 * 출력은 EditableCard[] (텍스트는 비어 있음 — Claude가 채울 자리). 워크플로우:
 *  1) decideStructure(angle, category) → 카드 구조 결정 (kind 배열)
 *  2) seedDesignTokens(template?, brandHint?, dna?) → 색상·레이아웃·효과 자동 매핑
 *  3) Claude가 텍스트만 채움 (카피 생성)
 *  4) auto-flags 검수
 */

/** 기본 폴백 팔레트 — 템플릿/DNA가 모두 없을 때 */
const DEFAULT_PALETTE = {
  bg: "#0f1429",
  surface: "#162043",
  text: "#cfe9ff",
  accent: "#ff4ec9",
  muted: "#7e94c8",
};

/** 콘텐츠 분량 자동 산출 — angle/cardKinds 기반으로 6~10장 결정 */
export function decideCardCount(angle: string, hint: { category?: string; depth?: "short" | "medium" | "deep" } = {}): number {
  const txt = (angle || "").trim();
  // 신호 추출: 스토리 톤이면 길게, 통계 톤이면 짧게
  const hasMultipleSignals = (txt.match(/[1-9]\d*/g) || []).length >= 2; // 숫자 2개 이상 → 비교/통계 → 7~8장
  const isStorytelling = /(스토리|이야기|왜|어쩌다|그래서)/.test(txt);
  const isList = /(\d+\s*가지|\d+\s*step|\d+\s*단계|체크리스트|방법|tip|팁)/i.test(txt);
  const longCategory = ["브랜드스토리", "인터뷰", "인사이트", "노하우"].includes(hint.category ?? "");

  let count = 7;
  if (isStorytelling || longCategory) count = 9;
  if (hasMultipleSignals) count = 8;
  if (isList) {
    // "5가지" 같은 표현이면 N + 커버 + CTA
    const m = txt.match(/(\d+)\s*가지|(\d+)\s*step|(\d+)\s*단계/i);
    if (m) {
      const n = parseInt(m[1] || m[2] || m[3] || "5", 10);
      count = Math.max(6, Math.min(10, n + 2));
    }
  }
  if (hint.depth === "short") count = Math.max(6, count - 2);
  if (hint.depth === "deep") count = Math.min(10, count + 1);
  return Math.max(6, Math.min(10, count));
}

/** 카드 구조 결정 — 카드 종류 시퀀스 */
export function decideStructure(angle: string, category: string, count: number): EditableCardKind[] {
  const isList = /(\d+\s*가지|\d+\s*step|\d+\s*단계|체크리스트|tip|팁)/i.test(angle || "");
  const isCompare = /(vs|비교|차이|대신)/i.test(angle || "");
  const isStat = /(\d+%|\d+배|통계|결과|증가|감소)/i.test(angle || "");
  const isStory = /(스토리|이야기|왜|어쩌다|그래서)/.test(angle || "");

  // 스토리텔링 시퀀스
  if (isStory) {
    const middle = count - 3; // cover, cta, outro 빼고
    const seq: EditableCardKind[] = ["cover"];
    for (let i = 0; i < middle; i++) seq.push("story");
    seq.push("cta", "outro");
    return seq.slice(0, count);
  }

  // 리스트 시퀀스
  if (isList) {
    const items = count - 2; // cover, cta
    const seq: EditableCardKind[] = ["cover"];
    for (let i = 0; i < items; i++) seq.push("tip");
    seq.push("cta");
    return seq.slice(0, count);
  }

  // 비교 시퀀스
  if (isCompare) {
    return (["cover", "hook", "problem", "compare", "feature", "stat", "solution", "cta"] as EditableCardKind[]).slice(0, count);
  }

  // 통계 시퀀스
  if (isStat) {
    return (["cover", "hook", "stat", "problem", "solution", "stat", "feature", "cta"] as EditableCardKind[]).slice(0, count);
  }

  // 기본 (후킹→문제→해결→증명→피처→CTA)
  return (["cover", "hook", "problem", "solution", "feature", "stat", "quote", "feature", "cta", "outro"] as EditableCardKind[]).slice(0, count);
}

/** 카드 종류별 권장 레이아웃 — 컴포저 기본값 (사용자 변경 가능) */
function defaultLayoutFor(kind: EditableCardKind): EditableCard["design"]["layout"] {
  switch (kind) {
    case "cover":   return "fullbleed";
    case "hook":    return "centered";
    case "problem": return "left_align";
    case "solution":return "left_align";
    case "feature": return "split_top";
    case "stat":    return "centered";
    case "compare": return "split_bottom";
    case "quote":   return "centered";
    case "story":   return "left_align";
    case "tip":     return "left_align";
    case "cta":     return "centered";
    case "outro":   return "centered";
  }
}

/**
 * 카드 N장에 대한 디자인 토큰 시드.
 * - 템플릿 토큰 베이스로 사용
 * - 카드별 약간의 변주 (커버는 fullbleed, 통계 카드는 accent 강조 등)
 */
export function seedDesignTokens(
  count: number,
  structure: EditableCardKind[],
  opts: {
    template?: BrandTemplate | null;
    brandHint?: string;
    /** 레퍼런스 보드에서 추출한 brand DNA (옵션) */
    dna?: { palette?: Partial<BrandTemplateTokens["palette"]> };
  } = {},
): EditableCard[] {
  const palette = {
    ...DEFAULT_PALETTE,
    ...(opts.template?.tokens.palette ?? {}),
    ...(opts.dna?.palette ?? {}),
  };

  const cards: EditableCard[] = [];
  for (let i = 0; i < count; i++) {
    const kind = structure[i] ?? "feature";
    cards.push({
      id: `c_${Date.now()}_${i}`,
      kind,
      page: i + 1,
      text: { headline: "", sub: "", body: "" },
      design: {
        layout: defaultLayoutFor(kind),
        palette: { ...palette },
        fontScale: kind === "cover" ? 1.2 : kind === "stat" ? 1.15 : 1.0,
      },
      effects: {
        glow: kind === "cover" || kind === "cta" ? { color: palette.accent, intensity: 0.5 } : undefined,
        stroke: undefined,
        gradient: kind === "cover" ? { from: palette.accent, to: palette.bg, angle: 135 } : undefined,
        pattern: opts.template?.tokens.decorations.patternOverlay ?? "none",
      },
      background: {
        kind: kind === "cover" ? "gradient" : kind === "stat" ? "color" : "color",
        color: kind === "stat" ? palette.surface : palette.bg,
        gradientFrom: palette.bg,
        gradientTo: palette.accent,
        imageOverlay: 0.45,
      },
    });
  }
  return cards;
}

/** Claude prompt builder — 카드 텍스트 채움용 (composer가 미리 구조를 결정해서 LLM 부담 ↓) */
export function buildCopyPrompt(args: {
  brandName: string;
  category: string;
  angle: string;
  cards: EditableCard[];
  toneProfile?: ToneProfile;
  brandVoice?: string;
}): { system: string; user: string } {
  const tone = args.toneProfile;
  const system = [
    `당신은 인스타 카드뉴스 카피라이터입니다. 브랜드 ${args.brandName}의 카드뉴스 ${args.cards.length}장의 텍스트를 작성합니다.`,
    args.brandVoice ? `브랜드 보이스: ${args.brandVoice}` : "",
    tone ? `톤: ${tone.voice} (${tone.formality}, 평균 문장 ${tone.sentenceLength}, 이모지 ${tone.emojiUsage})` : "",
    tone?.endingStyle ? `엔딩: "${tone.endingStyle}"` : "",
    `각 카드는 미리 정해진 종류(kind)와 레이아웃이 있습니다. 종류에 맞는 텍스트만 작성하세요.`,
    `금기: 최저가/100% 보장/즉효/기적/1위/유일한/치료/완치 등 — 광고법 위배 표현 금지.`,
    `headline은 28자 이내, body는 220자 이내. 통계 카드는 stat 필드, 비교 카드는 compare 필드, CTA는 cta 필드 사용.`,
  ].filter(Boolean).join("\n");

  const cardSpecs = args.cards.map((c, i) => `[${i + 1}] kind=${c.kind} layout=${c.design.layout}`).join("\n");
  const user = [
    `카테고리: ${args.category}`,
    `주제/각도: ${args.angle}`,
    `\n카드 구조 (${args.cards.length}장):`,
    cardSpecs,
    `\n응답 형식 — 순수 JSON 배열만:`,
    `[ { "headline": "...", "sub": "...", "body": "...", "stat"?: { "value": "...", "unit": "...", "caption": "..." }, "compare"?: { "left": "...", "right": "...", "leftLabel": "...", "rightLabel": "..." }, "quote"?: { "text": "...", "attribution": "..." }, "cta"?: { "headline": "...", "sub": "...", "button": "..." } }, ... ]`,
  ].join("\n");

  return { system, user };
}
