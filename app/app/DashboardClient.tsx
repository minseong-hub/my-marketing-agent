"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  FileText,
  CheckCircle2,
  Clock,
  CalendarDays,
  X,
  ExternalLink,
  ArrowRight,
  Zap,
} from "lucide-react";
import { mockContents } from "@/lib/mock-data";
import {
  ContentStatus,
  Platform,
  STATUS_LABELS,
  PLATFORM_LABELS,
  STATUS_COLORS,
  ContentItem,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
  brandDisplayName: string;
  userName: string;
}

// ── 플랫폼 배지 색상
const PLATFORM_BADGE: Record<Platform, string> = {
  instagram: "bg-pink-500",
  blog: "bg-orange-500",
  threads: "bg-slate-500",
  openchat: "bg-amber-500",
  tiktok: "bg-red-500",
};

// ── 상태 점 색상
const STATUS_DOT: Record<ContentStatus, string> = {
  idea: "bg-slate-400",
  drafting: "bg-amber-500",
  review: "bg-blue-500",
  scheduled: "bg-violet-500",
  published: "bg-emerald-500",
};

// ── 글래스 카드 (앱 내부, 밝은 배경)
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white/80 backdrop-blur-sm border border-white/80 rounded-2xl shadow-lg", className)}>
      {children}
    </div>
  );
}

// ── 상단 요약 카드 (부모 GlassCard 안에서 사용)
function SummaryCard({
  label,
  value,
  icon: Icon,
  colorClass,
  bgClass,
  href,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", bgClass)}>
            <Icon className={cn("w-4 h-4", colorClass)} />
          </div>
          <ArrowRight className="w-3 h-3 text-slate-200 group-hover:text-slate-400 transition-colors" />
        </div>
        <p className="text-2xl font-extrabold text-slate-800 mb-1">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </Link>
  );
}

