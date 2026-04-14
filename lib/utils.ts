import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  ContentItem,
  ContentStatus,
  Platform,
  TemplateType,
  PLATFORM_LABELS,
  STATUS_LABELS,
  TEMPLATE_LABELS,
} from "./types";
import { format, parseISO, isToday, isThisWeek, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ko } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), "yyyy년 MM월 dd일", { locale: ko });
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  try {
    return format(parseISO(dateString), "MM/dd", { locale: ko });
  } catch {
    return dateString;
  }
}

export function formatMonthYear(date: Date): string {
  return format(date, "yyyy년 MM월", { locale: ko });
}

export function isTodayDate(dateString: string): boolean {
  try {
    return isToday(parseISO(dateString));
  } catch {
    return false;
  }
}

export function isThisWeekDate(dateString: string): boolean {
  try {
    return isThisWeek(parseISO(dateString), { locale: ko });
  } catch {
    return false;
  }
}

export function getMonthDays(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  return eachDayOfInterval({ start, end });
}

export function getContentsByDate(
  contents: ContentItem[],
  dateString: string
): ContentItem[] {
  return contents.filter((c) => c.scheduledDate === dateString);
}

export function getTodayContents(contents: ContentItem[]): ContentItem[] {
  return contents.filter((c) => isTodayDate(c.scheduledDate));
}

export function getThisWeekContents(contents: ContentItem[]): ContentItem[] {
  return contents.filter((c) => isThisWeekDate(c.scheduledDate));
}

export function getContentsByStatus(
  contents: ContentItem[],
  status: ContentStatus
): ContentItem[] {
  return contents.filter((c) => c.status === status);
}

export function getContentsByPlatform(
  contents: ContentItem[],
  platform: Platform
): ContentItem[] {
  return contents.filter((c) => c.platforms.includes(platform));
}

export function getOpenChatContents(contents: ContentItem[]): ContentItem[] {
  return contents.filter((c) => c.platforms.includes("openchat"));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function duplicateContent(content: ContentItem): ContentItem {
  return {
    ...content,
    id: generateId(),
    title: `${content.title} (복사본)`,
    status: "idea",
    channelDrafts: {},
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  };
}

export function sortByScheduledDate(contents: ContentItem[]): ContentItem[] {
  return [...contents].sort(
    (a, b) =>
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );
}

export function sortByUpdatedAt(contents: ContentItem[]): ContentItem[] {
  return [...contents].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export { PLATFORM_LABELS, STATUS_LABELS, TEMPLATE_LABELS };
