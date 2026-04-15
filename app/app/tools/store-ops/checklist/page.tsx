"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const GROUPS = [
  { id: "launch", label: "런칭 준비", items: [
    "상품 상세페이지 제작", "대표 이미지 3종 준비", "SNS 채널 예약 발행",
    "오픈채팅 공지 발송", "초기 재고 수량 확인", "판매가 · 할인가 책정",
  ]},
  { id: "ops", label: "운영 점검", items: [
    "재고 주간 체크", "리뷰 답변 현황 확인", "Q&A 미답변 정리",
    "경쟁사 가격 비교", "배송 품질 점검",
  ]},
  { id: "close", label: "마감 처리", items: [
    "월간 판매 리포트 작성", "정산 내역 확인", "환불 · 반품 내역 정리", "다음 달 기획서 작성",
  ]},
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function ChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    "launch-0": true, "launch-1": true, "launch-3": false,
    "ops-0": true, "ops-2": false, "close-1": true,
  });
  const toggle = (k: string) => setChecked(p => ({ ...p, [k]: !p[k] }));

  const total = GROUPS.reduce((a, g) => a + g.items.length, 0);
  const done = Object.values(checked).filter(Boolean).length;

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckSquare className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Store Operations</p>
          <h1 className="text-xl font-bold text-slate-800">체크리스트</h1>
        </div>
      </motion.div>

      {/* Overall progress */}
      <GC className="p-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-slate-800">전체 진행률</p>
          <p className="text-sm font-extrabold text-emerald-600 tabular-nums">{done} / {total}</p>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all" style={{ width: `${(done/total)*100}%` }} />
        </div>
      </GC>

      <div className="space-y-4">
        {GROUPS.map((g, gi) => {
          const gDone = g.items.filter((_, i) => checked[`${g.id}-${i}`]).length;
          return (
            <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.07 }}>
              <GC className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{g.label}</p>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">{gDone}/{g.items.length}</span>
                </div>
                <div className="space-y-1">
                  {g.items.map((label, i) => {
                    const key = `${g.id}-${i}`;
                    const isDone = checked[key];
                    return (
                      <button key={key} onClick={() => toggle(key)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left", isDone ? "opacity-50" : "hover:bg-white")}>
                        <div className={cn("w-[17px] h-[17px] rounded-md border-2 flex-shrink-0 flex items-center justify-center", isDone ? "bg-emerald-500 border-emerald-500" : "border-slate-300")}>
                          {isDone && <svg className="w-2.5 h-2.5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className={cn("flex-1 text-sm", isDone ? "line-through text-slate-500" : "text-slate-700")}>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </GC>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
