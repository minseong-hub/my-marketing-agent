"use client";

import { motion } from "framer-motion";
import { BarChart2, Heart, Eye, MessageCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const results = [
  { title: "성주참외 신상품 티저", platform: "인스타그램", date: "2026-04-10", views: 4820, likes: 312, comments: 28, ctr: "4.2%", trend: "+18%" },
  { title: "봄 과일 블로그 리뷰", platform: "블로그", date: "2026-04-09", views: 1240, likes: 64, comments: 12, ctr: "3.1%", trend: "+5%" },
  { title: "회원 혜택 공지", platform: "오픈채팅", date: "2026-04-08", views: 218, likes: 0, comments: 41, ctr: "—", trend: "+12%" },
  { title: "프로모션 카드뉴스 5장", platform: "인스타그램", date: "2026-04-07", views: 3210, likes: 186, comments: 15, ctr: "3.8%", trend: "+9%" },
  { title: "스레드 후기 모음", platform: "스레드", date: "2026-04-06", views: 680, likes: 42, comments: 8, ctr: "2.4%", trend: "-3%" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function ResultsPage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <BarChart2 className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">SNS Marketing</p>
          <h1 className="text-xl font-bold text-slate-800">업로드 결과 기록</h1>
        </div>
      </motion.div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { icon: Eye, label: "총 노출", val: "10,168", color: "text-blue-600" },
          { icon: Heart, label: "좋아요", val: "604", color: "text-rose-600" },
          { icon: MessageCircle, label: "댓글", val: "104", color: "text-amber-600" },
          { icon: TrendingUp, label: "평균 CTR", val: "3.4%", color: "text-emerald-600" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GC className="p-4">
                <Icon className={cn("w-4 h-4 mb-2", s.color)} />
                <p className="text-xl font-extrabold text-slate-800 tabular-nums mb-0.5">{s.val}</p>
                <p className="text-[11px] text-slate-500">{s.label}</p>
              </GC>
            </motion.div>
          );
        })}
      </div>

      {/* Results list */}
      <div className="space-y-2">
        {results.map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.04 }}>
            <GC className="p-4 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm font-bold text-slate-800 mb-0.5">{r.title}</p>
                  <p className="text-[10px] text-slate-400">{r.platform} · {r.date}</p>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-right"><p className="text-[9px] text-slate-400">노출</p><p className="text-xs font-bold text-slate-800 tabular-nums">{r.views.toLocaleString()}</p></div>
                  <div className="text-right"><p className="text-[9px] text-slate-400">좋아요</p><p className="text-xs font-bold text-rose-600 tabular-nums">{r.likes}</p></div>
                  <div className="text-right"><p className="text-[9px] text-slate-400">댓글</p><p className="text-xs font-bold text-amber-600 tabular-nums">{r.comments}</p></div>
                  <div className="text-right"><p className="text-[9px] text-slate-400">CTR</p><p className="text-xs font-bold text-emerald-600 tabular-nums">{r.ctr}</p></div>
                  <div className="text-right"><p className="text-[9px] text-slate-400">추세</p><p className={cn("text-xs font-bold tabular-nums", r.trend.startsWith("+") ? "text-emerald-600" : "text-rose-600")}>{r.trend}</p></div>
                </div>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
