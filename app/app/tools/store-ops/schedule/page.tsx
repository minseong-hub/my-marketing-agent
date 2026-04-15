"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Plus, Package, Sparkles, RefreshCw, CalendarX, Hourglass, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard, PageShell, PrimaryButton, ProgressBar, Pill, RelatedTools } from "@/components/store-ops/shared";
import { AITaskPanel } from "@/components/store-ops/ai-task-panel";

type Cat = "신상품" | "재입고" | "종료 예정" | "예약판매" | "시즌 일정";

type Item = {
  name: string;
  category: Cat;
  openDate: string;
  dDay: number;
  status: string;
  statusTone: "blue" | "amber" | "emerald" | "rose" | "slate" | "violet";
  progress: number;
  channel: string;
  note?: string;
};

const items: Item[] = [
  { name: "성주참외 3kg", category: "신상품", openDate: "2026-04-18", dDay: 3, status: "상세 제작", statusTone: "blue", progress: 70, channel: "스마트스토어", note: "이미지 11컷 교체 진행" },
  { name: "제주 한라봉 5kg", category: "신상품", openDate: "2026-04-25", dDay: 10, status: "이미지 준비", statusTone: "amber", progress: 45, channel: "쿠팡" },
  { name: "청정 딸기 2kg", category: "예약판매", openDate: "2026-05-06", dDay: 21, status: "기획", statusTone: "violet", progress: 15, channel: "전채널", note: "5월 가정의 달 묶음 검토" },
  { name: "감귤 선물세트", category: "재입고", openDate: "2026-04-19", dDay: 4, status: "재고 입고 대기", statusTone: "blue", progress: 80, channel: "스마트스토어", note: "200box 입고 예정" },
  { name: "겨울 사과 5kg", category: "종료 예정", openDate: "2026-04-30", dDay: 15, status: "재고 소진 중", statusTone: "amber", progress: 60, channel: "전채널", note: "잔여 87box" },
  { name: "여름 복숭아 3kg", category: "시즌 일정", openDate: "2026-06-15", dDay: 61, status: "프리시즌 기획", statusTone: "slate", progress: 5, channel: "스마트스토어" },
];

const CATS: { key: Cat | "전체"; label: string; icon: any; tone: string }[] = [
  { key: "전체", label: "전체", icon: CalendarDays, tone: "text-slate-600" },
  { key: "신상품", label: "신상품", icon: Sparkles, tone: "text-blue-600" },
  { key: "재입고", label: "재입고", icon: RefreshCw, tone: "text-emerald-600" },
  { key: "종료 예정", label: "종료 예정", icon: CalendarX, tone: "text-amber-600" },
  { key: "예약판매", label: "예약판매", icon: Hourglass, tone: "text-violet-600" },
  { key: "시즌 일정", label: "시즌 일정", icon: Snowflake, tone: "text-sky-600" },
];

export default function SchedulePage() {
  const [filter, setFilter] = useState<Cat | "전체">("전체");
  const filtered = filter === "전체" ? items : items.filter((i) => i.category === filter);

  return (
    <PageShell
      icon={CalendarDays}
      title="상품 일정 관리"
      subtitle="신상품 · 재입고 · 종료 예정 · 예약판매 · 시즌 일정을 한 곳에서"
      maxWidth="1200px"
      action={<PrimaryButton><Plus className="w-3.5 h-3.5" /> 상품 일정 등록</PrimaryButton>}
    >
      <AITaskPanel category="일정 관리" />
      {/* Category filter chips */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {CATS.map((c) => {
          const Icon = c.icon;
          const active = filter === c.key;
          const count = c.key === "전체" ? items.length : items.filter((i) => i.category === c.key).length;
          return (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all",
                active
                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", active ? "text-white" : c.tone)} />
              {c.label}
              <span className={cn("text-[10px] font-bold px-1.5 rounded-full", active ? "bg-blue-500/40 text-white" : "bg-slate-100 text-slate-500")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GlassCard hover className="p-5 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <p className="text-sm font-extrabold text-slate-900">{p.name}</p>
                    <Pill tone={p.statusTone}>{p.status}</Pill>
                    <span className="text-[10px] font-bold text-slate-400">#{p.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    오픈 {p.openDate} · {p.channel}
                    {p.note && <span className="ml-2 text-slate-400">— {p.note}</span>}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1"><ProgressBar value={p.progress} tone={p.progress >= 70 ? "emerald" : p.progress >= 40 ? "blue" : "amber"} /></div>
                    <span className="text-[10px] font-bold text-slate-500 tabular-nums w-9 text-right">{p.progress}%</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p
                    className={cn(
                      "text-xl font-extrabold tabular-nums",
                      p.dDay < 0 ? "text-emerald-600" : p.dDay <= 7 ? "text-rose-600" : p.dDay <= 14 ? "text-amber-600" : "text-blue-600"
                    )}
                  >
                    {p.dDay < 0 ? "판매중" : `D-${p.dDay}`}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">진행률</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <RelatedTools
        items={[
          { label: "체크리스트", href: "/app/tools/store-ops/checklist", hint: "오픈 준비 현황 점검" },
          { label: "프로모션 관리", href: "/app/tools/store-ops/promotions" },
          { label: "SNS 일정", href: "/app/tools/sns/calendar", hint: "오픈일에 콘텐츠 예약" },
          { label: "광고 캠페인", href: "/app/tools/ads/campaigns" },
        ]}
      />
    </PageShell>
  );
}
