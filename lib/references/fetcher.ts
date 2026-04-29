/**
 * 플랫폼별 레퍼런스 본문 추출기.
 *
 * 외부 의존성 없이 fetch + 정규식으로 동작 (cheerio 추가 시 더 정확해짐 — Phase 2 후보).
 * 각 어댑터는 URL → { title, content, author, images, hashtags, raw_meta } 표준 형식으로 정규화.
 *
 * 지원 플랫폼:
 *  - naver_blog       (blog.naver.com / blog 본문 iframe 처리)
 *  - smartstore       (smartstore.naver.com 상품 상세)
 *  - instagram        (oEmbed/og:meta 까지만 — 로그인 필요한 본문은 og:description)
 *  - threads          (threads.net og:meta)
 *  - tistory          (티스토리 .tt_article_useless_p_margin)
 *  - generic          (모든 URL — og:title/description fallback)
 */

export type PlatformId =
  | "naver_blog"
  | "smartstore"
  | "instagram"
  | "threads"
  | "tistory"
  | "url";

export interface FetchedReference {
  platform: PlatformId;
  url: string;
  title: string;
  content: string;
  author?: string;
  images: string[];
  hashtags: string[];
  raw_meta: Record<string, string>;
}

const UA = "Mozilla/5.0 (compatible; CrewmateAI-ReferenceFetcher/1.0)";
const FETCH_TIMEOUT_MS = 12_000;

function detectPlatform(url: string): PlatformId {
  const u = url.toLowerCase();
  if (u.includes("blog.naver.com") || u.includes("m.blog.naver.com")) return "naver_blog";
  if (u.includes("smartstore.naver.com") || u.includes("brand.naver.com")) return "smartstore";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("threads.net") || u.includes("threads.com")) return "threads";
  if (u.includes("tistory.com")) return "tistory";
  return "url";
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.5",
      },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripTags(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h\d)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function pickMeta(html: string, prop: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const m = html.match(re);
  if (m) return decodeEntities(m[1]);
  // content가 먼저 오는 경우
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}["']`,
    "i"
  );
  const m2 = html.match(re2);
  return m2 ? decodeEntities(m2[1]) : undefined;
}

function extractTitle(html: string): string {
  return (
    pickMeta(html, "og:title") ||
    pickMeta(html, "twitter:title") ||
    (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ? decodeEntities(html.match(/<title[^>]*>([^<]+)<\/title>/i)![1]) : "") ||
    ""
  ).trim();
}

function extractDescription(html: string): string {
  return (
    pickMeta(html, "og:description") ||
    pickMeta(html, "description") ||
    pickMeta(html, "twitter:description") ||
    ""
  ).trim();
}

function extractImages(html: string, max = 8): string[] {
  const out = new Set<string>();
  const og = pickMeta(html, "og:image");
  if (og) out.add(og);
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const src = m[1];
    if (!src.startsWith("data:") && !src.includes("blank.gif")) out.add(src);
    if (out.size >= max) break;
  }
  return Array.from(out).slice(0, max);
}

function extractHashtags(text: string): string[] {
  const tags = new Set<string>();
  // \p{L} 유니코드 카테고리는 ES2018+ 필요 — 한글/영문/숫자/_ 직접 지정
  const re = /#([가-힯a-zA-Z0-9_]{1,40})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    tags.add(m[1]);
    if (tags.size >= 30) break;
  }
  return Array.from(tags);
}

// ─── 플랫폼별 어댑터 ────────────────────────────────────────────

