"use client";

import { motion } from "framer-motion";
import { Tag, Plus, CalendarRange, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

const promos = [
  { name: "봄맞이 신상품 10% 할인", status: "진행 중", statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-200", dates: "4/15 ~ 4/21", discount: "10%", channels: ["스마트스토어", "쿠팡"], sold: 82 },
  { name: "회원 전용 얼리버드", status: "준비 중", statusStyle: "bg-blue-50 text-blue-700 border-blue-200", dates: "4/22 ~ 4/28", discount: "15%", channels: ["스마트스토어"], sold: 0 },
  { name: "5월 가정의 달 기획전", status: "기획 중", statusStyle: "bg-amber-50 text-amber-700 border-amber-200", dates: "5/1 ~ 5/9", discount: "20%", channels: ["전채널"], sold: 0 },
  { name: "4월 회원 쿠폰", status: "종료", statusStyle: "bg-slate-100 text-slate-500 border-slate-200", dates: "4/1 ~ 4/14", discount: "5%", channels: ["스마트스토어", "인스타"], sold: 124 },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function PromotionsPage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Tag className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Store Operations</p>
            <h1 className="text-xl font-bold text-slate-800">프로모션 관리</h1>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> 프로모션 등록
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {promos.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GC className="p-5 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <Percent className="w-4 h-4 text-emerald-600" />
                </div>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", p.statusStyle)}>{p.status}</span>
              </div>
              <p className="text-sm font-bold text-slate-800 mb-2 leading-snug">{p.name}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-3">
                <CalendarRange className="w-3 h-3" />{p.dates}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {p.channels.map(c => (
                    <span key={c} className="text-[9px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-emerald-600 tabular-nums">{p.discount}</p>
                  <p className="text-[10px] text-slate-400">{p.sold > 0 ? `${p.sold}건 판매` : "대기"}</p>
                </div>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
