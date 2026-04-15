"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Instagram, AtSign, BookText, Radio, Copy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { id: "instagram", label: "인스타그램", icon: Instagram, color: "text-pink-600" },
  { id: "threads", label: "스레드", icon: AtSign, color: "text-slate-600" },
  { id: "blog", label: "블로그", icon: BookText, color: "text-orange-300" },
  { id: "openchat", label: "오픈채팅", icon: Radio, color: "text-amber-600" },
];
const DRAFTS: Record<string, string> = {
  instagram: "🍈 달콤함이 가득, 성주참외 신상품이 도착했어요.\n\n제철 과즙을 그대로 담아 왔습니다.\n회원님께 먼저 선보입니다 💛\n\n#성주참외 #제철과일 #산물",
  threads: "달콤한 성주참외, 오늘 입고됐어요.\n제철 맛 그대로, 회원 혜택도 있어요.",
  blog: "# 봄의 달콤함, 성주참외 신상품을 소개합니다\n\n안녕하세요, 산물입니다. 오랜 기다림 끝에 올해 성주참외를 만나볼 수 있게 되었어요.\n\n## 왜 성주참외인가요?\n— 기후 조건이 완벽한 성주 지역\n— 당도 13Brix 이상 선별\n— 산지 직송 24시간 내 배송",
  openchat: "[산물] 회원님 먼저 알려드립니다!\n\n성주참외 신상품이 오늘 입고됐어요.\n▫ 3kg 세트: 32,000원 (한정 40box)\n▫ 구매 링크: https://...\n\n※ 회원 전용 5% 추가 할인 적용",
};

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function ContentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [active, setActive] = useState("instagram");

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <Link href="/app/tools/sns/contents" className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">콘텐츠 #{id}</p>
          <h1 className="text-lg font-bold text-slate-800">성주참외 신상품 티저</h1>
        </div>
      </motion.div>

      {/* Meta */}
      <GC className="p-5 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-[10px] text-slate-400 mb-1">상태</p><p className="text-xs font-bold text-violet-600">예약됨</p></div>
          <div><p className="text-[10px] text-slate-400 mb-1">발행 예정일</p><p className="text-xs font-bold text-slate-800 tabular-nums">2026-04-14</p></div>
          <div><p className="text-[10px] text-slate-400 mb-1">플랫폼</p><p className="text-xs font-bold text-slate-800">4개 채널</p></div>
          <div><p className="text-[10px] text-slate-400 mb-1">마지막 수정</p><p className="text-xs font-bold text-slate-800">1시간 전</p></div>
        </div>
      </GC>

      {/* Platform tabs */}
      <GC className="overflow-hidden">
        <div className="flex border-b border-slate-200">
          {PLATFORMS.map(p => {
            const Icon = p.icon;
            const isActive = active === p.id;
            return (
              <button key={p.id} onClick={() => setActive(p.id)}
                className={cn("flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors",
                  isActive ? "border-blue-400 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-600")}>
                <Icon className={cn("w-3.5 h-3.5", isActive ? p.color : "")} />
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">초안</p>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                <Sparkles className="w-3 h-3" /> AI 재생성
              </button>
              <button className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
                <Copy className="w-3 h-3" /> 복사
              </button>
            </div>
          </div>
          <textarea value={DRAFTS[active]} readOnly rows={10}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed font-mono resize-none focus:outline-none" />
        </div>
      </GC>
    </div>
  );
}
