"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PlusCircle, Sparkles, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { id: "instagram", label: "인스타그램", dot: "bg-pink-500" },
  { id: "blog", label: "블로그", dot: "bg-orange-400" },
  { id: "threads", label: "스레드", dot: "bg-white/50" },
  { id: "tiktok", label: "틱톡", dot: "bg-red-400" },
  { id: "openchat", label: "오픈채팅", dot: "bg-amber-500" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function CreatePage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState("2026-04-20");
  const [selected, setSelected] = useState<string[]>(["instagram"]);
  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div className="p-6 max-w-[800px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <Link href="/app/tools/sns/contents" className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <PlusCircle className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">SNS Marketing</p>
          <h1 className="text-xl font-bold text-slate-800">새 콘텐츠 등록</h1>
        </div>
      </motion.div>

      <GC className="p-6 space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-600 mb-2 block">콘텐츠 제목</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="예) 성주참외 신상품 티저 이미지"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-300" />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 mb-2 block">발행 플랫폼</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => {
              const active = selected.includes(p.id);
              return (
                <button key={p.id} onClick={() => toggle(p.id)}
                  className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all",
                    active ? "bg-blue-100 border-blue-300 text-blue-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-50")}>
                  <div className={cn("w-2 h-2 rounded-full", p.dot)} />{p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 mb-2 block">발행 예정일</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-300" />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 mb-2 block">핵심 메시지 / 메모</label>
          <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={5} placeholder="전달하고 싶은 핵심 메시지를 적어주세요. AI가 채널별 초안을 만들어드려요."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 resize-none" />
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-100 hover:bg-blue-100 border border-blue-200 text-blue-700 text-sm font-bold transition-colors">
            <Sparkles className="w-4 h-4" /> AI 초안 생성
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm font-semibold transition-colors">
            초안 저장
          </button>
        </div>
      </GC>
    </div>
  );
}
