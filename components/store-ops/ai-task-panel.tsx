"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadAITasks, updateAITask, type AITask } from "@/lib/store-ops/ai-tasks";
import { GlassCard } from "@/components/store-ops/shared";

const URGENCY_STYLE: Record<string, string> = {
  "긴급": "bg-rose-50 text-rose-700 border-rose-200",
  "높음": "bg-amber-50 text-amber-700 border-amber-200",
  "보통": "bg-slate-100 text-slate-600 border-slate-200",
  "낮음": "bg-blue-50 text-blue-500 border-blue-100",
};

interface AITaskPanelProps {
  /** Category string matching AITask.category — filters tasks shown in this panel */
  category: string;
}

/**
 * Drop into any store-ops page to show AI-scheduled tasks for that module.
 * Reads from localStorage (ai-tasks store). Renders nothing when empty.
 */
export function AITaskPanel({ category }: AITaskPanelProps) {
  const [tasks, setTasks] = useState<AITask[]>([]);

  const reload = useCallback(() => {
    setTasks(
      loadAITasks().filter(
        (t) => t.category === category && t.status !== "완료" && t.status !== "보류"
      )
    );
  }, [category]);

  useEffect(() => {
    reload();
  }, [reload]);

  if (tasks.length === 0) return null;

  function markDone(id: string) {
    updateAITask(id, { status: "완료" });
    reload();
  }

  return (
    <GlassCard className="mb-5 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
            예약 업무
          </span>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
            {tasks.length}건
          </span>
        </div>
        <Link
          href="/app/tools/store-ops/board"
          className="text-[10px] font-bold text-[#0047CC] hover:underline underline-offset-2"
        >
          보드 →
        </Link>
      </div>

      {/* Task rows */}
      <div className="divide-y divide-slate-100">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="group flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/60 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 leading-snug truncate">
                {t.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {t.dueDate && (
                  <span className="text-[10px] text-slate-400 font-medium">~{t.dueDate}</span>
                )}
                {t.relatedProduct && (
                  <span className="text-[10px] text-slate-400">🥭 {t.relatedProduct}</span>
                )}
                {t.relatedSeason && (
                  <span className="text-[10px] text-slate-400">🗓 {t.relatedSeason}</span>
                )}
                {t.notes && t.notes !== t.title && (
                  <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{t.notes}</span>
                )}
              </div>
            </div>

            {/* Urgency badge */}
            <span
              className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0",
                URGENCY_STYLE[t.urgency] ?? URGENCY_STYLE["보통"]
              )}
            >
              {t.urgency}
            </span>

            {/* Mark-done button — appears on row hover */}
            <button
              onClick={() => markDone(t.id)}
              title="완료 처리"
              className="w-6 h-6 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 flex items-center justify-center flex-shrink-0 transition-all opacity-0 group-hover:opacity-100"
            >
              <Check className="w-3 h-3 text-emerald-600" />
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
