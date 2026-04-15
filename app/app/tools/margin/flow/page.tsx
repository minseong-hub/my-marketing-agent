"use client";

import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const months = [
  { label: "11월", rev: 3200, profit: 720 },
  { label: "12월", rev: 4100, profit: 850 },
  { label: "1월", rev: 3600, profit: 760 },
  { label: "2월", rev: 2900, profit: 620 },
  { label: "3월", rev: 3820, profit: 820 },
  { label: "4월", rev: 4280, profit: 920, isCurrent: true },
];
const maxRev = Math.max(...months.map(m => m.rev));

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function FlowPage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <TrendingUp className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Margin & Revenue</p>
          <h1 className="text-xl font-bold text-slate-800">흐름 분석</h1>
        </div>
      </motion.div>

      {/* Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {[
          { label: "이번 달 매출", val: "₩4,280,000", trend: "+12%", sub: "vs 3월" },
          { label: "이번 달 순이익", val: "₩920,000", trend: "+12%", sub: "마진율 21.5%" },
          { label: "3개월 평균", val: "₩3,667,000", trend: "+8%", sub: "2~4월" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GC className="p-4">
              <p className="text-[11px] text-slate-500 mb-1.5">{s.label}</p>
              <p className="text-xl font-extrabold text-slate-800 tabular-nums mb-1.5">{s.val}</p>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-600">{s.trend}</span>
                <span className="text-[10px] text-slate-400 ml-1">{s.sub}</span>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GC className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-bold text-slate-800">월별 매출 & 순이익 흐름</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-amber-500" /><span className="text-[10px] text-slate-500">매출</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-emerald-500" /><span className="text-[10px] text-slate-500">순이익</span></div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-64 px-2">
            {months.map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                className="flex-1 flex flex-col items-center gap-1.5 origin-bottom">
                <div className="relative w-full flex items-end justify-center gap-1 flex-1">
                  <div className={cn("w-3 rounded-t", m.isCurrent ? "bg-gradient-to-t from-amber-500 to-amber-300" : "bg-amber-500/50")}
                    style={{ height: `${(m.rev / maxRev) * 100}%` }} />
                  <div className={cn("w-3 rounded-t", m.isCurrent ? "bg-gradient-to-t from-emerald-500 to-emerald-300" : "bg-emerald-500/50")}
                    style={{ height: `${(m.profit / maxRev) * 100}%` }} />
                </div>
                <p className={cn("text-[10px] font-semibold", m.isCurrent ? "text-amber-600" : "text-slate-500")}>{m.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-6 gap-2 mt-4 pt-4 border-t border-slate-200 text-center">
            {months.map(m => (
              <div key={m.label}>
                <p className="text-[9px] text-slate-400 mb-0.5">{m.label}</p>
                <p className="text-[10px] font-bold text-slate-600 tabular-nums">{m.rev/1000}k</p>
              </div>
            ))}
          </div>
        </GC>
      </motion.div>
    </div>
  );
}
