"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, ArrowUpRight, ArrowDownRight, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const summary = [
  { label: "이번 달 매출", value: "₩4,280,000", sub: "전월 대비", trend: "+12%", up: true },
  { label: "예상 순이익", value: "₩920,000", sub: "마진율 21.5%", trend: "+5%", up: true },
  { label: "광고비 반영 수익", value: "₩640,000", sub: "광고비 ₩280,000", trend: "-3%", up: false },
  { label: "주의 필요 항목", value: "3개", sub: "마진 10% 미만", trend: "", up: false },
];
const alerts = [
  { name: "단감 1kg", margin: "8%", reason: "마진율 10% 미만" },
  { name: "포도즙 선물세트", margin: "6%", reason: "광고비 비율 과다" },
  { name: "제철 사과 박스", margin: "9%", reason: "원가 인상 감지" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function MarginHome() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <TrendingUp className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Margin & Revenue · 수익흐름 분석</p>
          <h1 className="text-lg font-bold text-slate-800">남는 상품과 새는 비용을 한눈에 확인하세요.</h1>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {summary.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GC className="p-4 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer h-full">
              <p className="text-[11px] text-slate-500 mb-1.5">{c.label}</p>
              <p className="text-xl font-extrabold text-slate-800 mb-1.5 tabular-nums">{c.value}</p>
              <div className="flex items-center gap-1">
                {c.trend && (
                  <>
                    {c.up ? <ArrowUpRight className="w-3 h-3 text-emerald-600" /> : <ArrowDownRight className="w-3 h-3 text-rose-600" />}
                    <span className={cn("text-[10px] font-bold", c.up ? "text-emerald-600" : "text-rose-600")}>{c.trend}</span>
                  </>
                )}
                <span className="text-[10px] text-slate-400 ml-1">{c.sub}</span>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GC className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-rose-600" /></div>
                <h3 className="text-sm font-bold text-slate-800">주의 필요 상품</h3>
              </div>
              <Link href="/app/tools/margin/products" className="text-[11px] text-amber-600 hover:text-amber-600 font-semibold flex items-center gap-1">전체 <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="space-y-2">
              {alerts.map(a => (
                <Link key={a.name} href="/app/tools/margin/products" className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{a.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{a.reason}</p>
                  </div>
                  <span className="text-sm font-extrabold text-rose-600 tabular-nums">{a.margin}</span>
                </Link>
              ))}
            </div>
          </GC>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GC className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-amber-600" /></div>
                <h3 className="text-sm font-bold text-slate-800">빠른 도구</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "마진 계산기", href: "/app/tools/margin/calculator" },
                { label: "상품별 수익성", href: "/app/tools/margin/products" },
                { label: "채널별 성과", href: "/app/tools/margin/channels" },
                { label: "흐름 분석", href: "/app/tools/margin/flow" },
                { label: "비용 구조", href: "/app/tools/margin/costs" },
                { label: "리포트", href: "/app/tools/margin/reports" },
              ].map(l => (
                <Link key={l.href} href={l.href} className="px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-200 hover:bg-amber-50 text-xs font-semibold text-slate-700 hover:text-amber-700 transition-all text-center">
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
