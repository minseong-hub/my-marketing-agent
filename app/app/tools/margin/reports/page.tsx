"use client";

import { motion } from "framer-motion";
import { FileText, Download, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const reports = [
  { period: "2026년 4월 리포트", date: "2026-04-14", revenue: "₩4,280,000", margin: "21.5%", insight: "고마진 상품군이 꾸준히 증가 중", new: true },
  { period: "2026년 3월 리포트", date: "2026-04-01", revenue: "₩3,820,000", margin: "19.8%", insight: "광고비 증가에 비해 ROAS 개선" },
  { period: "2026년 2월 리포트", date: "2026-03-01", revenue: "₩2,900,000", margin: "17.2%", insight: "설 연휴 영향으로 매출 감소" },
];
const insights = [
  { icon: TrendingUp, iconColor: "text-emerald-600", iconBg: "bg-emerald-50 border-emerald-200", title: "성주참외가 이번 달 매출의 27%를 차지", desc: "고마진 제철 상품에 마케팅 리소스를 더 집중할 수 있어요." },
  { icon: AlertTriangle, iconColor: "text-rose-600", iconBg: "bg-rose-50 border-rose-200", title: "포도즙 선물세트 마진율 6%로 하락", desc: "원가 또는 판매가 재검토가 필요합니다." },
  { icon: Lightbulb, iconColor: "text-amber-600", iconBg: "bg-amber-50 border-amber-200", title: "오픈채팅 주문이 마진율 35%로 최고", desc: "회원 전용 혜택을 강화하면 수익성이 개선될 가능성이 있어요." },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function ReportsPage() {
  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <FileText className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Margin & Revenue</p>
          <h1 className="text-xl font-bold text-slate-800">리포트 / 인사이트</h1>
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <GC className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center"><Lightbulb className="w-4 h-4 text-amber-600" /></div>
            <h3 className="text-sm font-bold text-slate-800">이번 달 주요 인사이트</h3>
          </div>
          <div className="space-y-2">
            {insights.map((ins, i) => {
              const Icon = ins.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0", ins.iconBg)}>
                    <Icon className={cn("w-4 h-4", ins.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 mb-0.5">{ins.title}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{ins.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </GC>
      </motion.div>

      {/* Report list */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">월간 리포트</p>
        <div className="space-y-2">
          {reports.map((r, i) => (
            <GC key={r.period} className="p-4 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-slate-800">{r.period}</p>
                    {r.new && <span className="text-[9px] font-semibold text-amber-600 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">NEW</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-1.5">{r.date} · 매출 {r.revenue} · 마진 {r.margin}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">💡 {r.insight}</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-semibold transition-colors flex-shrink-0">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </GC>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
