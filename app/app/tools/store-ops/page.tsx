"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Store,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  ChevronLeft,
  Layout as LayoutIcon,
  PackageX,
  CheckSquare,
  CalendarClock,
  Sparkles,
  RefreshCw,
  Tag,
  CalendarX,
  Pencil,
  ScrollText,
  Box,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard, PageShell, RelatedTools } from "@/components/store-ops/shared";
import {
  PRODUCTS,
  TODAY,
  countBy,
  currentSeason,
  SEASON_LABEL,
  Season,
  filters,
  type SeasonalProduct,
} from "@/lib/store-ops/seasonal-data";

// ─────────────────────────────────────────────────────────
// Calendar event derivation — built from PRODUCTS so counts
// stay synced (launch / restock / end / fix events)
// ─────────────────────────────────────────────────────────

type CalKind =
  | "신상품 오픈"
  | "재입고 예정"
  | "업로드 예정"
  | "프로모션 시작"
  | "프로모션 종료"
  | "상세페이지 완료"
  | "가격 수정"
  | "검토 필요"
  | "시즌 종료";

type CalItem = { date: string; kind: CalKind; label: string; href: string };

function deriveEvents(): CalItem[] {
  const items: CalItem[] = [];
  for (const p of PRODUCTS) {
    if (p.launchDate && (p.status === "시즌 오픈 예정" || p.status === "시즌 준비중")) {
      items.push({ date: p.launchDate, kind: "신상품 오픈", label: p.name, href: `/app/tools/store-ops/checklist?id=${p.id}` });
    }
    if (p.restockAt) {
      items.push({ date: p.restockAt, kind: "재입고 예정", label: p.name, href: "/app/tools/store-ops/inventory" });
    }
    if (p.uploadStatus === "수정 필요") {
      items.push({ date: p.updatedAt, kind: "가격 수정", label: p.name, href: "/app/tools/store-ops/uploads?status=수정 필요" });
    }
    if (p.uploadStatus === "검토 필요") {
      items.push({ date: p.updatedAt, kind: "검토 필요", label: p.name, href: "/app/tools/store-ops/uploads?status=검토 필요" });
    }
    if ((p.uploadStatus === "미등록" || p.uploadStatus === "등록 준비중") && p.launchDate) {
      const d = new Date(p.launchDate);
      d.setDate(d.getDate() - 2);
      items.push({ date: toKey(d), kind: "업로드 예정", label: p.name, href: "/app/tools/store-ops/uploads" });
    }
    if (p.endDate && p.status === "시즌 종료 예정") {
      items.push({ date: p.endDate, kind: "시즌 종료", label: p.name, href: `/app/tools/store-ops/products?id=${p.id}` });
    }
  }
  // Hand-curated promotions (mock)
  items.push({ date: "2026-04-15", kind: "프로모션 시작", label: "봄맞이 10% 할인", href: "/app/tools/store-ops/promotions" });
  items.push({ date: "2026-04-21", kind: "프로모션 종료", label: "봄맞이 10% 할인", href: "/app/tools/store-ops/promotions" });
  items.push({ date: "2026-04-22", kind: "프로모션 시작", label: "회원 얼리버드 15%", href: "/app/tools/store-ops/promotions" });
  items.push({ date: "2026-04-28", kind: "프로모션 종료", label: "회원 얼리버드", href: "/app/tools/store-ops/promotions" });
  items.push({ date: "2026-05-01", kind: "프로모션 시작", label: "5월 가정의 달 기획전", href: "/app/tools/store-ops/promotions" });
  items.push({ date: "2026-05-09", kind: "프로모션 종료", label: "가정의 달 기획전", href: "/app/tools/store-ops/promotions" });
  return items;
}

const KIND_META: Record<CalKind, { bar: string; chip: string; text: string }> = {
  "신상품 오픈":     { bar: "bg-[#0047CC]",   chip: "bg-blue-50 border-l-[#0047CC]",   text: "text-[#0047CC]" },
  "재입고 예정":     { bar: "bg-sky-500",     chip: "bg-sky-50 border-l-sky-500",      text: "text-sky-700" },
  "업로드 예정":     { bar: "bg-indigo-500",  chip: "bg-indigo-50 border-l-indigo-500", text: "text-indigo-700" },
  "프로모션 시작":   { bar: "bg-emerald-500", chip: "bg-emerald-50 border-l-emerald-500", text: "text-emerald-700" },
  "프로모션 종료":   { bar: "bg-slate-400",   chip: "bg-slate-100 border-l-slate-400",  text: "text-slate-600" },
  "상세페이지 완료": { bar: "bg-blue-400",    chip: "bg-blue-50/70 border-l-blue-400",  text: "text-blue-700" },
  "가격 수정":       { bar: "bg-amber-500",   chip: "bg-amber-50 border-l-amber-500",   text: "text-amber-700" },
  "검토 필요":       { bar: "bg-rose-500",    chip: "bg-rose-50 border-l-rose-500",     text: "text-rose-700" },
  "시즌 종료":       { bar: "bg-slate-500",   chip: "bg-slate-100 border-l-slate-500",  text: "text-slate-700" },
};

