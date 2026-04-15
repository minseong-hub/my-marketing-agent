"use client";

import { motion } from "framer-motion";
import { Archive, Eye, Download, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const completed = [
  { name: "감귤 선물세트 상세페이지 v2", date: "2026-04-08", channel: "스마트스토어", sections: 7, views: "12,800회" },
  { name: "포도즙 프리미엄 라인 상세", date: "2026-04-02", channel: "전채널", sections: 8, views: "9,240회" },
  { name: "겨울 선물세트 기획", date: "2026-03-20", channel: "스마트스토어", sections: 6, views: "15,120회" },
  { name: "딸기 2kg 상세페이지", date: "2026-03-14", channel: "쿠팡", sections: 5, views: "7,680회" },
  { name: "단감 수확 상세페이지", date: "2026-02-28", channel: "스마트스토어", sections: 6, views: "5,420회" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function ArchivePage() {
  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Archive className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-0.5">Detail Page Studio</p>
          <h1 className="text-xl font-bold text-slate-800">완료본 / 아카이브</h1>
        </div>
      </motion.div>

      <div className="space-y-2">
        {completed.map((c, i) => (
          <motion.div key={c.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GC className="p-4 hover:bg-slate-50 hover:border-blue-300 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 mb-0.5">{c.name}</p>
                  <p className="text-[10px] text-slate-500 tabular-nums">완료 {c.date} · {c.channel} · 섹션 {c.sections}개 · 조회 {c.views}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-[11px] font-semibold transition-colors">
                    <Eye className="w-3 h-3" /> 미리보기
                  </button>
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-50 border border-violet-200 hover:bg-violet-100 text-violet-600 text-[11px] font-semibold transition-colors">
                    <Download className="w-3 h-3" /> 내보내기
                  </button>
                </div>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
