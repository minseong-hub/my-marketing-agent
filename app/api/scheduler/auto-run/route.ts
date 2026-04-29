import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runAgent } from "@/lib/agents/runner";
import { pickScheduledTask } from "@/lib/scheduler/auto-tasks";
import type { AutoAgentType } from "@/lib/scheduler/auto-tasks";
import { checkQuotaForRun } from "@/lib/security/quota";

/**
 * POST /api/scheduler/auto-run
 * 자율 에이전트 자동 실행 엔드포인트
 *
 * 인증: Authorization: Bearer <SCHEDULER_SECRET>
 * Body: { agentTypes?: string[] }  — 기본값: ["marketing", "detail_page", "ads"]
 *
 * 이 엔드포인트는 외부 cron 서비스(Vercel Cron / GitHub Actions / 직접 curl)에서 호출
 */
export async function POST(request: NextRequest) {
  // 1. Secret 인증
  const secret = process.env.SCHEDULER_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SCHEDULER_SECRET이 설정되지 않았습니다." }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  // 2. 실행 대상 에이전트 타입 결정
  let body: { agentTypes?: string[]; userId?: string } = {};
  try { body = await request.json(); } catch { /* 빈 body 허용 */ }

  const validAutoTypes: AutoAgentType[] = ["marketing", "detail_page", "ads"];
  const agentTypes: AutoAgentType[] = (body.agentTypes as AutoAgentType[] | undefined)
    ?.filter((t) => validAutoTypes.includes(t)) ?? validAutoTypes;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY 없음" }, { status: 503 });
  }

  // 3. 대상 사용자 목록
  const users = body.userId
    ? [db.getUserById(body.userId)].filter(Boolean)
    : db.listUsers().filter((u) => u.status === "active");

  if (users.length === 0) {
    return NextResponse.json({ message: "활성 사용자 없음", launched: 0 });
  }

  const results: Array<{ userId: string; agentType: string; sessionId: string }> = [];

  const skipped: Array<{ userId: string; agentType: string; reason: string }> = [];

  for (const user of users) {
    if (!user) continue;
    for (const agentType of agentTypes) {
      // 플랜 한도/무료 자동 차단 검증
      const quota = checkQuotaForRun(user.id, { trigger: "auto_scheduler" });
      if (!quota.ok) {
        skipped.push({ userId: user.id, agentType, reason: quota.reason });
        continue;
      }
      try {
        const task = pickScheduledTask(agentType);
        const sessionId = await runAgent({
          userId: user.id,
          agentType,
          task,
          context: { trigger: "auto_scheduler", scheduledAt: new Date().toISOString() },
        });
        results.push({ userId: user.id, agentType, sessionId });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[scheduler] ${user.id}/${agentType} 실패:`, msg);
      }
    }
  }

  return NextResponse.json({
    message: "자율 에이전트 실행 완료",
    launched: results.length,
    skipped: skipped.length,
    results,
    skippedDetails: skipped,
  });
}

/**
 * GET /api/scheduler/auto-run — 상태 확인 (헬스체크)
 */
export async function GET(request: NextRequest) {
  const secret = process.env.SCHEDULER_SECRET;
  if (!secret) return NextResponse.json({ status: "SCHEDULER_SECRET 미설정" }, { status: 503 });

  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const activeUsers = db.listUsers().filter((u) => u.status === "active").length;
  return NextResponse.json({
    status: "ok",
    activeUsers,
    autoAgents: ["marketing", "detail_page", "ads"],
    anthropicKeySet: !!process.env.ANTHROPIC_API_KEY,
  });
}
