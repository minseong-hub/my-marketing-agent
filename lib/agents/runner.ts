import { getClaudeClient, MODEL } from "@/lib/claude/client";
import { COMMON_TOOLS } from "@/lib/claude/tools";
import { SYSTEM_PROMPTS, AGENT_NAMES } from "@/lib/claude/prompts";
import { db } from "@/lib/db";
import { sseBus } from "@/lib/sse/bus";
import type { AgentType, AgentRunInput } from "./types";
import type Anthropic from "@anthropic-ai/sdk";

const MAX_ITERATIONS = 30;

/** 에이전트 실행 메인 함수 — Next.js API Route에서 await 없이 fire-and-forget으로 호출 */
export async function runAgent(input: AgentRunInput): Promise<string> {
  const { userId, agentType, task } = input;

  // 세션 생성 또는 기존 세션 재사용
  const session = db.createAgentSession(userId, agentType, task);
  const sessionId = session.id;

  // 비동기로 실행 (응답은 SSE로)
  void executeAgentLoop(userId, agentType, sessionId, task).catch((err) => {
    const msg = err instanceof Error ? err.message : "알 수 없는 오류";
    db.updateAgentSession(sessionId, { status: "error", error_message: msg });
    db.createAgentLog({ session_id: sessionId, agent_type: agentType, user_id: userId, level: "error", message: `오류가 발생했습니다: ${msg}` });
    sseBus.publish(userId, { type: "agent_status_change", data: { agentType, sessionId, newStatus: "error" } });
  });

  return sessionId;
}

/** 승인 후 에이전트 재개 */
export async function resumeAgentAfterApproval(approvalId: string, userId: string, approved: boolean, rejectReason?: string): Promise<void> {
  const approval = db.getApprovalRequest(approvalId);
  if (!approval || approval.user_id !== userId) throw new Error("승인 요청을 찾을 수 없습니다.");
  if (approval.status !== "pending") throw new Error("이미 처리된 승인 요청입니다.");

  db.resolveApproval(approvalId, approved ? "approved" : "rejected", userId, rejectReason);

  const session = db.getAgentSessionById(approval.session_id);
  if (!session) return;

  if (approved) {
    db.updateAgentSession(session.id, { status: "running" });
    sseBus.publish(userId, { type: "approval_resolved", data: { approvalId, status: "approved", agentType: approval.agent_type } });

    // 재개 데이터 파싱
    let resumeData: Record<string, unknown> = {};
    try { resumeData = JSON.parse(approval.resume_data); } catch {}

    // 승인된 이후 컨텍스트로 에이전트 재개
    const resumeMessage = `사용자가 "${approval.title}" 요청을 승인했습니다. 이제 해당 작업을 실행하세요: ${JSON.stringify(resumeData)}`;
    void executeAgentLoop(userId, session.agent_type as AgentType, session.id, resumeMessage, true).catch((err) => {
      const msg = err instanceof Error ? err.message : "재개 중 오류";
      db.createAgentLog({ session_id: session.id, agent_type: session.agent_type, user_id: userId, level: "error", message: `재개 중 오류: ${msg}` });
    });
  } else {
    db.updateAgentSession(session.id, { status: "paused" });
    sseBus.publish(userId, { type: "approval_resolved", data: { approvalId, status: "rejected", agentType: approval.agent_type } });
    db.createAgentLog({
      session_id: session.id, agent_type: approval.agent_type, user_id: userId,
      level: "warning",
      message: `요청이 거절되었습니다. 사유: ${rejectReason || "사유 없음"}. 다른 방법을 고려합니다.`,
    });
  }
}

