"use client";

import { motion } from "framer-motion";
import { Archive, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const history = [
  { date: "2026-04-14", items: [
    { action: "상품 등록", target: "성주참외 3kg", by: "관리자", status: "완료" },
    { action: "이미지 교체", target: "감귤 선물세트", by: "관리자", status: "완료" },
  ]},
  { date: "2026-04-13", items: [
    { action: "쿠폰 발송", target: "회원 247명", by: "자동화", status: "완료" },
    { action: "프로모션 시작", target: "봄맞이 10% 할인", by: "관리자", status: "완료" },
  ]},
  { date: "2026-04-12", items: [
    { action: "재고 입고", target: "한라봉 5kg 200box", by: "관리자", status: "완료" },
    { action: "가격 조정", target: "딸기 2kg → 32,000원", by: "관리자", status: "완료" },
    { action: "리뷰 답변 일괄", target: "12건", by: "AI", status: "완료" },
  ]},
  { date: "2026-04-11", items: [
    { action: "상품 판매 시작", target: "감귤 선물세트", by: "관리자", status: "완료" },
  ]},
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function HistoryPage() {
  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Archive className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Store Operations</p>
          <h1 className="text-xl font-bold text-slate-800">운영 기록</h1>
        </div>
      </motion.div>

      <div className="space-y-5">
        {history.map((day, di) => (
          <motion.div key={day.date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.06 }}>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full tabular-nums">{day.date}</p>
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[10px] text-slate-400">{day.items.length}건</span>
            </div>
            <GC className="p-4">
              <div className="space-y-2">
                {day.items.map((it, i) => (
                  <div key={i} className="flex items-start gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        <span className="text-emerald-600">{it.action}</span> · <span className="text-slate-600">{it.target}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">by {it.by}</p>
                    </div>
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
