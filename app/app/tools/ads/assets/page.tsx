"use client";

import { motion } from "framer-motion";
import { FileImage, Plus, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ideas = [
  { concept: "산지 새벽 수확 컷", type: "이미지", platforms: ["인스타", "쿠팡"], status: "제작 완료" },
  { concept: "고객 후기 리뷰 합본 영상 30초", type: "영상", platforms: ["틱톡", "릴스"], status: "기획" },
  { concept: "당도 측정 장면 클로즈업", type: "이미지", platforms: ["인스타"], status: "촬영 예정" },
  { concept: "비포어/애프터 포장 비교", type: "이미지", platforms: ["전매체"], status: "제작 중" },
  { concept: "성주 농부 인터뷰 컷", type: "영상", platforms: ["유튜브"], status: "기획" },
  { concept: "시즌 할인 배너 3종", type: "배너", platforms: ["스마트스토어"], status: "제작 완료" },
];
const STATUS: Record<string, string> = {
  "기획": "bg-slate-100 text-slate-500 border-slate-200",
  "촬영 예정": "bg-blue-50 text-blue-700 border-blue-200",
  "제작 중": "bg-amber-50 text-amber-700 border-amber-200",
  "제작 완료": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function AssetsPage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <FileImage className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">Ad Automation</p>
            <h1 className="text-xl font-bold text-slate-800">소재 아이디어</h1>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> 아이디어 추가
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ideas.map((idea, i) => (
          <motion.div key={idea.concept} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GC className="hover:bg-slate-50 hover:border-rose-200 transition-all cursor-pointer overflow-hidden h-full">
              <div className="aspect-video bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center border-b border-slate-200">
                <ImageIcon className="w-8 h-8 text-slate-300" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full">{idea.type}</span>
                  <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", STATUS[idea.status])}>{idea.status}</span>
                </div>
                <p className="text-xs font-bold text-slate-800 mb-2 leading-snug">{idea.concept}</p>
                <div className="flex flex-wrap gap-1">
                  {idea.platforms.map(p => (
                    <span key={p} className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-full">#{p}</span>
                  ))}
                </div>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
