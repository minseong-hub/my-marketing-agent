"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart2, Search, AlertTriangle, CalendarClock, Plus, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GlassCard, PageShell, PrimaryButton, Pill, ProgressBar, RelatedTools, ToneKey,
} from "@/components/store-ops/shared";
import { AITaskPanel } from "@/components/store-ops/ai-task-panel";
import {
  PRODUCTS, deriveStockStatus, isVisibleProduct, StockStatus, type SeasonalProduct,
} from "@/lib/store-ops/seasonal-data";

const STATUS_TONE: Record<StockStatus, ToneKey> = {
  "정상": "emerald",
  "부족": "amber",
  "품절임박": "rose",
  "품절": "rose",
  "재입고예정": "blue",
};

const TABS: (StockStatus | "전체")[] = ["전체", "부족", "품절임박", "품절", "재입고예정", "정상"];

type Edit = { current: number; safety: number; restockAt: string; note: string };

export default function InventoryPage() {
  const [overrides, setOverrides] = useState<Record<string, Edit>>({});
  const [tab, setTab] = useState<StockStatus | "전체">("전체");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Edit>({ current: 0, safety: 0, restockAt: "", note: "" });

  const rows = useMemo(
    () =>
      PRODUCTS.filter(isVisibleProduct).map((p) => {
        const o = overrides[p.id];
        const merged: SeasonalProduct = o
          ? { ...p, currentStock: o.current, safetyStock: o.safety, restockAt: o.restockAt || undefined, note: o.note || p.note }
          : p;
        return { ...merged, status: deriveStockStatus(merged) };
      }),
    [overrides]
  );

  const filtered = rows.filter(
    (r) => (tab === "전체" || r.status === tab) && (!q || r.name.includes(q))
  );

  const summary = {
    low: rows.filter((r) => r.status === "부족" || r.status === "품절임박" || r.status === "품절" || r.status === "재입고예정").length,
    out: rows.filter((r) => r.status === "품절").length,
    incoming: rows.filter((r) => r.status === "재입고예정").length,
    healthy: rows.filter((r) => r.status === "정상").length,
  };

  function startEdit(r: typeof rows[number]) {
    setEditing(r.id);
    setDraft({ current: r.currentStock, safety: r.safetyStock, restockAt: r.restockAt ?? "", note: r.note ?? "" });
  }
  function applyEdit(id: string) {
    setOverrides((prev) => ({ ...prev, [id]: { ...draft } }));
    setEditing(null);
  }

  return (
    <PageShell
      icon={BarChart2}
      title="재고 관리"
      subtitle="시즌상품/옵션 단위 재고와 안전재고"
      maxWidth="1300px"
      action={<PrimaryButton><Plus className="w-3.5 h-3.5" /> 재고 항목 추가</PrimaryButton>}
    >
      <AITaskPanel category="재고 관리" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <SummaryCard label="재고 부족" value={summary.low} tone="amber" hint="안전재고 미달" />
        <SummaryCard label="품절" value={summary.out} tone="rose" hint="즉시 발주" />
        <SummaryCard label="재입고 예정" value={summary.incoming} tone="blue" hint="입고 대기" />
        <SummaryCard label="정상" value={summary.healthy} tone="emerald" hint="안전재고 이상" />
      </div>

      <GlassCard className="p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="상품 검색"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors",
                tab === t
                  ? "bg-[#0047CC] text-white border-[#0047CC]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#0047CC]"
              )}
            >
              {t}{" "}
              <span className={cn("ml-1 text-[10px]", tab === t ? "text-blue-100" : "text-slate-400")}>
                {t === "전체" ? rows.length : rows.filter((r) => r.status === t).length}
              </span>
            </button>
          ))}
        </div>
      </GlassCard>

      {rows.filter((r) => r.status === "품절" || r.status === "품절임박").length > 0 && (
        <GlassCard className="p-4 mb-4 border-rose-200 bg-rose-50/40">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-extrabold text-rose-700 mb-1">즉시 조치 필요</p>
              <div className="flex flex-wrap gap-1.5">
                {rows
                  .filter((r) => r.status === "품절" || r.status === "품절임박")
                  .map((r) => (
                    <span key={r.id} className="text-[11px] font-bold text-rose-700 bg-white border border-rose-200 px-2 py-0.5 rounded-full">
                      {r.name}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60">
              <tr>
                <Th>상품</Th>
                <Th>현재 재고</Th>
                <Th>안전재고</Th>
                <Th>적정성</Th>
                <Th>재입고 예정</Th>
                <Th>상태</Th>
                <Th className="text-right">관리</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-slate-400 py-10 text-sm">조건에 맞는 항목이 없습니다.</td></tr>
              )}
              {filtered.map((r, i) => {
                const ratio = r.safetyStock > 0 ? Math.min(100, Math.round((r.currentStock / r.safetyStock) * 100)) : 0;
                const isEditing = editing === r.id;
                return (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-t border-slate-100 hover:bg-blue-50/30 align-top"
                  >
                    <Td>
                      <div className="text-sm font-extrabold text-slate-900">{r.name}</div>
                      <div className="text-[11px] text-slate-500">{r.category}</div>
                      {r.note && !isEditing && <div className="text-[10px] text-slate-400 mt-1">{r.note}</div>}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <input type="number" value={draft.current}
                          onChange={(e) => setDraft({ ...draft, current: Number(e.target.value) })}
                          className="w-20 h-8 px-2 rounded-lg border border-[#0047CC] text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0047CC]/20" />
                      ) : (
                        <span className="text-sm font-extrabold text-slate-900 tabular-nums">{r.currentStock}</span>
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <input type="number" value={draft.safety}
                          onChange={(e) => setDraft({ ...draft, safety: Number(e.target.value) })}
                          className="w-20 h-8 px-2 rounded-lg border border-[#0047CC] text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0047CC]/20" />
                      ) : (
                        <span className="text-sm text-slate-600 tabular-nums">{r.safetyStock}</span>
                      )}
                    </Td>
                    <Td>
                      <div className="w-32">
                        <ProgressBar value={ratio} tone={ratio >= 100 ? "emerald" : ratio >= 50 ? "amber" : "rose"} />
                        <div className="text-[10px] text-slate-500 mt-1 tabular-nums">{ratio}%</div>
                      </div>
                    </Td>
                    <Td>
                      {isEditing ? (
                        <input type="date" value={draft.restockAt}
                          onChange={(e) => setDraft({ ...draft, restockAt: e.target.value })}
                          className="h-8 px-2 rounded-lg border border-[#0047CC] text-xs focus:outline-none focus:ring-2 focus:ring-[#0047CC]/20" />
                      ) : r.restockAt ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          <CalendarClock className="w-3 h-3" />
                          {r.restockAt}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </Td>
                    <Td><Pill tone={STATUS_TONE[r.status]}>{r.status}</Pill></Td>
                    <Td className="text-right">
                      {isEditing ? (
                        <button onClick={() => applyEdit(r.id)} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0047CC] hover:opacity-80">
                          <Save className="w-3 h-3" /> 저장
                        </button>
                      ) : (
                        <button onClick={() => startEdit(r)} className="text-[11px] font-bold text-[#0047CC] hover:opacity-80">
                          편집
                        </button>
                      )}
                    </Td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <RelatedTools
        items={[
          { label: "상품 관리", href: "/app/tools/store-ops/products" },
          { label: "이슈 / 알림", href: "/app/tools/store-ops/issues" },
          { label: "수익 분석", href: "/app/tools/margin" },
          { label: "운영 보드", href: "/app/tools/store-ops/board" },
        ]}
      />
    </PageShell>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3", className)}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3", className)}>{children}</td>;
}

function SummaryCard({ label, value, tone, hint }: { label: string; value: number; tone: ToneKey; hint?: string }) {
  const tones: Record<ToneKey, string> = {
    blue:    "from-blue-50 to-blue-100/40 border-blue-200 text-blue-700",
    emerald: "from-emerald-50 to-emerald-100/40 border-emerald-200 text-emerald-700",
    rose:    "from-rose-50 to-rose-100/40 border-rose-200 text-rose-700",
    amber:   "from-amber-50 to-amber-100/40 border-amber-200 text-amber-700",
    violet:  "from-violet-50 to-violet-100/40 border-violet-200 text-violet-700",
    slate:   "from-slate-50 to-slate-100/40 border-slate-200 text-slate-700",
  };
  return (
    <div className={cn("rounded-2xl border bg-gradient-to-br p-4", tones[tone])}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</p>
        <p className="text-2xl font-extrabold tracking-tight tabular-nums">{value}</p>
      </div>
      {hint && <p className="text-[10px] mt-1 opacity-70">{hint}</p>}
    </div>
  );
}
