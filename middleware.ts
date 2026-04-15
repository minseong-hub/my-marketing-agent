import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const USER_COOKIE = "auth-token";
const ADMIN_COOKIE = "admin-token";

function getSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ||
      "saas-marketing-agent-secret-key-2024-change-in-production"
  );
}

async function verify(token: string | undefined): Promise<{ role?: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { role?: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ===== /admin/* — admin 전용 쿠키 세션 =====
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      const adminPayload = await verify(request.cookies.get(ADMIN_COOKIE)?.value);
      if (adminPayload?.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }
    const adminPayload = await verify(request.cookies.get(ADMIN_COOKIE)?.value);
    if (!adminPayload || adminPayload.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ===== /app/* — 일반 사용자 =====
  if (pathname.startsWith("/app")) {
    const payload = await verify(request.cookies.get(USER_COOKIE)?.value);
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // ===== /login, /signup — 이미 로그인이면 /app =====
  if (pathname === "/login" || pathname === "/signup") {
    const payload = await verify(request.cookies.get(USER_COOKIE)?.value);
    if (payload) {
      return NextResponse.redirect(new URL("/app", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/app/:path*", "/login", "/signup"],
};
