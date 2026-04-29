import { z } from "zod";
import { passwordSchema } from "@/lib/security/password";

const PHONE_RE = /^010-\d{4}-\d{4}$/;

export const SignupSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(60),
  email: z.string().trim().toLowerCase().email("이메일 형식이 올바르지 않습니다.").max(254),
  password: passwordSchema,
  phone: z
    .string()
    .trim()
    .regex(PHONE_RE, "휴대폰 번호 형식(010-0000-0000)이 올바르지 않습니다."),
  businessName: z.string().trim().min(1, "사업체명을 입력해 주세요.").max(120),
  brandDisplayName: z.string().trim().min(1, "브랜드 표시 이름을 입력해 주세요.").max(60),
  businessType: z.string().trim().min(1).max(60),
  industry: z.string().trim().min(1).max(60),
  salesChannels: z.array(z.string().max(60)).max(20).default([]),
  productCategories: z.array(z.string().max(60)).max(20).default([]),
  termsAgreed: z.boolean().refine((v) => v === true, { message: "이용약관 동의가 필요합니다." }),
  privacyAgreed: z.boolean().refine((v) => v === true, { message: "개인정보처리방침 동의가 필요합니다." }),
  marketingConsent: z.boolean().optional(),
  // Honeypot — 봇이 채울 가능성이 높은 필드. 실제 사용자는 비워두어야 함.
  hp_company: z.string().max(0, "허용되지 않은 필드").optional(),
  // 폼 노출 시간(ms) — 너무 빠르면 봇으로 간주
  rendered_at: z.number().int().positive().optional(),
});

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(256),
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(10).max(512),
  password: passwordSchema,
});

export const AgentRunSchema = z.object({
  agentType: z.enum(["marketing", "detail_page", "ads", "finance"]),
  task: z.string().trim().min(1, "임무 내용이 필요합니다.").max(8000),
  context: z.record(z.string(), z.unknown()).optional(),
});

export const AutomationRunNowSchema = z.object({
  agentType: z.enum(["marketing", "detail_page", "ads"]),
});

export const ApprovalActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().max(2000).optional(),
});

export const BillingSubscribeSchema = z.object({
  plan: z.enum(["free", "starter", "growth", "pro"]),
});

/**
 * 헬퍼: API 라우트에서 Zod 결과를 NextResponse 친화적 메시지로 변환합니다.
 */
export function formatZodError(err: z.ZodError): string {
  return err.issues
    .map((i) => {
      const path = i.path.length ? `[${i.path.join(".")}] ` : "";
      return `${path}${i.message}`;
    })
    .join(" / ");
}
