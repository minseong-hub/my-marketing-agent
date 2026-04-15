"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  Search,
  Filter,
  Image as ImageIcon,
  X,
  Pencil,
  Tag,
  Layers,
  Snowflake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GlassCard,
  PageShell,
  PrimaryButton,
  GhostButton,
  Pill,
  RelatedTools,
  ToneKey,
} from "@/components/store-ops/shared";
import {
  PRODUCTS,
  SEASON_LABEL,
  ProductStatus,
  Season,
  type SeasonalProduct,
} from "@/lib/store-ops/seasonal-data";

const STATUS_TONE: Record<ProductStatus, ToneKey> = {
  "판매중":         "emerald",
  "시즌 준비중":    "blue",
  "시즌 오픈 예정": "blue",
  "시즌 종료 예정": "amber",
  "종료":           "slate",
  "숨김":           "violet",
};

const SEASON_TONE: Record<Season, string> = {
  spring: "bg-rose-50 text-rose-700 border-rose-200",
  summer: "bg-amber-50 text-amber-700 border-amber-200",
  autumn: "bg-orange-50 text-orange-700 border-orange-200",
  winter: "bg-sky-50 text-sky-700 border-sky-200",
  "year-round": "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_TABS: (ProductStatus | "전체")[] = [
  "전체", "판매중", "시즌 준비중", "시즌 오픈 예정", "시즌 종료 예정", "종료", "숨김",
];

