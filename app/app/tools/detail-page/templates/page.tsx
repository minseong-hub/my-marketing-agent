"use client";

import { motion } from "framer-motion";
import { LayoutTemplate, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const templates = [
  { name: "농산물 기본 구조 A", desc: "제철 농산물에 최적화된 7단 구조", sections: ["후킹", "스토리", "특징 3단", "후기", "FAQ", "CTA", "신뢰 배지"], uses: 3, best: true },
  { name: "신뢰 강조형 구조", desc: "인증·수상 중심의 신뢰 빌드업 구조", sections: ["문제 제기", "해결 솔루션", "인증 배지", "수상 내역", "전문가 추천", "CTA"], uses: 2 },
  { name: "감성 스토리텔링형", desc: "브랜드 철학을 감성적으로 전달", sections: ["감성 헤드", "브랜드 여정", "철학", "제품 소개", "후기", "CTA"], uses: 1 },
  { name: "할인 프로모션형", desc: "한정 프로모션 상품에 최적", sections: ["혜택 헤드", "카운트다운", "상품 소개", "후기", "긴급 CTA"], uses: 0 },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function TemplatesPage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <LayoutTemplate className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-0.5">Detail Page Studio</p>
            <h1 className="text-xl font-bold text-slate-800">템플릿 / 베스트 구조</h1>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-600 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> 템플릿 추가
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GC className="p-5 hover:bg-slate-50 hover:border-violet-200 transition-all cursor-pointer h-full">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-800">{t.name}</p>
                  {t.best && <span className="text-[9px] font-bold text-amber-600 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">BEST</span>}
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4">{t.desc}</p>

              {/* Section flow */}
              <div className="flex flex-wrap gap-1 mb-4">
                {t.sections.map((s, si) => (
                  <span key={si} className="flex items-center gap-0.5 text-[10px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                    <span className="text-[9px] font-bold text-violet-600 tabular-nums">{si+1}.</span>{s}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">섹션 {t.sections.length}개</span>
                  <span className="text-[10px] text-slate-400">사용 {t.uses}회</span>
                </div>
                <button className="flex items-center gap-1 text-[11px] text-violet-600 hover:text-violet-700 font-semibold">
                  <Check className="w-3 h-3" /> 적용하기
                </button>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
