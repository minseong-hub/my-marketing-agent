"use client";

import { motion } from "framer-motion";
import { AlertCircle, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const issues = [
  { id: 1, title: "재고 부족 임박", desc: "성주참외 현재고 32box — 7일 내 소진 예상", severity: "high", status: "미해결", time: "방금 전" },
  { id: 2, title: "미답변 문의 6건", desc: "24시간 이상 미답변 문의가 누적되어 있습니다.", severity: "mid", status: "처리중", time: "2시간 전" },
  { id: 3, title: "쿠팡 로켓 배송 지연", desc: "특정 권역 배송 지연 이슈 발생", severity: "mid", status: "처리중", time: "5시간 전" },
  { id: 4, title: "리뷰 평점 4.2 하락", desc: "딸기 상품군 평점 0.3 하락 감지", severity: "low", status: "미해결", time: "어제" },
  { id: 5, title: "상품 이미지 누락", desc: "한라봉 5kg 대표 이미지 한 컷 누락", severity: "low", status: "완료", time: "2일 전" },
];
const SEV: Record<string, { label: string; style: string; dot: string }> = {
  high: { label: "긴급", style: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  mid: { label: "보통", style: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  low: { label: "낮음", style: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" },
};
const STATUS: Record<string, string> = {
  "미해결": "bg-rose-50 text-rose-700 border-rose-200",
  "처리중": "bg-blue-50 text-blue-700 border-blue-200",
  "완료": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function IssuesPage() {
  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <AlertCircle className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Store Operations</p>
            <h1 className="text-xl font-bold text-slate-800">이슈 / 알림</h1>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> 이슈 등록
        </button>
      </motion.div>

      <div className="space-y-2">
        {issues.map((it, i) => (
          <motion.div key={it.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GC className="p-4 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", SEV[it.severity].dot)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-bold text-slate-800">{it.title}</p>
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", SEV[it.severity].style)}>{SEV[it.severity].label}</span>
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", STATUS[it.status])}>{it.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-2">{it.desc}</p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" /> {it.time}
                  </div>
                </div>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
