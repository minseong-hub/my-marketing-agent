import type { ReferenceBoardRow } from "@/lib/db";

/**
 * 레퍼런스 보드에 모인 N건의 분석 결과를 종합해서
 * "이 브랜드의 디자인 DNA"를 추출.
 *
 * - 색상: 가장 많이 등장한 hex 빈도 Top N
 * - 도메인: 출처 분포 (인스타 vs 핀터레스트 vs 블로그)
 * - 태그: 사용자 큐레이션 태그 빈도
 * - 적합도: 평균 + 분포
 */

export interface BoardInsights {
  total: number;
  domains: Array<{ domain: string; count: number; pct: number }>;
  topTags: Array<{ tag: string; count: number }>;
  paletteFrequency: Array<{ color: string; count: number }>;
  avgFitScore: number;
  starredCount: number;
  /** 자동 추론한 톤 무드 (라벨 1~3) */
  inferredMood: string[];
}

const HEX_RE = /#?([0-9a-fA-F]{6})/g;

export function computeInsights(rows: ReferenceBoardRow[]): BoardInsights {
  if (rows.length === 0) {
    return { total: 0, domains: [], topTags: [], paletteFrequency: [], avgFitScore: 0, starredCount: 0, inferredMood: [] };
  }

  const domainMap = new Map<string, number>();
  const tagMap = new Map<string, number>();
  const colorMap = new Map<string, number>();
  let scoreSum = 0;
  let starred = 0;

  for (const r of rows) {
    if (r.domain) domainMap.set(r.domain, (domainMap.get(r.domain) ?? 0) + 1);
    try {
      const tags = JSON.parse(r.tags || "[]") as string[];
      for (const t of tags) tagMap.set(t.toLowerCase(), (tagMap.get(t.toLowerCase()) ?? 0) + 1);
    } catch {}

    // design_tokens에서 hex 색상 추출
    try {
      const tok = JSON.parse(r.design_tokens || "{}");
      const flat = JSON.stringify(tok);
      const matches = flat.match(HEX_RE);
      if (matches) {
        for (const m of matches) {
          const c = m.startsWith("#") ? m.toLowerCase() : `#${m.toLowerCase()}`;
          colorMap.set(c, (colorMap.get(c) ?? 0) + 1);
        }
      }
    } catch {}

    scoreSum += r.fit_score;
    if (r.is_starred) starred++;
  }

  const total = rows.length;
  const domains = Array.from(domainMap.entries())
    .map(([domain, count]) => ({ domain, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topTags = Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const paletteFrequency = Array.from(colorMap.entries())
    .map(([color, count]) => ({ color, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // 색상 채도 → 무드 추론
  const inferredMood: string[] = [];
  const dominantColors = paletteFrequency.slice(0, 3).map((p) => p.color);
  if (dominantColors.some((c) => /^#0[0-3]/.test(c) || /^#1[0-3]/.test(c))) inferredMood.push("어둡고 시크함");
  if (dominantColors.some((c) => /^#f[ace][cdef]/i.test(c))) inferredMood.push("밝고 파스텔");
  if (paletteFrequency.length >= 4) inferredMood.push("색감 다양");
  if (topTags.find((t) => /감성|레트로|빈티지/.test(t.tag))) inferredMood.push("감성/빈티지");
  if (topTags.find((t) => /미니멀|심플/.test(t.tag))) inferredMood.push("미니멀");

  return { total, domains, topTags, paletteFrequency, avgFitScore: Math.round(scoreSum / total), starredCount: starred, inferredMood };
}
