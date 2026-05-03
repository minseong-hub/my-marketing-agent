import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { randomBytes } from "crypto";

/**
 * POST /api/monthly-plan/[id]/approve
 *  - 사용자가 위저드 3단계(피드 미리보기)에서 OK 클릭 → approvalToken 발급
 *  - 토큰은 일괄 생성 1회용 — execute 호출 후 폐기
 *  - status를 'approved'로 전환
 */

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:mplan-approve:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  const row = db.getMonthlyPlan(session.userId, params.id);
  if (!row) return NextResponse.json({ error: "월간 계획을 찾을 수 없습니다." }, { status: 404 });

  if (row.status === "generating" || row.status === "done") {
    return NextResponse.json({ error: `현재 상태(${row.status})에서는 승인할 수 없습니다.` }, { status: 409 });
  }

  // approvalToken — userId가 포함된 일회성 키 (executable 라우트에서 검증)
  const token = `mplan_${session.userId}_${randomBytes(24).toString("hex")}`;
  db.updateMonthlyPlan(session.userId, params.id, { status: "approved", approval_token: token });

  return NextResponse.json({ ok: true, approvalToken: token });
}
