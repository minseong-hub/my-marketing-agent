import type { NextRequest } from "next/server";

/**
 * 동일 출처(same-origin) 검증.
 * - 상태를 변경하는 POST/PUT/PATCH/DELETE 요청은 반드시 신뢰 도메인에서 와야 합니다.
 * - SameSite=Lax 쿠키와 함께 이 검증을 적용하면 CSRF를 광범위하게 차단할 수 있습니다.
 */

const STATE_CHANGING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function getAllowedOrigins(): string[] {
  const list = new Set<string>();
  const app = process.env.NEXT_PUBLIC_APP_URL;
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (app) list.add(app.replace(/\/$/, ""));
  if (base) list.add(base.replace(/\/$/, ""));
  // 개발 환경 기본 허용
  if (process.env.NODE_ENV !== "production") {
    list.add("http://localhost:3000");
    list.add("http://127.0.0.1:3000");
  }
  return Array.from(list);
}

export function verifySameOrigin(req: NextRequest): { ok: true } | { ok: false; reason: string } {
  if (!STATE_CHANGING.has(req.method)) return { ok: true };

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const allowed = getAllowedOrigins();

  // 명시적 Origin 헤더 우선 확인
  if (origin) {
    const norm = origin.replace(/\/$/, "");
    if (allowed.includes(norm)) return { ok: true };
    return { ok: false, reason: `허용되지 않은 출처: ${origin}` };
  }
  // Origin이 없으면 Referer 폴백
  if (referer) {
    try {
      const ref = new URL(referer);
      const norm = `${ref.protocol}//${ref.host}`;
      if (allowed.includes(norm)) return { ok: true };
      return { ok: false, reason: `허용되지 않은 Referer: ${referer}` };
    } catch {
      return { ok: false, reason: "Referer 파싱 실패" };
    }
  }
  return { ok: false, reason: "Origin 또는 Referer 헤더 없음" };
}
