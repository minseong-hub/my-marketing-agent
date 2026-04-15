"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Eye, MousePointerClick, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const copies = [
  { variant: "A", text: "봄의 시작, 제철 참외가 도착했어요. 회원 전용 5% 할인", ctr: "4.2%", roas: "340%" },
  { variant: "B", text: "달콤함이 가득, 오늘 산지에서 출발", ctr: "3.1%", roas: "240%" },
  { variant: "C", text: "13Brix 이상만 선별, 성주농부의 결정체", ctr: "5.8%", roas: "410%" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function CampaignDetail() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <Link href="/app/tools/ads/campaigns" className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">캠페인 #{id}</p>
          <h1 className="text-lg font-bold text-slate-800">봄 신상품 인스타 광고</h1>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { icon: DollarSign, label: "누적 집행", val: "₩120,000", color: "text-amber-600" },
          { icon: Eye, label: "노출", val: "48,200", color: "text-blue-600" },
          { icon: MousePointerClick, label: "클릭", val: "1,820", color: "text-violet-600" },
          { icon: TrendingUp, label: "ROAS", val: "340%", color: "text-emerald-600" },
        ].map((m, i) => {
          const I = m.icon;
          return (
            <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GC className="p-4">
                <I className={cn("w-4 h-4 mb-2", m.color)} />
                <p className="text-lg font-extrabold text-slate-800 tabular-nums mb-0.5">{m.val}</p>
                <p className="text-[11px] text-slate-500">{m.label}</p>
              </GC>
            </motion.div>
          );
        })}
      </div>

      {/* Meta */}
      <GC className="p-5 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-[10px] text-slate-400 mb-1">상태</p><p className="text-xs font-bold text-emerald-600">진행 중</p></div>
          <div><p className="text-[10px] text-slate-400 mb-1">매체</p><p className="text-xs font-bold text-slate-800">인스타그램</p></div>
          <div><p className="text-[10px] text-slate-400 mb-1">일 예산</p><p className="text-xs font-bold text-slate-800 tabular-nums">₩50,000</p></div>
          <div><p className="text-[10px] text-slate-400 mb-1">기간</p><p className="text-xs font-bold text-slate-800">04/10 ~ 04/30</p></div>
        </div>
      </GC>

      {/* A/B Copies */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GC className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4">광고 카피 A/B 비교</h3>
          <div className="space-y-2">
            {copies.map(c => (
              <div key={c.variant} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-extrabold text-rose-600">{c.variant}</span>
                </div>
                <p className="flex-1 text-sm text-slate-700 leading-relaxed">{c.text}</p>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right"><p className="text-[9px] text-slate-400">CTR</p><p className="text-xs font-bold text-slate-800 tabular-nums">{c.ctr}</p></div>
                  <div className="text-right"><p className="text-[9px] text-slate-400">ROAS</p><p className="text-xs font-bold text-emerald-600 tabular-nums">{c.roas}</p></div>
                </div>
              </div>
            ))}
          </div>
        </GC>
      </motion.div>
    </div>
  );
}
