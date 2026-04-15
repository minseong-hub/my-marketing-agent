"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Sparkles,
  Check,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { parseTask, type ParsedTask, type Urgency } from "@/lib/store-ops/ai-task-parser";
import { saveAITask } from "@/lib/store-ops/ai-tasks";
import { GlassCard } from "@/components/store-ops/shared";

// ─── Styling maps ─────────────────────────────────────────────────────────────
const CATEGORY_CHIP: Record<string, string> = {
  "상품 관리":        "bg-violet-50 text-violet-700 border-violet-200",
  "재고 관리":        "bg-sky-50 text-sky-700 border-sky-200",
  "상품 업로드 관리": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "프로모션 관리":    "bg-emerald-50 text-emerald-700 border-emerald-200",
  "체크리스트":       "bg-blue-50 text-blue-700 border-blue-200",
  "이슈 / 알림":      "bg-rose-50 text-rose-700 border-rose-200",
  "운영 기록":        "bg-slate-100 text-slate-600 border-slate-200",
  "일정 관리":        "bg-amber-50 text-amber-700 border-amber-200",
};

const URGENCY_CHIP: Record<string, string> = {
  "긴급": "bg-rose-50 text-rose-700 border-rose-200",
  "높음": "bg-amber-50 text-amber-700 border-amber-200",
  "보통": "bg-slate-100 text-slate-600 border-slate-200",
  "낮음": "bg-blue-50 text-blue-500 border-blue-100",
};

const EXAMPLES = [
  "다음주 신비복숭아 오픈 준비해줘",
  "참외 재고 부족 체크하고 재입고 일정 잡아줘",
  "스마트스토어에 아직 안 올린 상품 정리해줘",
  "망고 할인행사 준비 일정 넣어줘",
  "다음 시즌 참고할 메모 남겨줘",
];

type Phase = "input" | "preview" | "saving" | "saved";

