import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { startTrial } from "@/lib/billing";
import { db } from "@/lib/db";
import { PLAN_DEFINITIONS, PlanSlug } from "@/lib/plans";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { plan } = (await request.json()) as { plan?: string };
  if (!plan || !PLAN_DEFINITIONS[plan as PlanSlug]) {
    return NextResponse.json({ error: "유효한 플랜을 선택하세요." }, { status: 400 });
  }

  const user = db.getUserById(session.userId);
  if (!user) return NextResponse.json({ error: "사용자 없음" }, { status: 404 });
  if (user.trial_started_at) {
    return NextResponse.json({ error: "이미 체험을 사용하셨습니다." }, { status: 409 });
  }

  startTrial(session.userId, plan as PlanSlug);
  return NextResponse.json({ ok: true });
}
