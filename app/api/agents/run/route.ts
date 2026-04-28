import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runAgent } from "@/lib/agents/runner";
import type { AgentType } from "@/lib/agents/types";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { agentType: AgentType; task: string; context?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { agentType, task, context } = body;
  if (!agentType || !task) {
    return NextResponse.json({ error: "agentType과 task가 필요합니다." }, { status: 400 });
  }

  const validTypes: AgentType[] = ["marketing", "detail_page", "ads", "finance"];
  if (!validTypes.includes(agentType)) {
    return NextResponse.json({ error: "유효하지 않은 agentType입니다." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요." }, { status: 503 });
  }

  try {
    const sessionId = await runAgent({ userId: session.userId, agentType, task, context });
    return NextResponse.json({ sessionId, status: "running", message: "에이전트가 작업을 시작했습니다." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "실행 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