export default function ProductsPage() {
  const sp = useSearchParams();
  const initialStatus = (sp.get("status") as ProductStatus | null) ?? "전체";
  const [products, setProducts] = useState<SeasonalProduct[]>(PRODUCTS);
  const [tab, setTab] = useState<ProductStatus | "전체">(initialStatus);
  const [seasonFilter, setSeasonFilter] = useState<Season | "all">("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<SeasonalProduct | null>(null);

  useEffect(() => {
    const s = sp.get("status") as ProductStatus | null;
    if (s) setTab(s);
  }, [sp]);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (tab === "전체" || p.status === tab) &&
          (seasonFilter === "all" || p.season === seasonFilter) &&
          (!q || p.name.includes(q) || p.sku?.includes(q.toUpperCase()) || p.category.includes(q))
      ),
    [products, tab, seasonFilter, q]
  );

  const counts = {
    selling: products.filter((p) => p.status === "판매중").length,
    prepping: products.filter((p) => p.status === "시즌 준비중").length,
    upcoming: products.filter((p) => p.status === "시즌 오픈 예정").length,
    ending: products.filter((p) => p.status === "시즌 종료 예정").length,
  };

  function save(p: SeasonalProduct) {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    setEditing(null);
  }

  return (
    <PageShell
      icon={Package}
      title="상품 관리"
      subtitle="시즌상품 정보 · 가격 · 채널 · 상태"
      maxWidth="1300px"
      action={<PrimaryButton><Plus className="w-3.5 h-3.5" /> 상품 등록</PrimaryButton>}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <SummaryCard label="판매중 시즌상품" value={counts.selling} tone="emerald" />
        <SummaryCard label="시즌 준비중" value={counts.prepping} tone="blue" />
        <SummaryCard label="시즌 오픈 예정" value={counts.upcoming} tone="blue" />
        <SummaryCard label="시즌 종료 예정" value={counts.ending} tone="amber" />
      </div>

      <GlassCard className="p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="상품명 / SKU / 카테고리 검색"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20"
            />
          </div>
          <div className="flex items-center gap-1">
            <Snowflake className="w-3.5 h-3.5 text-slate-400" />
            {(["all", "spring", "summer", "autumn", "winter"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeasonFilter(s)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors",
                  seasonFilter === s
                    ? "bg-[#0047CC] text-white border-[#0047CC]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-[#0047CC]"
                )}
              >
                {s === "all" ? "전체" : SEASON_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors",
                tab === s
                  ? "bg-[#0047CC] text-white border-[#0047CC]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#0047CC]"
              )}
            >
              {s}{" "}
              <span className={cn("ml-1 text-[10px]", tab === s ? "text-blue-100" : "text-slate-400")}>
                {s === "전체" ? products.length : products.filter((p) => p.status === s).length}
              </span>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60">
              <tr>
                <Th>상품</Th>
                <Th>시즌</Th>
                <Th>카테고리 / SKU</Th>
                <Th>판매가</Th>
                <Th>채널</Th>
                <Th>상태</Th>
                <Th className="text-right">관리</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-slate-400 py-10 text-sm">조건에 맞는 상품이 없습니다.</td></tr>
              )}
              {filtered.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-t border-slate-100 hover:bg-blue-50/30"
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">{p.name}</p>
                        {p.note && <p className="text-[11px] text-slate-500">{p.note}</p>}
                        {p.prevSeasonNote && (
                          <p className="text-[10px] text-slate-400 mt-0.5">↺ {p.prevSeasonNote}</p>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", SEASON_TONE[p.season])}>
                      {SEASON_LABEL[p.season]} {p.season !== "year-round" ? p.seasonYear : ""}
                    </span>
                    {p.isRecurring && (
                      <span className="ml-1 text-[10px] text-slate-400 font-bold">↻</span>
                    )}
                  </Td>
                  <Td>
                    <div className="text-xs text-slate-700">{p.category}</div>
                    {p.sku && <div className="text-[10px] text-slate-400 font-mono">{p.sku}</div>}
                  </Td>
                  <Td>
                    <div className="text-sm font-bold text-slate-900 tabular-nums">₩{p.price.toLocaleString()}</div>
                    {p.discount ? <div className="text-[10px] font-bold text-rose-600">-{p.discount}%</div> : null}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1 flex-wrap">
                      {p.channels.length === 0 ? (
                        <span className="text-[10px] text-slate-400">미연결</span>
                      ) : (
                        p.channels.map((c) => (
                          <span key={c} className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">
                            {c}
                          </span>
                        ))
                      )}
                    </div>
                  </Td>
                  <Td>
                    <Pill tone={STATUS_TONE[p.status]}>{p.status}</Pill>
                  </Td>
                  <Td className="text-right">
                    <button onClick={() => setEditing(p)} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0047CC] hover:opacity-80">
                      <Pencil className="w-3 h-3" /> 편집
                    </button>
                  </Td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {editing && (
        <EditDrawer product={editing} onClose={() => setEditing(null)} onSave={save} />
      )}

      <RelatedTools
        items={[
          { label: "재고 관리", href: "/app/tools/store-ops/inventory" },
          { label: "상품 업로드", href: "/app/tools/store-ops/uploads" },
          { label: "체크리스트", href: "/app/tools/store-ops/checklist" },
          { label: "운영 기록", href: "/app/tools/store-ops/history", hint: "지난 시즌 참고" },
        ]}
      />
    </PageShell>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3", className)}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-top", className)}>{children}</td>;
}

const ALL_CHANNELS = ["자사몰", "스마트스토어", "쿠팡", "11번가", "인스타", "전채널"];
const ALL_STATUSES: ProductStatus[] = ["시즌 준비중", "시즌 오픈 예정", "판매중", "시즌 종료 예정", "종료", "숨김"];
const ALL_SEASONS: Season[] = ["spring", "summer", "autumn", "winter", "year-round"];

