"use client";

import { motion } from "framer-motion";
import { BarChart2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

const products = [
  { name: "성주참외 3kg", price: 32000, cost: 14000, sold: 124, revenue: 3968000, margin: 32.5, trend: "+12%", up: true },
  { name: "제주 한라봉 5kg", price: 45000, cost: 22000, sold: 87, revenue: 3915000, margin: 28.9, trend: "+8%", up: true },
  { name: "청정 딸기 2kg", price: 28000, cost: 15000, sold: 96, revenue: 2688000, margin: 24.2, trend: "+3%", up: true },
  { name: "감귤 선물세트", price: 38000, cost: 20000, sold: 52, revenue: 1976000, margin: 18.7, trend: "-2%", up: false },
  { name: "포도즙 선물세트", price: 25000, cost: 17000, sold: 38, revenue: 950000, margin: 6.4, trend: "-15%", up: false },
  { name: "단감 1kg", price: 12000, cost: 8500, sold: 42, revenue: 504000, margin: 8.2, trend: "-8%", up: false },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function ProductsPage() {
  const sorted = [...products].sort((a, b) => b.margin - a.margin);

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <BarChart2 className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Margin & Revenue</p>
          <h1 className="text-xl font-bold text-slate-800">상품별 수익성</h1>
        </div>
      </motion.div>

      <GC className="overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-4">상품명</div>
          <div className="col-span-2 text-right">판매수량</div>
          <div className="col-span-3 text-right">매출</div>
          <div className="col-span-3 text-right">마진율</div>
        </div>

        {sorted.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
            className="grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer items-center">
            <div className="col-span-4">
              <p className="text-sm font-bold text-slate-800">{p.name}</p>
              <p className="text-[10px] text-slate-400 tabular-nums">판매가 ₩{p.price.toLocaleString()} · 원가 ₩{p.cost.toLocaleString()}</p>
            </div>
            <div className="col-span-2 text-right">
              <p className="text-sm font-semibold text-slate-700 tabular-nums">{p.sold}</p>
            </div>
            <div className="col-span-3 text-right">
              <p className="text-sm font-bold text-slate-800 tabular-nums">₩{p.revenue.toLocaleString()}</p>
            </div>
            <div className="col-span-3 text-right">
              <div className="inline-flex items-center gap-1.5">
                {p.up ? <ArrowUpRight className="w-3 h-3 text-emerald-600" /> : <ArrowDownRight className="w-3 h-3 text-rose-600" />}
                <span className={cn("text-[10px] font-bold", p.up ? "text-emerald-600" : "text-rose-600")}>{p.trend}</span>
                <span className={cn("ml-2 text-base font-extrabold tabular-nums", p.margin >= 20 ? "text-emerald-600" : p.margin >= 10 ? "text-amber-600" : "text-rose-600")}>
                  {p.margin.toFixed(1)}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </GC>
    </div>
  );
}
