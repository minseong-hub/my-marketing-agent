import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  const session = await getAdminSession();
  if (session) {
    db.logAdmin({
      admin_id: session.userId,
      admin_email: session.email,
      action: "admin.logout",
    });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return res;
}
