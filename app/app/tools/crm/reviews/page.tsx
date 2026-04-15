"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const reviews = [
  { id: "r1", author: "주*연", rating: 5, content: "정말 달고 맛있어요! 아이들이 너무 좋아해서 바로 재구매했어요.", date: "2026-04-14", replied: false, product: "성주참외 3kg" },
  { id: "r2", author: "이*경", rating: 4, content: "배송이 빠르고 신선해요. 다음에도 주문할게요.", date: "2026-04-13", replied: true, product: "성주참외 3kg" },
  { id: "r3", author: "박*현", rating: 5, content: "처음 구매했는데 맛이 기대 이상이었어요. 강추합니다!", date: "2026-04-12", replied: false, product: "한라봉 5kg" },
  { id: "r4", author: "김*정", rating: 3, content: "맛은 좋은데 포장이 조금 허술해서 아쉬웠어요.", date: "2026-04-11", replied: false, product: "딸기 2kg" },
  { id: "r5", author: "안*미", rating: 5, content: "선물용으로 구매했는데 받으신 분이 너무 좋아하셨어요.", date: "2026-04-10", replied: true, product: "감귤 선물세트" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function ReviewsPage() {
  const [filter, setFilter] = useState("전체");
  const list = reviews.filter(r => filter === "전체" || (filter === "미답변" ? !r.replied : r.replied));

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Star className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-0.5">CRM & Reviews</p>
          <h1 className="text-xl font-bold text-slate-800">리뷰 관리</h1>
        </div>
      </motion.div>

      <div className="flex gap-1.5 mb-4">
        {["전체", "미답변", "답변 완료"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors",
              filter === f ? "bg-sky-100 text-sky-600 border-sky-200" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-50")}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {list.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link href={`/app/tools/crm/reviews/${r.id}`}>
              <GC className="p-4 hover:bg-slate-50 hover:border-sky-200 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-800">{r.author}</span>
                    <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-600" />)}</div>
                    <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">{r.product}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 tabular-nums">{r.date}</span>
                    {r.replied
                      ? <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-semibold">답변 완료</span>
                      : <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-full font-semibold">미답변</span>}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{r.content}</p>
              </GC>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
