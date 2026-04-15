"use client";

import { motion } from "framer-motion";
import { Layers, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const sectionTypes = [
  { name: "후킹 헤드라인", desc: "첫 3초 안에 관심을 끄는 메인 카피", structure: ["헤드라인", "서브카피", "핵심 비주얼"], common: true },
  { name: "상품 스토리", desc: "브랜드 철학과 상품의 탄생 배경", structure: ["브랜드 소개", "제조 과정", "차별점"] },
  { name: "상품 특징 3단", desc: "핵심 셀링 포인트 3가지를 구조적으로 제시", structure: ["특징 1 + 근거", "특징 2 + 근거", "특징 3 + 근거"], common: true },
  { name: "신뢰 · 증거", desc: "인증, 수상, 미디어 보도 자료 노출", structure: ["인증 배지", "미디어 로고", "수치 데이터"] },
  { name: "고객 후기", desc: "실제 구매 후기와 별점 중심 구성", structure: ["별점 요약", "실제 후기 3-5개", "후기 사진"], common: true },
  { name: "FAQ", desc: "자주 묻는 질문과 답변 정리", structure: ["질문 리스트", "간결한 답변"] },
  { name: "구매 이유 CTA", desc: "구매 결정을 유도하는 마지막 푸시", structure: ["혜택 강조", "시간 제한 문구", "CTA 버튼"], common: true },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function SectionsPage() {
  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Layers className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-0.5">Detail Page Studio</p>
            <h1 className="text-xl font-bold text-slate-800">섹션 기획</h1>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-600 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> 섹션 추가
        </button>
      </motion.div>

      <div className="space-y-2">
        {sectionTypes.map((s, i) => (
          <motion.div key={s.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GC className="p-5 hover:bg-slate-50 hover:border-violet-200 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800">{s.name}</p>
                  {s.common && <span className="text-[9px] font-bold text-violet-600 bg-violet-100 border border-violet-200 px-1.5 py-0.5 rounded-full">자주 쓰는</span>}
                </div>
                <button className="text-[11px] text-violet-600 hover:text-violet-700 font-semibold">+ 추가</button>
              </div>
              <p className="text-xs text-slate-500 mb-3">{s.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {s.structure.map((st, si) => (
                  <span key={si} className="flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                    <Check className="w-2.5 h-2.5 text-violet-600" />{st}
                  </span>
                ))}
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
