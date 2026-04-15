"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const CONTENTS: Record<string, { title: string; color: string }[]> = {
  "2026-04-14": [{ title: "성주참외 티저", color: "bg-pink-500" }, { title: "블로그 리뷰", color: "bg-orange-500" }],
  "2026-04-15": [{ title: "오픈채팅 공지", color: "bg-amber-500" }],
  "2026-04-17": [{ title: "프로모션 카드뉴스", color: "bg-pink-500" }, { title: "스레드 후기", color: "bg-slate-500" }],
  "2026-04-18": [{ title: "신상품 오픈 공지", color: "bg-pink-500" }],
  "2026-04-21": [{ title: "틱톡 제품 소개", color: "bg-red-500" }],
  "2026-04-24": [{ title: "주간 리뷰 모음", color: "bg-orange-500" }],
  "2026-04-28": [{ title: "회원 혜택 공지", color: "bg-amber-500" }, { title: "카드뉴스", color: "bg-pink-500" }],
};

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function CalendarPage() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(4);
  const [sel, setSel] = useState<string | null>(null);

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from<null>({ length: firstDay }).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dateStr = (d: number) => `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const today = "2026-04-15";

  const prev = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); };
  const next = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); };

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <CalendarDays className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">SNS Marketing</p>
            <h1 className="text-xl font-bold text-slate-800">콘텐츠 캘린더</h1>
          </div>
        </div>
        <Link href="/app/tools/sns/create" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> 새 콘텐츠
        </Link>
      </motion.div>

      <GC className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">{year}년 {month}월</h2>
          <div className="flex items-center gap-1">
            <button onClick={prev} className="w-7 h-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => { setYear(2026); setMonth(4); }} className="text-xs font-semibold text-blue-600 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50">오늘</button>
            <button onClick={next} className="w-7 h-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {dayNames.map((d, i) => (
            <div key={d} className={cn("text-center text-xs font-semibold py-2", i === 0 ? "text-rose-600/80" : i === 6 ? "text-blue-600/80" : "text-slate-500")}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-white rounded-xl overflow-hidden">
          {cells.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} className="bg-slate-50 min-h-[90px]" />;
            const key = dateStr(day);
            const items = CONTENTS[key] || [];
            const isToday = key === today;
            const isSel = key === sel;

            return (
              <div key={key} onClick={() => setSel(isSel ? null : key)}
                className={cn("bg-white min-h-[90px] p-1.5 cursor-pointer transition-colors relative", isSel ? "ring-2 ring-inset ring-blue-400" : "hover:bg-slate-50")}>
                <div className={cn("inline-flex items-center justify-center text-[11px] font-semibold w-5 h-5 rounded-full", isToday ? "bg-blue-500 text-slate-800" : "text-slate-600")}>{day}</div>
                <div className="mt-1 space-y-0.5">
                  {items.slice(0, 2).map((c, i) => (
                    <div key={i} className={cn("text-[9px] rounded px-1 py-0.5 truncate text-slate-800 font-medium leading-tight", c.color)}>{c.title}</div>
                  ))}
                  {items.length > 2 && <p className="text-[9px] text-blue-600 font-semibold px-1">+{items.length - 2}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </GC>
    </div>
  );
}
