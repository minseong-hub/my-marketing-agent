"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Megaphone, Target, TrendingUp, DollarSign, ArrowRight, PenLine, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";

const summary = [
  { label: "활성 캠페인", value: "5", icon: Target, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
  { label: "이번 달 광고비", value: "₩280,000", icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { label: "평균 ROAS", value: "280%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { label: "총 광고 카피", value: "12", icon: PenLine, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
];
const mainCampaigns = [
  { name: "봄 신상품 인스타 광고", status: "진행 중", statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-200", budget: "₩50,000/일", spent: "₩120,000", roas: "340%" },
  { name: "스마트스토어 키워드 광고", status: "진행 중", statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-200", budget: "₩30,000/일", spent: "₩84,000", roas: "220%" },
  { name: "쿠팡 로켓광고 테스트", status: "준비 중", statusStyle: "bg-amber-50 text-amber-700 border-amber-200", budget: "₩20,000/일", spent: "₩0", roas: "—" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function AdsHome() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <Megaphone className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">Ad Automation · 광고 자동화</p>
          <h1 className="text-lg font-bold text-slate-800">광고 문구, 캠페인, 소재 흐름을 효율적으로 관리하세요.</h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {summary.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GC className="p-4">
                <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center mb-3", s.bg, s.border)}><Icon className={cn("w-4 h-4", s.color)} /></div>
                <p className="text-xl font-extrabold text-slate-800 tabular-nums mb-0.5">{s.value}</p>
                <p className="text-[11px] text-slate-500">{s.label}</p>
              </GC>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GC className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center"><Target className="w-4 h-4 text-rose-600" /></div>
                <h3 className="text-sm font-bold text-slate-800">주요 캠페인</h3>
              </div>
              <Link href="/app/tools/ads/campaigns" className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1">전체 <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="space-y-2">
              {mainCampaigns.map((c, i) => (
                <Link key={i} href={`/app/tools/ads/campaigns/c${i+1}`} className="block p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-rose-200 hover:bg-slate-50 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-slate-800">{c.name}</p>
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", c.statusStyle)}>{c.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span>{c.budget}</span><span>집행 {c.spent}</span>
                    <span className="ml-auto text-emerald-600 font-bold">ROAS {c.roas}</span>
                  </div>
                </Link>
              ))}
            </div>
          </GC>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GC className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center"><FileImage className="w-4 h-4 text-rose-600" /></div>
              <h3 className="text-sm font-bold text-slate-800">빠른 도구</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "광고 문구 생성", href: "/app/tools/ads/copy" },
                { label: "캠페인 관리", href: "/app/tools/ads/campaigns" },
                { label: "소재 아이디어", href: "/app/tools/ads/assets" },
                { label: "매체별 관리", href: "/app/tools/ads/channels" },
                { label: "성과 기록", href: "/app/tools/ads/performance" },
                { label: "자산 보관함", href: "/app/tools/ads/vault" },
              ].map(l => (
                <Link key={l.href} href={l.href} className="px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-xs font-semibold text-slate-700 hover:text-rose-700 transition-all text-center">
                  {l.label}
                </Link>
              ))}
            </div>
          </GC>
        </motion.div>
      </div>
    </div>
  );
}
