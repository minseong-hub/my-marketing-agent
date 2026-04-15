"use client";

import { motion } from "framer-motion";
import { CalendarDays, Plus, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const products = [
  { name: "성주참외 3kg", dDay: 3, launch: "2026-04-18", channel: "스마트스토어", stage: "상세 제작", stageStyle: "bg-blue-50 text-blue-700 border-blue-200", progress: 70 },
  { name: "제주 한라봉 5kg", dDay: 10, launch: "2026-04-25", channel: "쿠팡", stage: "이미지 준비", stageStyle: "bg-amber-50 text-amber-700 border-amber-200", progress: 45 },
  { name: "청정 딸기 2kg", dDay: 21, launch: "2026-05-06", channel: "전채널", stage: "기획", stageStyle: "bg-slate-100 text-slate-500 border-slate-200", progress: 15 },
  { name: "감귤 선물세트", dDay: -4, launch: "2026-04-11", channel: "스마트스토어", stage: "판매중", stageStyle: "bg-emerald-50 text-emerald-700 border-emerald-200", progress: 100 },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function SchedulePage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CalendarDays className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Store Operations</p>
            <h1 className="text-xl font-bold text-slate-800">상품 일정 관리</h1>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> 상품 등록
        </button>
      </motion.div>

      <div className="space-y-3">
        {products.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GC className="p-5 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-bold text-slate-800">{p.name}</p>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", p.stageStyle)}>{p.stage}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">출시 {p.launch} · {p.channel}</p>
                  <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className={cn("text-lg font-extrabold", p.dDay < 0 ? "text-emerald-600" : p.dDay <= 7 ? "text-amber-600" : "text-slate-600")}>
                    {p.dDay < 0 ? "판매중" : `D-${p.dDay}`}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 tabular-nums">{p.progress}%</p>
                </div>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
