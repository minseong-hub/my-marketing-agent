import type { EditableCard, AutoFlag } from "./card-types";

/** 금기어 — 광고법/소비자보호법 일반 위배 표현. 카피 사후 검열에 사용. */
export const FORBIDDEN_WORDS = [
  "최저가", "100% 보장", "100% 환불", "절대", "확실히 효과", "즉효",
  "기적", "1위", "최고의", "유일한", "치료", "완치", "암 예방",
  "다이어트 효과", "노화 방지", "주름 제거", "발모", "탈모 방지",
];

/** WCAG-비스무리 — 두 색의 대비비 추정. 실제 WCAG 공식과 차이 있음 (간이 계산) */
function relLuminance(hex: string): number {
  const c = hex.replace("#", "");
  if (c.length !== 6) return 0.5;
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const f = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrastRatio(a: string, b: string): number {
  const la = relLuminance(a);
  const lb = relLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * 카드 배열에 대해 가독성/금기어/길이/CTA 누락/헤드라인 중복 자동 검사.
 * 보관함 적재 직전 자동 호출 → review_state 자동 결정 (error 0건이면 'draft', 있으면 'needs_review').
 */
export function runAutoFlags(cards: EditableCard[]): AutoFlag[] {
  const out: AutoFlag[] = [];

  cards.forEach((card, i) => {
    // 1. 대비비 — 텍스트 vs 표면(또는 배경)
    const surface = card.background.kind === "color" ? (card.background.color ?? card.design.palette.bg) : card.design.palette.surface;
    const ratio = contrastRatio(card.design.palette.text, surface);
    if (ratio < 3.0) {
      out.push({ cardIndex: i, kind: "low_contrast", severity: "warn", message: `${i + 1}번 카드 텍스트/배경 대비비 ${ratio.toFixed(1)} (3.0 미만)` });
    }

    // 2. 금기어 — 헤드라인 + 본문 + 서브 모두 검사
    const allText = [card.text.headline, card.text.sub, card.text.body, card.text.cta?.headline, card.text.quote?.text].filter(Boolean).join(" ");
    for (const w of FORBIDDEN_WORDS) {
      if (allText.includes(w)) {
        out.push({ cardIndex: i, kind: "forbidden_word", severity: "error", message: `${i + 1}번 카드에서 금기어 "${w}" 발견` });
      }
    }

    // 3. 길이
    if (card.text.headline.length > 28) {
      out.push({ cardIndex: i, kind: "headline_too_long", severity: "info", message: `${i + 1}번 헤드라인 ${card.text.headline.length}자 (28자 초과 — 가독성 저하)` });
    }
    if (card.text.headline.length < 4) {
      out.push({ cardIndex: i, kind: "headline_too_short", severity: "info", message: `${i + 1}번 헤드라인이 너무 짧습니다` });
    }
    if (card.text.body && card.text.body.length > 220) {
      out.push({ cardIndex: i, kind: "body_too_long", severity: "info", message: `${i + 1}번 본문 ${card.text.body.length}자 (220자 초과)` });
    }
  });

  // 4. CTA 누락
  const hasCta = cards.some((c) => c.kind === "cta" || c.text.cta);
  if (!hasCta) {
    out.push({ kind: "no_cta", severity: "warn", message: "CTA 카드가 없습니다 — 마지막 카드를 CTA로 권장" });
  }

  // 5. 헤드라인 중복
  const headlines = cards.map((c) => c.text.headline.trim());
  const seen = new Set<string>();
  headlines.forEach((h, i) => {
    if (seen.has(h) && h.length > 0) {
      out.push({ cardIndex: i, kind: "duplicate_headline", severity: "info", message: `${i + 1}번 헤드라인이 다른 카드와 동일` });
    }
    seen.add(h);
  });

  return out;
}

export function reviewStateFromFlags(flags: AutoFlag[]): "draft" | "needs_review" | "approved" {
  if (flags.some((f) => f.severity === "error")) return "needs_review";
  if (flags.some((f) => f.severity === "warn")) return "needs_review";
  return "draft";
}
