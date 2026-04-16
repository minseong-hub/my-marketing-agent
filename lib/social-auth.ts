import { SignJWT, jwtVerify } from "jose";

export const PENDING_COOKIE = "social-pending";
export const STATE_COOKIE = "oauth-state";

function getSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ||
      "saas-marketing-agent-secret-key-2024-change-in-production"
  );
}

export interface SocialPendingPayload {
  type: "social-pending";
  provider: "google" | "kakao";
  providerId: string;
  email: string;
  name: string;
}

export async function signSocialPending(
  payload: SocialPendingPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getSecret());
}

export async function verifySocialPending(
  token: string
): Promise<SocialPendingPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if ((payload as { type?: string }).type !== "social-pending") return null;
    return payload as unknown as SocialPendingPayload;
  } catch {
    return null;
  }
}

export function setCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}
