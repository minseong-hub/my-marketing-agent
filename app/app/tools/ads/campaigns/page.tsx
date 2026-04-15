"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Target, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const campaigns = [
  { id: "c1", name: "봄 신상품 인스타 광고", channel: "인스타그램", status: "진행 중", statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-200", budget: 50000, spent: 120000, impressions: 48200, clicks: 1820, roas: "340%" },
  { id: "c2", name: "스마트스토어 키워드 광고", channel: "네이버", status: "진행 중", statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-200", budget: 30000, spent: 84000, impressions: 22100, clicks: 920, roas: "220%" },
  { id: "c3", name: "쿠팡 로켓광고 테스트", channel: "쿠팡", status: "준비 중", statusStyle: "bg-amber-50 text-amber-700 border-amber-200", budget: 20000, spent: 0, impressions: 0, clicks: 0, roas: "—" },
  { id: "c4", name: "메타 리마케팅", channel: "페이스북", status: "일시 중지", statusStyle: "bg-slate-100 text-slate-500 border-slate-200", budget: 15000, spent: 42000, impressions: 15400, clicks: 420, roas: "180%" },
  { id: "c5", name: "오픈채팅 회원 프로모션", channel: "카카오", status: "진행 중", statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-200", budget: 10000, spent: 28000, impressions: 247, clicks: 89, roas: "520%" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function CampaignsPage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Target className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">Ad Automation</p>
            <h1 className="text-xl font-bold text-slate-800">캠페인 관리</h1>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> 새 캠페인
        </button>
      </motion.div>

      <div className="space-y-2">
        {campaigns.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link href={`/app/tools/ads/campaigns/${c.id}`}>
              <GC className="p-5 hover:bg-slate-50 hover:border-rose-200 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-bold text-slate-800">{c.name}</p>
                      <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", c.statusStyle)}>{c.status}</span>
                      <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">{c.channel}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 tabular-nums">일 예산 ₩{c.budget.toLocaleString()} · 누적 집행 ₩{c.spent.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-5 flex-shrink-0">
                    <div className="text-right"><p className="text-[9px] text-slate-400">노출</p><p className="text-xs font-bold text-slate-800 tabular-nums">{c.impressions.toLocaleString()}</p></div>
                    <div className="text-right"><p className="text-[9px] text-slate-400">클릭</p><p className="text-xs font-bold text-slate-800 tabular-nums">{c.clicks.toLocaleString()}</p></div>
                    <div className="text-right"><p className="text-[9px] text-slate-400">ROAS</p><p className="text-sm font-extrabold text-emerald-600 tabular-nums">{c.roas}</p></div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600" />
                  </div>
                </div>
              </GC>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
