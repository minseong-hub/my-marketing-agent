/**
 * 인스타그램 이미지 다중 추출기.
 *
 * 입력:
 *   - URL (단일 게시물)
 *   - @계정 핸들 (최근 게시물 9~12개 — 단, 인스타 Graph API 없이 og:image만 가능)
 *
 * 출력:
 *   - 이미지 URL 배열 (최대 12장)
 *   - 출처 메타 (도메인/추출시각만)
 *
 * 보안:
 *   - URL은 instagram.com 도메인만 화이트리스트
 *   - 핸들은 정규식 검증
 *   - SSRF 차단 (사설망 거부)
 *   - 분석 후 원본 URL은 메타에 저장하지 않음 (저작권/재배포 방지)
 */

const UA = "Mozilla/5.0 (compatible; CrewmateAI-InstagramExtractor/1.0)";
const FETCH_TIMEOUT_MS = 12_000;
const MAX_IMAGES = 12;

export interface InstagramExtractResult {
  /** 추출된 이미지 URL 배열 (Claude vision 입력으로만 사용 — 저장 X) */
  images: string[];
  /** 출처 메타 — 사용자에게 보여주는 메타. 원본 URL은 저장 안함. */
  meta: {
    sourceDomain: string;        // "instagram.com"
    sourceType: "post" | "account" | "image_upload";
    extractedAt: string;
    sampleCount: number;
    title?: string;
    note?: string;
  };
}

/** 인스타 핸들 정규식 — @ 옵션, 1~30자, 알파벳/숫자/_/. 만 허용 */
const HANDLE_RE = /^@?[a-zA-Z0-9_.]{1,30}$/;

function isAllowedInstagramUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    if (host !== "instagram.com" && host !== "www.instagram.com" && host !== "m.instagram.com") return false;
    // SSRF 추가 방어 — hostname IP 형식 거부
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return false;
    return true;
  } catch {
    return false;
  }
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

function pickAllOgImages(html: string): string[] {
  const urls: string[] = [];
  // og:image (메인) + 추가 이미지
  const re = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    urls.push(decodeURIComponent(m[1]));
    if (urls.length >= MAX_IMAGES) break;
  }
  // og:image:url 백업
  if (urls.length === 0) {
    const re2 = /<meta[^>]+property=["']og:image:url["'][^>]+content=["']([^"']+)["']/i;
    const m2 = html.match(re2);
    if (m2) urls.push(decodeURIComponent(m2[1]));
  }
  return urls;
}

function pickJsonLdImages(html: string): string[] {
  // 인스타 페이지에 JSON-LD가 가끔 있음. 캐러셀 이미지가 들어가는 경우.
  const out: string[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1].trim());
      const collect = (obj: unknown) => {
        if (!obj || typeof obj !== "object") return;
        const o = obj as Record<string, unknown>;
        if (typeof o.contentUrl === "string") out.push(o.contentUrl);
        if (typeof o.url === "string" && /\.(jpg|jpeg|png|webp)/i.test(o.url)) out.push(o.url);
        if (Array.isArray(o.image)) {
          for (const it of o.image) {
            if (typeof it === "string") out.push(it);
            else if (it && typeof it === "object" && typeof (it as { url?: unknown }).url === "string") out.push((it as { url: string }).url);
          }
        }
        if (typeof o.image === "string") out.push(o.image);
      };
      if (Array.isArray(data)) for (const d of data) collect(d);
      else collect(data);
    } catch {}
    if (out.length >= MAX_IMAGES) break;
  }
  return out;
}

/** 단일 게시물 URL → 이미지 추출 */
export async function extractFromPostUrl(url: string): Promise<InstagramExtractResult> {
  if (!isAllowedInstagramUrl(url)) {
    throw new Error("instagram.com 도메인만 지원합니다.");
  }
  const html = await fetchHtml(url);
  // og:image (단일 인스타 게시물은 보통 1개) + JSON-LD에서 캐러셀 추가
  const ogImages = pickAllOgImages(html);
  const ldImages = pickJsonLdImages(html);
  const merged = Array.from(new Set([...ogImages, ...ldImages])).slice(0, MAX_IMAGES);
  if (merged.length === 0) {
    throw new Error("이미지를 추출할 수 없습니다. 인스타가 비공개 계정이거나 페이지 구조가 변경됐을 수 있습니다.");
  }
  return {
    images: merged,
    meta: {
      sourceDomain: "instagram.com",
      sourceType: "post",
      extractedAt: new Date().toISOString(),
      sampleCount: merged.length,
      note: "인스타그램 단일 게시물에서 추출",
    },
  };
}

/** 계정 핸들 (@username) → 프로필 페이지 og:image (대표 이미지 1장만 가능) */
export async function extractFromAccountHandle(handle: string): Promise<InstagramExtractResult> {
  const cleaned = handle.replace(/^@/, "").trim();
  if (!HANDLE_RE.test(cleaned) || cleaned.length === 0) {
    throw new Error("올바른 인스타 핸들 형식이 아닙니다 (영문/숫자/_/. 만 허용, 1~30자).");
  }
  const url = `https://www.instagram.com/${encodeURIComponent(cleaned)}/`;
  const html = await fetchHtml(url);
  const images = pickAllOgImages(html);
  if (images.length === 0) {
    throw new Error("계정 프로필 이미지를 가져올 수 없습니다. 비공개 계정이거나 인스타 정책으로 차단됐을 수 있습니다.");
  }
  return {
    images: images.slice(0, MAX_IMAGES),
    meta: {
      sourceDomain: "instagram.com",
      sourceType: "account",
      extractedAt: new Date().toISOString(),
      sampleCount: images.length,
      title: `@${cleaned}`,
      note: "인스타 계정 프로필 이미지에서 추출 (Graph API 없이는 게시물별 다중 추출 제한적)",
    },
  };
}

/** 사용자가 직접 업로드한 이미지 (Data URL or 외부 URL) → 그대로 결과로 래핑 */
export function wrapUploadedImages(dataUrls: string[]): InstagramExtractResult {
  const cleaned = dataUrls.filter(Boolean).slice(0, MAX_IMAGES);
  return {
    images: cleaned,
    meta: {
      sourceDomain: "user_upload",
      sourceType: "image_upload",
      extractedAt: new Date().toISOString(),
      sampleCount: cleaned.length,
      note: "사용자가 직접 업로드한 이미지",
    },
  };
}
