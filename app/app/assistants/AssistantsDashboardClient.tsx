"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ActivityFeed } from "@/components/agents/ActivityFeed";
import { ApprovalModal } from "@/components/agents/ApprovalModal";
import { AstronautAvatar } from "@/components/primitives/AstronautAvatar";
import { CockpitPanel } from "@/components/primitives/CockpitPanel";
import { Bar } from "@/components/primitives/Bar";
import { HudStrip } from "@/components/primitives/HudStrip";
import { Starfield } from "@/components/primitives/Starfield";
import { AGENTS } from "@/data/agents";
import type { AgentType, AgentState } from "@/lib/agents/types";

const AGENT_TYPES: AgentType[] = ["marketing", "detail_page", "ads", "finance"];

// Crewmate AI 매핑
const CREW_MAP: Record<AgentType, { crewId: string; accent: string; accentDark: string; name: string; role: string }> = {
  marketing:   { crewId: "marky",  accent: "#ff4ec9", accentDark: "#8a2877",  name: "마키",   role: "마케팅 비서" },
  detail_page: { crewId: "dali",   accent: "#5ce5ff", accentDark: "#2a86a8",  name: "데일리", role: "상세페이지 비서" },
  ads:         { crewId: "addy",   accent: "#ffd84d", accentDark: "#a08820",  name: "애디",   role: "광고 전문가" },
  finance:     { crewId: "penny",  accent: "#66ff9d", accentDark: "#2a8a55",  name: "페니",   role: "재무 비서" },
};

const STATUS_LABEL: Record<string, string> = {
  idle: "대기 중", running: "임무 수행 중", waiting_approval: "승인 대기",
  completed: "완료", error: "통신 장애", paused: "일시정지",
};
const STATUS_COLOR: Record<string, string> = {
  idle: "#4a5a8a", running: "#5ce5ff", waiting_approval: "#ffd84d",
  completed: "#66ff9d", error: "#ff4ec9", paused: "#7e94c8",
};

interface LogItem {
  id: string; agent_type: string; level: string; message: string; created_at: string;
}
interface ApprovalItem {
  id: string; agent_type: string; title: string; description: string;
  urgency_level: string; expires_at: string; preview_data: Record<string, unknown>; action_type: string;
}

function CrewCard({ agentType, state, onClick }: {
  agentType: AgentType;
  state: (AgentState & { lastLog: string | null }) | undefined;
  onClick: () => void;
}) {
  const crew = CREW_MAP[agentType];
  const crewAgent = AGENTS.find(a => a.id === crew.crewId)!;
  const status = state?.status ?? "idle";
  const [hovered, setHovered] = useState(false);

  const relativeTime = state?.lastReportedAt
    ? (() => {
        const diff = Date.now() - new Date(state.lastReportedAt).getTime();
        if (diff < 60000) return "방금 전";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
        return `${Math.floor(diff / 3600000)}시간 전`;
      })()
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: AGENT_TYPES.indexOf(agentType) * 0.1 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="pixel-frame cursor-pointer flex flex-col"
      style={{
        border: `2px solid ${hovered ? crew.accent : crew.accent + "55"}`,
        background: hovered ? `${crew.accentDark}22` : "#0f1640",
        boxShadow: hovered ? `4px 4px 0 ${crew.accentDark}` : "none",
        transition: "all 0.15s",
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Title bar */}
      <div style={{
        padding: "7px 12px",
        borderBottom: `1px solid ${crew.accent}33`,
        background: "#060920",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: crew.accent }}>
          ● {crew.name} · {crew.role}
        </span>
        <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: STATUS_COLOR[status], animation: status === "running" ? "blink 1s steps(2) infinite" : "none" }}>
          ● {STATUS_LABEL[status]}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 14px", display: "flex", gap: 12, alignItems: "flex-start", flex: 1 }}>
        {/* Avatar */}
        <div style={{ filter: `drop-shadow(0 0 ${hovered ? 16 : 8}px ${crew.accent}88)`, flexShrink: 0, transition: "filter 0.2s" }}>
          <AstronautAvatar agent={crewAgent} scale={4} idle={true} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {state?.pendingApprovals && state.pendingApprovals > 0 ? (
            <div style={{ border: `1px solid ${crew.accent}`, background: `${crew.accentDark}33`, padding: "5px 10px", marginBottom: 8 }}>
              <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, fontWeight: 600, color: crew.accent, animation: "blink 1s steps(2) infinite" }}>
                ▸ 승인 대기 {state.pendingApprovals}건 — 응답 필요
              </p>
            </div>
          ) : null}

          <div style={{ minHeight: 48 }}>
            {state?.lastLog ? (
              <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#cfe9ff", lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                {state.lastLog}
              </p>
            ) : state?.currentTask ? (
              <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#cfe9ff", fontStyle: "italic" }}>
                &quot;{state.currentTask}&quot;
              </p>
            ) : (
              <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#7e94c8" }}>
                대기 중입니다. 임무를 지시해 주세요.
              </p>
            )}
          </div>

          {relativeTime && (
            <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#7e94c8", marginTop: 6 }}>
              마지막 활동: {relativeTime}
            </p>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ padding: "6px 14px", borderTop: `1px solid ${crew.accent}22`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: crew.accent, fontWeight: 500 }}>
          상세 화면 열기 →
        </span>
        <Bar v={status === "running" ? 75 : status === "completed" ? 100 : status === "waiting_approval" ? 50 : 20} c={crew.accent} segments={10} />
      </div>
    </motion.div>
  );
}

