/**
 * 월간 카드뉴스 계획 생성기.
 *
 * 입력: 월/총 카드뉴스 수/카테고리 비율/주력 발행 요일 또는 plan_runs에서 contentSeeds 가져오기.
 * 출력: PlannedCard[] — 발행일/카테고리/카드 종류가 균형있게 분배된 시드.
 *
 * LLM 호출 X — 단순 분배 알고리즘. 사용자가 위저드에서 즉시 수정 가능.
 * (향후 Opus로 더 정교한 분배 가능 — 우선 비용 절감)
 */

import type { PlannedCard, ContentSeed } from "./templates";

export interface MonthlyPlannerInput {
  /** "2026-05" */
  month: string;
  /** 총 카드뉴스 수 (1~12) */
  totalCards: number;
  /** 카테고리 분배 — [{category, ratio}] 합계 1.0 */
  categoryMix: { category: string; ratio: number }[];
  /** 발행 요일 0=일, 1=월, ..., 6=토. 빈 배열이면 평일(1~5) */
  preferredWeekdays?: number[];
  /** 추천 발행 시간 (HH:mm) */
  preferredTime?: string;
  /** brand_template의 accent 색 (썸네일 색감 기본값) */
  brandAccentColor?: string;
}

const DEFAULT_CARD_KINDS = ["hook","problem","solution","proof","compare","cta"];

const CATEGORY_COLOR_HINTS: Record<string, string> = {
  "신상":      "#ff4ec9",
  "스타일링":  "#5ce5ff",
  "브랜드스토리": "#ffd84d",
  "이벤트":    "#66ff9d",
  "팁":        "#a78bfa",
  "후기":      "#fb923c",
};

const CATEGORY_THUMBNAIL_TYPE: Record<string, PlannedCard["thumbnailType"]> = {
  "신상":      "photo",
  "스타일링":  "photo",
  "브랜드스토리": "quote",
  "이벤트":    "color_block",
  "팁":        "stat",
  "후기":      "quote",
};

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function* generateDates(month: string, total: number, weekdays: number[]): Generator<string> {
  // month "2026-05" → 그 달 1일부터 말일까지 weekday에 맞는 날 픽
  const [year, mon] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, mon - 1, 1));
  const end = new Date(Date.UTC(year, mon, 0));  // 말일
  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 24 * 3600 * 1000)) {
    if (weekdays.includes(d.getUTCDay())) days.push(new Date(d));
  }
  // total을 균등 간격으로 분배
  if (days.length === 0) return;
  const step = days.length / total;
  for (let i = 0; i < total; i++) {
    const idx = Math.min(days.length - 1, Math.floor(i * step));
    yield days[idx].toISOString().slice(0, 10);
  }
}

function distributeCategories(total: number, mix: { category: string; ratio: number }[]): string[] {
  // ratio 합 정규화
  const sum = mix.reduce((s, m) => s + Math.max(0, m.ratio || 0), 0) || 1;
  const out: string[] = [];
  for (const m of mix) {
    const count = Math.round(((m.ratio || 0) / sum) * total);
    for (let i = 0; i < count; i++) out.push(m.category);
  }
  // 부족분 보정
  while (out.length < total && mix.length > 0) out.push(mix[0].category);
  while (out.length > total) out.pop();
  // 셔플 (섞기 — 같은 카테고리가 연속 나오지 않도록)
  return interleave(out);
}

function interleave<T>(arr: T[]): T[] {
  // 같은 값이 연속하지 않도록 인터리브
  const groups = new Map<T, T[]>();
  for (const a of arr) {
    if (!groups.has(a)) groups.set(a, []);
    groups.get(a)!.push(a);
  }
  const sorted = Array.from(groups.values()).sort((a, b) => b.length - a.length);
  const out: T[] = [];
  while (sorted.some((g) => g.length > 0)) {
    for (const g of sorted) {
      if (g.length > 0) out.push(g.shift()!);
    }
  }
  return out;
}

export function generatePlannedCards(input: MonthlyPlannerInput): PlannedCard[] {
  const total = Math.max(1, Math.min(12, Math.trunc(input.totalCards || 4)));
  const weekdays = (input.preferredWeekdays && input.preferredWeekdays.length > 0)
    ? input.preferredWeekdays.filter((d) => d >= 0 && d <= 6)
    : [1, 2, 3, 4, 5];
  const categories = distributeCategories(total, input.categoryMix.length > 0 ? input.categoryMix : [{ category: "신상", ratio: 1 }]);
  const dates = Array.from(generateDates(input.month, total, weekdays));

  const cards: PlannedCard[] = [];
  for (let i = 0; i < total; i++) {
    const cat = categories[i] || "기타";
    cards.push({
      id: uid("pc"),
      planDate: dates[i] || "",
      planTime: input.preferredTime || "19:00",
      title: `${cat} #${i + 1}`,    // 사용자가 위저드에서 수정 가능
      angle: "",
      cardKinds: [...DEFAULT_CARD_KINDS],
      hashtags: [],
      category: cat,
      previewColor: CATEGORY_COLOR_HINTS[cat] || input.brandAccentColor || "#5ce5ff",
      thumbnailType: CATEGORY_THUMBNAIL_TYPE[cat] || "color_block",
      status: "planned",
    });
  }
  return cards;
}

/** plan_runs의 contentSeeds → PlannedCard 변환 */
export function plannedCardsFromContentSeeds(seeds: ContentSeed[], filter?: { channel?: string }): PlannedCard[] {
  const filtered = seeds.filter((s) => !filter?.channel || s.channel === filter.channel);
  return filtered.slice(0, 12).map((s) => ({
    id: uid("pc"),
    seedId: undefined,  // contentSeed에 id가 없으므로 매핑 어려움 — angle/title로 재추적
    planDate: s.date,
    planTime: "19:00",
    title: s.title,
    angle: s.angle,
    cardKinds: [...DEFAULT_CARD_KINDS],
    hashtags: s.hashtags || [],
    category: s.category,
    previewColor: CATEGORY_COLOR_HINTS[s.category] || "#5ce5ff",
    thumbnailType: CATEGORY_THUMBNAIL_TYPE[s.category] || "color_block",
    status: "planned",
  }));
}
