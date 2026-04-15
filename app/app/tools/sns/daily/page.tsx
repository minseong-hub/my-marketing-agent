"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DAILY: Record<string, { title: string; platform: string; time: string; status: string; statusStyle: string }[]> = {
  "2026-04-14": [
    { title: "성주참외 신상품 티저", platform: "인스타그램", time: "15:00", status: "업로드 완료", statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { title: "봄 과일 블로그 리뷰", platform: "블로그", time: "18:00", status: "예약됨", statusStyle: "bg-violet-50 text-violet-700 border-violet-200" },
  ],
  "2026-04-15": [
    { title: "오픈채팅 회원 공지", platform: "오픈채팅", time: "10:00", status: "작성중", statusStyle: "bg-amber-50 text-amber-700 border-amber-200" },
    { title: "제주 한라봉 티저", platform: "인스타그램", time: "15:00", status: "아이디어", statusStyle: "bg-slate-100 text-slate-500 border-slate-200" },
    { title: "스레드 짧은 글", platform: "스레드", time: "20:00", status: "검토 필요", statusStyle: "bg-amber-50 text-amber-700 border-amber-200" },
  ],
  "2026-04-16": [],
  "2026-04-17": [
    { title: "프로모션 카드뉴스", platform: "인스타그램", time: "14:00", status: "예약됨", statusStyle: "bg-violet-50 text-violet-700 border-violet-200" },
  ],
};

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function DailyPage() {
  const dates = Object.keys(DAILY).sort();
  const [idx, setIdx] = useState(1);
  const curDate = dates[idx];
  const items = DAILY[curDate] || [];
  const d = new Date(curDate);
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <CalendarCheck className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">SNS Marketing</p>
          <h1 className="text-xl font-bold text-slate-800">일자별 관리</h1>
        </div>
      </motion.div>

      {/* Date selector */}
      <GC className="p-5 mb-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-800 flex items-center justify-center disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="text-[11px] font-semibold text-blue-600 mb-0.5">{d.getFullYear()}년 {d.getMonth() + 1}월</p>
            <p className="text-2xl font-extrabold text-slate-800 tabular-nums">{d.getDate()}일 ({dayNames[d.getDay()]})</p>
          </div>
          <button onClick={() => setIdx(Math.min(dates.length - 1, idx + 1))} disabled={idx === dates.length - 1}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-800 flex items-center justify-center disabled:opacity-30 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </GC>

      {/* Items */}
      {items.length === 0 ? (
        <GC className="p-10 text-center">
          <p className="text-sm text-slate-500 mb-3">이 날 예정된 콘텐츠가 없어요</p>
          <Link href="/app/tools/sns/create" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 text-xs font-semibold">
            새 콘텐츠 등록
          </Link>
        </GC>
      ) : (
        <div className="space-y-2">
          {items.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href="/app/tools/sns/contents">
                <GC className="p-4 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="text-center flex-shrink-0">
                      <p className="text-xs font-bold text-blue-600 tabular-nums">{c.time}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 mb-0.5">{c.title}</p>
                      <p className="text-[11px] text-slate-500">{c.platform}</p>
                    </div>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", c.statusStyle)}>{c.status}</span>
                  </div>
                </GC>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