async function fetchNaverBlog(url: string): Promise<FetchedReference> {
  // 네이버 블로그는 본문이 iframe (https://blog.naver.com/PostView.naver?...)에 있음.
  // m.blog.naver.com은 비교적 그대로 본문 포함.
  let html = await fetchHtml(url);
  let finalUrl = url;

  // PC 블로그 → mainFrame iframe 추출
  const iframeMatch = html.match(/<iframe[^>]+id=["']mainFrame["'][^>]+src=["']([^"']+)["']/i);
  if (iframeMatch) {
    const src = iframeMatch[1].startsWith("http") ? iframeMatch[1] : `https://blog.naver.com${iframeMatch[1]}`;
    try {
      html = await fetchHtml(src);
      finalUrl = src;
    } catch { /* iframe 실패 시 원본 유지 */ }
  }

  const title = extractTitle(html);
  // 네이버 블로그 본문 주요 selector: .se-main-container (스마트에디터 ONE) 또는 #postViewArea
  const seMatch = html.match(/<div[^>]+class=["'][^"']*se-main-container[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i);
  const oldMatch = html.match(/<div[^>]+id=["']postViewArea["'][^>]*>([\s\S]*?)<\/div>/i);
  const bodyHtml = seMatch?.[1] || oldMatch?.[1] || html;
  const content = stripTags(bodyHtml).slice(0, 8000);
  const images = extractImages(html);
  const author = pickMeta(html, "naverblog:nickname") || pickMeta(html, "og:article:author");

  return {
    platform: "naver_blog",
    url: finalUrl,
    title,
    content,
    author,
    images,
    hashtags: extractHashtags(content),
    raw_meta: { og_title: title, og_description: extractDescription(html) },
  };
}

async function fetchSmartstore(url: string): Promise<FetchedReference> {
  const html = await fetchHtml(url);
  const title = extractTitle(html);
  const description = extractDescription(html);
  // 스마트스토어는 SPA — JSON-LD 먼저 시도
  const ldMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  let ldName = "";
  let ldDesc = "";
  if (ldMatch) {
    try {
      const ld = JSON.parse(ldMatch[1].trim());
      ldName = (Array.isArray(ld) ? ld[0]?.name : ld.name) || "";
      ldDesc = (Array.isArray(ld) ? ld[0]?.description : ld.description) || "";
    } catch {}
  }
  const content = (ldDesc || description || stripTags(html)).slice(0, 6000);
  const author = pickMeta(html, "og:site_name");

  return {
    platform: "smartstore",
    url,
    title: ldName || title,
    content,
    author,
    images: extractImages(html),
    hashtags: extractHashtags(content),
    raw_meta: { og_title: title, og_description: description, ld_name: ldName },
  };
}

async function fetchInstagramOrThreads(url: string, platform: "instagram" | "threads"): Promise<FetchedReference> {
  // 인스타/스레드는 로그인 필요 — og:description로만 접근 가능 (대략 첫 줄 + 좋아요 수 등)
  const html = await fetchHtml(url);
  const title = extractTitle(html);
  const description = extractDescription(html);
  // og:description 형식 예: "1,234 likes, 56 comments - username on April 28, 2026: \"실제 캡션 본문...\""
  const captionMatch = description.match(/[""]([^""]+)[""]/);
  const content = captionMatch?.[1] || description;
  const authorMatch = description.match(/-\s*([\w._]+)\s+on/);
  return {
    platform,
    url,
    title,
    content,
    author: authorMatch?.[1] || pickMeta(html, "og:site_name"),
    images: extractImages(html),
    hashtags: extractHashtags(content),
    raw_meta: { og_title: title, og_description: description },
  };
}

async function fetchTistory(url: string): Promise<FetchedReference> {
  const html = await fetchHtml(url);
  const title = extractTitle(html);
  // 티스토리 본문 selector: .tt_article_useless_p_margin / .article-view / .entry-content
  const m =
    html.match(/<div[^>]+class=["'][^"']*tt_article_useless_p_margin[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/article>/i) ||
    html.match(/<div[^>]+class=["'][^"']*article-view[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/article>/i) ||
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const content = stripTags(m?.[1] || html).slice(0, 8000);
  return {
    platform: "tistory",
    url,
    title,
    content,
    author: pickMeta(html, "article:author") || pickMeta(html, "og:site_name"),
    images: extractImages(html),
    hashtags: extractHashtags(content),
    raw_meta: { og_title: title, og_description: extractDescription(html) },
  };
}

async function fetchGeneric(url: string): Promise<FetchedReference> {
  const html = await fetchHtml(url);
  const title = extractTitle(html);
  const description = extractDescription(html);
  // article 태그 우선, 없으면 main, 없으면 body
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const bodyHtml = articleMatch?.[1] || mainMatch?.[1] || html;
  const content = stripTags(bodyHtml).slice(0, 8000);
  return {
    platform: "url",
    url,
    title,
    content,
    author: pickMeta(html, "author") || pickMeta(html, "article:author") || pickMeta(html, "og:site_name"),
    images: extractImages(html),
    hashtags: extractHashtags(content),
    raw_meta: { og_title: title, og_description: description },
  };
}

// ─── Public API ────────────────────────────────────────────

export async function fetchReference(url: string, forced?: PlatformId): Promise<FetchedReference> {
  // URL validation
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new Error("올바른 URL이 아닙니다."); }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("http/https URL만 지원합니다.");
  }
  // SSRF 보호: 사설망 차단
  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.startsWith("127.") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    throw new Error("사설망 URL은 수집할 수 없습니다.");
  }

  const platform = forced ?? detectPlatform(url);
  switch (platform) {
    case "naver_blog": return fetchNaverBlog(url);
    case "smartstore": return fetchSmartstore(url);
    case "instagram":  return fetchInstagramOrThreads(url, "instagram");
    case "threads":    return fetchInstagramOrThreads(url, "threads");
    case "tistory":    return fetchTistory(url);
    default:           return fetchGeneric(url);
  }
}

export const PLATFORM_LABELS: Record<PlatformId, string> = {
  naver_blog: "네이버 블로그",
  smartstore: "스마트스토어",
  instagram:  "인스타그램",
  threads:    "스레드",
  tistory:    "티스토리",
  url:        "일반 웹페이지",
};
