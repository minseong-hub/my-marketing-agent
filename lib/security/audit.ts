import { db } from "@/lib/db";
import type { NextRequest } from "next/server";
import { getClientIp } from "./rate-limit";

/**
 * 인증/관리자 행위에 대한 감사 로깅.
 * - auth_events: 로그인 시도, 비밀번호 변경 등 사용자 인증 관련 사건
 * - admin_logs: 관리자가 수행한 액션 (이미 정의되어 있음)
 *
 * 모든 보안 민감 라우트는 이 함수를 통해 기록되어야 합니다.
 */

export type AuthEventKind =
  | "login_success"
  | "login_fail"
  | "signup"
  | "password_change"
  | "password_reset_request"
  | "password_reset_success"
  | "logout"
  | "social_login_success"
  | "social_login_fail"
  | "rate_limited"
  | "csrf_blocked"
  | "quota_exceeded"
  | "permission_denied";

export interface AuthEventInput {
  kind: AuthEventKind;
  user_id?: string | null;
  email?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  detail?: string | null;
}

export function recordAuthEvent(input: AuthEventInput): void {
  try {
    db.createAuthEvent({
      kind: input.kind,
      user_id: input.user_id ?? null,
      email: input.email ?? null,
      ip: input.ip ?? null,
      user_agent: input.user_agent ?? null,
      detail: input.detail ?? null,
    });
  } catch (e) {
    // 로깅 실패가 핵심 흐름을 막아서는 안 됨
    console.error("[audit] auth event 기록 실패:", e);
  }
}

export function extractRequestMeta(req: NextRequest): { ip: string; user_agent: string } {
  return {
    ip: getClientIp(req),
    user_agent: req.headers.get("user-agent") ?? "",
  };
}
