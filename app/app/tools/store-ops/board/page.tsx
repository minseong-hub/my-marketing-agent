"use client";

import { motion } from "framer-motion";
import { ClipboardList, Plus, MoreHorizontal, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard, PageShell, PrimaryButton, GhostButton, RelatedTools } from "@/components/store-ops/shared";

type Task = { t: string; tag: string; prio: "high" | "mid" | "low"; due?: string };

const columns: { id: string; label: string; tone: string; items: Task[] }[] = [
  {
    id: "todo",
    label: "해야 할 일",
    tone: "text-slate-600",
    items: [
      { t: "제주 한라봉 상세페이지 카피 최종 검수", tag: "상세페이지", prio: "high", due: "오늘" },
      { t: "5월 가정의 달 프로모션 기획", tag: "프로모션", prio: "mid", due: "4/19" },
      { t: "쿠팡 상품군 카테고리 재정비", tag: "운영", prio: "low" },
    ],
  },
  {
    id: "doing",
    label: "진행 중",
    tone: "text-blue-600",
    items: [
      { t: "스마트스토어 이미지 11컷 교체", tag: "상세페이지", prio: "high", due: "오늘" },
      { t: "오픈채팅 공지 템플릿 작성", tag: "CRM", prio: "mid" },
      { t: "배송사 단가 재협상", tag: "운영", prio: "mid" },
    ],
  },
  {
    id: "review",
    label: "검토 필요",
    tone: "text-violet-600",
    items: [
      { t: "딸기 2kg 판매가 리뷰 (마진 요약)", tag: "마진", prio: "high" },
      { t: "광고 카피 A안 vs B안 비교", tag: "광고", prio: "mid" },
    ],
  },
  {
    id: "done",
    label: "완료",
    tone: "text-emerald-600",
    items: [
      { t: "4월 회원 쿠폰 발송 완료", tag: "프로모션", prio: "mid" },
      { t: "상품 원가 엑셀 재정리", tag: "운영", prio: "low" },
    ],
  },
  {
    id: "hold",
    label: "보류",
    tone: "text-amber-600",
    items: [
      { t: "라이브 커머스 채널 검토", tag: "운영", prio: "low" },
    ],
  },
];

const PRIO = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  mid: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-500 border-slate-200",
};

const TAG_TONE: Record<string, string> = {
  상세페이지: "bg-violet-50 text-violet-700 border-violet-200",
  프로모션: "bg-blue-50 text-blue-700 border-blue-200",
  운영: "bg-slate-100 text-slate-600 border-slate-200",
  CRM: "bg-sky-50 text-sky-700 border-sky-200",
  광고: "bg-rose-50 text-rose-700 border-rose-200",
  마진: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function BoardPage() {
  return (
    <PageShell
      icon={ClipboardList}
      title="운영 보드"
      subtitle="해야 할 일 · 진행 중 · 검토 · 완료 · 보류"
      maxWidth="1400px"
      action={
        <div className="flex items-center gap-2">
          <GhostButton><Filter className="w-3.5 h-3.5" /> 필터</GhostButton>
          <PrimaryButton><Plus className="w-3.5 h-3.5" /> 새 태스크</PrimaryButton>
        </div>
      }
    >
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">자주 쓰는 용도</span>
        {["운영 업무", "상품 준비", "업로드 준비", "프로모션 준비", "이슈 대응"].map((u) => (
          <span key={u} className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
            #{u}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {columns.map((col, ci) => (
          <motion.div key={col.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }}>
            <GlassCard className="p-3.5 h-full">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <p className={cn("text-[11px] font-extrabold uppercase tracking-wider", col.tone)}>{col.label}</p>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">{col.items.length}</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {col.items.map((it, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm hover:shadow-blue-600/5 transition-all cursor-pointer"
                  >
                    <p className="text-xs text-slate-800 leading-relaxed mb-2.5 font-medium">{it.t}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border", TAG_TONE[it.tag] ?? TAG_TONE["운영"])}>
                        #{it.tag}
                      </span>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border", PRIO[it.prio])}>
                        {it.prio === "high" ? "긴급" : it.prio === "mid" ? "보통" : "낮음"}
                      </span>
                      {it.due && (
                        <span className="ml-auto text-[10px] font-bold text-slate-500">~{it.due}</span>
                      )}
                    </div>
                  </div>
                ))}
                <button className="w-full flex items-center justify-center gap-1 py-2 rounded-xl border border-dashed border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 text-xs font-semibold transition-colors">
                  <Plus className="w-3 h-3" /> 카드 추가
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <RelatedTools
        items={[
          { label: "체크리스트", href: "/app/tools/store-ops/checklist", hint: "런칭 항목 자동 동기화" },
          { label: "이슈 / 알림", href: "/app/tools/store-ops/issues", hint: "긴급 카드로 전환" },
          { label: "상세페이지", href: "/app/tools/detail-page" },
          { label: "광고 설정", href: "/app/tools/ads" },
        ]}
      />
    </PageShell>
  );
}
