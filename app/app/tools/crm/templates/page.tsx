"use client";

import { motion } from "framer-motion";
import { FileText, Copy, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const templates = [
  { title: "5성 리뷰 감사 답변", category: "리뷰", preview: "{{고객명}} 님, 따뜻한 후기 정말 감사드립니다! 앞으로도 늘 가장 신선한 과일만 보내드릴게요." },
  { title: "낮은 평점 리뷰 응대", category: "리뷰", preview: "{{고객명}} 님, 불편을 드려 죄송합니다. 말씀주신 부분을 다시 살펴보고..." },
  { title: "배송 지연 사과 메시지", category: "CS", preview: "{{고객명}} 님, 배송이 늦어져 불편을 드려 대단히 죄송합니다. 현재 상황은..." },
  { title: "교환 / 반품 안내", category: "CS", preview: "{{고객명}} 님, 교환 절차를 안내드립니다. 1. 상품을 원래 포장에..." },
  { title: "재구매 유도 쿠폰 메시지", category: "마케팅", preview: "{{고객명}} 님, 이전에 구매해 주신 고객님께 특별 혜택을 드립니다..." },
  { title: "VIP 프리미엄 안내", category: "마케팅", preview: "{{고객명}} 님은 VIP 고객이십니다! 신상품 출시 전 사전 안내와 특별..." },
  { title: "재입고 알림", category: "CS", preview: "{{고객명}} 님이 관심 있어하신 {{상품명}}이 재입고되었습니다." },
  { title: "생일 축하 메시지", category: "마케팅", preview: "{{고객명}} 님, 생일을 진심으로 축하드립니다! 오늘만의 특별 쿠폰..." },
];
const CAT: Record<string, string> = {
  리뷰: "bg-rose-50 text-rose-700 border-rose-200",
  CS: "bg-amber-50 text-amber-700 border-amber-200",
  마케팅: "bg-blue-50 text-blue-700 border-blue-200",
};

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function TemplatesPage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <FileText className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-0.5">CRM & Reviews</p>
            <h1 className="text-xl font-bold text-slate-800">CS 템플릿</h1>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-600 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> 템플릿 추가
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map((t, i) => (
          <motion.div key={t.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GC className="p-5 hover:bg-slate-50 hover:border-sky-200 transition-all cursor-pointer h-full group">
              <div className="flex items-start justify-between mb-2">
                <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", CAT[t.category])}>{t.category}</span>
                <button className="text-slate-300 group-hover:text-sky-600 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
              </div>
              <p className="text-sm font-bold text-slate-800 mb-2">{t.title}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">{t.preview}</p>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
