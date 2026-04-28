"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AGENT_NAMES, AGENT_COLORS, AGENT_ICONS } from "@/lib/claude/prompts";

interface LogItem {
  id: string;
  agent_type: string;
  level: string;
  message: string;
  created_at: string;
}

interface ActivityFeedProps {
  logs: LogItem[];
}

const LEVEL_CONFIG: Record<string, { dot: string; bg: string }> = {
  info: { dot: "bg-blue-400", bg: "" },
  action: { dot: "bg-violet-400", bg: "" },
  warning: { dot: "bg-amber-400", bg: "bg-amber-50" },
  error: { dot: "bg-red-400", bg: "bg-red-50" },
  success: { dot: "bg-emerald-400", bg: "bg-emerald-50" },
};

export function ActivityFeed({ logs }: ActivityFeedProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-3">🤖</div>
        <p className="text-sm font-medium text-slate-400">아직 활동 내역이 없습니다.</p>
        <p className="text-xs text-slate-300 mt-1">에이전트를 시작하면 여기에 실시간으로 보고됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
      <AnimatePresence initial={false}>
        {logs.map((log, i) => {
          const colors = AGENT_COLORS[log.agent_type] || AGENT_COLORS.marketing;
          const levelConfig = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info;
          const time = new Date(log.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

          return (
            <motion.div
              key={log.id}
              initial={i === 0 ? { opacity: 0, x: -10 } : { opacity: 1 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-start gap-2.5 px-3 py-2 rounded-xl transition-colors",
                levelConfig.bg || "hover:bg-slate-50"
              )}
            >
              <div className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1.5", levelConfig.dot)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn("text-[10px] font-bold", colors.text)}>
                    {AGENT_ICONS[log.agent_type]} {AGENT_NAMES[log.agent_type] || log.agent_type}
                  </span>
                  <span className="text-[10px] text-slate-300 ml-auto flex-shrink-0">{time}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{log.message}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
