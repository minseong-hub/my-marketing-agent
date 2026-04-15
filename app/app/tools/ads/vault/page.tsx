"use client";

import { motion } from "framer-motion";
import { Archive, Image as ImageIcon, Video, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const assets = [
  { type: "image", name: "성주참외 산지 수확 컷.jpg", tags: ["인스타", "완료"], size: "2.4MB" },
  { type: "image", name: "당도 13Brix 인포그래픽.png", tags: ["전매체", "완료"], size: "1.8MB" },
  { type: "video", name: "고객 후기 리뷰 합본 30초.mp4", tags: ["틱톡", "릴스"], size: "18.2MB" },
  { type: "text", name: "A/B 테스트 결과 정리.txt", tags: ["분석"], size: "24KB" },
  { type: "image", name: "봄 신상품 배너 3종.zip", tags: ["스마트스토어"], size: "4.8MB" },
  { type: "video", name: "성주 농부 인터뷰 120초.mp4", tags: ["유튜브"], size: "42.6MB" },
  { type: "image", name: "시즌 할인 이벤트 배너.png", tags: ["인스타", "쿠팡"], size: "1.2MB" },
  { type: "text", name: "광고 카피 템플릿 모음.md", tags: ["자산"], size: "12KB" },
];
const TYPE_STYLE: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  image: { icon: ImageIcon, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
  video: { icon: Video, color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
  text: { icon: FileText, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
};

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function VaultPage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <Archive className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">Ad Automation</p>
          <h1 className="text-xl font-bold text-slate-800">자산 보관함</h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {assets.map((a, i) => {
          const T = TYPE_STYLE[a.type];
          const Icon = T.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <GC className="p-4 hover:bg-slate-50 hover:border-rose-200 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0", T.bg)}>
                    <Icon className={cn("w-5 h-5", T.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate mb-1">{a.name}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 tabular-nums">{a.size}</span>
                      {a.tags.map(t => (
                        <span key={t} className="text-[9px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </GC>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
