"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Layers, PenLine, Palette, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { name: "후킹 헤드라인", status: "완료", color: "text-emerald-600" },
  { name: "상품 스토리", status: "완료", color: "text-emerald-600" },
  { name: "상품 특징 3단", status: "작성중", color: "text-amber-600" },
  { name: "고객 후기", status: "초안", color: "text-blue-600" },
  { name: "신뢰 배지", status: "기획", color: "text-slate-500" },
  { name: "FAQ", status: "기획", color: "text-slate-500" },
];
const copies = [
  { label: "메인 헤드라인", text: "이 봄, 가장 먼저 만나는 단맛" },
  { label: "서브카피", text: "당도 13Brix 이상, 산지에서 바로 보내드려요" },
  { label: "CTA", text: "지금 바로 회원 혜택 받기 →" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function ProjectDetail() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <Link href="/app/tools/detail-page/projects" className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-0.5">프로젝트 #{id}</p>
          <h1 className="text-lg font-bold text-slate-800">성주참외 신상품 상세페이지</h1>
        </div>
      </motion.div>

      {/* Meta */}
      <GC className="p-5 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-[10px] text-slate-400 mb-1">단계</p><p className="text-xs font-bold text-blue-600">섹션 기획 중</p></div>
          <div><p className="text-[10px] text-slate-400 mb-1">진행률</p><p className="text-xs font-bold text-slate-800 tabular-nums">40%</p></div>
          <div><p className="text-[10px] text-slate-400 mb-1">섹션</p><p className="text-xs font-bold text-slate-800">6개</p></div>
          <div><p className="text-[10px] text-slate-400 mb-1">마지막 수정</p><p className="text-xs font-bold text-slate-800">1시간 전</p></div>
        </div>
      </GC>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GC className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-violet-600" />
              <h3 className="text-sm font-bold text-slate-800">섹션 구성</h3>
            </div>
            <div className="space-y-2">
              {sections.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold text-slate-400 tabular-nums">{String(i+1).padStart(2,"0")}</span>
                    <span className="text-xs font-semibold text-slate-800">{s.name}</span>
                  </div>
                  <span className={cn("text-[10px] font-semibold", s.color)}>{s.status}</span>
                </div>
              ))}
            </div>
          </GC>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
          <GC className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <PenLine className="w-4 h-4 text-violet-600" />
              <h3 className="text-sm font-bold text-slate-800">주요 카피</h3>
            </div>
            <div className="space-y-3">
              {copies.map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-1">{c.label}</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </GC>
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
        {[
          { icon: Layers, label: "섹션 기획", href: "/app/tools/detail-page/sections" },
          { icon: PenLine, label: "카피 작성", href: "/app/tools/detail-page/copy" },
          { icon: Palette, label: "레퍼런스", href: "/app/tools/detail-page/design" },
          { icon: CheckCircle2, label: "아카이브", href: "/app/tools/detail-page/archive" },
        ].map(a => {
          const I = a.icon;
          return (
            <Link key={a.label} href={a.href} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 hover:border-violet-200 hover:bg-violet-50 text-slate-700 hover:text-violet-700 transition-all">
              <I className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{a.label}</span>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
