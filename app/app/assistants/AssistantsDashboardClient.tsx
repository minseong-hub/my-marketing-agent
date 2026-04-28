"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { AgentCard } from "@/components/agents/AgentCard";
import { ActivityFeed } from "@/components/agents/ActivityFeed";
import { ApprovalModal } from "@/components/agents/ApprovalModal";
import type { AgentType, AgentState } from "@/lib/agents/types";

const AGENT_TYPES: AgentType[] = ["marketing", "detail_page", "ads", "finance"];

interface LogItem {
  id: string;
  agent_type: string;
  level: string;
  message: string;
  created_at: string;
}

interface ApprovalItem {
  id: string;
  agent_type: string;
  title: string;
  description: string;
  urgency_level: string;
  expires_at: string;
  preview_data: Record<string, unknown>;
  action_type: string;
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

  // 초기 상태 로드
  const loadStatus = useCallback(async () => {
    try {
      const [statusRes, logsRes, approvalsRes] = await Promise.all([
        fetch("/api/agents/status"),
        fetch("/api/agents/logs?limit=80"),
        fetch("/api/approvals"),
      ]);

      if (statusRes.ok) {
        const data = await statusRes.json();
        setAgents(data.agents);
        setTotalPending(data.totalPendingApprovals);
      }
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs || []);
      }
      if (approvalsRes.ok) {
        const data = await approvalsRes.json();
        setApprovals(data.approvals || []);
      }
      setLastRefresh(new Date());
    } catch {}
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // SSE 연결
  useEffect(() => {
    const connect = () => {
      const es = new EventSource("/api/sse");
      esRef.current = es;

      es.addEventListener("heartbeat", () => setSseConnected(true));

      es.addEventListener("agent_log", (e) => {
        const log = JSON.parse(e.data);
        setLogs((prev) => [{ id: `${Date.now()}-${Math.random()}`, ...log }, ...prev].slice(0, 100));
        // 에이전트 lastLog 업데이트
        setAgents((prev) => ({
          ...prev,
          [log.agentType]: {
            ...prev[log.agentType],
            lastLog: log.message,
            lastReportedAt: log.createdAt,
          },
        }));
      });

      es.addEventListener("agent_status_change", (e) => {
        const data = JSON.parse(e.data);
        setAgents((prev) => ({
          ...prev,
          [data.agentType]: {
            ...prev[data.agentType],
            status: data.newStatus,
            currentTask: data.currentTask ?? prev[data.agentType]?.currentTask,
          },
        }));
      });

      es.addEventListener("approval_requested", (e) => {
        const data = JSON.parse(e.data);
        setApprovals((prev) => {
          if (prev.some((a) => a.id === data.approvalId)) return prev;
          return [...prev, {
            id: data.approvalId,
            agent_type: data.agentType,
            title: data.title,
            description: data.description,
            urgency_level: data.urgencyLevel,
            expires_at: data.expiresAt,
            preview_data: data.previewData || {},
            action_type: "other",
          }];
        });
        setTotalPending((n) => n + 1);
        // 에이전트 상태 업데이트
        setAgents((prev) => ({
          ...prev,
          [data.agentType]: { ...prev[data.agentType], status: "waiting_approval", pendingApprovals: (prev[data.agentType]?.pendingApprovals || 0) + 1 },
        }));
      });

      es.addEventListener("approval_resolved", (e) => {
        const data = JSON.parse(e.data);
        setApprovals((prev) => prev.filter((a) => a.id !== data.approvalId));
        setTotalPending((n) => Math.max(0, n - 1));
      });

      es.onerror = () => {
        setSseConnected(false);
        es.close();
        setTimeout(connect, 5000);
      };
    };

    connect();
    return () => { esRef.current?.close(); };
  }, []);

  // 승인 처리
  async function handleApprove(id: string) {
    await fetch(`/api/approvals/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "approve" }) });
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleReject(id: string, reason?: string) {
    await fetch(`/api/approvals/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reject", reason }) });
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-0.5">AI 마케팅 비서</p>
          <h1 className="text-xl font-bold text-slate-800">어시스턴트 현황판</h1>
        </motion.div>

        <div className="flex items-center gap-3">
          {/* SSE 연결 상태 */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${sseConnected ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
            {sseConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {sseConnected ? "실시간 연결됨" : "연결 중..."}
          </div>

          {/* 승인 대기 배지 */}
          {totalPending > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700 animate-pulse">
              <Bell className="w-3 h-3" />
              승인 대기 {totalPending}건
            </div>
          )}

          <button
            onClick={loadStatus}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 승인 대기 섹션 */}
      {approvals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-amber-800 mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 animate-pulse" />
              결재 대기 중 — 응답이 있어야 작업이 재개됩니다
            </h2>
            <ApprovalModal approvals={approvals} onApprove={handleApprove} onReject={handleReject} />
          </div>
        </motion.div>
      )}

      {/* 4개 에이전트 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {AGENT_TYPES.map((agentType, i) => {
          const state = agents[agentType];
          return (
            <AgentCard
              key={agentType}
              agentType={agentType}
              status={state?.status ?? "idle"}
              currentTask={state?.currentTask ?? null}
              lastLog={state?.lastLog ?? null}
              pendingApprovals={state?.pendingApprovals ?? 0}
              lastReportedAt={state?.lastReportedAt ?? null}
              onClick={() => router.push(`/app/assistants/${agentType}`)}
              index={i}
            />
          );
        })}
      </div>

      {/* 실시간 활동 피드 */}
      <div className="bg-white/80 backdrop-blur-sm border border-white/80 rounded-2xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800">실시간 활동 피드</h2>
          {lastRefresh && (
            <span className="text-xs text-slate-400">
              마지막 동기화: {lastRefresh.toLocaleTimeString("ko-KR")}
            </span>
          )}
        </div>
        <ActivityFeed logs={logs} />
      </div>
    </div>
  );
}
