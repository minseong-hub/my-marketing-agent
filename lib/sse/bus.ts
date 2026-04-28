/**
 * 인메모리 SSE 이벤트 버스
 * Redis 없이 동작하는 단순 pub/sub 구현
 */

import type { SSEEvent } from "@/lib/agents/types";

type Subscriber = (event: SSEEvent) => void;

class SSEBus {
  private subscribers = new Map<string, Set<Subscriber>>();

  subscribe(userId: string, fn: Subscriber): () => void {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }
    this.subscribers.get(userId)!.add(fn);
    return () => {
      this.subscribers.get(userId)?.delete(fn);
    };
  }

  publish(userId: string, event: SSEEvent): void {
    const subs = this.subscribers.get(userId);
    if (!subs) return;
    for (const fn of Array.from(subs)) {
      try {
        fn(event);
      } catch {}
    }
  }
}

// Next.js 핫 리로드 시 중복 생성 방지
const globalForBus = globalThis as typeof globalThis & { sseBus?: SSEBus };
if (!globalForBus.sseBus) globalForBus.sseBus = new SSEBus();

export const sseBus = globalForBus.sseBus;
