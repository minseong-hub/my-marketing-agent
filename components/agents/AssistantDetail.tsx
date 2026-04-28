"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Send, Loader2, Play, Square, Bell, RefreshCw, Wifi, WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityFeed } from "./ActivityFeed";
import { ApprovalModal } from "./ApprovalModal";
import { cn } from "@/lib/utils";
import { AGENT_NAMES, AGENT_DESCRIPTIONS, AGENT_COLORS, AGENT_ICONS } from "@/lib/claude/prompts";
import type { AgentType } from "@/lib/agents/types";

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

interface AssistantDetailProps {
  agentType: AgentType;
  quickTasks?: { label: string; task: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  idle: "대기 중",
  running: "작업 중",
  waiting_approval: "승인 대기",
  completed: "완료",
  error: "오류",
  paused: "일시정지",
};

export function AssistantDetail({ agentType, quickTasks = [] }: AssistantDetailProps) {
  const router = useRouter();
  const colors = AGENT_COLORS[agentType];

  const [status, setStatus] = useState("idle");
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

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

  // SSE
  useEffect(() => {
    const connect = () => {
      const es = new EventSource("/api/sse");
      esRef.current = es;
      es.addEventListener("heartbeat", () => setSseConnected(true));

      es.addEventListener("agent_log", (e) => {
        const log = JSON.parse(e.data);
        if (log.agentType !== agentType) return;
        setLogs((prev) => [{ id: `${Date.now()}-${Math.random()}`, ...log }, ...prev].slice(0, 100));
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
    } catch {
      setIsRunning(false);
    }
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
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/app/assistants")}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl", colors.bg)}>
          {AGENT_ICONS[agentType]}
        </div>

        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">{AGENT_NAMES[agentType]}</h1>
          <p className="text-xs text-slate-400">{AGENT_DESCRIPTIONS[agentType]}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${sseConnected ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
            {sseConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {STATUS_LABELS[status] || status}
          </div>
          <button onClick={load} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 왼쪽: 명령 패널 */}
        <div className="space-y-4">
          {/* 작업 입력 */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/80 rounded-2xl shadow-lg p-4">
            <h2 className="text-sm font-bold text-slate-700 mb-3">작업 지시</h2>

            {/* 현재 실행 중 */}
            {isActive && currentTask && (
              <div className={cn("rounded-xl p-3 mb-3", colors.bg)}>
                <div className="flex items-center gap-2 mb-1">
                  <Loader2 className={cn("w-3.5 h-3.5 animate-spin", colors.text)} />
                  <span className={cn("text-xs font-semibold", colors.text)}>실행 중</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{currentTask}</p>
              </div>
            )}

            <div className="space-y-2">
              <textarea
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleRun(); }
                }}
                placeholder={`${AGENT_NAMES[agentType]}에게 지시할 내용을 입력하세요...\n(Ctrl+Enter로 실행)`}
                disabled={isActive || isRunning}
                rows={4}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-slate-50 disabled:text-slate-400"
              />
              <Button
                onClick={() => handleRun()}
                disabled={!taskInput.trim() || isActive || isRunning}
                className={cn("w-full gap-2", colors.dot.replace("bg-", "bg-"), "text-white hover:opacity-90")}
              >
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isRunning ? "시작 중..." : "시작"}
              </Button>
            </div>
          </div>

          {/* 빠른 작업 */}
          {quickTasks.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm border border-white/80 rounded-2xl shadow-lg p-4">
              <h2 className="text-sm font-bold text-slate-700 mb-3">빠른 작업</h2>
              <div className="space-y-2">
                {quickTasks.map((qt) => (
                  <button
                    key={qt.label}
                    onClick={() => handleRun(qt.task)}
                    disabled={isActive || isRunning}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all",
                      "border border-slate-100 hover:border-slate-200 hover:bg-slate-50",
                      "disabled:opacity-40 disabled:cursor-not-allowed",
                      colors.bg
                    )}
                  >
                    <span className={colors.text}>{qt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 승인 대기 */}
          {approvals.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm border border-white/80 rounded-2xl shadow-lg p-4">
              <h2 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 animate-pulse" />
                결재 대기 ({approvals.length}건)
              </h2>
              <ApprovalModal approvals={approvals} onApprove={handleApprove} onReject={handleReject} />
            </div>
          )}
        </div>

        {/* 오른쪽: 실시간 활동 피드 */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm border border-white/80 rounded-2xl shadow-lg p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800">실시간 보고</h2>
              <span className="text-xs text-slate-400">{logs.length}건</span>
            </div>
            <ActivityFeed logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}