function EditDrawer({
  product, onClose, onSave,
}: { product: SeasonalProduct; onClose: () => void; onSave: (p: SeasonalProduct) => void }) {
  const [draft, setDraft] = useState<SeasonalProduct>(product);
  const cls = "w-full h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20";

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col h-screen">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#0047CC] uppercase tracking-wider">상품 편집</p>
            <h2 className="text-base font-extrabold text-slate-900">{draft.name}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <Label icon={<Package className="w-3 h-3" />}>상품명</Label>
            <input className={cls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label icon={<Snowflake className="w-3 h-3" />}>시즌</Label>
              <select className={cls} value={draft.season} onChange={(e) => setDraft({ ...draft, season: e.target.value as Season })}>
                {ALL_SEASONS.map((s) => <option key={s} value={s}>{SEASON_LABEL[s]}</option>)}
              </select>
            </div>
            <div>
              <Label>시즌 연도</Label>
              <input type="number" className={cls + " tabular-nums"} value={draft.seasonYear} onChange={(e) => setDraft({ ...draft, seasonYear: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>오픈일</Label>
              <input type="date" className={cls} value={draft.launchDate ?? ""} onChange={(e) => setDraft({ ...draft, launchDate: e.target.value || undefined })} />
            </div>
            <div>
              <Label>종료일</Label>
              <input type="date" className={cls} value={draft.endDate ?? ""} onChange={(e) => setDraft({ ...draft, endDate: e.target.value || undefined })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label icon={<Layers className="w-3 h-3" />}>카테고리</Label>
              <input className={cls} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
            </div>
            <div>
              <Label>SKU</Label>
              <input className={cls + " font-mono"} value={draft.sku ?? ""} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label icon={<Tag className="w-3 h-3" />}>판매가</Label>
              <input type="number" className={cls + " tabular-nums"} value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
            </div>
            <div>
              <Label>할인(%)</Label>
              <input type="number" className={cls + " tabular-nums"} value={draft.discount ?? ""} onChange={(e) => setDraft({ ...draft, discount: e.target.value === "" ? undefined : Number(e.target.value) })} />
            </div>
            <div>
              <Label>원가</Label>
              <input type="number" className={cls + " tabular-nums"} value={draft.cost ?? ""} onChange={(e) => setDraft({ ...draft, cost: e.target.value === "" ? undefined : Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>상품 상태</Label>
              <select className={cls} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as ProductStatus })}>
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label>판매 상태</Label>
              <select className={cls} value={draft.saleStatus} onChange={(e) => setDraft({ ...draft, saleStatus: e.target.value as SeasonalProduct["saleStatus"] })}>
                <option value="판매">판매</option>
                <option value="중지">중지</option>
                <option value="예약">예약</option>
              </select>
            </div>
          </div>
          <div>
            <Label>등록 채널</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_CHANNELS.map((c) => {
                const on = draft.channels.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => setDraft({ ...draft, channels: on ? draft.channels.filter((x) => x !== c) : [...draft.channels, c] })}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors",
                      on ? "bg-[#0047CC] text-white border-[#0047CC]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0047CC]"
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label>지난 시즌 참고</Label>
            <textarea
              className="w-full min-h-[60px] p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20"
              value={draft.prevSeasonNote ?? ""}
              onChange={(e) => setDraft({ ...draft, prevSeasonNote: e.target.value || undefined })}
              placeholder="예: 전년 5월 라이브 전환율 4.6%"
            />
          </div>
          <div>
            <Label>메모</Label>
            <textarea
              className="w-full min-h-[60px] p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20"
              value={draft.note ?? ""}
              onChange={(e) => setDraft({ ...draft, note: e.target.value || undefined })}
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">취소</button>
          <button onClick={() => onSave(draft)} className="flex-[2] h-10 rounded-xl bg-[#0047CC] hover:opacity-90 text-sm font-bold text-white shadow-sm shadow-[#0047CC]/20">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

function Label({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <label className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
      {icon}
      {children}
    </label>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: ToneKey }) {
  const tones: Record<ToneKey, string> = {
    blue:    "from-blue-50 to-blue-100/40 border-blue-200 text-blue-700",
    emerald: "from-emerald-50 to-emerald-100/40 border-emerald-200 text-emerald-700",
    rose:    "from-rose-50 to-rose-100/40 border-rose-200 text-rose-700",
    amber:   "from-amber-50 to-amber-100/40 border-amber-200 text-amber-700",
    violet:  "from-violet-50 to-violet-100/40 border-violet-200 text-violet-700",
    slate:   "from-slate-50 to-slate-100/40 border-slate-200 text-slate-700",
  };
  return (
    <div className={cn("rounded-2xl border bg-gradient-to-br p-4 flex items-center justify-between", tones[tone])}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-2xl font-extrabold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}
