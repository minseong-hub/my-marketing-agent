"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Archive, CheckCircle2, Trophy, AlertOctagon, Lightbulb, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard, PageShell, PrimaryButton, Pill, RelatedTools, ToneKey } from "@/components/store-ops/shared";
import { AITaskPanel } from "@/components/store-ops/ai-task-panel";

type LaunchRecord = {
  id: string;
  product: string;
  openDate: string;
  outcome: "성공" | "보통" | "실패";
  channel: string;
  sales: string;
  note: string;
};

const launches: LaunchRecord[] = [
  { id: "l1", product: "감귤 선물세트", openDate: "2026-04-11", outcome: "성공", channel: "스마트스토어", sales: "1,240만원", note: "사전예약 배너 클릭률 12% — 다음 시즌 재활용" },
  { id: "l2", product: "겨울 사과 5kg", openDate: "2026-02-20", outcome: "보통", channel: "전채널", sales: "680만원", note: "쿠팡 노출 부진 — 광고 비중 늘려야" },
  { id: "l3", product: "한라봉 3kg 사전예약", openDate: "2026-01-15", outcome: "실패", channel: "스마트스토어", sales: "120만원", note: "썸네일 카피가 약함, 가격 메시지 부족" },
];

type EventRecord = {
  id: string;
  title: string;
  period: string;
  outcome: "성공" | "보통" | "실패";
  metric: string;
  note: string;
};

const events: EventRecord[] = [
  { id: "e1", title: "봄맞이 10% 할인", period: "2026-04-15 ~ 04-21", outcome: "성공", metric: "전환율 4.8%", note: "참외 세트 묶음이 핵심" },
  { id: "e2", title: "4월 회원 쿠폰", period: "2026-04-01 ~ 04-14", outcome: "성공", metric: "재구매 38%", note: "VIP 등급 우선 발송 효과" },
  { id: "e3", title: "겨울 사과 라이브", period: "2026-02-25", outcome: "실패", metric: "전환율 0.4%", note: "시간대 부적절 — 평일 저녁이 베스트" },
];

const seasonalNotes = [
  { season: "봄 (3~5월)", note: "신상품 + 가정의 달 묶음 효과 큼. 4월 중순부터 광고 강화." },
  { season: "여름 (6~8월)", note: "복숭아·자두 시즌 — 6월 1주차에 사전예약 오픈 권장." },
  { season: "가을 (9~11월)", note: "추석 선물세트 8월 말 등록 시작. 사과 수확 타이밍 체크." },
  { season: "겨울 (12~2월)", note: "감귤·한라봉 비중 ↑. 1월 초 사전예약 캠페인 효과 검증됨." },
];

const OUTCOME_TONE: Record<string, { tone: ToneKey; icon: any }> = {
  성공: { tone: "emerald", icon: Trophy },
  보통: { tone: "blue", icon: CheckCircle2 },
  실패: { tone: "rose", icon: AlertOctagon },
};

const TABS = ["오픈 기록", "행사 기록", "성공/실패 메모", "시즌 참고"] as const;

export default function HistoryPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("오픈 기록");

  return (
    <PageShell
      icon={Archive}
      title="운영 기록"
      subtitle="지난 오픈 · 행사 · 성공/실패 메모 · 다음 시즌 참고사항"
      maxWidth="1200px"
      action={<PrimaryButton><Plus className="w-3.5 h-3.5" /> 기록 추가</PrimaryButton>}
    >
      <AITaskPanel category="운영 기록" />
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
              tab === t
                ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "오픈 기록" && (
        <div className="space-y-3">
          {launches.map((l, i) => {
            const o = OUTCOME_TONE[l.outcome];
            const Icon = o.icon;
            return (
              <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard hover className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border", o.tone === "emerald" ? "bg-emerald-50 border-emerald-200" : o.tone === "rose" ? "bg-rose-50 border-rose-200" : "bg-blue-50 border-blue-200")}>
                      <Icon className={cn("w-5 h-5", o.tone === "emerald" ? "text-emerald-600" : o.tone === "rose" ? "text-rose-600" : "text-blue-600")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-extrabold text-slate-900">{l.product}</p>
                        <Pill tone={o.tone}>{l.outcome}</Pill>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">오픈 {l.openDate} · {l.channel}</p>
                      <p className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">{l.note}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">매출</p>
                      <p className="text-base font-extrabold text-slate-900 tabular-nums">{l.sales}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === "행사 기록" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {events.map((e, i) => {
            const o = OUTCOME_TONE[e.outcome];
            return (
              <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard hover className="p-5 h-full">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-extrabold text-slate-900">{e.title}</p>
                    <Pill tone={o.tone}>{e.outcome}</Pill>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">{e.period}</p>
                  <div className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5 inline-block mb-3">
                    {e.metric}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{e.note}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === "성공/실패 메모" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">성공 패턴</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {[
                "사전예약 배너 + 회원 쿠폰 조합은 전환율 2배",
                "선물세트는 추석/가정의 달 1주 전 노출 강화",
                "VIP 등급 우선 발송 → 재구매 38% 달성",
              ].map((s) => (
                <li key={s} className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">실패 학습</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {[
                "썸네일 카피 약하면 클릭률 절반 — 반드시 가격 메시지 포함",
                "라이브 평일 오후 시간대는 전환율 낮음",
                "쿠팡 노출 부진 시 광고 비중 ↑ 필수",
              ].map((s) => (
                <li key={s} className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50/40 border border-rose-100">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-600 mt-0.5 flex-shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      )}

      {tab === "시즌 참고" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {seasonalNotes.map((s, i) => (
            <motion.div key={s.season} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-5 h-full">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900 mb-1.5">{s.season}</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{s.note}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <RelatedTools
        items={[
          { label: "수익 분석", href: "/app/tools/margin", hint: "오픈별 마진 비교" },
          { label: "운영 보드", href: "/app/tools/store-ops/board" },
          { label: "체크리스트", href: "/app/tools/store-ops/checklist", hint: "성공 패턴 반영" },
          { label: "프로모션 관리", href: "/app/tools/store-ops/promotions" },
        ]}
      />
    </PageShell>
  );
}
