"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Store, CheckSquare, AlertCircle, Package, CalendarDays, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const todayTasks = [
  { id: 1, label: "스마트스토어 상품 이미지 교체", priority: "high", done: false },
  { id: 2, label: "오픈채팅 공지 발송 확인", priority: "high", done: true },
  { id: 3, label: "쿠팡 판매가 조정 검토", priority: "mid", done: false },
  { id: 4, label: "Q&A 미답변 4건 처리", priority: "mid", done: false },
  { id: 5, label: "SNS 예약 발행 최종 확인", priority: "low", done: true },
];
const weekDays = [
  { day: "월", date: 14, events: 1 }, { day: "화", date: 15, events: 2, isToday: true },
  { day: "수", date: 16, events: 0 }, { day: "목", date: 17, events: 1 },
  { day: "금", date: 18, events: 1 }, { day: "토", date: 19, events: 1 }, { day: "일", date: 20, events: 0 },
];
const upcomingProducts = [
  { name: "성주참외 3kg", dDay: 3, channel: "스마트스토어" },
  { name: "제주 한라봉 5kg", dDay: 10, channel: "쿠팡" },
  { name: "청정 딸기 2kg", dDay: 21, channel: "전채널" },
];
const issues = [
  { level: "high", title: "재고 부족 임박", desc: "성주참외 현재고 32box — 7일 내 소진 예상" },
  { level: "mid", title: "미답변 문의 6건", desc: "24시간 이상 미답변 문의 누적" },
];
const PRIO = {
  high: "bg-rose-50 text-rose-700 border border-rose-200",
  mid: "bg-amber-50 text-amber-700 border border-amber-200",
  low: "bg-slate-100 text-slate-500 border border-slate-200",
};

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function StoreOpsHome() {
  const done = todayTasks.filter(t => t.done).length;

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Store className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Store Operations · 운영보드</p>
          <h1 className="text-lg font-bold text-slate-800">오늘 스토어 운영, 무엇부터 시작할까요.</h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <GC className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center"><CheckSquare className="w-4 h-4 text-emerald-600" /></div>
                  <h3 className="text-sm font-bold text-slate-800">오늘 해야 할 운영 작업</h3>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{done} / {todayTasks.length} 완료</span>
              </div>
              <div className="h-1 rounded-full bg-slate-100 overflow-hidden mb-4">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(done/todayTasks.length)*100}%` }} />
              </div>
              <div className="space-y-1">
                {todayTasks.map(t => (
                  <Link key={t.id} href="/app/tools/store-ops/board" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors", t.done ? "opacity-40" : "hover:bg-white cursor-pointer")}>
                    <div className={cn("w-[16px] h-[16px] rounded-full border-2 flex-shrink-0 flex items-center justify-center", t.done ? "bg-emerald-500 border-emerald-500" : "border-slate-300")}>
                      {t.done && <div className="w-1 h-1 rounded-full bg-white" />}
                    </div>
                    <span className={cn("flex-1 text-sm", t.done ? "line-through text-slate-400" : "text-slate-700 font-medium")}>{t.label}</span>
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full", PRIO[t.priority as keyof typeof PRIO])}>
                      {t.priority === "high" ? "긴급" : t.priority === "mid" ? "보통" : "낮음"}
                    </span>
                  </Link>
                ))}
              </div>
            </GC>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GC className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center"><CalendarDays className="w-4 h-4 text-emerald-600" /></div>
                  <h3 className="text-sm font-bold text-slate-800">이번 주 일정</h3>
                </div>
                <Link href="/app/tools/store-ops/schedule" className="text-[11px] text-emerald-600 hover:text-emerald-600 font-semibold flex items-center gap-1">전체보기 <ArrowRight className="w-3 h-3" /></Link>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {weekDays.map(d => (
                  <div key={d.day} className={cn("rounded-xl p-2 text-center border", d.isToday ? "bg-blue-100 border-blue-200" : "bg-slate-50 border-slate-200")}>
                    <p className={cn("text-[10px] font-semibold mb-0.5", d.isToday ? "text-blue-700" : "text-slate-400")}>{d.day}</p>
                    <p className={cn("text-sm font-bold", d.isToday ? "text-slate-800" : "text-slate-600")}>{d.date}</p>
                    <div className="mt-1.5 h-1.5 flex items-center justify-center gap-0.5">
                      {Array.from({ length: d.events }).map((_, i) => <div key={i} className={cn("w-1 h-1 rounded-full", d.isToday ? "bg-white" : "bg-emerald-500/80")} />)}
                    </div>
                  </div>
                ))}
              </div>
            </GC>
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
            <GC className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center"><AlertCircle className="w-4 h-4 text-rose-600" /></div>
                  <h3 className="text-sm font-bold text-slate-800">긴급 이슈</h3>
                </div>
                <Link href="/app/tools/store-ops/issues" className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">{issues.length}건</Link>
              </div>
              <div className="space-y-2">
                {issues.map(i => (
                  <Link key={i.title} href="/app/tools/store-ops/issues" className={cn("block p-3 rounded-xl border transition-all hover:scale-[1.01]", i.level === "high" ? "bg-rose-500/10 border-rose-200" : "bg-amber-500/10 border-amber-200")}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={cn("w-1.5 h-1.5 rounded-full", i.level === "high" ? "bg-rose-500" : "bg-amber-500")} />
                      <p className={cn("text-xs font-bold", i.level === "high" ? "text-rose-700" : "text-amber-700")}>{i.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{i.desc}</p>
                  </Link>
                ))}
              </div>
            </GC>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <GC className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center"><Package className="w-4 h-4 text-emerald-600" /></div>
                  <h3 className="text-sm font-bold text-slate-800">오픈 예정 상품</h3>
                </div>
              </div>
              <div className="space-y-2">
                {upcomingProducts.map(p => (
                  <Link key={p.name} href="/app/tools/store-ops/schedule" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-50 transition-colors group">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.channel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">D-{p.dDay}</span>
                      <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-600" />
                    </div>
                  </Link>
                ))}
              </div>
            </GC>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
