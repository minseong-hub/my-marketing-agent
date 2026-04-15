"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Layers, PlusCircle, FileText, CheckCircle2, Clock, CalendarDays, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STATS = [
  { label: "이번 달 총 콘텐츠", value: 24, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", href: "/app/tools/sns/contents" },
  { label: "업로드 완료", value: 14, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", href: "/app/tools/sns/results" },
  { label: "검토 필요", value: 4, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", href: "/app/tools/sns/contents" },
  { label: "이번 주 예정", value: 6, icon: CalendarDays, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", href: "/app/tools/sns/calendar" },
];
const today = [
  { title: "성주참외 신상품 티저 이미지", platform: "인스타그램", time: "오후 3시", status: "예약됨" },
  { title: "봄 과일 블로그 리뷰 발행", platform: "블로그", time: "오후 6시", status: "작성중" },
];
const review = [
  { title: "제주 한라봉 오픈채팅 공지 초안", platform: "오픈채팅", edited: "1시간 전" },
  { title: "스레드 짧은 글 — 고객 후기", platform: "스레드", edited: "어제" },
  { title: "틱톡 제품 소개 60초", platform: "틱톡", edited: "어제" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function SnsHome() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">SNS Marketing · 4월 14일 (화)</p>
            <h1 className="text-lg font-bold text-slate-800">오늘도 좋은 콘텐츠를 차분하게 준비해볼까요.</h1>
          </div>
        </div>
        <Link href="/app/tools/sns/create" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 text-xs font-semibold transition-colors">
          <PlusCircle className="w-3.5 h-3.5" /> 새 콘텐츠 등록
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={s.href}>
                <GC className="p-4 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer h-full">
                  <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center mb-3", s.bg, s.border)}>
                    <Icon className={cn("w-4 h-4", s.color)} />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-800 tabular-nums mb-0.5">{s.value}</p>
                  <p className="text-[11px] text-slate-500">{s.label}</p>
                </GC>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GC className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center"><CalendarDays className="w-4 h-4 text-blue-600" /></div>
                <h3 className="text-sm font-bold text-slate-800">오늘 예정 콘텐츠</h3>
              </div>
              <Link href="/app/tools/sns/daily" className="text-[11px] text-blue-600 hover:text-blue-600 font-semibold flex items-center gap-1">전체 <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="space-y-2">
              {today.map((c, i) => (
                <Link key={i} href="/app/tools/sns/contents" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 mb-0.5">{c.title}</p>
                    <p className="text-[10px] text-slate-500">{c.platform} · {c.time}</p>
                  </div>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", c.status === "예약됨" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-amber-50 text-amber-700 border-amber-200")}>
                    {c.status}
                  </span>
                </Link>
              ))}
            </div>
          </GC>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GC className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center"><Clock className="w-4 h-4 text-amber-600" /></div>
                <h3 className="text-sm font-bold text-slate-800">검토 필요</h3>
              </div>
              <Link href="/app/tools/sns/contents" className="text-[11px] text-amber-600 hover:text-amber-600 font-semibold flex items-center gap-1">전체 <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="space-y-2">
              {review.map((c, i) => (
                <Link key={i} href="/app/tools/sns/contents" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 mb-0.5 truncate">{c.title}</p>
                    <p className="text-[10px] text-slate-500">{c.platform} · {c.edited}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                </Link>
              ))}
            </div>
          </GC>
        </motion.div>
      </div>
    </div>
  );
}
