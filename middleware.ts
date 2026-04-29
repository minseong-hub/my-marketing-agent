import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const USER_COOKIE = "auth-token";
const ADMIN_COOKIE = "admin-token";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || secret.includes("change-in-production")) {
    throw new Error("JWT_SECRET 환경변수가 설정되지 않았거나 안전하지 않습니다.");
  }
  return new TextEncoder().encode(secret);
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

  // ===== /desk/* — 일반 사용자 =====
  if (pathname.startsWith("/desk")) {
    const payload = await verify(request.cookies.get(USER_COOKIE)?.value);
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // ===== /login, /signup, /social-complete, /account-conflict — 이미 로그인이면 /desk =====
  if (pathname === "/login" || pathname === "/signup" || pathname === "/social-complete" || pathname === "/account-conflict") {
    const payload = await verify(request.cookies.get(USER_COOKIE)?.value);
    if (payload) {
      return NextResponse.redirect(new URL("/desk/marky", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/app/:path*", "/desk/:path*", "/login", "/signup", "/social-complete", "/account-conflict"],
};
