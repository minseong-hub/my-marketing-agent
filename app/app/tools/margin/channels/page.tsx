"use client";

import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const channels = [
  { name: "스마트스토어", revenue: 2180000, margin: 28.5, roas: 340, color: "from-green-500 to-emerald-600", pct: 51 },
  { name: "쿠팡", revenue: 1320000, margin: 18.2, roas: 220, color: "from-sky-500 to-blue-600", pct: 31 },
  { name: "인스타그램 쇼핑", revenue: 480000, margin: 22.0, roas: 280, color: "from-pink-500 to-rose-500", pct: 11 },
  { name: "오픈채팅 주문", revenue: 240000, margin: 35.0, roas: 520, color: "from-amber-500 to-orange-500", pct: 6 },
  { name: "네이버 블로그", revenue: 60000, margin: 18.0, roas: 140, color: "from-lime-500 to-green-500", pct: 1 },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function ChannelsPage() {
  const total = channels.reduce((a, c) => a + c.revenue, 0);

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Layers className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Margin & Revenue</p>
          <h1 className="text-xl font-bold text-slate-800">채널별 성과</h1>
        </div>
      </motion.div>

      {/* Stacked bar total */}
      <GC className="p-5 mb-4">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">이번 달 총 매출</p>
          <p className="text-2xl font-extrabold text-slate-800 tabular-nums">₩{total.toLocaleString()}</p>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {channels.map(c => (
            <div key={c.name} className={cn("bg-gradient-to-r", c.color)} style={{ width: `${c.pct}%` }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {channels.map(c => (
            <div key={c.name} className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full bg-gradient-to-br", c.color)} />
              <span className="text-[10px] text-slate-600">{c.name}</span>
              <span className="text-[10px] text-slate-400 tabular-nums">{c.pct}%</span>
            </div>
          ))}
        </div>
      </GC>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {channels.map((c, i) => (
          <motion.div key={c.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GC className="p-5 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer h-full">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-slate-800">{c.name}</p>
                <div className={cn("w-2 h-2 rounded-full bg-gradient-to-br", c.color)} />
              </div>
              <p className="text-xl font-extrabold text-slate-800 tabular-nums mb-4">₩{c.revenue.toLocaleString()}</p>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">마진율</p>
                  <p className={cn("text-sm font-bold tabular-nums", c.margin >= 25 ? "text-emerald-600" : c.margin >= 15 ? "text-amber-600" : "text-rose-600")}>{c.margin}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">ROAS</p>
                  <p className="text-sm font-bold text-slate-800 tabular-nums">{c.roas}%</p>
                </div>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
