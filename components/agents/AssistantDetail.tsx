"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CockpitShell } from "@/components/layout/CockpitShell";
import { CockpitPanel } from "@/components/primitives/CockpitPanel";
import { AstronautAvatar } from "@/components/primitives/AstronautAvatar";
import { Bar } from "@/components/primitives/Bar";
import { PixelButton } from "@/components/primitives/PixelButton";
import { Typewriter } from "@/components/primitives/Typewriter";
import { ApprovalModal } from "./ApprovalModal";
import { AGENTS } from "@/data/agents";
import type { AgentType } from "@/lib/agents/types";

// Crewmate AI mapping
const CREW_MAP: Record<AgentType, {
  crewId: string; accent: string; accentDark: string;
  name: string; role: string; sector: string;
  stats: { label: string; v: number; c: string }[];
}> = {
  marketing: {
    crewId: "marky", accent: "#ff4ec9", accentDark: "#8a2877",
    name: "마키", role: "마케팅 비서", sector: "SECTOR-7G · MARKY COMMS STATION",
    stats: [
      { label: "SNS 참여율 부스트", v: 92, c: "#ff4ec9" },
      { label: "콘텐츠 생산 속도",  v: 97, c: "#ff4ec9" },
      { label: "트렌드 감지",        v: 88, c: "#ff86dc" },
      { label: "브랜드 일관성",      v: 95, c: "#ff86dc" },
    ],
  },
  detail_page: {
    crewId: "dali", accent: "#5ce5ff", accentDark: "#2a86a8",
    name: "데일리", role: "상세페이지 비서", sector: "SECTOR-7G · DALI PAGE STUDIO",
    stats: [
      { label: "전환률 개선",     v: 89, c: "#5ce5ff" },
      { label: "페이지 체류시간", v: 94, c: "#5ce5ff" },
      { label: "카피 설득력",     v: 91, c: "#9af0ff" },
      { label: "섹션 구조화",     v: 96, c: "#9af0ff" },
    ],
  },
  ads: {
    crewId: "addy", accent: "#ffd84d", accentDark: "#a08820",
    name: "애디", role: "광고 전문가", sector: "SECTOR-7G · ADDY AD CONTROL",
    stats: [
      { label: "ROAS 최적화",      v: 93, c: "#ffd84d" },
      { label: "예산 효율",        v: 88, c: "#ffd84d" },
      { label: "채널 분석",        v: 95, c: "#fff0a8" },
      { label: "소재 A/B 테스트", v: 82, c: "#fff0a8" },
    ],
  },
  finance: {
    crewId: "penny", accent: "#66ff9d", accentDark: "#2a8a55",
    name: "페니", role: "재무 비서", sector: "SECTOR-7G · PENNY FINANCE HUB",
    stats: [
      { label: "손익 정확도",       v: 99, c: "#66ff9d" },
      { label: "현금흐름 추적",    v: 96, c: "#66ff9d" },
      { label: "비용 최적화",      v: 87, c: "#b8ffd1" },
      { label: "세금 시뮬레이션",  v: 90, c: "#b8ffd1" },
    ],
  },
};

const STATUS_LABEL: Record<string, string> = {
  idle: "대기 중", running: "임무 수행 중", waiting_approval: "승인 대기",
  completed: "완료", error: "통신 장애", paused: "일시정지",
};
const STATUS_COLOR: Record<string, string> = {
  idle: "#4a5a8a", running: "#5ce5ff", waiting_approval: "#ffd84d",
  completed: "#66ff9d", error: "#ff4ec9", paused: "#7e94c8",
};
const LOG_COLOR: Record<string, string> = {
  info: "#5ce5ff", success: "#66ff9d", warning: "#ffd84d",
  error: "#ff4ec9", action: "#ff4ec9",
};

interface LogItem { id: string; agent_type: string; level: string; message: string; created_at: string; }
interface ApprovalItem {
  id: string; agent_type: string; title: string; description: string;
  urgency_level: string; expires_at: string; preview_data: Record<string, unknown>; action_type: string;
}

