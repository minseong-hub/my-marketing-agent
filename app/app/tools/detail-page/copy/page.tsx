"use client";

import { motion } from "framer-motion";
import { PenLine, Sparkles, Copy, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const blocks = [
  { section: "후킹 헤드라인", project: "성주참외 신상품", items: [
    { type: "헤드라인", text: "이 봄, 가장 먼저 만나는 단맛", status: "확정" },
    { type: "서브카피", text: "당도 13Brix 이상, 산지에서 바로 보내드려요", status: "확정" },
    { type: "대안", text: "성주 농부의 20년 내공, 오늘 당신의 식탁으로", status: "검토" },
  ]},
  { section: "상품 특징 3단", project: "성주참외 신상품", items: [
    { type: "특징 1", text: "산지 직송 24시간 배송", status: "확정" },
    { type: "특징 2", text: "당도 선별 13Brix 이상만", status: "작성중" },
    { type: "특징 3", text: "친환경 저탄소 포장재 사용", status: "작성중" },
  ]},
  { section: "구매 이유 CTA", project: "봄 딸기 기획전", items: [
    { type: "CTA", text: "회원 전용 5% 추가 할인, 오늘만", status: "확정" },
  ]},
];
const STATUS: Record<string, string> = {
  확정: "bg-emerald-50 text-emerald-700 border-emerald-200",
  작성중: "bg-amber-50 text-amber-700 border-amber-200",
  검토: "bg-blue-50 text-blue-700 border-blue-200",
};

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function CopyPage() {
  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <PenLine className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-0.5">Detail Page Studio</p>
            <h1 className="text-xl font-bold text-slate-800">카피 작성</h1>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-600 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> AI 카피 생성
        </button>
      </motion.div>

      <div className="space-y-4">
        {blocks.map((b, bi) => (
          <motion.div key={bi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: bi * 0.06 }}>
            <GC className="p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <div>
                  <p className="text-sm font-bold text-slate-800">{b.section}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{b.project}</p>
                </div>
                <button className="flex items-center gap-1 text-[11px] text-violet-600 hover:text-violet-700 font-semibold"><Plus className="w-3 h-3" /> 버전 추가</button>
              </div>
              <div className="space-y-2">
                {b.items.map((it, i) => (
                  <div key={i} className="group flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-violet-200 transition-colors">
                    <span className="text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full flex-shrink-0 uppercase tracking-wider">{it.type}</span>
                    <p className="flex-1 text-sm text-slate-700 leading-relaxed">{it.text}</p>
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border flex-shrink-0", STATUS[it.status])}>{it.status}</span>
                    <button className="text-slate-300 group-hover:text-violet-600 flex-shrink-0"><Copy className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
