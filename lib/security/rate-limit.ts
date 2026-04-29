/**
 * 단순 토큰-버킷 인메모리 rate limiter.
 *
 * 한계:
 *  - 단일 인스턴스 내에서만 카운팅 (서버리스 멀티 인스턴스 환경에서는 Upstash 등으로 교체 필요)
 *  - 프로세스 재시작 시 카운터 초기화
 * 그러나 SQLite 기반 단일 노드 운영에서는 충분하며, 향후 redis 백엔드로 쉽게 교체할 수 있도록 인터페이스만 의존.
 */

import type { NextRequest } from "next/server";

interface Bucket {
  tokens: number;
  lastRefill: number;
}

interface Limiter {
  /** 시간 창(ms) 동안 허용되는 최대 횟수 */
  capacity: number;
  /** 시간 창(ms) */
  refillMs: number;
}

const store = new Map<string, Bucket>();

function take(key: string, limiter: Limiter): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  let bucket = store.get(key);
  if (!bucket) {
    bucket = { tokens: limiter.capacity, lastRefill: now };
    store.set(key, bucket);
  }
  // Refill
  if (now - bucket.lastRefill >= limiter.refillMs) {
    bucket.tokens = limiter.capacity;
    bucket.lastRefill = now;
  }
  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return { allowed: true, retryAfterSec: 0 };
  }
  const retryAfterSec = Math.max(1, Math.ceil((limiter.refillMs - (now - bucket.lastRefill)) / 1000));
  return { allowed: false, retryAfterSec };
}

// 정기 청소 (메모리 누수 방지)
const CLEANUP_MS = 5 * 60 * 1000;
const globalForCleanup = globalThis as typeof globalThis & { __rlCleanup?: NodeJS.Timeout };
if (!globalForCleanup.__rlCleanup) {
  globalForCleanup.__rlCleanup = setInterval(() => {
    const now = Date.now();
    store.forEach((b, k) => {
      if (now - b.lastRefill > 30 * 60 * 1000) store.delete(k);
    });
  }, CLEANUP_MS);
}

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const xrip = req.headers.get("x-real-ip");
  if (xrip) return xrip.trim();
  return req.ip ?? "unknown";
}

/**
 * 표준 limiter 프리셋
 */
export const RATE_LIMITS = {
  /** 로그인 시도: 15분 동안 IP+이메일 기준 5회 */
  LOGIN: { capacity: 5, refillMs: 15 * 60 * 1000 } satisfies Limiter,
  /** 회원가입: 1시간 동안 IP 기준 5회 */
  SIGNUP: { capacity: 5, refillMs: 60 * 60 * 1000 } satisfies Limiter,
  /** 비밀번호 재설정 요청: 1시간 동안 이메일 기준 3회 */
  PASSWORD_RESET: { capacity: 3, refillMs: 60 * 60 * 1000 } satisfies Limiter,
  /** OAuth 콜백 시도: 5분 동안 IP 기준 20회 (정상 사용자 고려) */
  OAUTH: { capacity: 20, refillMs: 5 * 60 * 1000 } satisfies Limiter,
  /** 일반 인증된 API 호출 부하 보호: 1분 동안 사용자 기준 60회 */
  API_AUTH: { capacity: 60, refillMs: 60 * 1000 } satisfies Limiter,
} as const;

export function consume(key: string, limiter: Limiter) {
  return take(key, limiter);
}

export function rateLimitResponseInit(retryAfterSec: number): ResponseInit {
  return {
    status: 429,
    headers: {
      "Retry-After": String(retryAfterSec),
      "Content-Type": "application/json",
    },
  };
}
