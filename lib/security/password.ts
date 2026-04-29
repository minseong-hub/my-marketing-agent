import { z } from "zod";

/**
 * 비밀번호 정책:
 *  - 최소 8자
 *  - 영문 / 숫자 / 특수문자 중 2종 이상 포함
 *  - 흔한 사전 비밀번호 차단
 *  - 이메일/이름과 동일 금지 (호출 측에서 추가 검증)
 */

const COMMON_PASSWORDS = new Set([
  "12345678", "123456789", "1234567890", "password", "password1", "password!",
  "qwerty12", "qwerty123", "abc12345", "11111111", "00000000", "asdfasdf",
  "asdfqwer", "letmein1", "iloveyou", "admin123", "test1234", "monkey12",
  "dragon12", "master12", "shadow12", "p@ssword", "p@ssw0rd",
  "비밀번호1", "비밀번호12", "qwer1234", "asdf1234", "zxcv1234",
]);

export function classifyPassword(password: string): {
  hasLetter: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  charKinds: number;
  length: number;
} {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const charKinds = [hasLetter, hasDigit, hasSpecial].filter(Boolean).length;
  return { hasLetter, hasDigit, hasSpecial, charKinds, length: password.length };
}

export function validatePasswordStrength(password: string): { ok: true } | { ok: false; reason: string } {
  if (password.length < 8) {
    return { ok: false, reason: "비밀번호는 8자 이상이어야 합니다." };
  }
  if (password.length > 128) {
    return { ok: false, reason: "비밀번호가 너무 깁니다 (128자 이하)." };
  }
  const { charKinds } = classifyPassword(password);
  if (charKinds < 2) {
    return {
      ok: false,
      reason: "영문 / 숫자 / 특수문자 중 2종류 이상을 포함해야 합니다.",
    };
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return { ok: false, reason: "너무 흔한 비밀번호입니다. 다른 조합을 사용해 주세요." };
  }
  // 같은 문자 4번 이상 반복 차단 (예: "aaaa1234")
  if (/(.)\1{3,}/.test(password)) {
    return { ok: false, reason: "같은 문자가 4회 이상 반복되었습니다." };
  }
  return { ok: true };
}

/**
 * Zod refinement 헬퍼.
 */
export const passwordSchema = z
  .string()
  .superRefine((val, ctx) => {
    const result = validatePasswordStrength(val);
    if (!result.ok) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.reason });
    }
  });

/**
 * 사용자 식별 정보(이메일/이름)와 동일하거나 포함되는 비밀번호 차단.
 */
export function passwordContainsIdentity(password: string, identity: string[]): boolean {
  const lower = password.toLowerCase();
  return identity.some((s) => {
    if (!s) return false;
    const id = s.toLowerCase();
    if (id.length < 3) return false;
    return lower === id || lower.includes(id);
  });
}