// ── 달력 컴포넌트
function MonthCalendar({
  year,
  month,
  contents,
  selectedDate,
  onSelectDate,
}: {
  year: number;
  month: number;
  contents: ContentItem[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  function getDateStr(day: number) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function getContentsForDate(day: number) {
    const dateStr = getDateStr(day);
    return contents.filter((c) => c.scheduledDate === dateStr);
  }

  return (
    <div>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((d, i) => (
          <div
            key={d}
            className={cn(
              "text-center text-xs font-semibold py-2",
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-400"
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-xl overflow-hidden">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="bg-slate-50/60 min-h-[80px]" />;
          }

          const dateStr = getDateStr(day);
          const dayContents = getContentsForDate(day);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const isSunday = (idx % 7) === 0;
          const isSaturday = (idx % 7) === 6;
          const showItems = dayContents.slice(0, 2);
          const extra = dayContents.length - 2;
          const isPast = new Date(dateStr) < new Date(todayStr);

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={cn(
                "bg-white min-h-[80px] p-1.5 cursor-pointer transition-colors group relative",
                isSelected && "bg-blue-50 ring-2 ring-inset ring-blue-400",
                !isSelected && "hover:bg-slate-50",
                isPast && !isToday && "bg-slate-50/40"
              )}
            >
              {/* 날짜 숫자 */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full",
                    isToday && "bg-blue-600 text-white",
                    !isToday && isSunday && "text-red-400",
                    !isToday && isSaturday && "text-blue-400",
                    !isToday && !isSunday && !isSaturday && "text-slate-600",
                    isPast && !isToday && "opacity-50"
                  )}
                >
                  {day}
                </span>
              </div>

              {/* 콘텐츠 바 목록 */}
              <div className="space-y-0.5">
                {showItems.map((content) => (
                  <Link
                    key={content.id}
                    href={`/app/contents/${content.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className={cn(
                        "text-[10px] rounded px-1.5 py-0.5 truncate text-white font-medium leading-tight w-full block",
                        PLATFORM_BADGE[content.platforms[0]] || "bg-slate-400",
                        content.status === "published" ? "opacity-50" : ""
                      )}
                    >
                      {content.title}
                    </div>
                  </Link>
                ))}
                {extra > 0 && (
                  <p className="text-[10px] text-blue-500 font-semibold px-1">
                    +{extra}개
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 날짜별 상세 패널
function DateDetailPanel({
  date,
  contents,
  onClose,
}: {
  date: string;
  contents: ContentItem[];
  onClose: () => void;
}) {
  const [d, m, y] = [
    new Date(date).getDate(),
    new Date(date).getMonth() + 1,
    new Date(date).getFullYear(),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
    >
      <GlassCard className="h-full">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{y}년 {m}월</p>
            <p className="text-base font-bold text-slate-800">{d}일 콘텐츠</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
          {contents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarDays className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">이 날 콘텐츠가 없어요</p>
              <Link href="/app/create" className="text-xs text-blue-500 mt-2 hover:underline">
                + 새 콘텐츠 등록
              </Link>
            </div>
          ) : (
            contents.map((content) => (
              <Link
                key={content.id}
                href={`/app/contents/${content.id}`}
                className="block"
              >
                <div className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                  <div className="flex items-start gap-2 mb-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1 flex-shrink-0",
                      STATUS_DOT[content.status]
                    )} />
                    <p className="text-xs font-semibold text-slate-700 leading-snug flex-1 line-clamp-2">
                      {content.title}
                    </p>
                    <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-400 flex-shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap ml-4">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", STATUS_COLORS[content.status])}>
                      {STATUS_LABELS[content.status]}
                    </span>
                    {content.platforms.slice(0, 3).map((p) => (
                      <span key={p} className={cn("text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium", PLATFORM_BADGE[p])}>
                        {PLATFORM_LABELS[p]}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function DashboardClient({
  brandDisplayName,
}: DashboardClientProps) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 캘린더 호버 틸트
  const calCardRef = useRef<HTMLDivElement>(null);
  const [calTilt, setCalTilt] = useState({ x: 0, y: 0 });

  function handleCalMouseMove(e: React.MouseEvent) {
    if (!calCardRef.current) return;
    const rect = calCardRef.current.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setCalTilt({ x: -dy * 2.5, y: dx * 2.5 });
  }

  function handleCalMouseLeave() {
    setCalTilt({ x: 0, y: 0 });
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dayLabel = dayNames[today.getDay()];

  // 이번 달 콘텐츠
  const thisMonthContents = mockContents.filter((c) => {
    const [y, m] = c.scheduledDate.split("-");
    return parseInt(y) === today.getFullYear() && parseInt(m) === today.getMonth() + 1;
  });

  // 오늘 콘텐츠
  const todayContents = mockContents.filter((c) => c.scheduledDate === todayStr);

  // 이번 주
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const weekContents = mockContents.filter((c) => {
    const d = new Date(c.scheduledDate);
    return d >= startOfWeek && d <= endOfWeek;
  });

  // 달력 이동
  function prevMonth() {
    if (calMonth === 1) { setCalYear(y => y - 1); setCalMonth(12); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 12) { setCalYear(y => y + 1); setCalMonth(1); }
    else setCalMonth(m => m + 1);
  }

  // 선택된 날짜의 콘텐츠
  const selectedContents = selectedDate
    ? mockContents.filter((c) => c.scheduledDate === selectedDate)
    : [];

  // 달력에서 보여줄 콘텐츠
  const calContents = mockContents.filter((c) => {
    const [y, m] = c.scheduledDate.split("-");
    return parseInt(y) === calYear && parseInt(m) === calMonth;
  });

  // 상태별 카운트
  const statusCounts: Record<ContentStatus, number> = {
    idea: 0, drafting: 0, review: 0, scheduled: 0, published: 0,
  };
  mockContents.forEach((c) => statusCounts[c.status]++);

  // 플랫폼별 카운트
  const platformCounts: Record<Platform, number> = {
    blog: 0, instagram: 0, threads: 0, tiktok: 0, openchat: 0,
  };
  mockContents.forEach((c) => c.platforms.forEach((p) => platformCounts[p]++));

  return (
    <div className="p-6 max-w-[1280px] mx-auto">
      {/* ── Welcome 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/app/create">
          <Button size="lg" className="shadow-sm gap-2 bg-blue-600 hover:bg-blue-700 flex-shrink-0">
            <PlusCircle className="w-4 h-4" />
            새 콘텐츠 등록
          </Button>
        </Link>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-0.5">
            {dateLabel} ({dayLabel}) · {brandDisplayName} 마케팅 스튜디오
          </p>
          <h1 className="text-xl font-bold text-slate-800 leading-snug">
            오늘도 좋은 콘텐츠를 차분하게 준비해볼까요.
          </h1>
        </motion.div>
      </div>

      {/* ── 상단 요약 카드 4개 (통합 컨테이너) */}
      <GlassCard className="mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100">
          <SummaryCard
            label="이번 달 총 콘텐츠"
            value={thisMonthContents.length}
            icon={FileText}
            colorClass="text-blue-600"
            bgClass="bg-blue-50"
            href="/app/contents"
          />
          <SummaryCard
            label="업로드 완료"
            value={mockContents.filter((c) => c.status === "published").length}
            icon={CheckCircle2}
            colorClass="text-emerald-600"
            bgClass="bg-emerald-50"
            href="/app/contents?status=published"
          />
          <SummaryCard
            label="검토 필요"
            value={mockContents.filter((c) => c.status === "review").length}
            icon={Clock}
            colorClass="text-amber-600"
            bgClass="bg-amber-50"
            href="/app/contents?status=review"
          />
          <SummaryCard
            label="이번 주 예정"
            value={weekContents.length}
            icon={CalendarDays}
            colorClass="text-violet-600"
            bgClass="bg-violet-50"
            href="/app/contents?quick=this-week"
          />
        </div>
      </GlassCard>

      {/* ── 메인 영역: 달력 + 오른쪽 패널 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* 달력 (좌측 2/3) */}
        <div className="lg:col-span-2">
          <motion.div
            ref={calCardRef}
            onMouseMove={handleCalMouseMove}
            onMouseLeave={handleCalMouseLeave}
            animate={{ rotateX: calTilt.x, rotateY: calTilt.y }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            style={{ transformPerspective: 1200, transformStyle: "preserve-3d" }}
            className="will-change-transform"
          >
          <GlassCard className="p-5">
            {/* 달력 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">
                {calYear}년 {calMonth}월
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setCalYear(today.getFullYear()); setCalMonth(today.getMonth() + 1); }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  오늘
                </button>
                <button
                  onClick={nextMonth}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <MonthCalendar
              year={calYear}
              month={calMonth}
              contents={calContents}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </GlassCard>
          </motion.div>
        </div>

        {/* 우측 패널 (1/3) */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selectedDate ? (
              <DateDetailPanel
                key={selectedDate}
                date={selectedDate}
                contents={selectedContents}
                onClose={() => setSelectedDate(null)}
              />
            ) : (
              <motion.div
                key="default-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* 오늘 할 일 */}
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-800">오늘 예정</h3>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {todayContents.length}건
                    </span>
                  </div>
                  {todayContents.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">오늘 예정된 콘텐츠가 없어요</p>
                  ) : (
                    <div className="space-y-2">
                      {todayContents.map((c) => (
                        <Link key={c.id} href={`/app/contents/${c.id}`}>
                          <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors group">
                            <div className={cn("w-2 h-2 rounded-full mt-1 flex-shrink-0", STATUS_DOT[c.status])} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-700 truncate">{c.title}</p>
                              <p className="text-[10px] text-slate-400">{STATUS_LABELS[c.status]}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </GlassCard>

                {/* 이번 주 예정 */}
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-800">이번 주 예정</h3>
                    <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                      {weekContents.length}건
                    </span>
                  </div>
                  {weekContents.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">이번 주 예정 콘텐츠가 없어요</p>
                  ) : (
                    <div className="space-y-1.5">
                      {weekContents.slice(0, 5).map((c) => (
                        <Link key={c.id} href={`/app/contents/${c.id}`}>
                          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-violet-50 transition-colors group">
                            <div className={cn("w-2 h-2 rounded-full flex-shrink-0", PLATFORM_BADGE[c.platforms[0]] || "bg-slate-300")} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-700 truncate">{c.title}</p>
                              <p className="text-[10px] text-slate-400">{c.scheduledDate}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {weekContents.length > 5 && (
                        <Link href="/app/contents?quick=this-week" className="block text-center text-xs text-blue-500 hover:underline pt-1">
                          +{weekContents.length - 5}개 더 보기
                        </Link>
                      )}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── 하단 요약 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* A. 진행 요약 */}
        <GlassCard className="p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">상태 요약</h3>
          <div className="space-y-1.5">
            {(["idea", "drafting", "review", "scheduled", "published"] as ContentStatus[]).map((status) => (
              <Link key={status} href={`/app/contents?status=${status}`}>
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", STATUS_DOT[status])} />
                    <span className="text-xs font-medium text-slate-600">{STATUS_LABELS[status]}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700 tabular-nums">
                    {statusCounts[status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </GlassCard>

        {/* B. 채널별 현황 */}
        <GlassCard className="p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">채널별 현황</h3>
          <div className="space-y-2">
            {(["blog", "instagram", "threads", "tiktok", "openchat"] as Platform[]).map((platform) => {
              const count = platformCounts[platform];
              const pct = mockContents.length > 0 ? Math.round((count / mockContents.length) * 100) : 0;
              return (
                <Link key={platform} href={`/app/contents?platform=${platform}`}>
                  <div className="group">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-slate-600">{PLATFORM_LABELS[platform]}</span>
                      <span className="text-[10px] font-bold text-slate-500 tabular-nums">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", PLATFORM_BADGE[platform])}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </GlassCard>

        {/* C. 전체 진행률 */}
        <GlassCard className="p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">이번 달 진행률</h3>
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-24 h-24 mb-3">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="38" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="48" cy="48" r="38" fill="none"
                  stroke="#3B82F6" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - (mockContents.filter(c => c.status === "published").length / (mockContents.length || 1)))}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-slate-800">
                  {Math.round((mockContents.filter(c => c.status === "published").length / (mockContents.length || 1)) * 100)}%
                </span>
                <span className="text-[10px] text-slate-400">완료</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              전체 {mockContents.length}건 중<br />
              <span className="font-bold text-emerald-600">{mockContents.filter(c => c.status === "published").length}건</span> 업로드 완료
            </p>
          </div>
        </GlassCard>

        {/* D. 빠른 액션 */}
        <GlassCard className="p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">빠른 액션</h3>
          <div className="space-y-2">
            {[
              { label: "새 콘텐츠 등록", href: "/app/create", icon: PlusCircle, color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
              { label: "콘텐츠 목록", href: "/app/contents", icon: FileText, color: "text-slate-600 bg-slate-50 hover:bg-slate-100" },
              { label: "캘린더 보기", href: "/app/calendar", icon: CalendarDays, color: "text-violet-600 bg-violet-50 hover:bg-violet-100" },
              { label: "템플릿 관리", href: "/app/templates", icon: Zap, color: "text-amber-600 bg-amber-50 hover:bg-amber-100" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <div className={cn("flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors", action.color)}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-semibold">{action.label}</span>
                    <ArrowRight className="w-3 h-3 ml-auto opacity-50" />
                  </div>
                </Link>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
