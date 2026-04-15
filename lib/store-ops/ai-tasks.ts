/**
 * AI Task Store — localStorage-based for MVP
 * Migrate to server DB (see lib/db.ts pattern) when multi-device sync is needed.
 */

import type { ParsedTask } from "./ai-task-parser";

export interface AITask extends ParsedTask {
  id: string;
  rawInput: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "store_ops_ai_tasks_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadAITasks(): AITask[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(tasks: AITask[]) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function saveAITask(parsed: ParsedTask, rawInput: string): AITask {
  const tasks = loadAITasks();
  const now = new Date().toISOString();
  const task: AITask = {
    ...parsed,
    id: `ait_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    rawInput,
    createdAt: now,
    updatedAt: now,
  };
  tasks.unshift(task);
  persist(tasks);
  return task;
}

export function updateAITask(id: string, patch: Partial<Pick<AITask, "status" | "title" | "urgency" | "notes">>) {
  const tasks = loadAITasks().map((t) =>
    t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
  );
  persist(tasks);
}

export function deleteAITask(id: string) {
  persist(loadAITasks().filter((t) => t.id !== id));
}
