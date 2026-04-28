export type AgentType = "marketing" | "detail_page" | "ads" | "finance";

export type AgentStatus =
  | "idle"
  | "running"
  | "waiting_approval"
  | "completed"
  | "error"
  | "paused";

export interface AgentRunInput {
  userId: string;
  agentType: AgentType;
  task: string;
  context?: Record<string, unknown>;
  resumeFromApproval?: {
    approvalId: string;
    approved: boolean;
    rejectReason?: string;
  };
}

export interface AgentState {
  sessionId: string;
  agentType: AgentType;
  status: AgentStatus;
  currentTask: string | null;
  lastReportedAt: string | null;
  pendingApprovals: number;
  lastLog: string | null;
}

export interface SSEEvent {
  type:
    | "agent_log"
    | "agent_status_change"
    | "approval_requested"
    | "approval_resolved"
    | "collaboration"
    | "heartbeat"
    | "initial_state";
  data: Record<string, unknown>;
}