export interface AssistantDetailProps {
  agentType: AgentType;
  quickTasks?: { label: string; task: string }[];
}

function LeftConsole({ agentType, status, sseConnected, quickTasks, approvals, isActive, isRunning, onRun, onApprove, onReject }: {
  agentType: AgentType;
  status: string;
  sseConnected: boolean;
  quickTasks: { label: string; task: string }[];
  approvals: ApprovalItem[];
  isActive: boolean;
  isRunning: boolean;
  onRun: (task: string) => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
}) {
  const crew = CREW_MAP[agentType];
  const crewAgent = AGENTS.find(a => a.id === crew.crewId)!;
  const [typeKey, setTypeKey] = useState(0);

  return (
    <>
      {/* 크루 프로필 */}
      <CockpitPanel title={`${crew.name.toUpperCase()} · 프로필`} accent={crew.accent} status={STATUS_LABEL[status] ?? status} statusColor={STATUS_COLOR[status] ?? "#4a5a8a"} className="flex-1">
        <div className="flex flex-col items-center gap-3">
          <div style={{ filter: `drop-shadow(0 0 20px ${crew.accent}88)` }}>
            <AstronautAvatar agent={crewAgent} scale={7} idle={true} />
          </div>
          <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, color: crew.accent, textAlign: "center" }}>
            {crew.name.toUpperCase()}
          </p>
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 7, color: "#7e94c8", textAlign: "center" }}>
            {crew.role}
          </p>

          {/* SSE 연결 상태 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 6, height: 6,
              background: sseConnected ? "#66ff9d" : "#4a5a8a",
              boxShadow: sseConnected ? "0 0 6px #66ff9d" : "none",
            }} />
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 7, color: sseConnected ? "#66ff9d" : "#4a5a8a" }}>
              {sseConnected ? "SSE LIVE" : "CONNECTING..."}
            </span>
          </div>

          {/* 퍼포먼스 게이지 */}
          <div className="w-full space-y-2 mt-1">
            {crew.stats.map(s => (
              <Bar key={s.label} v={s.v} c={s.c} label={s.label} segments={12} />
            ))}
          </div>
        </div>
      </CockpitPanel>

      {/* 빠른 임무 */}
      {quickTasks.length > 0 && (
        <CockpitPanel title="QUICK MISSIONS" accent={crew.accent} status="READY" statusColor="#66ff9d">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {quickTasks.map((qt) => (
              <button
                key={qt.label}
                onClick={() => onRun(qt.task)}
                disabled={isActive || isRunning}
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 8,
                  color: (isActive || isRunning) ? "#4a5a8a" : crew.accent,
                  background: "none",
                  border: `1px solid ${(isActive || isRunning) ? "#4a5a8a33" : crew.accentDark}`,
                  padding: "6px 8px",
                  cursor: (isActive || isRunning) ? "not-allowed" : "pointer",
                  textAlign: "left",
                  lineHeight: 1.5,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!isActive && !isRunning) (e.currentTarget as HTMLElement).style.background = `${crew.accentDark}22`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}
              >
                ▸ {qt.label.replace(/^[^\s]+\s/, "")}
              </button>
            ))}
          </div>
        </CockpitPanel>
      )}

      {/* 승인 대기 */}
      {approvals.length > 0 && (
        <CockpitPanel title={`APPROVAL QUEUE · ${approvals.length}`} accent="#ffd84d" status="PENDING" statusColor="#ffd84d">
          <ApprovalModal approvals={approvals} onApprove={onApprove} onReject={onReject} />
        </CockpitPanel>
      )}
    </>
  );
}

