"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

type ScopeId = "marketing" | "detail_page" | "ads" | "finance";

const SCOPE_LABEL: Record<ScopeId, { name: string; agent: string; color: string }> = {
  marketing:   { name: "마케팅",     agent: "마키",   color: "#ff4ec9" },
  detail_page: { name: "상세페이지", agent: "데일리", color: "#5ce5ff" },
  ads:         { name: "광고",       agent: "애디",   color: "#ffd84d" },
  finance:     { name: "재무",       agent: "페니",   color: "#66ff9d" },
};

interface PlanItem {
  id: string;
  scope: string;
  summary: Record<string, unknown>;
  seedsCount: number;
  autoExecutableCount: number;
  executionLogCount: number;
  cost: { costUsd: number; costKrw: number; model: string };
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export function PlansListClient({
  initialItems,
  initialCounts,
}: {
  initialItems: PlanItem[];
  initialCounts: { total: number; byScope: Record<string, number> };
}) {
  const [items, setItems] = useState(initialItems);
  const [scopeFilter, setScopeFilter] = useState<ScopeId | "all">("all");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "cost">("recent");

  const filtered = useMemo(() => {
    let f = items;
    if (scopeFilter !== "all") f = f.filter((it) => it.scope === scopeFilter);
    if (favoriteOnly) f = f.filter((it) => it.isFavorite);
    if (sortBy === "cost") {
      f = [...f].sort((a, b) => (b.cost.costUsd || 0) - (a.cost.costUsd || 0));
    }
    return f;
  }, [items, scopeFilter, favoriteOnly, sortBy]);

  const totalCost = useMemo(() => {
    const usd = items.reduce((s, it) => s + (it.cost.costUsd || 0), 0);
    const krw = items.reduce((s, it) => s + (it.cost.costKrw || 0), 0);
    return { usd, krw };
  }, [items]);

  const toggleFavorite = async (id: string, current: boolean) => {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, isFavorite: !current } : it));
    try {
      await fetch(`/api/plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !current }),
      });
    } catch {
      setItems((prev) => prev.map((it) => it.id === id ? { ...it, isFavorite: current } : it));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("이 기획서를 삭제하시겠습니까? (소프트 삭제 — 복구 불가)")) return;
    const prev = items;
    setItems((p) => p.filter((it) => it.id !== id));
    try {
      const res = await fetch(`/api/plans/${id}`, { method: "DELETE" });
      if (!res.ok) setItems(prev);
    } catch {
      setItems(prev);
    }
  };

  return (
    <div style={{ background: "#060920", minHeight: "100vh", color: "#cfe9ff" }}>
      {/* Top */}
      <nav style={{ padding: "10px 20px", borderBottom: "1px solid #1f2a6b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: FONT_PIX, fontSize: 14, color: "#ff4ec9", textShadow: "2px 2px 0 #8a2877" }}>STRATEGY ARCHIVE</span>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/app/plans/analytics" style={{ fontFamily: FONT_KR, fontSize: 13, color: "#5ce5ff", textDecoration: "none", fontWeight: 600 }}>
            📊 분석 모드
          </Link>
          <Link href="/desk/marky" style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", textDecoration: "none", fontWeight: 500 }}>
            ← 데스크
          </Link>
        </div>
      </nav>

      <div style={{ padding: "30px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, color: "#5ce5ff", marginBottom: 6 }}>기획 코어 v2 — 누적 룰북</p>
        <h1 style={{ fontFamily: FONT_KR, fontSize: 36, fontWeight: 800, color: "#ffffff", marginBottom: 24 }}>
          나의 기획서 ({initialCounts.total}건)
        </h1>

        {/* 통계 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
          {(["marketing","detail_page","ads","finance"] as ScopeId[]).map((s) => {
            const meta = SCOPE_LABEL[s];
            return (
              <div key={s} className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${meta.color}33`, padding: 14 }}>
                <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: meta.color, letterSpacing: "0.1em", marginBottom: 6 }}>
                  {meta.agent.toUpperCase()} · {meta.name}
                </p>
                <p style={{ fontFamily: FONT_KR, fontSize: 24, fontWeight: 800, color: "#ffffff" }}>
                  {initialCounts.byScope[s] || 0}
                  <span style={{ fontSize: 13, color: "#7e94c8", fontWeight: 500 }}> 건</span>
                </p>
              </div>
            );
          })}
          <div className="pixel-frame" style={{ background: "#0a0e27", border: "1px solid #66ff9d33", padding: 14 }}>
            <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: "#66ff9d", letterSpacing: "0.1em", marginBottom: 6 }}>총 비용 (누적)</p>
            <p style={{ fontFamily: FONT_KR, fontSize: 18, fontWeight: 800, color: "#66ff9d" }}>
              ₩{Math.round(totalCost.krw).toLocaleString()}
            </p>
            <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8", marginTop: 2 }}>
              ${totalCost.usd.toFixed(4)}
            </p>
          </div>
        </div>

        {/* 필터 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <FilterBtn active={scopeFilter === "all"} label="전체" onClick={() => setScopeFilter("all")} />
          {(["marketing","detail_page","ads","finance"] as ScopeId[]).map((s) => (
            <FilterBtn key={s} active={scopeFilter === s} label={SCOPE_LABEL[s].name} color={SCOPE_LABEL[s].color} onClick={() => setScopeFilter(s)} />
          ))}
          <span style={{ width: 1, height: 24, background: "#1f2a6b", margin: "0 6px" }} />
          <FilterBtn active={favoriteOnly} label="⭐ 즐겨찾기만" color="#ffd84d" onClick={() => setFavoriteOnly(!favoriteOnly)} />
          <span style={{ width: 1, height: 24, background: "#1f2a6b", margin: "0 6px" }} />
          <FilterBtn active={sortBy === "recent"} label="최신순" onClick={() => setSortBy("recent")} />
          <FilterBtn active={sortBy === "cost"} label="비용 큰 순" onClick={() => setSortBy("cost")} />
        </div>

        {/* 리스트 */}
        {filtered.length === 0 ? (
          <div className="pixel-frame" style={{ background: "#0a0e27", border: "1px dashed #1f2a6b", padding: 40, textAlign: "center" }}>
            <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#7e94c8" }}>아직 기획서가 없습니다.</p>
            <Link href="/desk/marky" style={{ fontFamily: FONT_KR, fontSize: 14, color: "#5ce5ff", textDecoration: "underline" }}>
              마키 데스크에서 기획 코어 시작 →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((it) => {
              const meta = SCOPE_LABEL[it.scope as ScopeId] || SCOPE_LABEL.marketing;
              const headline = (it.summary.headline as string) || "(제목 없음)";
              const insight = (it.summary.hookInsight as string) || "";
              const cadence = (it.summary.cadenceSummary as string) || "—";
              const next7 = (it.summary.nextSevenDaysCount as number) || 0;
              return (
                <Link
                  key={it.id}
                  href={`/app/plans/${it.id}`}
                  className="pixel-frame"
                  style={{
                    background: "#0a0e27",
                    border: `1px solid ${meta.color}33`,
                    padding: 16,
                    textDecoration: "none",
                    display: "block",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = meta.color; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${meta.color}33`; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: meta.color, border: `1px solid ${meta.color}66`, padding: "2px 8px" }}>
                      {meta.agent} · {meta.name}
                    </span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8" }}>
                      #{it.id.slice(-6).toUpperCase()}
                    </span>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(it.id, it.isFavorite); }}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: it.isFavorite ? "#ffd84d" : "#4a5a8a", fontSize: 16, padding: 0 }}
                      aria-label="즐겨찾기"
                    >
                      {it.isFavorite ? "★" : "☆"}
                    </button>
                    <span style={{ marginLeft: "auto", fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8" }}>
                      {new Date(it.updatedAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p style={{ fontFamily: FONT_KR, fontSize: 17, fontWeight: 700, color: "#ffffff", lineHeight: 1.4, marginBottom: 6 }}>
                    {headline}
                  </p>
                  {insight && (
                    <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", lineHeight: 1.6, marginBottom: 10, fontStyle: "italic" }}>
                      &quot;{insight}&quot;
                    </p>
                  )}

                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8" }}>
                    <span>📅 {cadence}</span>
                    <span style={{ color: "#66ff9d" }}>🚀 7일 내 {next7}건</span>
                    <span>📦 시드 {it.seedsCount}건 (자동 {it.autoExecutableCount})</span>
                    {it.executionLogCount > 0 && <span style={{ color: "#5ce5ff" }}>📈 실행 {it.executionLogCount}건</span>}
                    <span style={{ marginLeft: "auto" }}>💰 ₩{(it.cost.costKrw || 0).toLocaleString()} (${(it.cost.costUsd || 0).toFixed(4)})</span>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(it.id); }}
                      style={{ background: "transparent", color: "#ff6688", border: "1px solid #ff668866", padding: "2px 8px", fontFamily: FONT_KR, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                    >
                      삭제
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterBtn({ active, label, color, onClick }: { active: boolean; label: string; color?: string; onClick: () => void }) {
  const c = color || "#5ce5ff";
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${c}22` : "transparent",
        color: active ? c : "#cfe9ff",
        border: `1px solid ${active ? c : "#1f2a6b"}`,
        padding: "5px 12px",
        fontFamily: FONT_KR,
        fontSize: 12,
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
