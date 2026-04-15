"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, Plus, X, Check, Pencil, Trash2, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GlassCard, PageShell, PrimaryButton, RelatedTools } from "@/components/store-ops/shared";
import { updateAITask } from "@/lib/store-ops/ai-tasks";
import {
  type BoardTask, type TaskStatus, type Urgency,
  getOrInitBoardTasks, saveBoardTasks,
} from "@/lib/store-ops/board-tasks";

// ─── Constants ─────────────────────────────────────────────────────────────────

const COLUMNS: { id: TaskStatus; label: string; tone: string; dot: string }[] = [
  { id: "오늘 해야할 일", label: "오늘 해야할 일", tone: "text-rose-600",    dot: "bg-rose-500"    },
  { id: "해야 할 일",     label: "해야 할 일",     tone: "text-slate-700",   dot: "bg-slate-400"   },
  { id: "진행 중",        label: "진행 중",        tone: "text-blue-600",    dot: "bg-blue-500"    },
  { id: "진행예정",       label: "진행예정",       tone: "text-indigo-600",  dot: "bg-indigo-500"  },
  { id: "완료",           label: "완료",           tone: "text-emerald-600", dot: "bg-emerald-500" },
  { id: "지연",           label: "지연",           tone: "text-amber-600",   dot: "bg-amber-500"   },
];

const CATEGORIES = [
  "운영", "상품 관리", "재고 관리", "업로드 관리", "프로모션",
  "체크리스트", "이슈 대응", "상세페이지", "광고", "CRM",
];

const URGENCY_CONFIG: Record<Urgency, string> = {
  "낮음": "bg-slate-100 text-slate-500 border-slate-200",
  "보통": "bg-blue-50 text-blue-600 border-blue-200",
  "높음": "bg-amber-50 text-amber-700 border-amber-200",
  "긴급": "bg-rose-50 text-rose-700 border-rose-200",
};

const TAG_TONE: Record<string, string> = {
  "운영":             "bg-slate-100 text-slate-600 border-slate-200",
  "상품 관리":        "bg-violet-50 text-violet-700 border-violet-200",
  "재고 관리":        "bg-sky-50 text-sky-700 border-sky-200",
  "업로드 관리":      "bg-indigo-50 text-indigo-700 border-indigo-200",
  "프로모션":         "bg-emerald-50 text-emerald-700 border-emerald-200",
  "체크리스트":       "bg-teal-50 text-teal-700 border-teal-200",
  "이슈 대응":        "bg-rose-50 text-rose-700 border-rose-200",
  "상세페이지":       "bg-purple-50 text-purple-700 border-purple-200",
  "광고":             "bg-orange-50 text-orange-700 border-orange-200",
  "CRM":              "bg-sky-50 text-sky-700 border-sky-200",
  // AI task categories from parser
  "상품 업로드 관리": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "프로모션 관리":    "bg-emerald-50 text-emerald-700 border-emerald-200",
  "이슈 / 알림":      "bg-rose-50 text-rose-700 border-rose-200",
  "운영 기록":        "bg-slate-100 text-slate-600 border-slate-200",
  "일정 관리":        "bg-amber-50 text-amber-700 border-amber-200",
};

