"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Star, MessageCircle, RefreshCcw, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const reviews = [
  { id: "r1", author: "주*연", rating: 5, content: "정말 달고 맛있어요! 아이들이 너무 좋아해서 바로 재구매했어요.", date: "04-14", replied: false },
  { id: "r2", author: "이*경", rating: 4, content: "배송이 빠르고 신선해요. 다음에도 주문할게요.", date: "04-13", replied: true },
];
const inquiries = [
  { author: "김*수", content: "성주참외 3kg 배송 언제 되나요?", channel: "스마트스토어", urgent: true },
  { author: "최*진", content: "제품 교환 가능한가요?", channel: "카카오", urgent: true },
];
const segments = [
  { label: "신규 고객", count: 42, color: "bg-blue-500", pct: 30 },
  { label: "재구매 고객", count: 87, color: "bg-emerald-500", pct: 62 },
  { label: "VIP (3회+)", count: 11, color: "bg-violet-500", pct: 8 },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function CrmHome() {
  const unreplied = reviews.filter(r => !r.replied).length;

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Users className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-0.5">CRM & Reviews · 고객응대</p>
          <h1 className="text-lg font-bold text-slate-800">리뷰, 문의, 재구매 흐름을 한 곳에서 관리하세요.</h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <GC className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center"><Star className="w-4 h-4 text-sky-600" /></div>
                <h3 className="text-sm font-bold text-slate-800">최근 리뷰</h3>
              </div>
              <Link href="/app/tools/crm/reviews" className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">{unreplied}건 미답변</Link>
            </div>
            <div className="space-y-2">
              {reviews.map(r => (
                <Link key={r.id} href={`/app/tools/crm/reviews/${r.id}`} className="block p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-200 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800">{r.author}</span>
                      <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-600" />)}</div>
                    </div>
                    <span className="text-[10px] text-slate-400">{r.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{r.content}</p>
                </Link>
              ))}
            </div>
          </GC>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GC className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center"><MessageCircle className="w-4 h-4 text-amber-600" /></div>
                <h3 className="text-sm font-bold text-slate-800">긴급 문의</h3>
              </div>
              <Link href="/app/tools/crm/cs" className="text-[11px] text-sky-600 hover:text-sky-600 font-semibold flex items-center gap-1">전체 <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="space-y-2">
              {inquiries.map((q, i) => (
                <Link key={i} href="/app/tools/crm/cs" className="block p-3 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-xs font-semibold text-slate-800">{q.author}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">{q.channel}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{q.content}</p>
                  <button className="mt-2 flex items-center gap-1 text-[11px] text-sky-600 font-semibold"><Sparkles className="w-3 h-3" /> AI 답변</button>
                </Link>
              ))}
            </div>
          </GC>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <GC className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center"><Users className="w-4 h-4 text-sky-600" /></div>
              <h3 className="text-sm font-bold text-slate-800">고객 세그먼트</h3>
            </div>
            <Link href="/app/tools/crm/segments" className="text-[11px] text-sky-600 hover:text-sky-600 font-semibold flex items-center gap-1">전체 <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {segments.map(seg => (
              <div key={seg.label} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-600">{seg.label}</p>
                  <p className="text-lg font-extrabold text-slate-800 tabular-nums">{seg.count}</p>
                </div>
                <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div className={cn("h-full rounded-full", seg.color)} style={{ width: `${seg.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <Link href="/app/tools/crm/reorder" className="mt-4 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-600 text-xs font-semibold transition-colors">
            <RefreshCcw className="w-3.5 h-3.5" /> 재구매 캠페인 기획
          </Link>
        </GC>
      </motion.div>
    </div>
  );
}
