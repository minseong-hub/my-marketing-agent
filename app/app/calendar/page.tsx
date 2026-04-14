"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { mockContents } from "@/lib/mock-data";
import { getMonthDays, getContentsByDate, formatMonthYear, cn } from "@/lib/utils";
import { ContentItem, Platform, ContentStatus, PLATFORM_LABELS, STATUS_LABELS } from "@/lib/types";
import { StatusBadge } from "@/components/contents/status-badge";
import { PlatformBadge } from "@/components/contents/platform-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const platformFilters: (Platform | "all")[] = ["all", "blog", "instagram", "threads", "tiktok", "openchat"];
const statusFilters: (ContentStatus | "all")[] = ["all", "idea", "drafting", "review", "scheduled", "published"];

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");

  const days = getMonthDays(currentYear, currentMonth);
  const firstDay = days[0].getDay();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const filteredContents = mockContents.filter((c) => {
    if (platformFilter !== "all" && !c.platforms.includes(platformFilter)) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  const selectedContents = selectedDate ? getContentsByDate(filteredContents, selectedDate) : [];
  const getDateString = (date: Date) => format(date, "yyyy-MM-dd");

  return (
    <div className="p-6 max-w-[1200px] mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">콘텐츠 캘린더</h1>
        <p className="text-sm text-slate-400 mt-0.5">업로드 일정을 한눈에 확인하세요</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-5">
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1.5">플랫폼</p>
          <div className="flex gap-1.5 flex-wrap">
            {platformFilters.map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                  platformFilter === p
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                )}
              >
                {p === "all" ? "전체" : PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1.5">상태</p>
          <div className="flex gap-1.5 flex-wrap">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                  statusFilter === s
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                )}
              >
                {s === "all" ? "전체" : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-5">
                <Button variant="ghost" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-base font-bold text-slate-800">
                  {formatMonthYear(new Date(currentYear, currentMonth))}
                </h2>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                  <div key={d} className={cn(
                    "text-center text-xs font-semibold py-1.5",
                    i === 0 ? "text-rose-400" : i === 6 ? "text-blue-400" : "text-slate-400"
                  )}>
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {days.map((date) => {
                  const dateStr = getDateString(date);
                  const dayContents = getContentsByDate(filteredContents, dateStr);
                  const isToday = dateStr === getDateString(today);
                  const isSelected = selectedDate === dateStr;
                  const dow = date.getDay();

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl transition-all cursor-pointer",
                        isSelected ? "bg-blue-600 text-white shadow-sm" :
                        isToday ? "bg-blue-50 ring-2 ring-blue-200" :
                        "hover:bg-slate-50"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full",
                        isSelected ? "text-white" :
                        isToday ? "bg-blue-600 text-white" :
                        dow === 0 ? "text-rose-400" :
                        dow === 6 ? "text-blue-500" :
                        "text-slate-600"
                      )}>
                        {date.getDate()}
                      </span>
                      {dayContents.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center px-1">
                          {dayContents.slice(0, 3).map((_, i) => (
                            <div key={i} className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white/70" : "bg-blue-400")} />
                          ))}
                          {dayContents.length > 3 && (
                            <span className={cn("text-[9px] font-bold", isSelected ? "text-white/70" : "text-blue-400")}>
                              +{dayContents.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-5">
            {selectedDate ? (
              <>
                <p className="text-sm font-semibold text-slate-700 mb-4">
                  {format(new Date(selectedDate + "T00:00:00"), "M월 d일 (eee)", { locale: ko })}
                </p>
                {selectedContents.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedContents.map((content) => (
                      <Link
                        key={content.id}
                        href={`/app/contents/${content.id}`}
                        className="block p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all group"
                      >
                        <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 mb-2 line-clamp-2 leading-snug transition-colors">
                          {content.title}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {content.platforms.map((p) => (
                            <PlatformBadge key={p} platform={p} />
                          ))}
                        </div>
                        <StatusBadge status={content.status} showDot />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <CalendarDays className="w-6 h-6 text-slate-200 mb-2" />
                    <p className="text-xs text-slate-400">이 날짜에 예정된 콘텐츠가 없어요</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <CalendarDays className="w-8 h-8 text-slate-200 mb-3" />
                <p className="text-sm text-slate-400 font-medium">날짜를 선택하세요</p>
                <p className="text-xs text-slate-300 mt-1">해당 날짜 콘텐츠가 표시됩니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
