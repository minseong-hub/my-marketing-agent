"use client";

import { motion } from "framer-motion";
import { LayoutTemplate, Copy, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const templates = [
  { name: "신상품 티저 — 인스타", category: "신상품", platform: "인스타그램", preview: "🍈 {{상품명}} 신상품이 도착했어요. 제철 맛 그대로, 회원님께 먼저 선보입니다.", uses: 14 },
  { name: "블로그 상세 리뷰", category: "리뷰", platform: "블로그", preview: "# {{상품명}}, 저희가 먼저 먹어보았습니다\n\n안녕하세요, 산물입니다.", uses: 8 },
  { name: "오픈채팅 회원 공지", category: "공지", platform: "오픈채팅", preview: "[산물] 회원님께 먼저 알려드립니다!\n\n{{상품명}} 신상품이 오늘 입고됐어요.", uses: 22 },
  { name: "프로모션 카드뉴스", category: "프로모션", platform: "인스타그램", preview: "🎁 {{프로모션명}}\n{{할인율}} 할인 · {{기간}}\n회원 전용 추가 혜택", uses: 6 },
  { name: "스레드 짧은 글", category: "브랜딩", platform: "스레드", preview: "{{상품명}}, 오늘 입고됐어요.\n제철 맛 그대로, 회원 혜택도 있어요.", uses: 11 },
  { name: "틱톡 60초 대본", category: "영상", platform: "틱톡", preview: "Hook (3초): {{후킹 문구}}\nStory (45초): 제품 사용 장면\nCTA (12초): 구매 유도", uses: 3 },
];
const CAT: Record<string, string> = {
  신상품: "bg-blue-50 text-blue-700 border-blue-200",
  리뷰: "bg-emerald-50 text-emerald-700 border-emerald-200",
  공지: "bg-amber-50 text-amber-700 border-amber-200",
  프로모션: "bg-rose-50 text-rose-700 border-rose-200",
  브랜딩: "bg-violet-50 text-violet-700 border-violet-200",
  영상: "bg-pink-50 text-pink-700 border-pink-200",
};

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function TemplatesPage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <LayoutTemplate className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">SNS Marketing</p>
            <h1 className="text-xl font-bold text-slate-800">템플릿 / 문구 자산</h1>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> 템플릿 추가
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GC className="p-5 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-wrap gap-1.5">
                  <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", CAT[t.category])}>{t.category}</span>
                  <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">{t.platform}</span>
                </div>
                <button className="text-slate-400 hover:text-blue-600 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
              </div>
              <p className="text-sm font-bold text-slate-800 mb-2">{t.name}</p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3">
                <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line font-mono">{t.preview}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">사용 {t.uses}회</span>
                <button className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold">
                  <Sparkles className="w-3 h-3" /> 이 템플릿으로 작성
                </button>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
