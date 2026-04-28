"use client";

import { motion } from "framer-motion";
import { ChevronRight, Play, Loader2, Clock, CheckCircle2, AlertCircle, PauseCircle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { AGENT_NAMES, AGENT_DESCRIPTIONS, AGENT_COLORS, AGENT_ICONS } from "@/lib/claude/prompts";
import type { AgentType } from "@/lib/agents/types";

interface AgentCardProps {
  agentType: AgentType;
  status: string;
  currentTask: string | null;
  lastLog: string | null;
  pendingApprovals: number;
  lastReportedAt: string | null;
  onClick: () => void;
  index: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; pulse: boolean }> = {
  idle: { label: "대기 중", color: "text-slate-400", icon: Clock, pulse: false },
  running: { label: "실행 중", color: "text-blue-500", icon: Loader2, pulse: true },
  waiting_approval: { label: "승인 대기", color: "text-amber-500", icon: PauseCircle, pulse: true },
  completed: { label: "완료", color: "text-emerald-500", icon: CheckCircle2, pulse: false },
  error: { label: "오류", color: "text-red-500", icon: AlertCircle, pulse: false },
  paused: { label: "일시정지", color: "text-slate-400", icon: PauseCircle, pulse: false },
};

export function AgentCard({ agentType, status, currentTask, lastLog, pendingApprovals, lastReportedAt, onClick, index }: AgentCardProps) {
  const colors = AGENT_COLORS[agentType];
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const StatusIcon = statusConfig.icon;

  const relativeTime = lastReportedAt
    ? (() => {
        const diff = Date.now() - new Date(lastReportedAt).getTime();
        if (diff < 60000) return "방금 전";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
        return `${Math.floor(diff / 3600000)}시간 전`;
      })()
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      className={cn(
        "group relative bg-white rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden",
        "hover:shadow-lg hover:-translate-y-0.5",
        status === "waiting_approval" ? "border-amber-300 shadow-amber-100 shadow-md" : colors.border,
        "hover:border-opacity-100"
      )}
    >
      {/* 상단 컬러 바 */}
      <div className={cn("h-1.5 w-full", colors.dot.replace("bg-", "bg-"))} />

      <div className="p-5">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl", colors.bg)}>
              {AGENT_ICONS[agentType]}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">{AGENT_NAMES[agentType]}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{AGENT_DESCRIPTIONS[agentType]}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 mt-1" />
        </div>

        {/* 상태 */}
        <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl mb-3", colors.bg)}>
          <StatusIcon className={cn("w-3.5 h-3.5 flex-shrink-0", statusConfig.color, statusConfig.pulse && status === "running" && "animate-spin")} />
          <span className={cn("text-xs font-semibold", statusConfig.color)}>{statusConfig.label}</span>
          {relativeTime && (
            <span className="text-xs text-slate-400 ml-auto">{relativeTime}</span>
          )}
        </div>

        {/* 최근 보고 */}
        <div className="min-h-[48px]">
          {lastLog ? (
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{lastLog}</p>
          ) : currentTask ? (
            <p className="text-xs text-slate-400 italic">&quot;{currentTask}&quot;</p>
          ) : (
            <p className="text-xs text-slate-300">아직 작업 내역이 없습니다.</p>
          )}
        </div>

        {/* 승인 배지 */}
        {pendingApprovals > 0 && (
          <div className="mt-3 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <Bell className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-amber-700">승인 대기 {pendingApprovals}건</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
