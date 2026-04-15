"use client";

import { motion } from "framer-motion";
import { PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

const costs = [
  { label: "상품 원가", value: 1850000, pct: 43.2, color: "bg-amber-500", dot: "bg-amber-500" },
  { label: "플랫폼 수수료", value: 680000, pct: 15.9, color: "bg-blue-500", dot: "bg-blue-500" },
  { label: "배송비", value: 560000, pct: 13.1, color: "bg-emerald-500", dot: "bg-emerald-500" },
  { label: "광고비", value: 280000, pct: 6.5, color: "bg-rose-500", dot: "bg-rose-500" },
  { label: "기타 (포장·운영)", value: 190000, pct: 4.4, color: "bg-violet-500", dot: "bg-violet-500" },
  { label: "순이익", value: 720000, pct: 16.8, color: "bg-slate-400", dot: "bg-slate-500" },
];
const total = costs.reduce((a, c) => a + c.value, 0);

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function CostsPage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <PieChart className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Margin & Revenue</p>
          <h1 className="text-xl font-bold text-slate-800">비용 구조 분석</h1>
        </div>
      </motion.div>

      {/* Horizontal stacked bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GC className="p-6 mb-4">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">매출 대비 비용 구조</p>
            <p className="text-xl font-extrabold text-slate-800 tabular-nums">₩{total.toLocaleString()}</p>
          </div>
          <div className="flex h-4 rounded-full overflow-hidden gap-0.5 mb-4">
            {costs.map(c => (
              <div key={c.label} className={c.color} style={{ width: `${c.pct}%` }} title={`${c.label} ${c.pct}%`} />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {costs.map(c => (
              <div key={c.label} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", c.dot)} />
                <span className="text-[11px] text-slate-600 flex-1">{c.label}</span>
                <span className="text-[10px] font-bold text-slate-800 tabular-nums">{c.pct}%</span>
              </div>
            ))}
          </div>
        </GC>
      </motion.div>

      {/* Detailed breakdown */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GC className="p-5">
          <p className="text-sm font-bold text-slate-800 mb-4">항목별 상세</p>
          <div className="space-y-3">
            {costs.map(c => (
              <div key={c.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", c.dot)} />
                    <span className="text-xs text-slate-700 font-medium">{c.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 tabular-nums">{c.pct}%</span>
                    <span className="text-xs font-bold text-slate-800 tabular-nums">₩{c.value.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-1 bg-white rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", c.color)} style={{ width: `${c.pct * 2}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GC>
      </motion.div>
    </div>
  );
}
