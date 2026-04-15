"use client";

import { motion } from "framer-motion";
import { BarChart2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const history = [
  { date: "2026-04-14", campaign: "봄 신상품 인스타 광고", spend: 48000, revenue: 163200, roas: 340, up: true },
  { date: "2026-04-13", campaign: "스마트스토어 키워드 광고", spend: 28000, revenue: 61600, roas: 220, up: true },
  { date: "2026-04-12", campaign: "메타 리타겟팅", spend: 14000, revenue: 25200, roas: 180, up: false },
  { date: "2026-04-11", campaign: "카카오 비즈보드", spend: 10000, revenue: 52000, roas: 520, up: true },
  { date: "2026-04-10", campaign: "봄 신상품 인스타 광고", spend: 42000, revenue: 134400, roas: 320, up: true },
  { date: "2026-04-09", campaign: "스마트스토어 키워드 광고", spend: 26000, revenue: 52000, roas: 200, up: false },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function PerformancePage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <BarChart2 className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">Ad Automation</p>
          <h1 className="text-xl font-bold text-slate-800">성과 기록</h1>
        </div>
      </motion.div>

      <GC className="overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2">날짜</div>
          <div className="col-span-5">캠페인</div>
          <div className="col-span-2 text-right">광고비</div>
          <div className="col-span-2 text-right">매출</div>
          <div className="col-span-1 text-right">ROAS</div>
        </div>
        {history.map((h, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            className="grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors items-center">
            <div className="col-span-2"><p className="text-xs text-slate-600 tabular-nums">{h.date}</p></div>
            <div className="col-span-5"><p className="text-sm font-semibold text-slate-800">{h.campaign}</p></div>
            <div className="col-span-2 text-right"><p className="text-xs text-slate-600 tabular-nums">₩{h.spend.toLocaleString()}</p></div>
            <div className="col-span-2 text-right"><p className="text-xs font-bold text-slate-800 tabular-nums">₩{h.revenue.toLocaleString()}</p></div>
            <div className="col-span-1 text-right">
              <div className="inline-flex items-center gap-0.5">
                {h.up ? <TrendingUp className="w-3 h-3 text-emerald-600" /> : <TrendingDown className="w-3 h-3 text-rose-600" />}
                <span className={cn("text-xs font-bold tabular-nums", h.roas >= 300 ? "text-emerald-600" : h.roas >= 150 ? "text-amber-600" : "text-rose-600")}>{h.roas}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </GC>
    </div>
  );
}
