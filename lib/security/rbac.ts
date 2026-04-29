import { db } from "@/lib/db";
import type { UserPayload } from "@/lib/auth";

/**
 * 역할 기반 접근 제어 (Role-Based Access Control).
 *
 * 기존 user/admin 단일 분리에서 owner/admin/support 3단계로 확장:
 *  - owner   : 모든 권한 (settings.owner_email 또는 role='owner')
 *  - admin   : 일반 운영 권한 (사용자 관리, 환불, 플랜 변경 등)
 *  - support : 읽기 전용 + 티켓 답변 (민감한 결제/탈퇴 권한 없음)
 *  - user    : 일반 사용자
 *
 * 기존 DB의 role 컬럼은 그대로 유지하되, owner는 settings.owner_email 매칭으로도 인식합니다.
 */

export type Role = "owner" | "admin" | "support" | "user";

export type Permission =
  | "user.read"
  | "user.update"
  | "user.suspend"
  | "user.delete"
  | "billing.read"
  | "billing.refund"
  | "billing.plan_change"
  | "support.read"
  | "support.reply"
  | "settings.read"
  | "settings.update"
  | "admin_log.read"
  | "owner.transfer";

const PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    "user.read", "user.update", "user.suspend", "user.delete",
    "billing.read", "billing.refund", "billing.plan_change",
    "support.read", "support.reply",
    "settings.read", "settings.update",
    "admin_log.read",
    "owner.transfer",
  ],
  admin: [
    "user.read", "user.update", "user.suspend",
    "billing.read", "billing.refund", "billing.plan_change",
    "support.read", "support.reply",
    "settings.read",
    "admin_log.read",
  ],
  support: [
    "user.read",
    "billing.read",
    "support.read", "support.reply",
  ],
  user: [],
};

export function getEffectiveRole(session: UserPayload): Role {
  // session.role이 admin/user인 경우 + settings.owner_email과 일치하면 owner로 승격
  const settingsRow = db.getSettings();
  const ownerEmail = (settingsRow.owner_email || "").trim().toLowerCase();
  if (ownerEmail && session.email.trim().toLowerCase() === ownerEmail) return "owner";
  // 향후 role 컬럼이 'support'까지 확장될 수 있으므로 그대로 사용
  if (session.role === "admin") return "admin";
  // session.role이 'support' 등 새 값일 경우
  const r = (session.role as Role | undefined) ?? "user";
  if (r === "owner" || r === "admin" || r === "support" || r === "user") return r;
  return "user";
}

export function hasPermission(session: UserPayload, perm: Permission): boolean {
  const role = getEffectiveRole(session);
  return PERMISSIONS[role].includes(perm);
}

export function requirePermission(session: UserPayload, perm: Permission): void {
  if (!hasPermission(session, perm)) {
    const err = new Error(`권한이 부족합니다: ${perm}`);
    (err as Error & { code?: string }).code = "PERMISSION_DENIED";
    throw err;
  }
}
