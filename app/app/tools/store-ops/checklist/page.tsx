"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Plus, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard, PageShell, PrimaryButton, ProgressBar, Pill, RelatedTools } from "@/components/store-ops/shared";
import { AITaskPanel } from "@/components/store-ops/ai-task-panel";
import { PRODUCTS, TODAY, type SeasonalProduct } from "@/lib/store-ops/seasonal-data";

const LAUNCH_ITEMS = [
  "상품명/옵션 확정",
  "판매가 확정",
  "썸네일 완료",
  "상세페이지 완료",
  "자사몰 등록 완료",
  "스마트스토어 등록 완료",
  "SNS 콘텐츠 완료",
  "광고 세팅 완료",
  "공지 작성 완료",
];

function readinessTone(pct: number, dDay: number) {
  if (pct === 100) return { label: "오픈 가능", tone: "emerald" as const };
  if (pct >= 80) return { label: "거의 완료", tone: "blue" as const };
  if (dDay <= 7 && pct < 70) return { label: "보류 — 보강 필요", tone: "rose" as const };
  if (pct >= 30) return { label: "준비중", tone: "amber" as const };
  return { label: "준비중 (초기)", tone: "slate" as const };
}

function dDay(p: SeasonalProduct): number {
  if (!p.launchDate) return 999;
  const d = new Date(p.launchDate);
  return Math.ceil((d.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ChecklistPage() {
  // Source: products that are upcoming this season (matches home "오픈 예정" card)
  const initialProducts = useMemo(
    () =>
      PRODUCTS.filter((p) => p.status === "시즌 오픈 예정")
        .sort((a, b) => dDay(a) - dDay(b)),
    []
  );

  const [products, setProducts] = useState(initialProducts);
  const [activeId, setActiveId] = useState(initialProducts[0]?.id ?? "");
  const active = products.find((p) => p.id === activeId);

  if (!active) {
    return (
      <PageShell icon={CheckSquare} title="체크리스트" subtitle="출시 준비 9단계" maxWidth="900px">
        <GlassCard className="p-10 text-center text-sm text-slate-400">
          현재 오픈 예정인 시즌상품이 없습니다.
        </GlassCard>
      </PageShell>
    );
  }

  const doneCount = active.checklist.filter(Boolean).length;
  const pct = Math.round((doneCount / LAUNCH_ITEMS.length) * 100);
  const missing = LAUNCH_ITEMS.filter((_, i) => !active.checklist[i]);
  const dd = dDay(active);
  const readiness = readinessTone(pct, dd);

  function toggle(idx: number) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === activeId ? { ...p, checklist: p.checklist.map((s, i) => (i === idx ? !s : s)) } : p
      )
    );
  }

  return (
    <PageShell
      icon={CheckSquare}
      title="체크리스트"
      subtitle="시즌 오픈 예정 상품의 출시 준비 9단계"
      maxWidth="1200px"
      action={<PrimaryButton><Plus className="w-3.5 h-3.5" /> 상품 추가</PrimaryButton>}
    >
      <AITaskPanel category="체크리스트" />
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-1.5 px-1">
            시즌 오픈 예정 ({products.length})
          </p>
          {products.map((p) => {
            const d = p.checklist.filter(Boolean).length;
            const pp = Math.round((d / LAUNCH_ITEMS.length) * 100);
            const isActive = p.id === activeId;
            const ddv = dDay(p);
            return (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={cn(
                  "w-full text-left p-3.5 rounded-2xl border transition-all",
                  isActive
                    ? "bg-[#0047CC] border-[#0047CC] text-white shadow-md shadow-[#0047CC]/25"
                    : "bg-white border-slate-200 hover:border-[#0047CC]"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={cn("text-sm font-extrabold", isActive ? "text-white" : "text-slate-900")}>{p.name}</p>
                  <ChevronRight className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-slate-300")} />
                </div>
                <div className={cn("flex items-center gap-2 text-[10px] mb-2", isActive ? "text-blue-100" : "text-slate-500")}>
                  <span className="font-bold">{p.launchDate}</span>
                  <span>·</span>
                  <span>D-{ddv}</span>
                </div>
                <div className={cn("h-1.5 rounded-full overflow-hidden", isActive ? "bg-blue-500/40" : "bg-slate-100")}>
                  <div className={cn("h-full rounded-full", isActive ? "bg-white" : "bg-[#0047CC]")} style={{ width: `${pp}%` }} />
                </div>
                <p className={cn("text-[10px] font-bold mt-1.5 tabular-nums", isActive ? "text-blue-100" : "text-slate-500")}>
                  {d}/{LAUNCH_ITEMS.length} ({pp}%)
                </p>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <p className="text-[10px] font-bold text-[#0047CC] uppercase tracking-[0.18em] mb-1">출시 준비 점수</p>
                <h2 className="text-xl font-extrabold text-slate-900">{active.name}</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">오픈 {active.launchDate} · D-{dd} · {active.channels.join(" / ") || "채널 미연결"}</p>
                {active.prevSeasonNote && (
                  <p className="text-[11px] text-slate-500 mt-1">↺ 지난 시즌: {active.prevSeasonNote}</p>
                )}
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-3xl font-extrabold tabular-nums",
                  pct === 100 ? "text-emerald-600" : pct >= 70 ? "text-[#0047CC]" : pct >= 40 ? "text-amber-600" : "text-rose-600"
                )}>
                  {pct}%
                </p>
                <Pill tone={readiness.tone}>{readiness.label}</Pill>
              </div>
            </div>
            <ProgressBar value={pct} tone={pct === 100 ? "emerald" : pct >= 70 ? "blue" : pct >= 40 ? "amber" : "rose"} />
            {missing.length > 0 && dd <= 7 && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-rose-700">
                  <span className="font-bold">출시 임박</span> — 누락 항목 {missing.length}개를 우선 처리하세요.
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">출시 준비 항목</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {LAUNCH_ITEMS.map((label, i) => {
                const checked = active.checklist[i];
                return (
                  <button
                    key={label}
                    onClick={() => toggle(i)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                      checked ? "bg-blue-50/60 border-blue-200" : "bg-white border-slate-200 hover:border-[#0047CC]"
                    )}
                  >
                    <div className={cn("w-[18px] h-[18px] rounded-md border-2 flex-shrink-0 flex items-center justify-center", checked ? "bg-[#0047CC] border-[#0047CC]" : "border-slate-300")}>
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={cn("text-xs font-semibold flex-1", checked ? "text-blue-800" : "text-slate-700")}>{label}</span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {missing.length > 0 && (
            <GlassCard className="p-5">
              <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-3">누락 항목 ({missing.length})</p>
              <div className="flex flex-wrap gap-2">
                {missing.map((m) => (
                  <span key={m} className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                    {m}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      <RelatedTools
        items={[
          { label: "상세페이지 제작", href: "/app/tools/detail-page" },
          { label: "SNS 콘텐츠", href: "/app/tools/sns/create" },
          { label: "광고 세팅", href: "/app/tools/ads/campaigns" },
          { label: "운영 보드", href: "/app/tools/store-ops/board" },
        ]}
      />
    </PageShell>
  );
}
