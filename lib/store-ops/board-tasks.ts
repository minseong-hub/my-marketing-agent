/**
 * Board Tasks — single source of truth for store-ops task management.
 * Used by: operations board page, store-ops dashboard (today column, calendar).
 */

import { loadAITasks, type AITask } from "./ai-tasks";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type TaskStatus =
  | "오늘 해야할 일"
  | "해야 할 일"
  | "진행 중"
  | "진행예정"
  | "완료"
  | "지연";

export type Urgency = "낮음" | "보통" | "높음" | "긴급";

export interface BoardTask {
  id: string;
  title: string;
  memo?: string;
  category: string;
  urgency: Urgency;
  status: TaskStatus;
  dueDate?: string;        // YYYY-MM-DD
  relatedProduct?: string;
  relatedSeason?: string;
  assignedModule?: string;
  assignedModuleHref?: string;
  createdAt: string;
  updatedAt: string;
  source: "manual" | "ai";
  aiId?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const BOARD_KEY = "store_ops_board_v1";
export const TODAY_STR = "2026-04-15";

// ─── Storage ─────────────────────────────────────────────────────────────────

function isBrowser() { return typeof window !== "undefined"; }

export function loadBoardTasks(): BoardTask[] {
  if (!isBrowser()) return [];
  try { return JSON.parse(localStorage.getItem(BOARD_KEY) ?? "[]"); } catch { return []; }
}

export function saveBoardTasks(tasks: BoardTask[]) {
  if (!isBrowser()) return;
  localStorage.setItem(BOARD_KEY, JSON.stringify(tasks));
}

// ─── Status auto-refresh ──────────────────────────────────────────────────────
/**
 * Automatically fix stale statuses based on today's date.
 * - Past due + not (완료 | 진행 중) → 지연
 * - Due today + was (해야 할 일 | 진행예정) → 오늘 해야할 일
 */
export function refreshStatuses(tasks: BoardTask[]): BoardTask[] {
  return tasks.map((t) => {
    if (t.status === "완료") return t;
    if (!t.dueDate) return t;
    if (t.dueDate < TODAY_STR && t.status !== "진행 중") {
      return { ...t, status: "지연" as TaskStatus };
    }
    if (t.dueDate === TODAY_STR && (t.status === "해야 할 일" || t.status === "진행예정")) {
      return { ...t, status: "오늘 해야할 일" as TaskStatus };
    }
    return t;
  });
}

// ─── AI task → BoardTask conversion ──────────────────────────────────────────

const URGENCY_MAP: Record<string, Urgency> = {
  "긴급": "긴급", "높음": "높음", "보통": "보통", "낮음": "낮음",
};

// Maps old status values (검토 필요 / 보류) to new column names
const STATUS_MAP: Record<string, TaskStatus> = {
  "해야 할 일":    "해야 할 일",
  "진행 중":       "진행 중",
  "검토 필요":     "진행 중",
  "완료":          "완료",
  "보류":          "해야 할 일",
  "오늘 해야할 일":"오늘 해야할 일",
  "진행예정":      "진행예정",
  "지연":          "지연",
};

export function aiToBoardTask(t: AITask): BoardTask {
  return {
    id:                 `aiboard_${t.id}`,
    title:              t.title,
    memo:               t.notes,
    category:           t.category,
    urgency:            URGENCY_MAP[t.urgency]  ?? "보통",
    status:             STATUS_MAP[t.status]    ?? "해야 할 일",
    dueDate:            t.dueDate,
    relatedProduct:     t.relatedProduct,
    relatedSeason:      t.relatedSeason,
    assignedModule:     t.assignedModule,
    assignedModuleHref: t.assignedModuleHref,
    createdAt:          t.createdAt,
    updatedAt:          t.updatedAt,
    source:             "ai",
    aiId:               t.id,
  };
}

// ─── Seed data ────────────────────────────────────────────────────────────────

function genId() { return `bt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

const SEED: Omit<BoardTask, "id" | "createdAt" | "updatedAt">[] = [
  // 오늘 해야할 일
  { title: "제주 한라봉 상세페이지 카피 최종 검수", memo: "3단 구성 최종 확인, CTA 문구 검토",    category: "상세페이지", urgency: "높음", status: "오늘 해야할 일", dueDate: "2026-04-15", relatedProduct: "한라봉",   source: "manual" },
  // 진행 중
  { title: "스마트스토어 이미지 11컷 교체",          memo: "참외 상세 이미지 전체 교체 진행 중",   category: "상세페이지", urgency: "높음", status: "진행 중",       dueDate: "2026-04-15", relatedProduct: "성주참외", source: "manual" },
  { title: "오픈채팅 공지 템플릿 작성",                                                             category: "CRM",        urgency: "보통", status: "진행 중",                                                              source: "manual" },
  // 해야 할 일
  { title: "쿠팡 상품군 카테고리 재정비",                                                           category: "운영",       urgency: "낮음", status: "해야 할 일",                                                           source: "manual" },
  { title: "배송사 단가 재협상",                                                                     category: "운영",       urgency: "보통", status: "해야 할 일",                                                           source: "manual" },
  // 진행예정
  { title: "5월 가정의 달 프로모션 기획",            memo: "선물세트 20% 할인 기획안 작성",         category: "프로모션",    urgency: "보통", status: "진행예정",      dueDate: "2026-04-19",                                 source: "manual" },
  { title: "청정 딸기 2kg 채널 업로드",                                                             category: "업로드 관리", urgency: "보통", status: "진행예정",      dueDate: "2026-04-22", relatedProduct: "딸기",     source: "manual" },
  // 완료
  { title: "4월 회원 쿠폰 발송 완료",                                                               category: "프로모션",    urgency: "보통", status: "완료",                                                                 source: "manual" },
  { title: "상품 원가 엑셀 재정리",                                                                 category: "운영",        urgency: "낮음", status: "완료",                                                                 source: "manual" },
  // 지연
  { title: "딸기 2kg 판매가 리뷰 (마진 요약)",       memo: "원가 대비 마진율, 할인 적용 여부 검토", category: "상품 관리",   urgency: "높음", status: "지연",          dueDate: "2026-04-10", relatedProduct: "딸기",     source: "manual" },
  { title: "광고 카피 A안 vs B안 비교",                                                             category: "광고",        urgency: "보통", status: "지연",          dueDate: "2026-04-12",                                 source: "manual" },
];

export function buildSeedTasks(): BoardTask[] {
  const ts = new Date("2026-04-10").toISOString();
  return SEED.map((s) => ({ ...s, id: genId(), createdAt: ts, updatedAt: ts }));
}

// ─── Init / sync ──────────────────────────────────────────────────────────────
/**
 * Load board tasks, seeding on first visit and syncing new AI tasks.
 * Safe to call from any page — idempotent.
 */
export function getOrInitBoardTasks(): BoardTask[] {
  if (!isBrowser()) return buildSeedTasks();

  let board    = loadBoardTasks();
  const isFirst = board.length === 0;
  if (isFirst) board = buildSeedTasks();

  // Sync AI tasks not yet in board
  const aiTasks      = loadAITasks();
  const aiIdsInBoard = new Set(board.filter((t) => t.aiId).map((t) => t.aiId!));
  const fresh        = aiTasks.filter((t) => !aiIdsInBoard.has(t.id)).map(aiToBoardTask);

  let changed = isFirst || fresh.length > 0;
  if (fresh.length > 0) board = [...fresh, ...board];

  // Refresh stale statuses
  const refreshed = refreshStatuses(board);
  if (refreshed.some((t, i) => t.status !== board[i].status)) changed = true;
  board = refreshed;

  if (changed) saveBoardTasks(board);
  return board;
}
