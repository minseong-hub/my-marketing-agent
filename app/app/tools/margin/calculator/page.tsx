"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function CalculatorPage() {
  const [price, setPrice] = useState(25000);
  const [cost, setCost] = useState(12000);
  const [ship, setShip] = useState(3000);
  const [fee, setFee] = useState(1500);
  const [ad, setAd] = useState(2000);

  const totals = useMemo(() => {
    const totalCost = cost + ship + fee + ad;
    const profit = price - totalCost;
    const margin = price > 0 ? (profit / price) * 100 : 0;
    return { totalCost, profit, margin };
  }, [price, cost, ship, fee, ad]);

  const marginColor = totals.margin >= 20 ? "text-emerald-600" : totals.margin >= 10 ? "text-amber-600" : "text-rose-600";

  const inputs = [
    { label: "판매가", value: price, set: setPrice, hint: "소비자 결제 금액" },
    { label: "상품 원가", value: cost, set: setCost, hint: "상품 매입가" },
    { label: "배송비", value: ship, set: setShip, hint: "택배 · 포장비" },
    { label: "플랫폼 수수료", value: fee, set: setFee, hint: "채널 결제 수수료" },
    { label: "광고비 (개당)", value: ad, set: setAd, hint: "광고비 / 판매수량" },
  ];

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Calculator className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Margin & Revenue</p>
          <h1 className="text-xl font-bold text-slate-800">마진 계산기</h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Inputs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
          <GC className="p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">입력 항목</p>
            <div className="space-y-4">
              {inputs.map(inp => (
                <div key={inp.label}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <label className="text-sm font-medium text-slate-600">{inp.label}</label>
                    <span className="text-[10px] text-slate-400">{inp.hint}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={inp.value}
                      onChange={(e) => inp.set(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-slate-800 font-bold tabular-nums focus:outline-none focus:border-amber-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">원</span>
                  </div>
                </div>
              ))}
            </div>
          </GC>
        </motion.div>

        {/* Result */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-3">
          <GC className="p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">총 비용</p>
            <p className="text-2xl font-extrabold text-slate-800 tabular-nums mb-4">₩{totals.totalCost.toLocaleString()}</p>
            <div className="space-y-1 text-[11px] text-slate-500">
              <p className="flex justify-between"><span>· 원가</span><span className="tabular-nums">{cost.toLocaleString()}</span></p>
              <p className="flex justify-between"><span>· 배송비</span><span className="tabular-nums">{ship.toLocaleString()}</span></p>
              <p className="flex justify-between"><span>· 수수료</span><span className="tabular-nums">{fee.toLocaleString()}</span></p>
              <p className="flex justify-between"><span>· 광고비</span><span className="tabular-nums">{ad.toLocaleString()}</span></p>
            </div>
          </GC>

          <GC className="p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">순이익</p>
            <p className={cn("text-2xl font-extrabold tabular-nums mb-3", totals.profit >= 0 ? "text-slate-800" : "text-rose-600")}>
              ₩{totals.profit.toLocaleString()}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-xs text-slate-500">마진율</span>
              <span className={cn("text-lg font-extrabold tabular-nums", marginColor)}>{totals.margin.toFixed(1)}%</span>
            </div>
          </GC>
        </motion.div>
      </div>
    </div>
  );
}
