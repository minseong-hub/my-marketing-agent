import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { activateSubscription } from "@/lib/billing";
import { PLAN_DEFINITIONS, PlanSlug } from "@/lib/plans";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { plan } = (await request.json()) as { plan?: string };
  if (!plan || !PLAN_DEFINITIONS[plan as PlanSlug]) {
    return NextResponse.json({ error: "유효한 플랜을 선택하세요." }, { status: 400 });
  }

  // NOTE: Mock payment — real PG integration replaces this block.
  activateSubscription(session.userId, plan as PlanSlug);
  return NextResponse.json({ ok: true });
}