export default function AssistantsDashboardClient() {
  const router = useRouter();
  const [agents, setAgents] = useState<Record<string, AgentState & { lastLog: string | null }>>({});
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [totalPending, setTotalPending] = useState(0);
  const [sseConnected, setSseConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const [statusRes, logsRes, approvalsRes] = await Promise.all([
        fetch("/api/agents/status"),
        fetch("/api/agents/logs?limit=80"),
        fetch("/api/approvals"),
      ]);
      if (statusRes.ok) { const d = await statusRes.json(); setAgents(d.agents); setTotalPending(d.totalPendingApprovals); }
      if (logsRes.ok) { const d = await logsRes.json(); setLogs(d.logs || []); }
      if (approvalsRes.ok) { const d = await approvalsRes.json(); setApprovals(d.approvals || []); }
      setLastRefresh(new Date());
    } catch {}
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  useEffect(() => {
    const connect = () => {
      const es = new EventSource("/api/sse");
      esRef.current = es;
      es.addEventListener("heartbeat", () => setSseConnected(true));
      es.addEventListener("agent_log", (e) => {
        const log = JSON.parse(e.data);
        setLogs(prev => [{ id: `${Date.now()}-${Math.random()}`, ...log }, ...prev].slice(0, 100));
        setAgents(prev => ({ ...prev, [log.agentType]: { ...prev[log.agentType], lastLog: log.message, lastReportedAt: log.createdAt } }));
      });
      es.addEventListener("agent_status_change", (e) => {
        const d = JSON.parse(e.data);
        setAgents(prev => ({ ...prev, [d.agentType]: { ...prev[d.agentType], status: d.newStatus, currentTask: d.currentTask ?? prev[d.agentType]?.currentTask } }));
      });
      es.addEventListener("approval_requested", (e) => {
        const d = JSON.parse(e.data);
        setApprovals(prev => prev.some(a => a.id === d.approvalId) ? prev : [...prev, {
          id: d.approvalId, agent_type: d.agentType, title: d.title, description: d.description,
          urgency_level: d.urgencyLevel, expires_at: d.expiresAt, preview_data: d.previewData || {}, action_type: "other",
        }]);
        setTotalPending(n => n + 1);
        setAgents(prev => ({ ...prev, [d.agentType]: { ...prev[d.agentType], status: "waiting_approval", pendingApprovals: (prev[d.agentType]?.pendingApprovals || 0) + 1 } }));
      });
      es.addEventListener("approval_resolved", (e) => {
        const d = JSON.parse(e.data);
        setApprovals(prev => prev.filter(a => a.id !== d.approvalId));
        setTotalPending(n => Math.max(0, n - 1));
      });
      es.onerror = () => { setSseConnected(false); es.close(); setTimeout(connect, 5000); };
    };
    connect();
    return () => { esRef.current?.close(); };
  }, []);

  async function handleApprove(id: string) {
    await fetch(`/api/approvals/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "approve" }) });
    setApprovals(prev => prev.filter(a => a.id !== id));
  }
  async function handleReject(id: string, reason?: string) {
    await fetch(`/api/approvals/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reject", reason }) });
    setApprovals(prev => prev.filter(a => a.id !== id));
  }

  return (
    <div style={{ background: "#060920", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top nav */}
      <nav style={{ padding: "10px 20px", borderBottom: "1px solid #1f2a6b", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#060920", flexShrink: 0 }}>
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 14, color: "#ff4ec9", textShadow: "2px 2px 0 #8a2877" }}>CREWMATE AI</span>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          {/* SSE 상태 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, background: sseConnected ? "#66ff9d" : "#7e94c8", animation: sseConnected ? "led-pulse 1.5s infinite" : "none" }} />
            <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: sseConnected ? "#66ff9d" : "#7e94c8" }}>
              {sseConnected ? "실시간 연결됨" : "연결 중..."}
            </span>
          </div>
          {totalPending > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #ffd84d", background: "#ffd84d22", padding: "4px 10px" }}>
              <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#ffd84d", animation: "blink 1s steps(2) infinite" }}>
                ▸ 승인 대기 {totalPending}건
              </span>
            </div>
          )}
          <button
            onClick={loadStatus}
            style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#5ce5ff", background: "none", border: "1px solid #1f2a6b", padding: "5px 12px", cursor: "pointer", fontWeight: 500 }}
          >
            ↻ 새로고침
          </button>
          <button
            onClick={() => router.push("/app/automation")}
            style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#5ce5ff", background: "none", border: "1px solid #5ce5ff55", padding: "5px 12px", cursor: "pointer", fontWeight: 500 }}
          >
            ⚡ 자동화 허브
          </button>
          <button
            onClick={() => router.push("/app/billing")}
            style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#cfe9ff", background: "none", border: "1px solid #1f2a6b", padding: "5px 12px", cursor: "pointer", fontWeight: 500 }}
          >
            결제 / 플랜
          </button>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
              router.refresh();
            }}
            style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#7e94c8", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
          >
            로그아웃 →
          </button>
        </div>
      </nav>

      {/* Main cockpit frame */}
      <div style={{ flex: 1, padding: "12px 16px 0", display: "flex", flexDirection: "column" }}>
        <div className="pixel-frame flex-1 flex flex-col" style={{ border: "2px solid #5ce5ff", background: "#0a0e27" }}>

          {/* Boot strip */}
          <div style={{ padding: "5px 16px", borderBottom: "1px solid #5ce5ff33", background: "#060920", display: "flex", alignItems: "center", gap: 12 }}>
            {["#ff4ec9","#ffd84d","#66ff9d"].map((c, i) => <div key={i} style={{ width: 8, height: 8, background: c }} />)}
            <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#5ce5ff", flex: 1, fontWeight: 500 }}>
              ▸ 함교 가동 중 · 크루 4명 대기 · 실시간 연결 {sseConnected ? "정상" : "재연결 중"}
            </span>
            <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#7e94c8" }}>
              마지막 동기화: {lastRefresh ? lastRefresh.toLocaleTimeString("ko-KR") : "—"}
            </span>
          </div>

          {/* 3-column grid */}
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 240px", flex: 1, minHeight: 0 }} className="hidden lg:grid">

            {/* Left console — 승인 큐 */}
            <div style={{ borderRight: "1px solid #5ce5ff22", padding: 12, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
              <CockpitPanel title="승인 대기 목록" status={totalPending > 0 ? `${totalPending}건` : "비어있음"} statusColor={totalPending > 0 ? "#ffd84d" : "#66ff9d"} accent="#ffd84d" className="flex-1">
                <AnimatePresence>
                  {approvals.length > 0 ? (
                    <div className="space-y-2">
                      <ApprovalModal approvals={approvals} onApprove={handleApprove} onReject={handleReject} />
                    </div>
                  ) : (
                    <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#7e94c8", textAlign: "center", paddingTop: 20 }}>
                      승인이 필요한 작업이 없습니다.
                    </p>
                  )}
                </AnimatePresence>
              </CockpitPanel>
            </div>

            {/* Main viewport */}
            <div style={{ borderRight: "1px solid #5ce5ff22", overflowY: "auto", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.15 }}>
                <Starfield density={0.4} />
              </div>
              <div style={{ position: "relative", zIndex: 1, padding: 20 }}>
                {/* Section header */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#5ce5ff", letterSpacing: "0.04em", marginBottom: 6 }}>
                    함교 · 크루 운영 현황
                  </p>
                  <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: "clamp(16px, 1.5vw, 20px)", color: "#cfe9ff", textShadow: "3px 3px 0 #8a2877", marginBottom: 16 }}>
                    크루 현황판
                  </h1>
                </div>

                {/* 빠른 진입 카드 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
                  {[
                    { href: "/app/brand", label: "브랜드 프로필", desc: "비서가 자동 참조" },
                    { href: "/app/products", label: "상품 카탈로그", desc: "한 번 등록 → 모든 비서 활용" },
                    { href: "/app/library", label: "보관함", desc: "결과물·즐겨찾기 모음" },
                  ].map((c) => (
                    <button
                      key={c.href}
                      onClick={() => router.push(c.href)}
                      className="pixel-frame"
                      style={{
                        textAlign: "left",
                        background: "#0a0e27",
                        border: "1px solid #5ce5ff44",
                        padding: "10px 12px",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#5ce5ff11"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#0a0e27"; }}
                    >
                      <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 700, color: "#5ce5ff", marginBottom: 2 }}>
                        {c.label} →
                      </p>
                      <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 12, color: "#7e94c8" }}>
                        {c.desc}
                      </p>
                    </button>
                  ))}
                </div>

                {/* 4 Crew cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  {AGENT_TYPES.map(agentType => (
                    <CrewCard
                      key={agentType}
                      agentType={agentType}
                      state={agents[agentType]}
                      onClick={() => router.push(`/desk/${CREW_MAP[agentType].crewId}`)}
                    />
                  ))}
                </div>

                {/* Quick run panel */}
                <QuickRunPanel onRefresh={loadStatus} />
              </div>
            </div>

            {/* Right console — Activity feed */}
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
              <CockpitPanel title="실시간 활동 로그" status="실시간" statusColor="#5ce5ff" accent="#5ce5ff" className="flex-1">
                <ActivityFeed logs={logs} />
              </CockpitPanel>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="lg:hidden overflow-y-auto p-4 space-y-4">
            <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 18, color: "#cfe9ff", textShadow: "2px 2px 0 #8a2877" }}>크루 현황판</h1>
            {approvals.length > 0 && (
              <div style={{ border: "1px solid #ffd84d", background: "#ffd84d11", padding: 12 }}>
                <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#ffd84d", marginBottom: 8 }}>▸ 승인 대기</p>
                <ApprovalModal approvals={approvals} onApprove={handleApprove} onReject={handleReject} />
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {AGENT_TYPES.map(agentType => (
                <CrewCard key={agentType} agentType={agentType} state={agents[agentType]} onClick={() => router.push(`/desk/${CREW_MAP[agentType].crewId}`)} />
              ))}
            </div>
            <div style={{ background: "#0f1640", border: "1px solid #1f2a6b", padding: 12 }}>
              <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#5ce5ff", marginBottom: 8 }}>▸ 실시간 활동 로그</p>
              <ActivityFeed logs={logs} />
            </div>
          </div>

          <HudStrip />
        </div>
      </div>
    </div>
  );
}

// 에이전트 빠른 실행 패널
function QuickRunPanel({ onRefresh }: { onRefresh: () => void }) {
  const [selectedAgent, setSelectedAgent] = useState<AgentType>("marketing");
  const [task, setTask] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleRun() {
    if (!task.trim()) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: selectedAgent, task }),
      });
      const data = await res.json();
      setResult(res.ok ? "▸ 임무 시작됨 — 교신 로그를 확인하세요" : `✗ ${data.error || "오류 발생"}`);
      if (res.ok) { setTask(""); onRefresh(); }
    } catch {
      setResult("✗ 통신 장애");
    } finally {
      setRunning(false);
    }
  }

  const crew = CREW_MAP[selectedAgent];

  return (
    <div className="pixel-frame" style={{ border: `1px solid ${crew.accent}44`, background: "#0f1640", padding: 14 }}>
      <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: crew.accent, marginBottom: 10 }}>
        ▸ 빠른 임무 지시
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        {AGENT_TYPES.map(at => {
          const c = CREW_MAP[at];
          return (
            <button
              key={at}
              onClick={() => setSelectedAgent(at)}
              style={{
                fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 500, padding: "5px 12px", cursor: "pointer",
                border: `1px solid ${selectedAgent === at ? c.accent : "#1f2a6b"}`,
                background: selectedAgent === at ? `${c.accentDark}33` : "transparent",
                color: selectedAgent === at ? c.accent : "#cfe9ff",
              }}
            >
              {c.name}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={task}
          onChange={e => setTask(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleRun(); }}
          placeholder={`${crew.name}에게 무엇을 시킬까요?`}
          style={{
            flex: 1, background: "#060920", border: `1px solid ${crew.accent}44`, padding: "9px 12px",
            fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 15, color: "#cfe9ff", outline: "none",
          }}
          onFocus={e => { e.target.style.border = `1px solid ${crew.accent}`; }}
          onBlur={e => { e.target.style.border = `1px solid ${crew.accent}44`; }}
        />
        <button
          onClick={handleRun}
          disabled={running || !task.trim()}
          className="pixel-frame"
          style={{
            fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 700, padding: "8px 18px", cursor: "pointer",
            background: crew.accent, color: "#060920", border: `2px solid ${crew.accent}`,
            boxShadow: `3px 3px 0 ${crew.accentDark}`, opacity: running || !task.trim() ? 0.5 : 1,
          }}
        >
          {running ? "전송 중..." : "▶ 실행"}
        </button>
      </div>
      {result && (
        <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: result.startsWith("✗") ? "#ff4ec9" : "#66ff9d", marginTop: 8 }}>
          {result}
        </p>
      )}
    </div>
  );
}
