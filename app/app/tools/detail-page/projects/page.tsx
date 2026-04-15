"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Folder, Plus, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const projects = [
  { id: "p1", name: "성주참외 신상품 상세페이지", stage: "섹션 기획 중", stageStyle: "bg-blue-50 text-blue-700 border-blue-200", progress: 40, sections: 4, copies: 2, lastEdited: "1시간 전" },
  { id: "p2", name: "봄 딸기 기획전 상세", stage: "카피 작성 중", stageStyle: "bg-violet-50 text-violet-700 border-violet-200", progress: 65, sections: 6, copies: 4, lastEdited: "어제" },
  { id: "p3", name: "감귤 선물세트 리뉴얼", stage: "레퍼런스 수집", stageStyle: "bg-amber-50 text-amber-700 border-amber-200", progress: 20, sections: 2, copies: 0, lastEdited: "3일 전" },
  { id: "p4", name: "포도즙 프리미엄 라인", stage: "완료", stageStyle: "bg-emerald-50 text-emerald-700 border-emerald-200", progress: 100, sections: 8, copies: 12, lastEdited: "2주 전" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function ProjectsPage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Folder className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-0.5">Detail Page Studio</p>
            <h1 className="text-xl font-bold text-slate-800">프로젝트 관리</h1>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-600 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> 새 프로젝트
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {projects.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={`/app/tools/detail-page/projects/${p.id}`}>
              <GC className="p-5 hover:bg-slate-50 hover:border-violet-200 transition-all cursor-pointer h-full group">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-bold text-slate-800 leading-snug flex-1">{p.name}</p>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-600 flex-shrink-0 ml-2" />
                </div>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", p.stageStyle)}>{p.stage}</span>
                <div className="mt-4 mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500">진행률</span>
                    <span className="text-[10px] font-bold text-slate-600 tabular-nums">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span>섹션 {p.sections}개</span>
                  <span>카피 {p.copies}개</span>
                  <span className="ml-auto flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {p.lastEdited}</span>
                </div>
              </GC>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
