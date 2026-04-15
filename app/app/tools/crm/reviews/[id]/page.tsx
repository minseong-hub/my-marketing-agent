"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Star, Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const aiSuggestion = "주연 님, 따뜻한 후기 정말 감사드립니다! 아이들이 너무 좋아해주셔서 저희도 뿌듯해요. 앞으로도 늘 가장 달고 신선한 제철 과일만 엄선해서 보내드릴게요. 다음에 또 만나요 🧡";

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function ReviewDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [reply, setReply] = useState("");

  return (
    <div className="p-6 max-w-[800px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <Link href="/app/tools/crm/reviews" className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-0.5">리뷰 #{id}</p>
          <h1 className="text-lg font-bold text-slate-800">리뷰 답변 작성</h1>
        </div>
      </motion.div>

      {/* Original review */}
      <GC className="p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">주*연</span>
            <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-600" />)}</div>
            <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">성주참외 3kg</span>
          </div>
          <span className="text-[10px] text-slate-400">2026-04-14</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">정말 달고 맛있어요! 아이들이 너무 좋아해서 바로 재구매했어요. 포장도 꼼꼼하게 되어 있어서 받자마자 신선한 느낌 그대로였습니다. 다음에도 꼭 구매할게요!</p>
      </GC>

      {/* AI suggestion */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GC className="p-5 mb-4 border border-sky-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <p className="text-sm font-bold text-sky-600">AI 추천 답변</p>
            </div>
            <button onClick={() => setReply(aiSuggestion)} className="text-[11px] text-sky-600 hover:text-sky-700 font-semibold px-2 py-1 rounded-lg hover:bg-sky-50 transition-colors">이 답변 사용</button>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed italic">{aiSuggestion}</p>
        </GC>
      </motion.div>

      {/* Reply box */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <GC className="p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">내 답변</p>
          <textarea value={reply} onChange={e => setReply(e.target.value)} rows={6} placeholder="답변을 작성해주세요..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-300 resize-none mb-3" />
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-100 hover:bg-sky-100 border border-sky-200 text-sky-700 text-sm font-bold transition-colors">
              <Send className="w-4 h-4" /> 답변 등록
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm font-semibold transition-colors">
              임시 저장
            </button>
          </div>
        </GC>
      </motion.div>
    </div>
  );
}
