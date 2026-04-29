import { z } from "zod";

/**
 * 부팅 시 한 번 실행되어 필수 환경변수를 검증합니다.
 * 누락/약한 값이 발견되면 즉시 throw 하여 잘못된 상태로 운영 진입을 막습니다.
 */

const HEX64 = /^[0-9a-fA-F]{64}$/; // 32바이트 hex
const MIN_SECRET_LEN = 32;

const isProd = process.env.NODE_ENV === "production";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // === 인증/암호화 시크릿 (절대 폴백 금지) ===
  JWT_SECRET: z
    .string()
    .min(MIN_SECRET_LEN, `JWT_SECRET이 누락되었거나 ${MIN_SECRET_LEN}자 미만입니다.`)
    .refine(
      (v) => !v.includes("change-in-production") && !v.includes("default"),
      "JWT_SECRET이 기본 예시 값입니다. openssl rand -hex 32로 새 값을 발급하세요."
    ),

  ENCRYPTION_KEY: z
    .string()
    .regex(HEX64, "ENCRYPTION_KEY가 누락되었거나 64자 hex(32바이트)가 아닙니다.")
    .refine(
      (v) => v !== "0".repeat(63) + "1" && !/^0+$/i.test(v),
      "ENCRYPTION_KEY가 기본 예시 값입니다. openssl rand -hex 32로 새 값을 발급하세요."
    ),

  // === DB / 앱 ===
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),

  // === AI ===
  ANTHROPIC_API_KEY: z.string().min(10).optional(),

  // === 자동 스케줄러 ===
  SCHEDULER_SECRET: z
    .string()
    .min(MIN_SECRET_LEN, "SCHEDULER_SECRET은 32자 이상이어야 합니다.")
    .refine(
      (v) => !v.includes("change-in-production"),
      "SCHEDULER_SECRET이 기본 예시 값입니다."
    )
    .optional(),

  // === OAuth ===
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  KAKAO_CLIENT_ID: z.string().optional(),
  KAKAO_CLIENT_SECRET: z.string().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
});

let cached: z.infer<typeof schema> | null = null;

export function getEnv() {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    const msg = `[환경변수 검증 실패]\n${issues}\n\n` +
      `해결 방법:\n` +
      `  1) openssl rand -hex 32 로 시크릿 생성\n` +
      `  2) .env 또는 호스팅 비밀 관리에 저장\n` +
      `  3) 서버 재시작\n`;
    if (isProd) {
      // 프로덕션에서는 즉시 실패
      throw new Error(msg);
    } else {
      // 개발환경에서는 로그 출력 후 진행 (개발 중 편의), 그러나 시크릿 폴백은 사용하지 않음
      console.error(msg);
      throw new Error(msg);
    }
  }
  cached = parsed.data;
  return cached;
}

/**
 * JWT 서명용 비밀키를 Uint8Array로 반환합니다. 폴백은 없습니다.
 */
export function getJwtSecretBytes(): Uint8Array {
  const env = getEnv();
  return new TextEncoder().encode(env.JWT_SECRET);
}
