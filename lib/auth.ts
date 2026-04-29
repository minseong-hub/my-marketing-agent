import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getJwtSecretBytes } from "./env";

export const COOKIE_NAME = "auth-token";
export const ADMIN_COOKIE_NAME = "admin-token";

function getSecret() {
  return getJwtSecretBytes();
}

export interface UserPayload {
  userId: string;
  email: string;
  name: string;
  businessName: string;
  brandDisplayName: string;
  role: "user" | "admin";
}

export async function signToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function signAdminToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAdminSession(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

export async function requireAdmin(): Promise<UserPayload> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export function isOwner(email: string): boolean {
  const ownerEmail = (db.getSettings().owner_email || "").trim().toLowerCase();
  if (!ownerEmail) return false;
  return email.trim().toLowerCase() === ownerEmail;
}

export async function requireOwner(): Promise<UserPayload> {
  const session = await requireAdmin();
  const ownerEmail = (db.getSettings().owner_email || "").trim().toLowerCase();
  if (ownerEmail && session.email.trim().toLowerCase() !== ownerEmail) {
    redirect("/admin?forbidden=owner");
  }
  return session;
}
