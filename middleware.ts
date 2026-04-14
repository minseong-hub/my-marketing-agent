import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "auth-token";

function getSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ||
      "saas-marketing-agent-secret-key-2024-change-in-production"
  );
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /app/* 보호
  if (pathname.startsWith("/app")) {
    if (!(await isAuthenticated(request))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 이미 로그인한 사용자는 /login, /signup 접근 시 /app으로 리다이렉트
  if (pathname === "/login" || pathname === "/signup") {
    if (await isAuthenticated(request)) {
      return NextResponse.redirect(new URL("/app", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/signup"],
};
