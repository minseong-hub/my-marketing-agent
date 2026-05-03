/**
 * 발행 안전 가드 — 실제 발행 (instagram/naver/cafe24 등) 직전에 호출.
 *
 * 책임:
 *  1. 콘텐츠 검열 — 사용자 brandRules.forbidden + 일반 금기어 매칭
 *  2. 사용자 명시 승인 검증 — approvalToken 없이는 발행 거부
 *  3. 발행 시도 audit log 기록 (모든 시도, 승인 여부 무관)
 *  4. 발행 channel 화이트리스트 (만든 적 없는 채널로 발행 금지)
 *
 * 모든 발행 라우트는 publishGuard()를 통과해야 channel adapter를 호출할 수 있도록 사용.
 */

import { db } from "@/lib/db";
import { recordAuthEvent } from "@/lib/security/audit";
import type { ChannelId } from "./channels";

/** 발행 가능한 채널 화이트리스트 (lib/publish/channels.ts와 동기화) */
const ALLOWED_CHANNELS: ChannelId[] = [
  "library",
  "manual_export",
  "naver_blog",
  "instagram_graph",
  "threads_api",
  "kakao_open",
  "cafe24_api",
];

/** 일반 금기어 — 사용자 forbidden과 합쳐서 검열 */
const GLOBAL_FORBIDDEN = [
  "최저가",
  "100% 보장",
  "즉효",
  "치료",
  "완치",
  "절대 안전",
  "무조건",
];

export interface PublishGuardInput {
  userId: string;
  channel: string;
  /** 발행할 콘텐츠 텍스트 (필터 매칭용) */
  contentText: string;
  /** 사용자 명시 승인 토큰 — 클라이언트에서 발행 버튼 클릭 시 발급된 일회성 키 */
  approvalToken?: string;
  /** 기획서 ID (있으면 brandRules.forbidden 자동 적용) */
  planRunId?: string;
  /** 발행 컨텍스트 메타 (audit log에 기록) */
  meta?: Record<string, unknown>;
  /** 요청 IP/UA — audit용 */
  requestMeta?: { ip: string; user_agent: string };
}

export interface PublishGuardResult {
  ok: boolean;
  reason?: string;
  /** 검열에 걸린 단어 (있을 때) */
  matchedForbidden?: string[];
}

/**
 * 사용자 명시 승인 토큰 형식: "publish_<userId>_<random>".
 * 1회용 — 사용 후 폐기. 현재 구현은 단순 검증 (실제 사용 시 메모리/DB 추적 권장).
 */
export function isValidApprovalToken(token: string | undefined, userId: string): boolean {
  if (!token) return false;
  if (typeof token !== "string") return false;
  if (!token.startsWith(`publish_${userId}_`)) return false;
  if (token.length < 30 || token.length > 200) return false;
  return true;
}

/**
 * 발행 직전 안전 가드.
 * 통과하지 못한 발행 시도는 audit log에 기록되어 운영자가 모니터링 가능.
 */
export function publishGuard(input: PublishGuardInput): PublishGuardResult {
  // 1. 채널 화이트리스트
  if (!ALLOWED_CHANNELS.includes(input.channel as ChannelId)) {
    recordPublishAttempt(input, false, "channel_not_allowed");
    return { ok: false, reason: `허용되지 않은 채널: ${input.channel}` };
  }

  // 2. 사용자 승인 토큰 검증 (library/manual_export는 즉시 발행 가능 — 본인 보관함만 영향)
  const isInternalChannel = input.channel === "library" || input.channel === "manual_export";
  if (!isInternalChannel) {
    if (!isValidApprovalToken(input.approvalToken, input.userId)) {
      recordPublishAttempt(input, false, "approval_token_invalid");
      return { ok: false, reason: "외부 채널 발행은 사용자 명시 승인 토큰이 필요합니다." };
    }
  }

  // 3. 콘텐츠 검열
  const forbiddenWords = new Set<string>(GLOBAL_FORBIDDEN.map((w) => w.toLowerCase()));
  if (input.planRunId) {
    try {
      const plan = db.getPlanRun(input.userId, input.planRunId);
      if (plan) {
        const spec = JSON.parse(plan.spec_json);
        const planForbidden = (spec?.brandRules?.forbidden || []) as string[];
        for (const w of planForbidden) forbiddenWords.add(String(w).toLowerCase());
      }
    } catch {}
  }
  const text = (input.contentText || "").toLowerCase();
  const matched: string[] = [];
  forbiddenWords.forEach((w) => {
    if (w && text.includes(w)) matched.push(w);
  });
  if (matched.length > 0) {
    recordPublishAttempt(input, false, `forbidden_words: ${matched.join(",")}`);
    return { ok: false, reason: `금지어 포함 (${matched.length}건): ${matched.join(", ")}`, matchedForbidden: matched };
  }

  // 통과
  recordPublishAttempt(input, true, "approved");
  return { ok: true };
}

function recordPublishAttempt(input: PublishGuardInput, ok: boolean, reason: string) {
  recordAuthEvent({
    kind: ok ? "login_success" : "permission_denied", // 재사용 — 별도 publish 이벤트 enum 추가는 향후
    user_id: input.userId,
    ip: input.requestMeta?.ip || null,
    user_agent: input.requestMeta?.user_agent || null,
    detail: `publish_attempt channel=${input.channel} planRunId=${input.planRunId || "-"} result=${reason}`,
  });
}
