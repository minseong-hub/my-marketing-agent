"use client";

import { motion } from "framer-motion";
import { Palette, Plus, Link as LinkIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const refs = [
  { category: "구조", title: "고급 농산물 브랜드 A — 스토리텔링 구조", url: "ref-01.com", note: "브랜드 철학을 3단으로 나눠 설명" },
  { category: "카피", title: "B 브랜드 — 후킹 헤드라인 모음", url: "ref-02.com", note: "감성적 표현과 숫자 강조의 균형" },
  { category: "디자인", title: "C 브랜드 — 컬러톤 레퍼런스", url: "ref-03.com", note: "크림톤 + 연한 그린의 차분한 조합" },
  { category: "구조", title: "D 브랜드 — 후기 섹션 구성", url: "ref-04.com", note: "실제 사용자 사진을 크게 배치" },
  { category: "디자인", title: "E 브랜드 — 타이포그래피", url: "ref-05.com", note: "세리프와 산세리프 조합" },
  { category: "카피", title: "F 브랜드 — CTA 문구 비교", url: "ref-06.com", note: "시간 제한과 혜택 강조" },
];
const CAT: Record<string, string> = {
  구조: "bg-blue-50 text-blue-700 border-blue-200",
  카피: "bg-violet-50 text-violet-700 border-violet-200",
  디자인: "bg-rose-50 text-rose-700 border-rose-200",
};

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function DesignPage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Palette className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-0.5">Detail Page Studio</p>
            <h1 className="text-xl font-bold text-slate-800">레퍼런스</h1>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-600 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> 레퍼런스 추가
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {refs.map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GC className="hover:bg-slate-50 hover:border-violet-200 transition-all cursor-pointer overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-violet-100 to-purple-600/15 flex items-center justify-center border-b border-slate-200">
                <ImageIcon className="w-8 h-8 text-slate-300" />
              </div>
              <div className="p-4">
                <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border inline-block mb-2", CAT[r.category])}>{r.category}</span>
                <p className="text-xs font-bold text-slate-800 mb-1.5 leading-snug line-clamp-2">{r.title}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 mb-2">{r.note}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <LinkIcon className="w-2.5 h-2.5" />{r.url}
                </div>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
