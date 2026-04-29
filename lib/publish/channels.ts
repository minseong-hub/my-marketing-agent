/**
 * 발행 채널 어댑터.
 *
 * 각 채널은 publish(payload) → { ok, externalRef, error } 형태로 일관된 응답을 반환.
 * OAuth 연동은 사용자별 토큰을 ENV에 저장하지 않고 추후 연동 (P-4).
 *
 * 현재 구현:
 *  - library          : 보관함에 즉시 저장 (항상 작동)
 *  - manual_export    : 보관함 + 수동 발행 안내 메시지 (항상 작동)
 *  - naver_blog       : 미구현 (OAuth 필요) — 결제/계약 후 활성화
 *  - instagram_graph  : 미구현 (Meta Graph API)
 *  - threads_api      : 미구현
 *  - kakao_open       : 미구현 (카카오 비즈니스)
 *  - cafe24_api       : 미구현 (Cafe24 OAuth)
 */

import { db } from "@/lib/db";

export type ChannelId =
  | "library"
  | "manual_export"
  | "naver_blog"
  | "instagram_graph"
  | "threads_api"
  | "kakao_open"
  | "cafe24_api";

export interface PublishContext {
  userId: string;
  agentType: string;
  kind: string;
  title: string;
  payload: Record<string, unknown>;
}

export interface PublishResult {
  ok: boolean;
  externalRef?: string;     // 발행 후 외부 ID/URL
  error?: string;
  needs_oauth?: boolean;    // true면 사용자에게 OAuth 연결 요청
}

export interface ChannelAdapter {
  id: ChannelId;
  label: string;
  ready: boolean;            // 즉시 발행 가능?
  needsOAuth: boolean;
  publish(ctx: PublishContext): Promise<PublishResult>;
}

// ─── 채널 1: library (즉시 보관함 저장) ───────────────────
const libraryAdapter: ChannelAdapter = {
  id: "library",
  label: "보관함 저장 (즉시)",
  ready: true,
  needsOAuth: false,
  async publish(ctx) {
    try {
      const item = db.createLibraryItem(ctx.userId, {
        agent_type: ctx.agentType,
        kind: ctx.kind,
        title: ctx.title,
        content: typeof ctx.payload.content === "string" ? ctx.payload.content : JSON.stringify(ctx.payload),
        metadata: JSON.stringify({
          published_via: "queue",
          channel: "library",
          published_at: new Date().toISOString(),
          ...ctx.payload,
        }),
        is_favorite: 0,
      });
      return { ok: true, externalRef: `library://${item.id}` };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "library 저장 실패" };
    }
  },
};

// ─── 채널 2: manual_export (보관함 + 수동 안내) ───────────
const manualExportAdapter: ChannelAdapter = {
  id: "manual_export",
  label: "수동 발행용 추출",
  ready: true,
  needsOAuth: false,
  async publish(ctx) {
    try {
      const item = db.createLibraryItem(ctx.userId, {
        agent_type: ctx.agentType,
        kind: ctx.kind,
        title: `[수동 발행 대기] ${ctx.title}`,
        content: typeof ctx.payload.content === "string" ? ctx.payload.content : JSON.stringify(ctx.payload, null, 2),
        metadata: JSON.stringify({
          published_via: "queue",
          channel: "manual_export",
          status: "ready_to_publish",
          ...ctx.payload,
        }),
        is_favorite: 0,
      });
      return { ok: true, externalRef: `manual://${item.id}` };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "추출 실패" };
    }
  },
};

// ─── 미구현 채널들 (자리만) ──────────────────────────────────
function makeOAuthPendingAdapter(id: ChannelId, label: string): ChannelAdapter {
  return {
    id,
    label,
    ready: false,
    needsOAuth: true,
    async publish() {
      return {
        ok: false,
        needs_oauth: true,
        error: `${label} 자동 발행은 OAuth 연결 후 활성화됩니다. 결제 + 운영 도메인 등록 후 사용 가능.`,
      };
    },
  };
}

const adapters: Record<ChannelId, ChannelAdapter> = {
  library: libraryAdapter,
  manual_export: manualExportAdapter,
  naver_blog: makeOAuthPendingAdapter("naver_blog", "네이버 블로그"),
  instagram_graph: makeOAuthPendingAdapter("instagram_graph", "Instagram"),
  threads_api: makeOAuthPendingAdapter("threads_api", "Threads"),
  kakao_open: makeOAuthPendingAdapter("kakao_open", "카카오 오픈채팅"),
  cafe24_api: makeOAuthPendingAdapter("cafe24_api", "카페24"),
};

export function getAdapter(channel: string): ChannelAdapter | null {
  return adapters[channel as ChannelId] ?? null;
}

export function listChannels(): { id: ChannelId; label: string; ready: boolean; needsOAuth: boolean }[] {
  return (Object.values(adapters)).map((a) => ({
    id: a.id, label: a.label, ready: a.ready, needsOAuth: a.needsOAuth,
  }));
}
