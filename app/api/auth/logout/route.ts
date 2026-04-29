import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, getSession } from "@/lib/auth";
import { verifySameOrigin } from "@/lib/security/csrf";
import { recordAuthEvent, extractRequestMeta } from "@/lib/security/audit";

export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) {
    return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  }

  const session = await getSession();
  if (session) {
    recordAuthEvent({
      kind: "logout",
      ...extractRequestMeta(request),
      user_id: session.userId,
      email: session.email,
    });
  }

  const response = NextResponse.json({ message: "로그아웃 되었습니다." });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
