"use client";

import { motion } from "framer-motion";
import { Tv2 } from "lucide-react";
import { cn } from "@/lib/utils";

const channels = [
  { name: "네이버 키워드", spend: 84000, clicks: 920, ctr: "4.2%", roas: 220, color: "from-green-500 to-emerald-500" },
  { name: "인스타그램 광고", spend: 120000, clicks: 1820, ctr: "3.8%", roas: 340, color: "from-pink-500 to-rose-500" },
  { name: "쿠팡 상품 광고", spend: 0, clicks: 0, ctr: "—", roas: 0, color: "from-sky-500 to-blue-500" },
  { name: "메타 리타겟팅", spend: 42000, clicks: 420, ctr: "2.7%", roas: 180, color: "from-blue-500 to-indigo-500" },
  { name: "카카오 비즈보드", spend: 28000, clicks: 89, ctr: "5.1%", roas: 520, color: "from-amber-500 to-yellow-500" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function AdChannelsPage() {
  const totalSpend = channels.reduce((a, c) => a + c.spend, 0);

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <Tv2 className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">Ad Automation</p>
          <h1 className="text-xl font-bold text-slate-800">매체별 관리</h1>
        </div>
      </motion.div>

      <GC className="p-5 mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">이번 달 총 광고비</p>
          <p className="text-2xl font-extrabold text-slate-800 tabular-nums">₩{totalSpend.toLocaleString()}</p>
        </div>
        <p className="text-[11px] text-slate-500">5개 매체 집행 중</p>
      </GC>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {channels.map((c, i) => (
          <motion.div key={c.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GC className="p-5 hover:bg-slate-50 hover:border-rose-200 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={cn("w-2.5 h-2.5 rounded-full bg-gradient-to-br", c.color)} />
                  <p className="text-sm font-bold text-slate-800">{c.name}</p>
                </div>
                <p className="text-sm font-extrabold text-slate-800 tabular-nums">₩{c.spend.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                <div><p className="text-[9px] text-slate-400 mb-0.5">클릭</p><p className="text-xs font-bold text-slate-800 tabular-nums">{c.clicks}</p></div>
                <div><p className="text-[9px] text-slate-400 mb-0.5">CTR</p><p className="text-xs font-bold text-slate-800 tabular-nums">{c.ctr}</p></div>
                <div><p className="text-[9px] text-slate-400 mb-0.5">ROAS</p><p className={cn("text-xs font-bold tabular-nums", c.roas >= 300 ? "text-emerald-600" : c.roas >= 150 ? "text-amber-600" : "text-slate-500")}>{c.roas > 0 ? `${c.roas}%` : "—"}</p></div>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