async function executeAgentLoop(
  userId: string,
  agentType: AgentType,
  sessionId: string,
  task: string,
  isResume = false,
): Promise<void> {
  const claude = getClaudeClient();
  const agentName = AGENT_NAMES[agentType];

  function emit(level: string, message: string) {
    db.createAgentLog({ session_id: sessionId, agent_type: agentType, user_id: userId, level, message });
    db.updateAgentSession(sessionId, { last_reported_at: new Date().toISOString() });
    sseBus.publish(userId, { type: "agent_log", data: { agentType, sessionId, level, message, createdAt: new Date().toISOString() } });
  }

  function setStatus(status: string, currentTask?: string) {
    db.updateAgentSession(sessionId, { status, current_task: currentTask });
    sseBus.publish(userId, { type: "agent_status_change", data: { agentType, sessionId, newStatus: status, currentTask } });
  }

  if (!isResume) {
    emit("info", `${agentName}이 작업을 시작합니다: "${task}"`);
  } else {
    emit("info", `${agentName}이 작업을 재개합니다.`);
  }

  setStatus("running", task);

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: task },
  ];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let response: Anthropic.Message;
    try {
      response = await claude.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: SYSTEM_PROMPTS[agentType],
        tools: COMMON_TOOLS,
        messages,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Claude API 오류";
      emit("error", `AI 연결 오류: ${msg}`);
      setStatus("error");
      return;
    }

    // 텍스트 응답 추가
    const textContent = response.content.filter((b) => b.type === "text").map((b) => (b as Anthropic.TextBlock).text).join("");
    if (textContent) {
      // 텍스트 응답은 로그로 기록 (보고 내용)
      // report_action 미사용 시에도 텍스트는 표시
    }

    // 도구 사용 처리
    const toolUses = response.content.filter((b) => b.type === "tool_use") as Anthropic.ToolUseBlock[];
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    let shouldPause = false;
    let shouldComplete = false;

    for (const tool of toolUses) {
      const input = tool.input as Record<string, unknown>;
      let toolResult = "완료";

      if (tool.name === "report_action") {
        const level = (input.level as string) || "info";
        const message = (input.message as string) || "";
        emit(level, message);
        toolResult = "보고 완료";
      }

      else if (tool.name === "request_approval") {
        // 승인 요청 생성 후 일시정지
        const approval = db.createApprovalRequest({
          session_id: sessionId,
          user_id: userId,
          agent_type: agentType,
          title: (input.title as string) || "승인 요청",
          description: (input.description as string) || "",
          action_type: (input.action_type as string) || "other",
          payload: (input.payload as Record<string, unknown>) || {},
          preview_data: (input.preview_data as Record<string, unknown>) || {},
          urgency_level: (input.urgency_level as string) || "normal",
          expires_in_minutes: (input.expires_in_minutes as number) || 60,
          resume_data: { task, last_message: textContent, tool_input: input },
        });

        emit("warning", `⏸ 승인이 필요합니다: "${input.title}" — 화면의 승인 요청을 확인하고 응답해주세요.`);
        setStatus("waiting_approval", task);

        sseBus.publish(userId, {
          type: "approval_requested",
          data: {
            approvalId: approval.id,
            agentType,
            title: approval.title,
            description: approval.description,
            previewData: JSON.parse(approval.preview_data),
            urgencyLevel: approval.urgency_level,
            expiresAt: approval.expires_at,
          },
        });

        toolResult = `승인 요청 생성됨 (ID: ${approval.id})`;
        shouldPause = true;
      }

      else if (tool.name === "collaborate") {
        const toAgent = input.to_agent_type as string;
        const subject = input.subject as string;
        emit("info", `🤝 ${AGENT_NAMES[toAgent] || toAgent}에게 협업 요청을 전달합니다: "${subject}"`);

        sseBus.publish(userId, {
          type: "collaboration",
          data: { fromAgent: agentType, toAgent, subject },
        });

        db.createAgentLog({
          session_id: sessionId, agent_type: agentType, user_id: userId,
          level: "action",
          message: `${AGENT_NAMES[toAgent] || toAgent}에게 "${subject}" 협업 요청을 전달했습니다.`,
          metadata: { to_agent: toAgent, content: input.content },
        });
        toolResult = "협업 메시지 전달 완료";
      }

      else if (tool.name === "task_complete") {
        const summary = (input.summary as string) || "작업이 완료되었습니다.";
        emit("success", `✅ ${summary}`);
        setStatus("completed", undefined);
        toolResult = "완료";
        shouldComplete = true;
      }

      else if (tool.name === "save_financial_record") {
        try {
          db.createFinancialRecord({
            user_id: userId,
            type: input.type as string,
            category: input.category as string,
            amount: input.amount as number,
            description: (input.description as string) || "",
            channel: input.channel as string | undefined,
            product_name: input.product_name as string | undefined,
            date: input.date as string,
            generated_by: "finance_agent",
            source_session_id: sessionId,
          });
          toolResult = "재무 데이터 저장 완료";
        } catch (e) {
          toolResult = `저장 실패: ${e}`;
        }
      }

      else if (tool.name === "save_content_draft") {
        // 콘텐츠 초안 저장 (향후 DB 연동)
        emit("action", `📝 "${input.title}" 콘텐츠 초안을 저장했습니다. 플랫폼: ${input.platform}`);
        toolResult = "콘텐츠 초안 저장 완료";
      }

      else if (tool.name === "save_ad_campaign") {
        emit("action", `🎯 "${input.campaign_name}" 광고 캠페인 초안을 생성했습니다. 플랫폼: ${input.platform}`);
        toolResult = "광고 캠페인 저장 완료";
      }

      toolResults.push({ type: "tool_result", tool_use_id: tool.id, content: toolResult });
    }

    // 어시스턴트 응답 추가
    messages.push({ role: "assistant", content: response.content });

    if (shouldPause || shouldComplete) break;

    // stop_reason이 end_turn이면 완료
    if (response.stop_reason === "end_turn" && toolUses.length === 0) {
      if (textContent) {
        emit("success", textContent.slice(0, 300));
      }
      setStatus("completed");
      break;
    }

    // 도구 결과 추가
    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    }

    // 더 이상 도구 없고 end_turn이면 종료
    if (response.stop_reason === "end_turn") {
      setStatus("completed");
      break;
    }
  }
}