// Today's tasks — small block (lower priority)
const todayTasks = [
  { id: 1, label: "스마트스토어 상품 이미지 교체", done: false },
  { id: 2, label: "오픈채팅 공지 발송 확인", done: true },
  { id: 3, label: "쿠팡 판매가 조정 검토", done: false },
  { id: 4, label: "Q&A 미답변 4건 처리", done: false },
];

const issues = [
  { level: "high", title: "재고 부족 임박", desc: "성주참외 32box · 7일 내 소진 예상", category: "품절" },
  { level: "mid", title: "한라봉 자사몰 등록 누락", desc: "스마트스토어만 등록됨", category: "등록 누락" },
];

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────

export default function StoreOpsHome() {
  const [cursor, setCursor] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [seasonFilter, setSeasonFilter] = useState<Season | "all">("all");

  const calItems = useMemo(deriveEvents, []);
  const grid = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const monthLabel = `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`;
  const monthEvents = calItems.filter((c) => {
    const d = new Date(c.date);
    return d.getFullYear() === cursor.getFullYear() && d.getMonth() === cursor.getMonth();
  });

  // Counts derived from shared data — guarantees parity with destination pages
  const counts = {
    selling:        countBy("selling"),
    prepping:       countBy("prepping"),
    upcoming:       countBy("upcoming"),
    endingSoon:     countBy("endingSoon"),
    lowStock:       countBy("lowStock"),
    pendingUpload:  countBy("pendingUpload"),
    needsFix:       countBy("needsFix"),
    recurring:      countBy("recurring"),
  };

  const tasksRemaining = todayTasks.filter((t) => !t.done).length;
  const seasonNow = currentSeason();

  return (
    <PageShell
      icon={Store}
      eyebrow="DASH BOARD"
      title="대시보드"
      subtitle="상품 · 재고 · 업무 준비를 한 화면에서"
      maxWidth="1300px"
    >
      {/* ───── Top quick-stat strip ───── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        <QuickStat label="이번 달 일정" value={monthEvents.length} sub="캘린더 등록" tone="brand" />
        <QuickStat label="오픈 임박" value={counts.upcoming} sub="시즌 D-30 이내" tone="brand" />
        <QuickStat label="조치 필요" value={counts.lowStock + counts.pendingUpload + counts.needsFix} sub="재고/업로드/수정" tone="warn" />
        <QuickStat label="현재 시즌" value={SEASON_LABEL[seasonNow]} sub={`${TODAY.getFullYear()} 운영`} tone="muted" />
      </div>

      {/* ───── 1. Monthly calendar ───── */}
      <SectionLabel
        title="상품 운영 캘린더"
        right={
          <SeasonChips
            value={seasonFilter}
            onChange={setSeasonFilter}
          />
        }
      />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="mb-8 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 hover:border-[#0047CC] hover:bg-blue-50/40 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <h2 className="text-sm font-extrabold text-slate-900 tabular-nums min-w-[100px] text-center">
                {monthLabel}
              </h2>
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 hover:border-[#0047CC] hover:bg-blue-50/40 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <button
                onClick={() => setCursor(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))}
                className="ml-1 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-[#0047CC] hover:bg-blue-50/40 transition-colors"
              >
                오늘
              </button>
            </div>
            <div className="text-[11px] font-bold text-slate-500">
              월 일정 <span className="text-[#0047CC]">{monthEvents.length}건</span>
            </div>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/40">
            {["일", "월", "화", "수", "목", "금", "토"].map((w, i) => (
              <div
                key={w}
                className={cn(
                  "px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider",
                  i === 0 ? "text-rose-500" : i === 6 ? "text-[#0047CC]" : "text-slate-500"
                )}
              >
                {w}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7">
            {grid.map((cell, idx) => {
              const day = cell.date;
              const inMonth = cell.inMonth;
              const isToday = isSameDay(day, TODAY);
              const dayKey = toKey(day);
              const events = calItems.filter((c) => c.date === dayKey);
              const visible = events.slice(0, 3);
              const more = events.length - visible.length;

              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[88px] border-r border-b border-slate-100 p-1.5 flex flex-col gap-1",
                    !inMonth && "bg-slate-50/40",
                    idx % 7 === 6 && "border-r-0"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center text-[11px] font-bold tabular-nums w-5 h-5 rounded-md",
                        isToday
                          ? "bg-[#0047CC] text-white"
                          : !inMonth
                          ? "text-slate-300"
                          : day.getDay() === 0
                          ? "text-rose-500"
                          : day.getDay() === 6
                          ? "text-[#0047CC]"
                          : "text-slate-700"
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {events.length > 0 && (
                      <span className="text-[9px] font-bold text-slate-400">{events.length}</span>
                    )}
                  </div>

                  <div className="space-y-0.5 flex-1">
                    {visible.map((e, i) => {
                      const meta = KIND_META[e.kind];
                      return (
                        <Link
                          key={i}
                          href={e.href}
                          title={`${e.kind} · ${e.label}`}
                          className={cn(
                            "block pl-1.5 pr-1 py-[2px] rounded-r-[3px] border-l-[3px] hover:brightness-[0.97] transition-all",
                            meta.chip
                          )}
                        >
                          <span className={cn("text-[10px] font-bold leading-tight truncate block", meta.text)}>
                            {e.label}
                          </span>
                        </Link>
                      );
                    })}
                    {more > 0 && (
                      <span className="block text-[10px] font-extrabold text-slate-500 pl-1.5">+{more}건</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-x-3.5 gap-y-1 flex-wrap text-[10px]">
              {(Object.keys(KIND_META) as CalKind[]).map((k) => {
                const m = KIND_META[k];
                return (
                  <span key={k} className="inline-flex items-center gap-1.5 text-slate-600 font-semibold">
                    <span className={cn("w-2.5 h-[3px] rounded-full", m.bar)} />
                    {k}
                  </span>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ───── 2. Seasonal product summary ───── */}
      <SectionLabel
        title="상품관리 요약"
        hint="시즌 상품 중심"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <SummaryCard
          icon={<Box className="w-3.5 h-3.5" />}
          label="판매중 시즌상품"
          count={counts.selling}
          sub="활성 매출"
          href="/app/tools/store-ops/products?status=판매중"
          emphasize
        />
        <SummaryCard
          icon={<Sparkles className="w-3.5 h-3.5" />}
          label="시즌 준비중 상품"
          count={counts.prepping}
          sub="런칭 대기"
          href="/app/tools/store-ops/products?status=시즌 준비중"
        />
        <SummaryCard
          icon={<CalendarClock className="w-3.5 h-3.5" />}
          label="시즌 오픈 예정"
          count={counts.upcoming}
          sub="D-30 이내"
          href="/app/tools/store-ops/checklist"
        />
        <SummaryCard
          icon={<CalendarX className="w-3.5 h-3.5" />}
          label="시즌 종료 예정"
          count={counts.endingSoon}
          sub="잔여 소진 임박"
          href="/app/tools/store-ops/products?status=시즌 종료 예정"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <SummaryCard
          icon={<PackageX className="w-3.5 h-3.5" />}
          label="재고 부족 시즌상품"
          count={counts.lowStock}
          sub="안전재고 미달"
          href="/app/tools/store-ops/inventory"
          warn
        />
        <SummaryCard
          icon={<LayoutIcon className="w-3.5 h-3.5" />}
          label="업로드 대기"
          count={counts.pendingUpload}
          sub="미등록 / 준비중"
          href="/app/tools/store-ops/uploads?status=pending"
        />
        <SummaryCard
          icon={<Pencil className="w-3.5 h-3.5" />}
          label="수정 필요"
          count={counts.needsFix}
          sub="가격/검토 필요"
          href="/app/tools/store-ops/uploads?status=fix"
          warn
        />
        <SummaryCard
          icon={<History className="w-3.5 h-3.5" />}
          label="지난 시즌 참고"
          count={counts.recurring}
          sub="반복 시즌상품"
          href="/app/tools/store-ops/history"
          muted
        />
      </div>

      {/* ───── 3. Lower modules — today + issues ───── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">오늘 해야 할 작업</h3>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 rounded">
                  {tasksRemaining}건 남음
                </span>
              </div>
              <Link href="/app/tools/store-ops/board" className="text-[11px] font-bold text-[#0047CC] inline-flex items-center gap-1">
                전체 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ul className="space-y-1">
              {todayTasks.slice(0, 4).map((t) => (
                <li key={t.id}>
                  <Link
                    href="/app/tools/store-ops/board"
                    className={cn(
                      "flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors",
                      t.done ? "opacity-40" : "hover:bg-blue-50/40"
                    )}
                  >
                    <div
                      className={cn(
                        "w-3.5 h-3.5 rounded-md border-2 flex-shrink-0 flex items-center justify-center",
                        t.done ? "bg-[#0047CC] border-[#0047CC]" : "border-slate-300"
                      )}
                    >
                      {t.done && (
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={cn("text-[13px]", t.done ? "line-through text-slate-400" : "text-slate-700")}>
                      {t.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <GlassCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">이슈 / 알림</h3>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 rounded">
                  {issues.length}건
                </span>
              </div>
              <Link href="/app/tools/store-ops/issues" className="text-[11px] font-bold text-[#0047CC] inline-flex items-center gap-1">
                전체 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ul className="space-y-2">
              {issues.map((i) => (
                <li key={i.title}>
                  <Link
                    href="/app/tools/store-ops/issues"
                    className="block p-3 rounded-xl border border-slate-200 hover:border-[#0047CC] hover:bg-blue-50/30 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("w-1.5 h-1.5 rounded-full", i.level === "high" ? "bg-rose-500" : "bg-amber-500")} />
                      <p className="text-[13px] font-bold text-slate-900">{i.title}</p>
                      <span className="ml-auto text-[10px] font-bold text-slate-400">#{i.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{i.desc}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>
      </div>

      <RelatedTools
        items={[
          { label: "SNS 콘텐츠", href: "/app/tools/sns" },
          { label: "상세페이지", href: "/app/tools/detail-page" },
          { label: "광고 설정", href: "/app/tools/ads" },
          { label: "수익 분석", href: "/app/tools/margin" },
          { label: "CRM", href: "/app/tools/crm" },
        ]}
      />
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function SectionLabel({ title, right, hint }: { title: string; right?: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-end justify-between mb-2.5">
      <div className="flex items-baseline gap-2">
        <p className="text-[11px] font-extrabold text-slate-700 uppercase tracking-[0.18em]">{title}</p>
        {hint && <span className="text-[10px] font-semibold text-slate-400">{hint}</span>}
      </div>
      {right}
    </div>
  );
}

function QuickStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number | string;
  sub: string;
  tone: "brand" | "warn" | "muted";
}) {
  const styles = {
    brand: "bg-white border-slate-200 text-slate-900",
    warn:  "bg-white border-slate-200 text-rose-700",
    muted: "bg-slate-50 border-slate-200 text-slate-700",
  };
  return (
    <div className={cn("rounded-2xl border p-3.5 flex items-center justify-between", styles[tone])}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className={cn("text-2xl font-extrabold mt-1 tabular-nums", tone === "warn" && "text-rose-600", tone === "brand" && "text-[#0047CC]")}>
          {value}
        </p>
      </div>
      <p className="text-[10px] text-slate-400 font-semibold text-right max-w-[80px]">{sub}</p>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  count,
  sub,
  href,
  emphasize = false,
  warn = false,
  muted = false,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  sub: string;
  href: string;
  emphasize?: boolean;
  warn?: boolean;
  muted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-2xl border p-4 transition-all hover:-translate-y-0.5",
        emphasize
          ? "bg-[#0047CC] border-[#0047CC] text-white shadow-md shadow-[#0047CC]/25 hover:shadow-[#0047CC]/35"
          : muted
          ? "bg-slate-50 border-slate-200 hover:border-[#0047CC]"
          : "bg-white border-slate-200 hover:border-[#0047CC] hover:shadow-sm"
      )}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className={cn(
          emphasize ? "text-blue-100" : warn ? "text-rose-500" : "text-slate-500"
        )}>
          {icon}
        </span>
        <p className={cn("text-[11px] font-bold uppercase tracking-wider", emphasize ? "text-blue-100" : "text-slate-500")}>
          {label}
        </p>
      </div>
      <p
        className={cn(
          "text-3xl font-extrabold tracking-tight tabular-nums",
          emphasize ? "text-white" : warn ? "text-rose-600" : "text-slate-900"
        )}
      >
        {count}
      </p>
      <p className={cn("text-[10px] mt-1 font-semibold", emphasize ? "text-blue-100/80" : "text-slate-400")}>{sub}</p>
    </Link>
  );
}

function SeasonChips({ value, onChange }: { value: Season | "all"; onChange: (v: Season | "all") => void }) {
  const opts: { key: Season | "all"; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "spring", label: "봄" },
    { key: "summer", label: "여름" },
    { key: "autumn", label: "가을" },
    { key: "winter", label: "겨울" },
  ];
  return (
    <div className="flex items-center gap-1">
      {opts.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            "px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors",
            value === o.key
              ? "bg-[#0047CC] text-white border-[#0047CC]"
              : "bg-white text-slate-500 border-slate-200 hover:border-[#0047CC]"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function buildMonthGrid(cursor: Date) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const start = new Date(year, month, 1 - startWeekday);
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === month });
  }
  return cells;
}

function toKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
