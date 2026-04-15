import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { cancelSubscription } from "@/lib/billing";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  cancelSubscription(session.userId);
  return NextResponse.json({ ok: true });
}
