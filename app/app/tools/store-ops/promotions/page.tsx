"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Plus, CalendarRange, Percent, NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard, PageShell, PrimaryButton, Pill, RelatedTools, ToneKey } from "@/components/store-ops/shared";

type Status = "진행 중" | "예정" | "종료";

type Promo = {
  name: string;
  status: Status;
  dates: string;
  discount: string;
  channels: string[];
  sold: number;
  note?: string;
};

const promos: Promo[] = [
  { name: "봄맞이 신상품 10% 할인", status: "진행 중", dates: "4/15 ~ 4/21", discount: "10%", channels: ["스마트스토어", "쿠팡"], sold: 82, note: "참외 · 딸기 묶음 추천" },
  { name: "회원 전용 얼리버드", status: "예정", dates: "4/22 ~ 4/28", discount: "15%", channels: ["스마트스토어"], sold: 0, note: "VIP 등급 우선 알림" },
  { name: "5월 가정의 달 기획전", status: "예정", dates: "5/1 ~ 5/9", discount: "20%", channels: ["전채널"], sold: 0, note: "선물세트 노출 강화" },
  { name: "4월 회원 쿠폰", status: "종료", dates: "4/1 ~ 4/14", discount: "5%", channels: ["스마트스토어", "인스타"], sold: 124, note: "재구매 전환 38%" },
];

const STATUS_TONE: Record<Status, ToneKey> = {
  "진행 중": "emerald",
  "예정": "blue",
  "종료": "slate",
};

const TABS: { key: Status | "전체"; label: string }[] = [
  { key: "전체", label: "전체" },
  { key: "진행 중", label: "진행 중" },
  { key: "예정", label: "예정" },
  { key: "종료", label: "종료" },
];

export default function PromotionsPage() {
  const [tab, setTab] = useState<Status | "전체">("전체");
  const filtered = tab === "전체" ? promos : promos.filter((p) => p.status === tab);

  const summary = {
    active: promos.filter((p) => p.status === "진행 중").length,
    upcoming: promos.filter((p) => p.status === "예정").length,
    closed: promos.filter((p) => p.status === "종료").length,
  };

  return (
    <PageShell
      icon={Tag}
      title="프로모션 관리"
      subtitle="진행 중 · 예정 · 종료된 프로모션과 메모를 관리합니다"
      maxWidth="1200px"
      action={<PrimaryButton><Plus className="w-3.5 h-3.5" /> 프로모션 등록</PrimaryButton>}
    >
      <div className="grid grid-cols-3 gap-3 mb-5">
        <SummaryCard label="진행 중" value={summary.active} tone="emerald" />
        <SummaryCard label="예정" value={summary.upcoming} tone="blue" />
        <SummaryCard label="종료" value={summary.closed} tone="slate" />
      </div>

      <div className="flex items-center gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
              tab === t.key
                ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard hover className="p-5 cursor-pointer h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Percent className="w-4 h-4 text-blue-600" />
                </div>
                <Pill tone={STATUS_TONE[p.status]}>{p.status}</Pill>
              </div>
              <p className="text-sm font-extrabold text-slate-900 mb-2 leading-snug">{p.name}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-3">
                <CalendarRange className="w-3 h-3" />
                {p.dates}
              </div>
              {p.note && (
                <div className="flex items-start gap-1.5 mb-3 text-[11px] text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                  <NotebookPen className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-400" />
                  <span>{p.note}</span>
                </div>
              )}
              <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {p.channels.map((c) => (
                    <span key={c} className="text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-blue-600 tabular-nums leading-none">{p.discount}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{p.sold > 0 ? `${p.sold}건 판매` : "대기"}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <RelatedTools
        items={[
          { label: "운영 보드", href: "/app/tools/store-ops/board", hint: "프로모션 준비 태스크" },
          { label: "SNS 콘텐츠", href: "/app/tools/sns" },
          { label: "광고 캠페인", href: "/app/tools/ads/campaigns" },
          { label: "수익 분석", href: "/app/tools/margin" },
        ]}
      />
    </PageShell>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: ToneKey }) {
  const tones: Record<ToneKey, string> = {
    blue: "from-blue-50 to-blue-100/40 border-blue-200 text-blue-700",
    emerald: "from-emerald-50 to-emerald-100/40 border-emerald-200 text-emerald-700",
    slate: "from-slate-50 to-slate-100/40 border-slate-200 text-slate-700",
    rose: "from-rose-50 to-rose-100/40 border-rose-200 text-rose-700",
    amber: "from-amber-50 to-amber-100/40 border-amber-200 text-amber-700",
    violet: "from-violet-50 to-violet-100/40 border-violet-200 text-violet-700",
  };
  return (
    <div className={cn("rounded-2xl border bg-gradient-to-br p-4 flex items-center justify-between", tones[tone])}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-2xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}
