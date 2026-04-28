import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resumeAgentAfterApproval } from "@/lib/agents/runner";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  let body: { action: "approve" | "reject"; reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!["approve", "reject"].includes(body.action)) {
    return NextResponse.json({ error: "action은 approve 또는 reject여야 합니다." }, { status: 400 });
  }

  try {
    await resumeAgentAfterApproval(id, session.userId, body.action === "approve", body.reason);
    return NextResponse.json({
      success: true,
      message: body.action === "approve"
        ? "승인되었습니다. 에이전트가 작업을 재개합니다."
        : "거절되었습니다. 에이전트에게 통보했습니다.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "처리 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
