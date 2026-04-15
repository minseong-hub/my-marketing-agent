"use client";

import { motion } from "framer-motion";
import { RefreshCcw, Plus, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const campaigns = [
  { name: "재구매 고객 후기 요청", target: "재구매 고객", recipients: 87, sent: 62, open: "78%", status: "진행 중", statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { name: "이탈 위험 고객 컴백 쿠폰", target: "이탈 위험", recipients: 14, sent: 14, open: "45%", status: "발송 완료", statusStyle: "bg-blue-50 text-blue-700 border-blue-200" },
  { name: "VIP 프리미엄 혜택 안내", target: "VIP", recipients: 11, sent: 0, open: "—", status: "준비 중", statusStyle: "bg-amber-50 text-amber-700 border-amber-200" },
  { name: "신규 고객 온보딩 메시지", target: "신규", recipients: 42, sent: 42, open: "82%", status: "발송 완료", statusStyle: "bg-blue-50 text-blue-700 border-blue-200" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function ReorderPage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <RefreshCcw className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-0.5">CRM & Reviews</p>
            <h1 className="text-xl font-bold text-slate-800">재구매 / 후기 캠페인</h1>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-600 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> 캠페인 기획
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "발송 완료", val: "118건", color: "text-emerald-600" },
          { label: "평균 열람률", val: "68%", color: "text-sky-600" },
          { label: "재구매 전환", val: "22건", color: "text-violet-600" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GC className="p-4">
              <p className="text-xl font-extrabold text-slate-800 tabular-nums mb-0.5">{s.val}</p>
              <p className="text-[11px] text-slate-500">{s.label}</p>
            </GC>
          </motion.div>
        ))}
      </div>

      {/* Campaigns */}
      <div className="space-y-2">
        {campaigns.map((c, i) => (
          <motion.div key={c.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
            <GC className="p-5 hover:bg-slate-50 hover:border-sky-200 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center flex-shrink-0">
                  <Send className="w-5 h-5 text-sky-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-bold text-slate-800">{c.name}</p>
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", c.statusStyle)}>{c.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">대상 {c.target} · {c.recipients}명 · 발송 {c.sent}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-slate-400">열람률</p>
                  <p className="text-sm font-extrabold text-sky-600 tabular-nums">{c.open}</p>
                </div>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
