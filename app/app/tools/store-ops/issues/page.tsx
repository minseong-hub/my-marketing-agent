"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Plus, Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard, PageShell, PrimaryButton, GhostButton, Pill, RelatedTools, ToneKey } from "@/components/store-ops/shared";

type Category = "품절" | "배송 이슈" | "일정 지연" | "광고 보류" | "등록 누락";
type Severity = "긴급" | "확인 필요" | "지연" | "보류" | "해결 완료";

type Issue = {
  id: number;
  title: string;
  desc: string;
  category: Category;
  severity: Severity;
  time: string;
  link?: string;
};

const issues: Issue[] = [
  { id: 1, title: "성주참외 재고 32box", desc: "7일 내 소진 예상 — 재발주 필요", category: "품절", severity: "긴급", time: "방금 전", link: "/app/tools/store-ops/schedule" },
  { id: 2, title: "쿠팡 로켓 배송 지연", desc: "특정 권역 1~2일 지연 발생", category: "배송 이슈", severity: "확인 필요", time: "2시간 전" },
  { id: 3, title: "한라봉 상세페이지 마감 지연", desc: "오픈 D-3 시점 진행률 70%", category: "일정 지연", severity: "지연", time: "5시간 전", link: "/app/tools/store-ops/checklist" },
  { id: 4, title: "신규 광고 카피 검토 보류", desc: "법무 컴플라이언스 확인 대기", category: "광고 보류", severity: "보류", time: "어제" },
  { id: 5, title: "한라봉 5kg 자사몰 등록 누락", desc: "스마트스토어만 등록, 자사몰 미등록", category: "등록 누락", severity: "확인 필요", time: "어제", link: "/app/tools/store-ops/checklist" },
  { id: 6, title: "감귤 선물세트 이미지 1컷 누락", desc: "대표 이미지 4번 누락", category: "등록 누락", severity: "해결 완료", time: "2일 전" },
];

const SEV_TONE: Record<Severity, ToneKey> = {
  "긴급": "rose",
  "확인 필요": "blue",
  "지연": "amber",
  "보류": "slate",
  "해결 완료": "emerald",
};

const CAT_TABS: (Category | "전체")[] = ["전체", "품절", "배송 이슈", "일정 지연", "광고 보류", "등록 누락"];
const SEV_TABS: (Severity | "전체")[] = ["전체", "긴급", "확인 필요", "지연", "보류", "해결 완료"];

export default function IssuesPage() {
  const [cat, setCat] = useState<Category | "전체">("전체");
  const [sev, setSev] = useState<Severity | "전체">("전체");

  const filtered = issues.filter((i) => (cat === "전체" || i.category === cat) && (sev === "전체" || i.severity === sev));

  const summary = {
    urgent: issues.filter((i) => i.severity === "긴급").length,
    checking: issues.filter((i) => i.severity === "확인 필요").length,
    delayed: issues.filter((i) => i.severity === "지연").length,
    held: issues.filter((i) => i.severity === "보류").length,
    resolved: issues.filter((i) => i.severity === "해결 완료").length,
  };

  return (
    <PageShell
      icon={AlertCircle}
      title="이슈 / 알림"
      subtitle="품절 · 배송 · 일정 · 광고 · 등록 누락 통합 모니터링"
      maxWidth="1200px"
      action={
        <div className="flex items-center gap-2">
          <GhostButton><Filter className="w-3.5 h-3.5" /> 필터</GhostButton>
          <PrimaryButton><Plus className="w-3.5 h-3.5" /> 이슈 등록</PrimaryButton>
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5">
        <SummaryChip label="긴급" value={summary.urgent} tone="rose" />
        <SummaryChip label="확인 필요" value={summary.checking} tone="blue" />
        <SummaryChip label="지연" value={summary.delayed} tone="amber" />
        <SummaryChip label="보류" value={summary.held} tone="slate" />
        <SummaryChip label="해결 완료" value={summary.resolved} tone="emerald" />
      </div>

      <GlassCard className="p-4 mb-4">
        <div className="space-y-2">
          <FilterRow label="카테고리" tabs={CAT_TABS} value={cat} onChange={(v) => setCat(v as any)} />
          <FilterRow label="상태" tabs={SEV_TABS} value={sev} onChange={(v) => setSev(v as any)} />
        </div>
      </GlassCard>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <GlassCard className="p-10 text-center text-sm text-slate-400">조건에 맞는 이슈가 없습니다.</GlassCard>
        )}
        {filtered.map((it, i) => {
          const Wrapper: any = it.link ? "a" : "div";
          return (
            <motion.div key={it.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Wrapper {...(it.link ? { href: it.link } : {})}>
                <GlassCard hover className="p-4 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", SEV_TONE[it.severity] === "rose" ? "bg-rose-500" : SEV_TONE[it.severity] === "amber" ? "bg-amber-500" : SEV_TONE[it.severity] === "blue" ? "bg-blue-500" : SEV_TONE[it.severity] === "emerald" ? "bg-emerald-500" : "bg-slate-400")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-extrabold text-slate-900">{it.title}</p>
                        <Pill tone={SEV_TONE[it.severity]}>{it.severity}</Pill>
                        <span className="text-[10px] font-bold text-slate-400">#{it.category}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">{it.desc}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" /> {it.time}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </Wrapper>
            </motion.div>
          );
        })}
      </div>

      <RelatedTools
        items={[
          { label: "운영 보드", href: "/app/tools/store-ops/board", hint: "이슈를 태스크로 전환" },
          { label: "체크리스트", href: "/app/tools/store-ops/checklist" },
          { label: "CRM 응대", href: "/app/tools/crm", hint: "고객 이슈 처리" },
          { label: "수익 분석", href: "/app/tools/margin", hint: "품절 영향 추적" },
        ]}
      />
    </PageShell>
  );
}

function SummaryChip({ label, value, tone }: { label: string; value: number; tone: ToneKey }) {
  const tones: Record<ToneKey, string> = {
    blue: "from-blue-50 to-blue-100/40 border-blue-200 text-blue-700",
    rose: "from-rose-50 to-rose-100/40 border-rose-200 text-rose-700",
    amber: "from-amber-50 to-amber-100/40 border-amber-200 text-amber-700",
    emerald: "from-emerald-50 to-emerald-100/40 border-emerald-200 text-emerald-700",
    violet: "from-violet-50 to-violet-100/40 border-violet-200 text-violet-700",
    slate: "from-slate-50 to-slate-100/40 border-slate-200 text-slate-700",
  };
  return (
    <div className={cn("rounded-2xl border bg-gradient-to-br p-3 flex items-center justify-between", tones[tone])}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-xl font-extrabold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

function FilterRow({
  label,
  tabs,
  value,
  onChange,
}: {
  label: string;
  tabs: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-16 flex-shrink-0">{label}</p>
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors",
            value === t
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
