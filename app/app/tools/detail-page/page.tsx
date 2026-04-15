"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Layout, Folder, PenLine, LayoutTemplate, Clock, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const projects = [
  { id: "p1", name: "성주참외 신상품 상세페이지", stage: "섹션 기획 중", stageStyle: "bg-blue-50 text-blue-700 border-blue-200", progress: 40, sections: 4, copies: 2, lastEdited: "1시간 전" },
  { id: "p2", name: "봄 딸기 기획전 상세", stage: "카피 작성 중", stageStyle: "bg-violet-50 text-violet-700 border-violet-200", progress: 65, sections: 6, copies: 4, lastEdited: "어제" },
];
const recent = [
  { type: "카피", typeStyle: "bg-violet-50 text-violet-700 border-violet-200", name: "성주참외 헤드라인 초안 3가지", project: "성주참외 신상품", time: "1시간 전" },
  { type: "섹션", typeStyle: "bg-blue-50 text-blue-700 border-blue-200", name: "신뢰 · 증거 섹션 구성안", project: "딸기 기획전", time: "어제" },
  { type: "레퍼런스", typeStyle: "bg-slate-100 text-slate-500 border-slate-200", name: "벤치마크 상세 클리핑 5건", project: "딸기 기획전", time: "어제" },
];
const templates = [
  { name: "농산물 기본 구조 A", sections: 5, uses: 3 },
  { name: "신뢰 강조형 구조", sections: 7, uses: 2 },
  { name: "감성 스토리텔링형", sections: 6, uses: 1 },
];
const frequentSections = ["후킹 헤드라인", "상품 특징 3단", "고객 후기", "FAQ", "구매 이유 CTA", "신뢰 배지", "브랜드 소개"];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function DetailPageHome() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Layout className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-0.5">Detail Page Studio · 프로젝트</p>
          <h1 className="text-lg font-bold text-slate-800">상세페이지 구조, 카피, 레퍼런스를 빠르게 정리하세요.</h1>
        </div>
      </motion.div>

      {/* 진행 중 프로젝트 */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <GC className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center"><Folder className="w-4 h-4 text-violet-600" /></div>
              <h3 className="text-sm font-bold text-slate-800">진행 중 프로젝트</h3>
            </div>
            <Link href="/app/tools/detail-page/projects" className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-semibold hover:bg-violet-50 px-2 py-1 rounded-lg">
              <Plus className="w-3 h-3" /> 새 프로젝트
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map(p => (
              <Link key={p.id} href={`/app/tools/detail-page/projects/${p.id}`} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-violet-200 hover:bg-slate-50 transition-all group">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-bold text-slate-800 leading-snug flex-1 pr-2">{p.name}</p>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-600 flex-shrink-0" />
                </div>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", p.stageStyle)}>{p.stage}</span>
                <div className="mt-3 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500">진행률</span>
                    <span className="text-[10px] font-bold text-slate-600">{p.progress}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span>섹션 {p.sections}</span><span>카피 {p.copies}</span>
                  <span className="ml-auto flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {p.lastEdited}</span>
                </div>
              </Link>
            ))}
          </div>
        </GC>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GC className="p-4 h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center"><Clock className="w-4 h-4 text-violet-600" /></div>
              <h3 className="text-sm font-bold text-slate-800">최근 작업</h3>
            </div>
            <div className="space-y-2">
              {recent.map((w, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 mt-0.5", w.typeStyle)}>{w.type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{w.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{w.project} · {w.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </GC>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
          <GC className="p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center"><LayoutTemplate className="w-4 h-4 text-violet-600" /></div>
                <h3 className="text-sm font-bold text-slate-800">템플릿</h3>
              </div>
              <span className="text-[10px] text-slate-400">{templates.length}개</span>
            </div>
            <div className="space-y-2">
              {templates.map(t => (
                <Link key={t.name} href="/app/tools/detail-page/templates" className="block p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-violet-200 hover:bg-slate-50 transition-all group">
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-semibold text-slate-800 flex-1">{t.name}</p>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-violet-600" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400">섹션 {t.sections}개</span>
                    <span className="text-[10px] text-slate-400">사용 {t.uses}회</span>
                  </div>
                </Link>
              ))}
            </div>
          </GC>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <GC className="p-4 h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center"><PenLine className="w-4 h-4 text-violet-600" /></div>
              <h3 className="text-sm font-bold text-slate-800">자주 쓰는 섹션</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {frequentSections.map(s => (
                <button key={s} className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all">{s}</button>
              ))}
            </div>
          </GC>
        </motion.div>
      </div>
    </div>
  );
}
