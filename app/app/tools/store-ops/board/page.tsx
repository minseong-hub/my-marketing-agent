"use client";

import { motion } from "framer-motion";
import { ClipboardList, Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const columns = [
  { id: "todo", label: "예정", color: "text-slate-500", items: [
      { t: "제주 한라봉 상세페이지 카피 최종 검수", tag: "상세페이지", prio: "high" },
      { t: "5월 가정의 달 프로모션 기획", tag: "프로모션", prio: "mid" },
      { t: "쿠팡 상품군 카테고리 재정비", tag: "운영", prio: "low" },
  ]},
  { id: "doing", label: "진행중", color: "text-blue-600", items: [
      { t: "스마트스토어 이미지 11컷 교체", tag: "상세페이지", prio: "high" },
      { t: "오픈채팅 공지 템플릿 작성", tag: "CRM", prio: "mid" },
      { t: "배송사 단가 재협상", tag: "운영", prio: "mid" },
  ]},
  { id: "done", label: "완료", color: "text-emerald-600", items: [
      { t: "4월 회원 쿠폰 발송 완료", tag: "프로모션", prio: "mid" },
      { t: "상품 원가 엑셀 재정리", tag: "운영", prio: "low" },
  ]},
];
const PRIO: Record<string, string> = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  mid: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-500 border-slate-200",
};
function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function BoardPage() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ClipboardList className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Store Operations</p>
            <h1 className="text-xl font-bold text-slate-800">운영 보드</h1>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 text-xs font-semibold transition-colors">
          <Plus className="w-3.5 h-3.5" /> 새 태스크
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col, ci) => (
          <motion.div key={col.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.07 }}>
            <GC className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <p className={cn("text-xs font-bold uppercase tracking-wider", col.color)}>{col.label}</p>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">{col.items.length}</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2">
                {col.items.map((it, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-all cursor-pointer">
                    <p className="text-xs text-slate-700 leading-relaxed mb-2.5">{it.t}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">#{it.tag}</span>
                      <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", PRIO[it.prio])}>
                        {it.prio === "high" ? "긴급" : it.prio === "mid" ? "보통" : "낮음"}
                      </span>
                    </div>
                  </div>
                ))}
                <button className="w-full flex items-center justify-center gap-1 py-2 rounded-xl border border-dashed border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-200 text-xs font-medium transition-colors">
                  <Plus className="w-3 h-3" /> 카드 추가
                </button>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
