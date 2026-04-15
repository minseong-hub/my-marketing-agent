"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Layout, Plus, Search, Image as ImageIcon, FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GlassCard, PageShell, PrimaryButton, Pill, ProgressBar, RelatedTools, ToneKey,
} from "@/components/store-ops/shared";
import {
  PRODUCTS, isVisibleProduct, UploadStatus, type SeasonalProduct,
} from "@/lib/store-ops/seasonal-data";

const STATUS_TONE: Record<UploadStatus, ToneKey> = {
  "미등록": "slate",
  "등록 준비중": "blue",
  "등록 완료": "emerald",
  "수정 필요": "amber",
  "검토 필요": "violet",
};

const TABS: (UploadStatus | "전체")[] = ["전체", "미등록", "등록 준비중", "수정 필요", "검토 필요", "등록 완료"];

// URL ?status= aliases used by the home page summary cards
function aliasToStatus(alias: string | null): UploadStatus | "전체" | "pending" | "fix" | null {
  if (!alias) return null;
  if (alias === "pending" || alias === "fix") return alias;
  if (TABS.includes(alias as UploadStatus)) return alias as UploadStatus;
  return null;
}

export default function UploadsPage() {
  const sp = useSearchParams();
  const [tab, setTab] = useState<UploadStatus | "전체">("전체");
  const [groupFilter, setGroupFilter] = useState<"all" | "pending" | "fix">("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    const alias = aliasToStatus(sp.get("status"));
    if (alias === "pending") { setGroupFilter("pending"); setTab("전체"); }
    else if (alias === "fix") { setGroupFilter("fix"); setTab("전체"); }
    else if (alias && alias !== "전체") setTab(alias as UploadStatus);
  }, [sp]);

  const rows = useMemo(() => PRODUCTS.filter(isVisibleProduct), []);

  const filtered = rows.filter((r) => {
    if (q && !r.name.includes(q)) return false;
    if (groupFilter === "pending" && !(r.uploadStatus === "미등록" || r.uploadStatus === "등록 준비중")) return false;
    if (groupFilter === "fix" && !(r.uploadStatus === "수정 필요" || r.uploadStatus === "검토 필요")) return false;
    if (tab !== "전체" && r.uploadStatus !== tab) return false;
    return true;
  });

  const summary = {
    pending: rows.filter((r) => r.uploadStatus === "미등록" || r.uploadStatus === "등록 준비중").length,
    fix: rows.filter((r) => r.uploadStatus === "수정 필요").length,
    review: rows.filter((r) => r.uploadStatus === "검토 필요").length,
    done: rows.filter((r) => r.uploadStatus === "등록 완료").length,
  };

  return (
    <PageShell
      icon={Layout}
      title="상품 업로드 관리"
      subtitle="자사몰 · 스마트스토어 등록 흐름을 한 곳에서"
      maxWidth="1400px"
      action={<PrimaryButton><Plus className="w-3.5 h-3.5" /> 업로드 항목 추가</PrimaryButton>}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <SummaryCard label="등록 대기" value={summary.pending} tone="blue" hint="미등록 + 준비중" />
        <SummaryCard label="수정 필요" value={summary.fix} tone="amber" hint="가격/이미지 불일치" />
        <SummaryCard label="검토 필요" value={summary.review} tone="violet" hint="정책/품질 검토" />
        <SummaryCard label="등록 완료" value={summary.done} tone="emerald" hint="모든 채널 발행" />
      </div>

      <GlassCard className="p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="상품 검색"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setGroupFilter("all"); }}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors",
                tab === t && groupFilter === "all"
                  ? "bg-[#0047CC] text-white border-[#0047CC]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#0047CC]"
              )}
            >
              {t}{" "}
              <span className={cn("ml-1 text-[10px]", tab === t && groupFilter === "all" ? "text-blue-100" : "text-slate-400")}>
                {t === "전체" ? rows.length : rows.filter((r) => r.uploadStatus === t).length}
              </span>
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <GlassCard className="p-10 text-center text-sm text-slate-400">조건에 맞는 항목이 없습니다.</GlassCard>
        )}
        {filtered.map((r, i) => {
          const checks = [r.thumbReady, r.detailReady, r.ownMall, r.smartStore];
          const ready = checks.filter(Boolean).length;
          const pct = (ready / checks.length) * 100;
          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <GlassCard hover className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_auto] gap-4 items-start">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <p className="text-sm font-extrabold text-slate-900">{r.name}</p>
                      <Pill tone={STATUS_TONE[r.uploadStatus]}>{r.uploadStatus}</Pill>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-bold text-slate-900 tabular-nums">₩{r.price.toLocaleString()}</span>
                      {r.discountedPrice && (
                        <span className="text-rose-600 font-bold tabular-nums">→ ₩{r.discountedPrice.toLocaleString()}</span>
                      )}
                    </div>
                    {r.note && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 mt-2">{r.note}</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-2">최종 수정 {r.updatedAt}</p>
                  </div>

                  <div>
                    <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                      <CheckBadge label="썸네일" icon={<ImageIcon className="w-3 h-3" />} ready={r.thumbReady} />
                      <CheckBadge label="상세페이지" icon={<FileText className="w-3 h-3" />} ready={r.detailReady} />
                      <CheckBadge label="자사몰" icon={<ExternalLink className="w-3 h-3" />} ready={r.ownMall} />
                      <CheckBadge label="스마트스토어" icon={<ExternalLink className="w-3 h-3" />} ready={r.smartStore} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1"><ProgressBar value={pct} tone={pct === 100 ? "emerald" : pct >= 50 ? "blue" : "amber"} /></div>
                      <span className="text-[10px] font-bold text-slate-500 tabular-nums">{ready}/4</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 lg:items-end">
                    <button className="h-8 px-3 rounded-lg bg-[#0047CC] hover:opacity-90 text-white text-[11px] font-bold transition-colors">편집</button>
                    <button className="h-8 px-3 rounded-lg border border-slate-200 hover:border-[#0047CC] text-slate-600 text-[11px] font-bold transition-colors">체크리스트 열기</button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <RelatedTools
        items={[
          { label: "상품 관리", href: "/app/tools/store-ops/products" },
          { label: "체크리스트", href: "/app/tools/store-ops/checklist" },
          { label: "상세페이지", href: "/app/tools/detail-page" },
          { label: "이슈 / 알림", href: "/app/tools/store-ops/issues" },
        ]}
      />
    </PageShell>
  );
}

function CheckBadge({ label, icon, ready }: { label: string; icon: React.ReactNode; ready: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-colors",
        ready ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-400"
      )}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {ready ? (
        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <span className="text-slate-300">—</span>
      )}
    </div>
  );
}

function SummaryCard({ label, value, tone, hint }: { label: string; value: number; tone: ToneKey; hint?: string }) {
  const tones: Record<ToneKey, string> = {
    blue: "from-blue-50 to-blue-100/40 border-blue-200 text-blue-700",
    emerald: "from-emerald-50 to-emerald-100/40 border-emerald-200 text-emerald-700",
    rose: "from-rose-50 to-rose-100/40 border-rose-200 text-rose-700",
    amber: "from-amber-50 to-amber-100/40 border-amber-200 text-amber-700",
    violet: "from-violet-50 to-violet-100/40 border-violet-200 text-violet-700",
    slate: "from-slate-50 to-slate-100/40 border-slate-200 text-slate-700",
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
