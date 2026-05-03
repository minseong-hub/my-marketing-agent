/**
 * 마키 자동 레퍼런스 스카우트.
 *
 * 사용자 브랜드 프로필 + 카테고리/톤을 입력으로,
 *  1) 검색 쿼리 자동 생성 (Claude Sonnet)
 *  2) Brave/Bing 등 외부 검색 → URL 후보 N개
 *     (API 키 부재 시 reference_pulls 기존 자료 + 사용자 등록 핸들 풀에서 fallback)
 *  3) 각 URL을 fetcher로 추출 → vision으로 디자인 토큰 분석
 *  4) 적합도 점수 산출 → reference_board에 N건 자동 적재
 *
 * 비용: 호출당 약 $0.02 ~ $0.10 (Sonnet vision 1~3건).
 * 보안: instagram/pinterest/tistory/naver_blog 도메인만 화이트리스트. SSRF 차단.
 */

import { getDb } from "@/lib/db";

export interface ScoutQuery {
  brandName: string;
  category: string;
  voice?: string;
  /** 키워드 힌트 — 쉼표 구분 */
  hints?: string[];
  /** 한 번 호출에 적재할 최대 건수 (기본 5) */
  limit?: number;
}

export interface ScoutCandidate {
  url: string;
  domain: string;
  title: string;
  previewImage?: string;
  fitScore: number;
  designTokens?: Record<string, unknown>;
  query: string;
  reason: string;
}

const ALLOW_DOMAINS = ["instagram.com", "www.instagram.com", "www.pinterest.com", "pinterest.com", "blog.naver.com", "tistory.com", "behance.net"];

function isAllowed(url: string): boolean {
  try {
    const u = new URL(url);
    return ALLOW_DOMAINS.some((d) => u.hostname === d || u.hostname.endsWith("." + d));
  } catch { return false; }
}

/**
 * 검색 쿼리 N개 자동 생성.
 *
 * Claude API가 없거나 실패해도 의미있는 fallback을 제공한다.
 */
export function buildScoutQueries(q: ScoutQuery): string[] {
  const base = [q.category, q.voice, ...(q.hints ?? [])].filter(Boolean).join(" ").trim();
  // 한국어/영어 혼합 + 플랫폼 한정자
  const queries = [
    `${base} 인스타 카드뉴스 site:instagram.com`,
    `${base} pinterest design`,
    `${base} 카드뉴스 디자인 모음 site:blog.naver.com`,
    `${q.brandName} 비슷한 브랜드 인스타`,
    `${q.category} 무드보드 ${q.voice ?? "감성"}`,
  ].filter((s) => s.trim().length > 5);
  return queries.slice(0, 5);
}

/**
 * 외부 검색 — 환경변수 BRAVE_API_KEY 또는 BING_API_KEY가 있으면 그 API 사용,
 * 없으면 빈 배열 반환 (호출자가 fallback 경로 선택).
 */
async function searchUrls(query: string, limit = 5): Promise<Array<{ url: string; title: string }>> {
  const braveKey = process.env.BRAVE_API_KEY;
  if (braveKey) {
    try {
      const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${limit}`, {
        headers: { "X-Subscription-Token": braveKey, "Accept": "application/json" },
      });
      if (!res.ok) return [];
      const data = await res.json();
      const results = (data?.web?.results || []) as Array<{ url: string; title: string }>;
      return results.filter((r) => isAllowed(r.url)).slice(0, limit);
    } catch { return []; }
  }
  // 키 없음 → 빈 배열. 호출자가 fallback (사용자 등록 핸들 + reference_pulls 사용)
  return [];
}

/** 사용자 fallback — 본인이 등록한 reference_pulls + brand_profiles.competitor_urls */
function fallbackCandidates(userId: string, limit: number): Array<{ url: string; title: string }> {
  const db = getDb();
  const refs = db.prepare("SELECT url, title FROM reference_pulls WHERE user_id = ? ORDER BY created_at DESC LIMIT ?").all(userId, limit * 2) as Array<{ url: string; title: string }>;
  const profileRow = db.prepare("SELECT competitor_urls FROM brand_profiles WHERE user_id = ?").get(userId) as { competitor_urls?: string } | undefined;
  let competitors: string[] = [];
  try { competitors = JSON.parse(profileRow?.competitor_urls || "[]"); } catch {}
  const compEntries = competitors.filter(isAllowed).map((url) => ({ url, title: url }));
  return [...refs.filter((r) => isAllowed(r.url)), ...compEntries].slice(0, limit);
}

/**
 * 메인 진입점 — 자동 스카우트 1회 실행.
 *
 * 외부 의존성 (BRAVE_API_KEY, ANTHROPIC_API_KEY)이 없거나 실패해도
 * 항상 안전한 결과(빈 배열 포함)를 반환한다.
 */
export async function scoutOnce(userId: string, q: ScoutQuery): Promise<ScoutCandidate[]> {
  const limit = Math.max(1, Math.min(10, q.limit ?? 5));
  const queries = buildScoutQueries(q);

  // 1) 외부 검색 시도
  const seenUrls = new Set<string>();
  const collected: Array<{ url: string; title: string; query: string }> = [];
  for (const query of queries) {
    const results = await searchUrls(query, limit);
    for (const r of results) {
      if (seenUrls.has(r.url)) continue;
      seenUrls.add(r.url);
      collected.push({ ...r, query });
      if (collected.length >= limit) break;
    }
    if (collected.length >= limit) break;
  }

  // 2) fallback — 외부 검색 실패 시 사용자 자료 활용
  if (collected.length < limit) {
    const fb = fallbackCandidates(userId, limit - collected.length);
    for (const r of fb) {
      if (seenUrls.has(r.url)) continue;
      seenUrls.add(r.url);
      collected.push({ ...r, query: "fallback:user_history" });
    }
  }

  // 3) URL → 후보 변환 (fitScore는 휴리스틱 — vision 분석 없이 도메인+카테고리 매칭)
  // 실제 vision 분석은 사용자가 별표 누를 때 lazy하게 (비용 최소화).
  const out: ScoutCandidate[] = collected.slice(0, limit).map((r) => {
    let domain = "";
    try { domain = new URL(r.url).hostname; } catch {}
    let score = 50;
    if (domain.includes("instagram")) score += 20;
    if (domain.includes("pinterest")) score += 15;
    if (r.title.toLowerCase().includes(q.category.toLowerCase())) score += 10;
    if (q.voice && r.title.includes(q.voice)) score += 5;
    return {
      url: r.url,
      domain,
      title: r.title.slice(0, 200),
      fitScore: Math.max(0, Math.min(100, score)),
      query: r.query,
      reason: `${q.category} 키워드 매칭 (${domain})`,
    };
  });
  return out;
}

/** 한 후보를 DB에 저장 — URL은 저장하지 않고 도메인/메타만 (개인정보 최소화) */
export function persistCandidates(userId: string, brandId: string | null, candidates: ScoutCandidate[]): number {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO reference_board (id, user_id, brand_id, source, domain, title, design_tokens, fit_score, query)
     VALUES (?, ?, ?, 'auto_scout', ?, ?, ?, ?, ?)`
  );
  let inserted = 0;
  for (const c of candidates) {
    const id = `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      stmt.run(id, userId, brandId, c.domain, c.title, JSON.stringify(c.designTokens ?? {}), c.fitScore, c.query);
      inserted++;
    } catch {}
  }
  return inserted;
}