export function AssistantDetail({ agentType, quickTasks = [] }: AssistantDetailProps) {
  const router = useRouter();
  const crew = CREW_MAP[agentType];

  const [status, setStatus] = useState("idle");
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    const [logsRes, approvalsRes, statusRes] = await Promise.all([
      fetch(`/api/agents/logs?agentType=${agentType}&limit=80`),
      fetch("/api/approvals"),
      fetch("/api/agents/status"),
    ]);
    if (logsRes.ok) {
      const d = await logsRes.json();
      setLogs(d.logs || []);
      if (d.sessionId) setSessionId(d.sessionId);
      if (d.status) setStatus(d.status);
    }
    if (approvalsRes.ok) {
      const d = await approvalsRes.json();
      setApprovals((d.approvals || []).filter((a: ApprovalItem) => a.agent_type === agentType));
    }
    if (statusRes.ok) {
      const d = await statusRes.json();
      const s = d.agents?.[agentType];
      if (s) { setStatus(s.status); setCurrentTask(s.currentTask); }
    }
  }, [agentType]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // SSE
  useEffect(() => {
    const connect = () => {
      const es = new EventSource("/api/sse");
      esRef.current = es;
      es.addEventListener("heartbeat", () => setSseConnected(true));
      es.addEventListener("agent_log", (e) => {
        const log = JSON.parse(e.data);
        if (log.agentType !== agentType) return;
        setLogs((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, ...log }].slice(-100));
      });
      es.addEventListener("agent_status_change", (e) => {
        const data = JSON.parse(e.data);
        if (data.agentType !== agentType) return;
        setStatus(data.newStatus);
        if (data.currentTask) setCurrentTask(data.currentTask);
        if (data.newStatus === "running") setIsRunning(false);
      });
      es.addEventListener("approval_requested", (e) => {
        const data = JSON.parse(e.data);
        if (data.agentType !== agentType) return;
        setApprovals((prev) => {
          if (prev.some((a) => a.id === data.approvalId)) return prev;
          return [...prev, {
            id: data.approvalId, agent_type: data.agentType, title: data.title,
            description: data.description, urgency_level: data.urgencyLevel,
            expires_at: data.expiresAt, preview_data: data.previewData || {}, action_type: "other",
          }];
        });
        setStatus("waiting_approval");
      });
      es.addEventListener("approval_resolved", (e) => {
        const data = JSON.parse(e.data);
        setApprovals((prev) => prev.filter((a) => a.id !== data.approvalId));
      });
      es.onerror = () => { setSseConnected(false); es.close(); setTimeout(connect, 5000); };
    };
    connect();
    return () => { esRef.current?.close(); };
  }, [agentType]);

  async function handleRun(task?: string) {
    const t = task || taskInput.trim();
    if (!t) return;
    setIsRunning(true);
    setTaskInput("");
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType, task: t }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`오류: ${data.error}`);
        setIsRunning(false);
      } else {
        setSessionId(data.sessionId);
        setStatus("running");
        setCurrentTask(t);
      }
    } catch { setIsRunning(false); }
  }

  async function handleApprove(id: string) {
    await fetch(`/api/approvals/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "approve" }) });
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleReject(id: string, reason?: string) {
    await fetch(`/api/approvals/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reject", reason }) });
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }

  const isActive = status === "running" || status === "waiting_approval";

  return (
    <CockpitShell
      sector={crew.sector}
      accent={crew.accent}
      bootMessage={`${crew.name.toUpperCase()} STATION ONLINE · STATUS: ${(STATUS_LABEL[status] ?? status).toUpperCase()} · AWAITING ORDERS`}
      leftConsole={
        <LeftConsole
          agentType={agentType}
          status={status}
          sseConnected={sseConnected}
          quickTasks={quickTasks}
          approvals={approvals}
          isActive={isActive}
          isRunning={isRunning}
          onRun={handleRun}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      }
    >
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
        {/* 브레드크럼 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <button
            onClick={() => router.push("/app/assistants")}
            style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#4a5a8a",
              background: "none", border: "none", cursor: "pointer",
            }}
          >
            ← CREW STATIONS
          </button>
          <span style={{ color: "#1f2a6b" }}>›</span>
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: crew.accent }}>
            {crew.name.toUpperCase()} · {crew.role.toUpperCase()}
          </span>
        </div>

        {/* 현재 임무 표시 */}
        {isActive && currentTask && (
          <div
            className="pixel-frame"
            style={{
              border: `1px solid ${crew.accent}66`,
              background: `${crew.accentDark}22`,
              padding: "10px 14px",
              marginBottom: 16,
            }}
          >
            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 7, color: crew.accent, marginBottom: 4 }}>
              ▸ EXECUTING MISSION
            </p>
            <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 12, color: "#cfe9ff", lineHeight: 1.6 }}>
              {currentTask}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <div
                style={{
                  width: 6, height: 6, background: crew.accent,
                  animation: "blink 0.8s step-end infinite",
                }}
              />
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 7, color: crew.accent }}>
                {STATUS_LABEL[status] ?? status}
              </span>
              {sessionId && (
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 7, color: "#4a5a8a" }}>
                  · SESSION {sessionId.slice(0, 8).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 교신 로그 */}
        <div
          className="pixel-frame flex-1"
          style={{
            border: `1px solid ${crew.accent}33`,
            background: "#060e20",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 280,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              padding: "6px 12px",
              borderBottom: `1px solid ${crew.accent}22`,
              background: "#0a0e27",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 7, color: "#7e94c8" }}>
              ▸ 교신 로그 ({logs.length})
            </span>
            <button
              onClick={load}
              style={{
                fontFamily: '"JetBrains Mono", monospace', fontSize: 7, color: "#4a5a8a",
                background: "none", border: "none", cursor: "pointer",
              }}
            >
              ↻ 새로고침
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
            {logs.length === 0 ? (
              <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#4a5a8a", textAlign: "center", marginTop: 40 }}>
                — 교신 기록 없음 · 임무를 지시하세요 —
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 7,
                    color: "#4a5a8a", flexShrink: 0, paddingTop: 2,
                  }}>
                    {new Date(log.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 7,
                    color: LOG_COLOR[log.level] ?? "#5ce5ff",
                    flexShrink: 0, paddingTop: 2,
                    textTransform: "uppercase",
                    width: 48,
                  }}>
                    [{log.level}]
                  </span>
                  <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 12, color: "#cfe9ff", lineHeight: 1.6 }}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* 명령 입력 */}
        <div
          className="pixel-frame"
          style={{ border: `1px solid ${crew.accent}44`, background: "#0f1640", padding: "14px 16px" }}
        >
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 7, color: "#7e94c8", marginBottom: 10 }}>
            ▸ 임무 지시 (Ctrl+Enter 실행)
          </p>
          <textarea
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleRun();
              }
            }}
            placeholder={`${crew.name}에게 임무를 지시하세요...\n예: 이번 주 인스타그램 콘텐츠 3개 기획해줘`}
            disabled={isActive || isRunning}
            rows={3}
            style={{
              width: "100%",
              background: "#060920",
              border: `1px solid ${isActive ? "#4a5a8a44" : crew.accentDark}`,
              color: (isActive || isRunning) ? "#4a5a8a" : "#cfe9ff",
              fontFamily: '"IBM Plex Sans KR", sans-serif',
              fontSize: 13,
              lineHeight: 1.6,
              padding: "8px 10px",
              resize: "vertical",
              outline: "none",
              borderRadius: 0,
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <PixelButton
              variant="primary"
              size="sm"
              onClick={() => handleRun()}
              disabled={!taskInput.trim() || isActive || isRunning}
            >
              {isRunning ? "▶ 전송 중..." : "▶ 임무 하달"}
            </PixelButton>
            <PixelButton
              variant="ghost"
              size="sm"
              onClick={() => router.push("/app/assistants")}
            >
              ← 대시보드
            </PixelButton>
          </div>
        </div>
      </div>
    </CockpitShell>
  );
}
