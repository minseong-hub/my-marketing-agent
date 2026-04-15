"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PenLine, Sparkles, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const generated = [
  { variant: "A", tone: "감성형", text: "봄의 시작, 제철 참외가 도착했어요. 회원 전용 5% 할인" },
  { variant: "B", tone: "직설형", text: "당도 13Brix 이상만. 지금 사면 20% 할인" },
  { variant: "C", tone: "후킹형", text: "봄 과일 1등, 직접 먹어보고 결정하세요" },
  { variant: "D", tone: "혜택형", text: "첫 구매 회원 추가 10%, 오늘만" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function AdCopyPage() {
  const [product, setProduct] = useState("성주참외 3kg");
  const [target, setTarget] = useState("30~50대 주부");
  const [tone, setTone] = useState("친근");

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <PenLine className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">Ad Automation</p>
          <h1 className="text-xl font-bold text-slate-800">광고 문구 생성</h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <GC className="p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">입력</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">상품명</label>
                <input value={product} onChange={e => setProduct(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-rose-300" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">타겟 고객</label>
                <input value={target} onChange={e => setTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-rose-300" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">톤앤매너</label>
                <div className="flex flex-wrap gap-1.5">
                  {["친근", "프리미엄", "감성", "후킹"].map(t => (
                    <button key={t} onClick={() => setTone(t)}
                      className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border",
                        tone === t ? "bg-rose-100 text-rose-600 border-rose-200" : "bg-slate-50 text-slate-500 border-slate-200")}>{t}</button>
                  ))}
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-rose-100 hover:bg-rose-100 border border-rose-200 text-rose-700 text-sm font-bold transition-colors">
                <Sparkles className="w-4 h-4" /> AI 카피 생성
              </button>
            </div>
          </GC>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
          <GC className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">생성된 카피</p>
              <span className="text-[10px] text-slate-400">{generated.length}개 변형</span>
            </div>
            <div className="space-y-2">
              {generated.map(g => (
                <div key={g.variant} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-rose-200 transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-extrabold text-rose-600">{g.variant}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-rose-600 mb-1 uppercase tracking-wider">{g.tone}</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{g.text}</p>
                  </div>
                  <button className="text-slate-300 group-hover:text-rose-600 transition-colors flex-shrink-0"><Copy className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </GC>
        </motion.div>
      </div>
    </div>
  );
}