function nowISO() { return new Date().toISOString(); }
function genId()  { return `bt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

// ─── Shared styles ────────────────────────────────────────────────────────────

const LABEL_CLS = "text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block";
const INPUT_CLS = "w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0047CC] focus:ring-2 focus:ring-blue-100/60 text-[13px] text-slate-800 outline-none transition-all bg-white";

// ─── TaskForm ─────────────────────────────────────────────────────────────────

interface TaskFormProps {
  initial: Partial<BoardTask>;
  onSave: (data: Omit<BoardTask, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  submitLabel?: string;
}

function TaskForm({ initial, onSave, onCancel, submitLabel = "저장" }: TaskFormProps) {
  const [title,          setTitle]          = useState(initial.title          ?? "");
  const [memo,           setMemo]           = useState(initial.memo           ?? "");
  const [category,       setCategory]       = useState(initial.category       ?? "운영");
  const [urgency,        setUrgency]        = useState<Urgency>(initial.urgency    ?? "보통");
  const [status,         setStatus]         = useState<TaskStatus>(initial.status  ?? "해야 할 일");
  const [dueDate,        setDueDate]        = useState(initial.dueDate        ?? "");
  const [relatedProduct, setRelatedProduct] = useState(initial.relatedProduct ?? "");
  const [relatedSeason,  setRelatedSeason]  = useState(initial.relatedSeason  ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title:              title.trim(),
      memo:               memo.trim() || undefined,
      category,
      urgency,
      status,
      dueDate:            dueDate || undefined,
      relatedProduct:     relatedProduct.trim() || undefined,
      relatedSeason:      relatedSeason.trim()  || undefined,
      assignedModule:     initial.assignedModule,
      assignedModuleHref: initial.assignedModuleHref,
      source:             initial.source ?? "manual",
      aiId:               initial.aiId,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={LABEL_CLS}>제목 *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          className={INPUT_CLS} placeholder="업무 제목을 입력하세요" required autoFocus />
      </div>

      <div>
        <label className={LABEL_CLS}>메모</label>
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)}
          rows={3} className={cn(INPUT_CLS, "resize-none leading-relaxed")}
          placeholder="업무 설명 또는 참고 사항..." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>카테고리</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={cn(INPUT_CLS, "cursor-pointer")}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>우선순위</label>
          <select value={urgency} onChange={(e) => setUrgency(e.target.value as Urgency)} className={cn(INPUT_CLS, "cursor-pointer")}>
            {(["낮음", "보통", "높음", "긴급"] as Urgency[]).map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>상태</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={cn(INPUT_CLS, "cursor-pointer")}>
            {(["오늘 해야할 일", "해야 할 일", "진행 중", "진행예정", "완료", "지연"] as TaskStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>마감일</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={INPUT_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>관련 상품</label>
          <input value={relatedProduct} onChange={(e) => setRelatedProduct(e.target.value)}
            className={INPUT_CLS} placeholder="예: 한라봉" />
        </div>
        <div>
          <label className={LABEL_CLS}>관련 시즌</label>
          <input value={relatedSeason} onChange={(e) => setRelatedSeason(e.target.value)}
            className={INPUT_CLS} placeholder="예: 봄 시즌" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-500 transition-colors">
          취소
        </button>
        <button type="submit"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0047CC] hover:bg-[#0038A8] text-white text-xs font-bold shadow-sm shadow-[#0047CC]/20 transition-all active:scale-[0.98]">
          <Check className="w-3.5 h-3.5" /> {submitLabel}
        </button>
      </div>
    </form>
  );
}

// ─── TaskDetail ───────────────────────────────────────────────────────────────

interface TaskDetailProps {
  task: BoardTask;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (s: TaskStatus) => void;
}

function TaskDetail({ task, onEdit, onDelete, onStatusChange }: TaskDetailProps) {
  const overdue = task.status === "지연";

  return (
    <div className="space-y-4">
      <h2 className="text-base font-extrabold text-slate-900 leading-snug">{task.title}</h2>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg border", TAG_TONE[task.category] ?? TAG_TONE["운영"])}>
          {task.category}
        </span>
        <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg border", URGENCY_CONFIG[task.urgency])}>
          {task.urgency}
        </span>
        {task.dueDate && (
          <span className={cn(
            "text-[10px] font-bold px-2.5 py-1 rounded-lg border",
            overdue ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-slate-50 text-slate-600 border-slate-200"
          )}>
            {overdue ? "⚠ " : ""}마감 {task.dueDate}
          </span>
        )}
      </div>

      {/* Memo */}
      {task.memo && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">메모</p>
          <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">{task.memo}</p>
        </div>
      )}

      {/* Meta chips */}
      {(task.relatedProduct || task.relatedSeason || task.assignedModule) && (
        <div className="grid grid-cols-2 gap-2">
          {task.relatedProduct && <MetaChip label="관련 상품" value={task.relatedProduct} />}
          {task.relatedSeason  && <MetaChip label="관련 시즌"  value={task.relatedSeason}  />}
          {task.assignedModule && <MetaChip label="연결 모듈"  value={task.assignedModule}  />}
        </div>
      )}

      {/* Timestamps + source */}
      <div className="grid grid-cols-2 gap-2">
        <MetaChip label="생성일" value={task.createdAt.slice(0, 10)} />
        <MetaChip label="수정일" value={task.updatedAt.slice(0, 10)} />
        {task.source === "ai" && <MetaChip label="출처" value="AI 생성" />}
      </div>

      {/* Status change */}
      <div>
        <p className={LABEL_CLS}>상태 변경</p>
        <div className="flex flex-wrap gap-1.5">
          {COLUMNS.map((col) => (
            <button key={col.id} onClick={() => onStatusChange(col.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                task.status === col.id
                  ? "bg-[#0047CC] text-white border-[#0047CC] shadow-sm shadow-[#0047CC]/20"
                  : "bg-white border-slate-200 hover:border-[#0047CC] hover:text-[#0047CC] text-slate-600"
              )}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>

      {/* Module link */}
      {task.assignedModuleHref && (
        <Link href={task.assignedModuleHref}
          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-[#0047CC] hover:bg-blue-50/30 transition-all group">
          <span className="text-[12px] font-bold text-slate-700 group-hover:text-[#0047CC]">
            {task.assignedModule} 페이지 열기
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0047CC]" />
        </Link>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 text-slate-400 hover:text-rose-600 text-xs font-semibold transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> 삭제
        </button>
        <button onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0047CC] hover:bg-[#0038A8] text-white text-xs font-bold shadow-sm shadow-[#0047CC]/20 transition-all active:scale-[0.98]">
          <Pencil className="w-3.5 h-3.5" /> 수정하기
        </button>
      </div>
    </div>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-[12px] font-semibold text-slate-700 truncate">{value}</p>
    </div>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({ task, onClick }: { task: BoardTask; onClick: () => void }) {
  const overdue = task.status === "지연";
  return (
    <button onClick={onClick}
      className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-[#0047CC] hover:shadow-sm hover:shadow-blue-500/10 transition-all group"
    >
      <p className={cn(
        "text-[12px] leading-relaxed mb-2 font-medium group-hover:text-[#0047CC] transition-colors",
        task.status === "완료" ? "line-through text-slate-400" : "text-slate-800"
      )}>
        {task.title}
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0", TAG_TONE[task.category] ?? TAG_TONE["운영"])}>
          {task.category}
        </span>
        {(task.urgency === "긴급" || task.urgency === "높음") && (
          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0", URGENCY_CONFIG[task.urgency])}>
            {task.urgency}
          </span>
        )}
        {task.dueDate && (
          <span className={cn("ml-auto text-[10px] font-bold flex-shrink-0", overdue ? "text-rose-500" : "text-slate-400")}>
            ~{task.dueDate.slice(5)}
          </span>
        )}
      </div>
      {task.relatedProduct && (
        <p className="text-[10px] text-slate-400 mt-1.5 font-medium truncate">🥭 {task.relatedProduct}</p>
      )}
    </button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200/80 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <p className="text-[11px] font-extrabold text-slate-600 uppercase tracking-[0.16em]">{title}</p>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[82vh]">{children}</div>
      </motion.div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ModalState =
  | { kind: "closed" }
  | { kind: "create"; defaultStatus: TaskStatus }
  | { kind: "view";   task: BoardTask }
  | { kind: "edit";   task: BoardTask };

export default function BoardPage() {
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });

  useEffect(() => { setTasks(getOrInitBoardTasks()); }, []);

  const closeModal = useCallback(() => setModal({ kind: "closed" }), []);

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, BoardTask[]> = {
      "오늘 해야할 일": [], "해야 할 일": [], "진행 중": [], "진행예정": [], "완료": [], "지연": [],
    };
    for (const t of tasks) {
      if (map[t.status]) map[t.status].push(t);
    }
    return map;
  }, [tasks]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  function createTask(data: Omit<BoardTask, "id" | "createdAt" | "updatedAt">) {
    const ts   = nowISO();
    const task: BoardTask = { ...data, id: genId(), createdAt: ts, updatedAt: ts };
    const next = [task, ...tasks];
    saveBoardTasks(next);
    setTasks(next);
    closeModal();
  }

  function updateTask(id: string, data: Omit<BoardTask, "id" | "createdAt" | "updatedAt">) {
    const prev    = tasks.find((t) => t.id === id)!;
    const updated: BoardTask = { ...prev, ...data, updatedAt: nowISO() };
    const next    = tasks.map((t) => (t.id === id ? updated : t));
    saveBoardTasks(next);
    setTasks(next);
    if (updated.aiId) {
      updateAITask(updated.aiId, {
        status:  updated.status  as any,
        title:   updated.title,
        urgency: updated.urgency as any,
        notes:   updated.memo,
      });
    }
    setModal({ kind: "view", task: updated });
  }

  function changeStatus(id: string, status: TaskStatus) {
    const prev    = tasks.find((t) => t.id === id)!;
    const updated: BoardTask = { ...prev, status, updatedAt: nowISO() };
    const next    = tasks.map((t) => (t.id === id ? updated : t));
    saveBoardTasks(next);
    setTasks(next);
    if (updated.aiId) updateAITask(updated.aiId, { status: status as any });
    if (modal.kind === "view" && modal.task.id === id) {
      setModal({ kind: "view", task: updated });
    }
  }

  function deleteTask(id: string) {
    const next = tasks.filter((t) => t.id !== id);
    saveBoardTasks(next);
    setTasks(next);
    closeModal();
  }

  return (
    <PageShell
      icon={ClipboardList}
      title="운영 보드"
      subtitle="태스크를 상태별로 관리하고 진행 상황을 한눈에 확인합니다"
      maxWidth="1500px"
      action={
        <PrimaryButton onClick={() => setModal({ kind: "create", defaultStatus: "해야 할 일" })}>
          <Plus className="w-3.5 h-3.5" /> 새 태스크
        </PrimaryButton>
      }
    >
      {/* Status summary strip */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {COLUMNS.map((col) => (
          <div key={col.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px]">
            <span className={cn("w-2 h-2 rounded-full flex-shrink-0", col.dot)} />
            <span className="text-slate-600 font-semibold">{col.label}</span>
            <span className={cn("font-extrabold tabular-nums", col.tone)}>
              {tasksByStatus[col.id].length}
            </span>
          </div>
        ))}
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 mb-8">
        {COLUMNS.map((col, ci) => {
          const colTasks = tasksByStatus[col.id];
          return (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.05 }}
              className="flex flex-col"
            >
              <GlassCard className="p-3.5 flex flex-col flex-1 min-h-[320px]">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-0.5">
                  <span className={cn("w-2 h-2 rounded-full flex-shrink-0", col.dot)} />
                  <p className={cn("text-[11px] font-extrabold uppercase tracking-wider flex-1", col.tone)}>
                    {col.label}
                  </p>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full tabular-nums">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2 flex-1">
                  {colTasks.length === 0 && (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-[11px] text-slate-300 font-medium select-none">태스크 없음</p>
                    </div>
                  )}
                  <AnimatePresence initial={false}>
                    {colTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.14 }}
                      >
                        <TaskCard
                          task={task}
                          onClick={() => setModal({ kind: "view", task })}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Add card */}
                <button
                  onClick={() => setModal({ kind: "create", defaultStatus: col.id })}
                  className="w-full flex items-center justify-center gap-1 py-2 mt-3 rounded-xl border border-dashed border-slate-200 text-slate-400 hover:text-[#0047CC] hover:border-[#0047CC] hover:bg-blue-50/30 text-[11px] font-semibold transition-colors"
                >
                  <Plus className="w-3 h-3" /> 카드 추가
                </button>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <RelatedTools
        items={[
          { label: "체크리스트",    href: "/app/tools/store-ops/checklist", hint: "런칭 항목 자동 동기화" },
          { label: "이슈 / 알림",   href: "/app/tools/store-ops/issues",    hint: "긴급 카드로 전환"     },
          { label: "상세페이지",    href: "/app/tools/detail-page"                                        },
          { label: "광고 설정",     href: "/app/tools/ads"                                                },
        ]}
      />

      {/* Modal */}
      <AnimatePresence>
        {modal.kind !== "closed" && (
          <Modal
            title={
              modal.kind === "create" ? `새 태스크 — ${modal.defaultStatus}` :
              modal.kind === "edit"   ? "태스크 수정" :
              "태스크 상세"
            }
            onClose={closeModal}
          >
            {modal.kind === "create" && (
              <TaskForm
                initial={{ status: modal.defaultStatus, source: "manual" }}
                onSave={createTask}
                onCancel={closeModal}
                submitLabel="태스크 만들기"
              />
            )}
            {modal.kind === "view" && (
              <TaskDetail
                task={modal.task}
                onEdit={() => setModal({ kind: "edit", task: modal.task })}
                onDelete={() => deleteTask(modal.task.id)}
                onStatusChange={(s) => changeStatus(modal.task.id, s)}
              />
            )}
            {modal.kind === "edit" && (
              <TaskForm
                initial={modal.task}
                onSave={(data) => updateTask(modal.task.id, data)}
                onCancel={() => setModal({ kind: "view", task: modal.task })}
                submitLabel="변경 저장"
              />
            )}
          </Modal>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