// ─── Component ────────────────────────────────────────────────────────────────
export function AITaskIntake({ onTaskSaved }: { onTaskSaved?: () => void }) {
  const [phase, setPhase] = useState<Phase>("input");
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedTask | null>(null);

  // Editable preview fields
  const [editTitle, setEditTitle] = useState("");
  const [editUrgency, setEditUrgency] = useState<Urgency>("보통");
  const [editDueDate, setEditDueDate] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const handleAnalyze = useCallback(() => {
    if (!input.trim()) return;
    const result = parseTask(input);
    setParsed(result);
    setEditTitle(result.title);
    setEditUrgency(result.urgency);
    setEditDueDate(result.dueDate ?? "");
    setEditNotes(result.notes ?? "");
    setPhase("preview");
  }, [input]);

  const handleSave = useCallback(async () => {
    if (!parsed) return;
    setPhase("saving");
    // Simulate async processing (replace with real API call when LLM is connected)
    await new Promise((r) => setTimeout(r, 700));
    const final: ParsedTask = {
      ...parsed,
      title: editTitle.trim() || parsed.title,
      urgency: editUrgency,
      dueDate: editDueDate || undefined,
      notes: editNotes || undefined,
    };
    saveAITask(final, input);
    setPhase("saved");
    onTaskSaved?.();
    setTimeout(() => {
      setPhase("input");
      setInput("");
      setParsed(null);
    }, 2800);
  }, [parsed, editTitle, editUrgency, editDueDate, editNotes, input, onTaskSaved]);

  const handleCancel = useCallback(() => {
    setPhase("input");
    setParsed(null);
  }, []);

  return (
    <GlassCard className="overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0047CC] to-[#0038A8] flex items-center justify-center shadow-sm shadow-[#0047CC]/30 flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-extrabold text-slate-900 tracking-tight">AI비서</p>
          <p className="text-[10px] text-slate-400 font-medium">자연어로 입력하면 AI가 업무를 분류하고 배분합니다</p>
        </div>
        <span className="text-[9px] font-bold text-[#0047CC] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex-shrink-0">
          BETA
        </span>
      </div>

      {/* ── Phase content ── */}
      <AnimatePresence mode="wait">

        {/* ── 1. Input ── */}
        {phase === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="p-5"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyze();
              }}
              placeholder="운영 업무를 자연어로 입력하세요. 예) 다음주 신비복숭아 오픈 준비해줘"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0047CC] focus:ring-2 focus:ring-blue-100/60 text-[13px] text-slate-800 placeholder:text-slate-400 resize-none outline-none transition-all font-medium leading-relaxed"
            />

            {/* Example chips */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2.5 mb-3">
              <span className="text-[10px] font-bold text-slate-400 mr-0.5 flex-shrink-0">예시</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setInput(ex)}
                  className="text-[10px] font-semibold text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-[#0047CC] border border-slate-200 hover:border-blue-200 px-2 py-0.5 rounded-full transition-colors"
                >
                  {ex.length > 15 ? ex.slice(0, 13) + "…" : ex}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">⌘ + Enter로 빠른 분석</span>
              <button
                onClick={handleAnalyze}
                disabled={!input.trim()}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  input.trim()
                    ? "bg-[#0047CC] hover:bg-[#0038A8] text-white shadow-sm shadow-[#0047CC]/20 active:scale-[0.98]"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                업무 분석하기
              </button>
            </div>
          </motion.div>
        )}

        {/* ── 2. Preview ── */}
        {phase === "preview" && parsed && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="p-5"
          >
            {/* AI banner */}
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-blue-50/70 border border-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-[#0047CC] flex-shrink-0" />
              <p className="text-[11px] font-semibold text-[#0047CC]">
                AI 분석 완료 — 내용을 확인하고 저장하세요
              </p>
            </div>

            {/* Original input */}
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">입력 내용</p>
              <p className="text-[12px] text-slate-600 leading-relaxed">{input}</p>
            </div>

            {/* Fields grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">

              {/* Title — full width */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                  업무 제목
                </label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0047CC] focus:ring-2 focus:ring-blue-100/60 text-[13px] font-bold text-slate-800 outline-none transition-all"
                />
              </div>

              {/* Category + assigned module */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  카테고리 / 배분
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-lg border", CATEGORY_CHIP[parsed.category])}>
                    {parsed.category}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <Link
                    href={parsed.assignedModuleHref}
                    target="_blank"
                    className="text-[11px] font-bold text-[#0047CC] underline-offset-2 hover:underline"
                  >
                    {parsed.assignedModule} →
                  </Link>
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                  우선순위
                </label>
                <select
                  value={editUrgency}
                  onChange={(e) => setEditUrgency(e.target.value as Urgency)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:border-[#0047CC] text-[12px] font-bold text-slate-700 outline-none bg-white cursor-pointer"
                >
                  {(["긴급", "높음", "보통", "낮음"] as Urgency[]).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Due date */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                  마감일
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:border-[#0047CC] text-[12px] font-medium text-slate-700 outline-none bg-white"
                />
              </div>

              {/* Product / season info */}
              {(parsed.relatedProduct || parsed.relatedSeason) && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    연관 정보
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {parsed.relatedProduct && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                        🥭 {parsed.relatedProduct}
                      </span>
                    )}
                    {parsed.relatedSeason && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                        🗓 {parsed.relatedSeason}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                메모
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0047CC] focus:ring-2 focus:ring-blue-100/60 text-[12px] text-slate-600 resize-none outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-500 transition-colors"
              >
                <X className="w-3 h-3" /> 취소
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0047CC] hover:bg-[#0038A8] text-white text-xs font-bold shadow-sm shadow-[#0047CC]/20 transition-all active:scale-[0.98]"
              >
                <Check className="w-3.5 h-3.5" />
                저장 및 배분
                <ArrowRight className="w-3 h-3 opacity-60" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── 3. Saving ── */}
        {phase === "saving" && (
          <motion.div
            key="saving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-10 flex items-center justify-center gap-3"
          >
            <Loader2 className="w-5 h-5 text-[#0047CC] animate-spin" />
            <p className="text-[13px] font-semibold text-slate-600">업무를 저장하고 배분하는 중…</p>
          </motion.div>
        )}

        {/* ── 4. Saved ── */}
        {phase === "saved" && parsed && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="p-7 flex flex-col items-center text-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/30">
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900 mb-1">업무가 저장됐습니다</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <span className={cn("font-bold px-1.5 py-0.5 rounded-md border mr-1.5", CATEGORY_CHIP[parsed.category])}>
                  {parsed.category}
                </span>
                →{" "}
                <Link href={parsed.assignedModuleHref} className="text-[#0047CC] font-bold hover:underline underline-offset-2">
                  {parsed.assignedModule}
                </Link>
                에 배분됐습니다
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </GlassCard>
  );
}

// ─── Mini urgency badge (used in board/dashboard) ─────────────────────────────
export function UrgencyBadge({ urgency }: { urgency: string }) {
  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border", URGENCY_CHIP[urgency] ?? URGENCY_CHIP["보통"])}>
      {urgency}
    </span>
  );
}

// ─── Mini category badge (used in board/dashboard) ────────────────────────────
export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border", CATEGORY_CHIP[category] ?? "bg-slate-100 text-slate-600 border-slate-200")}>
      {category}
    </span>
  );
}
