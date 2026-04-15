"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const issues = [
  { customer: "최*진", issue: "배송 중 상품 파손", action: "교환 발송 완료", date: "2026-04-13", status: "해결 완료", severity: "high" },
  { customer: "김*수", issue: "배송 지연 문의", action: "출고 지연 사과 + 적립금", date: "2026-04-12", status: "해결 완료", severity: "mid" },
  { customer: "이*정", issue: "쿠폰 적용 오류", action: "수동 재발급 처리", date: "2026-04-11", status: "해결 완료", severity: "low" },
  { customer: "박*준", issue: "사이즈별 당도 불만", action: "답변 발송", date: "2026-04-10", status: "처리 중", severity: "mid" },
  { customer: "오*연", issue: "재입고 알림 요청", action: "알림 등록", date: "2026-04-09", status: "해결 완료", severity: "low" },
];
const SEV: Record<string, { label: string; style: string; dot: string }> = {
  high: { label: "긴급", style: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  mid: { label: "보통", style: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  low: { label: "낮음", style: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" },
};
const STATUS: Record<string, string> = {
  "해결 완료": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "처리 중": "bg-blue-50 text-blue-700 border-blue-200",
};

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function IssuesPage() {
  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <ShieldAlert className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-0.5">CRM & Reviews</p>
          <h1 className="text-xl font-bold text-slate-800">고객 이슈 로그</h1>
        </div>
      </motion.div>

      <div className="space-y-2">
        {issues.map((it, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GC className="p-4 hover:bg-slate-50 hover:border-sky-200 transition-all cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", SEV[it.severity].dot)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-bold text-slate-800">{it.customer} · {it.issue}</p>
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", SEV[it.severity].style)}>{SEV[it.severity].label}</span>
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", STATUS[it.status])}>{it.status}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-1">대응: {it.action}</p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />{it.date}
                  </div>
                </div>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
