"use client";

import { motion } from "framer-motion";
import { Users, Plus, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const segments = [
  { label: "신규 고객", count: 42, desc: "최근 30일 내 첫 구매", color: "from-blue-500 to-blue-600", action: "온보딩 메시지 발송" },
  { label: "재구매 고객", count: 87, desc: "2회 이상 구매 고객", color: "from-emerald-500 to-teal-600", action: "감사 메시지 + 쿠폰" },
  { label: "VIP (3회+)", count: 11, desc: "3회 이상 구매한 VIP", color: "from-violet-500 to-purple-600", action: "프리미엄 혜택 안내" },
  { label: "이탈 위험", count: 14, desc: "45일 이상 미구매 고객", color: "from-rose-500 to-pink-600", action: "컴백 쿠폰 발송" },
  { label: "휴면", count: 28, desc: "90일 이상 미구매", color: "from-slate-500 to-slate-600", action: "재활성화 캠페인" },
  { label: "장바구니 이탈", count: 19, desc: "장바구니만 담고 미구매", color: "from-amber-500 to-orange-500", action: "리마인드 알림" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function SegmentsPage() {
  const total = segments.reduce((a, s) => a + s.count, 0);

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Users className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-0.5">CRM & Reviews</p>
            <h1 className="text-xl font-bold text-slate-800">고객 세그먼트</h1>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-600 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> 세그먼트 생성
        </button>
      </motion.div>

      <GC className="p-5 mb-4">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">전체 고객 수</p>
          <p className="text-2xl font-extrabold text-slate-800 tabular-nums">{total}명</p>
        </div>
      </GC>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {segments.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GC className="p-5 hover:bg-slate-50 hover:border-sky-200 transition-all cursor-pointer h-full">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", s.color)}>
                  <Users className="w-4 h-4 text-slate-800" />
                </div>
                <p className="text-2xl font-extrabold text-slate-800 tabular-nums">{s.count}</p>
              </div>
              <p className="text-sm font-bold text-slate-800 mb-1">{s.label}</p>
              <p className="text-[11px] text-slate-500 mb-4">{s.desc}</p>
              <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-sky-50 hover:border-sky-200 text-slate-600 hover:text-sky-700 text-[11px] font-semibold transition-all">
                <Mail className="w-3 h-3" /> {s.action}
              </button>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
