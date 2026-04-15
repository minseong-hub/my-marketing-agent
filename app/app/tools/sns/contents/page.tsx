"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const CONTENTS = [
  { id: "c1", title: "성주참외 신상품 티저 이미지", platforms: ["인스타그램"], status: "예약됨", date: "2026-04-14", body: "달콤하게 익은 성주참외, 곧 만나보세요." },
  { id: "c2", title: "봄 과일 블로그 리뷰", platforms: ["블로그"], status: "작성중", date: "2026-04-14", body: "제철 과일을 정리한 상세 리뷰" },
  { id: "c3", title: "오픈채팅 회원 공지", platforms: ["오픈채팅"], status: "작성중", date: "2026-04-15", body: "회원님께 먼저 알립니다" },
  { id: "c4", title: "제주 한라봉 티저", platforms: ["인스타그램", "스레드"], status: "아이디어", date: "2026-04-15", body: "아직 기획 단계" },
  { id: "c5", title: "프로모션 카드뉴스 5장", platforms: ["인스타그램"], status: "검토 필요", date: "2026-04-17", body: "할인율과 기간을 강조" },
  { id: "c6", title: "틱톡 제품 소개 60초", platforms: ["틱톡"], status: "예약됨", date: "2026-04-21", body: "제품 사용 장면 중심" },
  { id: "c7", title: "주간 리뷰 모음", platforms: ["블로그"], status: "업로드 완료", date: "2026-04-08", body: "이번 주 고객 후기 모음" },
  { id: "c8", title: "회원 혜택 공지", platforms: ["오픈채팅"], status: "업로드 완료", date: "2026-04-10", body: "4월 혜택 안내" },
];
const STATUS: Record<string, string> = {
  "아이디어": "bg-slate-100 text-slate-500 border-slate-200",
  "작성중": "bg-amber-50 text-amber-700 border-amber-200",
  "검토 필요": "bg-blue-50 text-blue-700 border-blue-200",
  "예약됨": "bg-violet-50 text-violet-700 border-violet-200",
  "업로드 완료": "bg-emerald-50 text-emerald-700 border-emerald-200",
};
const STATUSES = ["전체", "아이디어", "작성중", "검토 필요", "예약됨", "업로드 완료"];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function ContentsPage() {
  const [filter, setFilter] = useState("전체");
  const [q, setQ] = useState("");
  const list = CONTENTS.filter(c => (filter === "전체" || c.status === filter) && (q === "" || c.title.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FileText className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">SNS Marketing</p>
            <h1 className="text-xl font-bold text-slate-800">콘텐츠 목록</h1>
          </div>
        </div>
        <Link href="/app/tools/sns/create" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> 새 콘텐츠
        </Link>
      </motion.div>

      <GC className="p-3 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="콘텐츠 검색"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-300" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors",
                filter === s ? "bg-blue-100 text-blue-600 border-blue-200" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-50")}>{s}</button>
          ))}
        </div>
      </GC>

      <div className="space-y-2">
        {list.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Link href={`/app/tools/sns/contents/${c.id}`}>
              <GC className="p-4 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-bold text-slate-800">{c.title}</p>
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", STATUS[c.status])}>{c.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-1 mb-1.5">{c.body}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-400 tabular-nums">{c.date}</span>
                    {c.platforms.map(p => (
                      <span key={p} className="text-[9px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
              </GC>
            </Link>
          </motion.div>
        ))}
        {list.length === 0 && <GC className="p-10 text-center"><p className="text-sm text-slate-500">검색 결과가 없어요</p></GC>}
      </div>
    </div>
  );
}
