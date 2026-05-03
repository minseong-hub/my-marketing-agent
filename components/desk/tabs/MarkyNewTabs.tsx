"use client";

/**
 * 마키 신규 큰메뉴 탭들 (DeskTabs.tsx의 기존 패턴을 따라가지만 파일은 분리해서 가독성 ↑).
 *
 * - 📅 이번 달 계획 / 다음 달 자동 초안 / 계획 히스토리
 * - 🎨 지시 인박스 / 자동 실행 로그
 * - 🖼️ 활성 템플릿 / 디자인 갤러리 / 프리셋 시드
 * - 🔖 내 보드 / 자동 스카우트 / 브랜드 DNA
 * - 📦 카드뉴스 보관함 / 발행 큐
 *
 * 모든 탭은 SectionHeader + 본문 구조를 따른다.
 */

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { DESKS, type DeskAgentId } from "@/data/desks";
import { showToast } from "../ToastHost";
import { TemplateGalleryStudio } from "@/components/studio/TemplateGalleryStudio";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

function SectionHeader({ title, sub, accent }: { title: string; sub?: string; accent: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: accent, letterSpacing: "0.08em", marginBottom: 6 }}>
        ▌ {title.toUpperCase()}
      </p>
      {sub && <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#7e94c8", lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

function PixelButton({ children, onClick, color = "#ff4ec9", disabled }: { children: React.ReactNode; onClick: () => void; color?: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="pixel-frame"
      style={{
        background: color, color: "#0a0e27",
        border: `2px solid ${color}`, padding: "9px 18px",
        fontFamily: FONT_KR, fontSize: 14, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent", color: "#cfe9ff",
        border: "1px solid #1f2a6b", padding: "8px 16px",
        fontFamily: FONT_KR, fontSize: 13, cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// ============================================================
// 📅 월간 계획 — 이번 달
// ============================================================
type MonthlyPlanSummary = {
  id: string;
  month: string;
  status: string;
  cards: Array<{ id: string; planDate: string; title: string; category: string; status: string; excluded?: boolean; previewColor?: string }>;
  source?: string;
  rationale?: string;
  confidence?: number;
};

export function MonthlyThisMonthTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  const [plans, setPlans] = useState<MonthlyPlanSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/monthly-plan");
      const d = await r.json();
      if (d.ok) {
        const cur = new Date();
        const m = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`;
        setPlans(d.items.filter((p: MonthlyPlanSummary) => p.month === m));
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        title="📅 이번 달 계획"
        sub="마키가 작성하거나 사용자가 직접 만든 이번 달 카드뉴스 발행 계획. 카드별 일정·각도를 한눈에."
        accent={a.accent}
      />

      {loading && <p style={{ color: "#7e94c8", fontFamily: FONT_KR }}>불러오는 중…</p>}

      {!loading && plans.length === 0 && (
        <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px dashed ${a.accent}55`, padding: 20, textAlign: "center" }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", marginBottom: 10 }}>
            아직 이번 달 계획이 없습니다.
          </p>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", marginBottom: 14 }}>
            &quot;다음 달 자동 초안&quot; 메뉴에서 마키에게 한 달치 계획 작성을 시키거나, 디자인 갤러리에서 활성 템플릿을 먼저 골라주세요.
          </p>
        </div>
      )}

      {plans.map((p) => (
        <PlanCard key={p.id} plan={p} accent={a.accent} onChanged={refresh} />
      ))}
    </div>
  );
}

function PlanCard({ plan, accent, onChanged }: { plan: MonthlyPlanSummary; accent: string; onChanged: () => void }) {
  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${accent}33`, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: accent, letterSpacing: "0.08em", marginBottom: 4 }}>
            ▌ {plan.month}
          </p>
          <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff" }}>
            카드 {plan.cards.length}건 · 상태 <span style={{ color: accent, fontWeight: 700 }}>{plan.status}</span>
            {plan.source === "auto" && <span style={{ marginLeft: 8, fontSize: 11, color: "#66ff9d" }}>· 마키 자동 작성</span>}
          </p>
        </div>
      </div>

      {plan.rationale && (
        <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", padding: 10, background: "#060920", border: `1px solid ${accent}22`, marginBottom: 10 }}>
          💡 {plan.rationale}
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
        {plan.cards.slice(0, 12).map((c) => (
          <div key={c.id} style={{ background: c.previewColor || "#162043", padding: 10, opacity: c.excluded ? 0.4 : 1 }}>
            <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#0a0e27", letterSpacing: "0.1em" }}>{c.planDate}</p>
            <p style={{ fontFamily: FONT_KR, fontSize: 12, fontWeight: 700, color: "#0a0e27", marginTop: 4 }}>{c.title}</p>
            <p style={{ fontFamily: FONT_KR, fontSize: 10, color: "#0a0e27", opacity: 0.7, marginTop: 2 }}>{c.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 📅 다음 달 자동 초안 — 마키가 자율 작성
// ============================================================
export function MonthlyAutoDraftTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  const today = new Date();
  const nm = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const defaultMonth = `${nm.getFullYear()}-${String(nm.getMonth() + 1).padStart(2, "0")}`;

  const [month, setMonth] = useState(defaultMonth);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [activeTemplateName, setActiveTemplateName] = useState<string>("(선택 안함)");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ id: string; cards: any[]; rationale: string; confidence: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/templates?activeOnly=true&limit=1").then((r) => r.json()).then((d) => {
      if (d.ok && d.items?.[0]) {
        setActiveTemplateId(d.items[0].id);
        setActiveTemplateName(d.items[0].name);
      }
    }).catch(() => {});
  }, []);

  const run = useCallback(async () => {
    setRunning(true); setError(null);
    try {
      const res = await fetch("/api/monthly-plan/auto-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          brandTemplateId: activeTemplateId || "none",
        }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "초안 생성 실패"); return; }
      setResult(d.plan);
      showToast(`마키가 ${d.plan.cards.length}건의 카드뉴스를 자동 기획했습니다`, { color: a.accent, icon: "📅" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "네트워크 오류");
    } finally { setRunning(false); }
  }, [month, activeTemplateId, a.accent]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        title="📅 다음 달 자동 초안"
        sub="마키가 사용자 브랜드 프로필 + 직전 기획서 자가학습을 읽어 한 달치 카드뉴스 계획을 자율 작성합니다. 사용자는 결과를 보고 슬라이더로 미세 조정만."
        accent={a.accent}
      />

      <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}33`, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 12, marginBottom: 14 }}>
          <div>
            <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginBottom: 4 }}>대상 월</p>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
              style={{ width: "100%", background: "#060920", border: "1px solid #1f2a6b", padding: 8, color: "#cfe9ff", fontFamily: FONT_KR, fontSize: 13 }} />
          </div>
          <div>
            <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginBottom: 4 }}>활성 디자인 템플릿</p>
            <p style={{ padding: "8px 10px", background: "#060920", border: "1px solid #1f2a6b", color: a.accent, fontFamily: FONT_KR, fontSize: 13, fontWeight: 700 }}>
              {activeTemplateName} <span style={{ fontSize: 10, color: "#7e94c8", marginLeft: 4 }}>(선택)</span>
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
            <PixelButton onClick={run} disabled={running} color={a.accent}>
              {running ? "🤖 마키가 기획 중..." : "🤖 마키에게 자동 기획 시키기"}
            </PixelButton>
          </div>
        </div>

        <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", lineHeight: 1.6 }}>
          ⓘ 디자인 템플릿은 선택입니다. 활성 템플릿이 없어도 브랜드 프로필 + 레퍼런스 보드 DNA로 카드 디자인이 자동 설계됩니다.
        </p>

        {error && (
          <div style={{ marginTop: 12, padding: "10px 14px", border: "1px solid #ff6688", background: "#ff668811", color: "#ff6688", fontFamily: FONT_KR, fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: 14, padding: 14, background: "#060920", border: `1px solid ${a.accent}55` }}>
            <p style={{ fontFamily: FONT_KR, fontSize: 13, color: a.accent, fontWeight: 700, marginBottom: 6 }}>
              ✓ 마키가 작성 완료 — 신뢰도 {result.confidence}%
            </p>
            <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", marginBottom: 10, lineHeight: 1.6 }}>
              💡 {result.rationale}
            </p>
            <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8" }}>
              {result.cards.length}건의 카드뉴스 시드가 만들어졌습니다. <strong>이번 달 계획</strong>(또는 <strong>지시 인박스</strong>)에서 확인하세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 📅 계획 히스토리
// ============================================================
export function MonthlyHistoryTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  const [items, setItems] = useState<MonthlyPlanSummary[]>([]);

  useEffect(() => {
    fetch("/api/monthly-plan").then((r) => r.json()).then((d) => { if (d.ok) setItems(d.items); });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="📅 계획 히스토리" sub="과거 월간 계획 전체 — 클릭하면 해당 월 카드 목록을 볼 수 있습니다." accent={a.accent} />
      {items.length === 0 ? (
        <p style={{ color: "#7e94c8", fontFamily: FONT_KR, padding: 20 }}>아직 작성된 계획이 없습니다.</p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {items.map((p) => (
            <div key={p.id} className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}22`, padding: 12, display: "flex", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: a.accent }}>▌ {p.month}</p>
                <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", marginTop: 4 }}>
                  카드 {p.cards.length}건 · {p.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 🎨 지시 인박스 (월간계획에서 내려온 카드뉴스 작업 큐)
// ============================================================
export function CardInboxTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  const [plans, setPlans] = useState<MonthlyPlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/monthly-plan");
      const d = await r.json();
      if (d.ok) setPlans(d.items.filter((p: MonthlyPlanSummary) => p.cards.some((c) => c.status === "planned" || c.status === "approved")));
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const totalPending = plans.reduce((s, p) => s + p.cards.filter((c) => !c.excluded && (c.status === "planned" || c.status === "approved")).length, 0);

  const runOne = useCallback(async (planId: string, cardId: string) => {
    setRunning((prev) => new Set(prev).add(cardId));
    try {
      const r = await fetch(`/api/monthly-plan/${planId}/auto-execute-card`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });
      const d = await r.json();
      if (!r.ok) {
        showToast(d.error || "생성 실패", { color: "#ff6688", icon: "⚠" });
        return;
      }
      const stateLabel = d.reviewState === "needs_review" ? "검토 필요" : d.reviewState === "approved" ? "승인됨" : "초안";
      showToast(`✓ 카드뉴스 생성 완료 (${stateLabel}) — 보관함에서 확인`, { color: a.accent, icon: "🤖" });
      refresh();
    } catch {
      showToast("네트워크 오류", { color: "#ff6688", icon: "⚠" });
    } finally {
      setRunning((prev) => { const n = new Set(prev); n.delete(cardId); return n; });
    }
  }, [a.accent, refresh]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        title="🎨 지시 인박스"
        sub={`월간 계획에서 내려온 작업 ${totalPending}건. 카드 클릭 → AI에게 자동 생성 위임 또는 워크스페이스에서 직접 편집.`}
        accent={a.accent}
      />

      {loading && <p style={{ color: "#7e94c8", fontFamily: FONT_KR }}>불러오는 중…</p>}

      {!loading && plans.length === 0 && (
        <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px dashed ${a.accent}55`, padding: 20, textAlign: "center" }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff" }}>대기 중인 작업이 없습니다.</p>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", marginTop: 8 }}>
            마키 데스크 → 📅 다음 달 자동 초안에서 계획을 먼저 만드세요.
          </p>
        </div>
      )}

      {plans.map((p) => (
        <div key={p.id} className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}33`, padding: 16 }}>
          <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: a.accent, marginBottom: 10 }}>▌ {p.month}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
            {p.cards.filter((c) => !c.excluded && (c.status === "planned" || c.status === "approved")).map((c) => (
              <div key={c.id} className="pixel-frame" style={{ background: "#060920", border: `1px solid ${a.accent}22`, padding: 12 }}>
                <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: a.accent, letterSpacing: "0.1em", marginBottom: 4 }}>
                  {c.planDate} · {c.category}
                </p>
                <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 8, minHeight: 36 }}>
                  {c.title}
                </p>
                <button
                  onClick={() => runOne(p.id, c.id)}
                  disabled={running.has(c.id)}
                  style={{
                    width: "100%", background: a.accent, color: "#0a0e27",
                    border: "none", padding: "6px 10px", fontFamily: FONT_KR, fontSize: 12, fontWeight: 700,
                    cursor: "pointer", opacity: running.has(c.id) ? 0.5 : 1,
                  }}
                >
                  {running.has(c.id) ? "⚙ 생성 중…" : "🤖 AI에게 맡기기"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 🎨 자동 실행 로그 (placeholder — 카드뉴스 생성 이벤트 로그)
// ============================================================
export function CardAutoLogTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="🎨 자동 실행 로그" sub="AI가 자동으로 생성·검수·실패한 카드뉴스 이벤트 타임라인" accent={a.accent} />
      <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px dashed ${a.accent}33`, padding: 20, textAlign: "center" }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#7e94c8" }}>
          (Phase F — 발행 큐와 통합 시 활성화)
        </p>
      </div>
    </div>
  );
}

// ============================================================
// 🖼️ 디자인 — 전체 갤러리 (기존)
// ============================================================
export function DesignGalleryTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="🖼️ 디자인 갤러리" sub="브랜드별 카드뉴스 디자인 템플릿. 활성 템플릿이 자동 생성에 적용됩니다." accent={a.accent} />
      <TemplateGalleryStudio />
    </div>
  );
}

// ============================================================
// 🖼️ 활성 템플릿 — 갤러리에서 활성 1개만 강조
// ============================================================
export function ActiveTemplateTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  const [t, setT] = useState<{ id: string; name: string; tokens?: any } | null>(null);
  useEffect(() => {
    fetch("/api/templates?activeOnly=true&limit=1").then((r) => r.json()).then((d) => {
      if (d.ok && d.items?.[0]) setT(d.items[0]);
    });
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="🖼️ 활성 템플릿" sub="현재 카드뉴스 자동 생성에 적용 중인 디자인 템플릿. 갤러리에서 다른 걸 활성화할 수 있습니다." accent={a.accent} />
      {t ? (
        <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}33`, padding: 20 }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{t.name}</p>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8" }}>이 템플릿의 색상·레이아웃·효과가 카드뉴스 자동 설계에 적용됩니다.</p>
        </div>
      ) : (
        <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px dashed ${a.accent}55`, padding: 20, textAlign: "center" }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", marginBottom: 8 }}>활성 템플릿이 없습니다.</p>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8" }}>
            템플릿 없이도 카드뉴스 자동 생성은 가능합니다 (브랜드 프로필 + 레퍼런스 DNA 기반 자동 설계).
          </p>
        </div>
      )}
    </div>
  );
}

export function PresetSeedTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  const [running, setRunning] = useState(false);
  const seed = async () => {
    setRunning(true);
    try {
      const r = await fetch("/api/templates/seed-presets", { method: "POST" });
      const d = await r.json();
      showToast(d.ok ? "프리셋 8종 시드 완료 → 갤러리에서 확인" : (d.error || "실패"), { color: a.accent, icon: d.ok ? "🎁" : "⚠" });
    } finally { setRunning(false); }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="🖼️ 프리셋 시드" sub="미니멀/감성파스텔/POP/뉴스풍/매거진/픽셀/네온/모노블랙 8종을 갤러리에 한 번에 추가합니다." accent={a.accent} />
      <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}33`, padding: 20 }}>
        <PixelButton onClick={seed} disabled={running} color={a.accent}>
          {running ? "시드 중…" : "🎁 프리셋 8종 시드"}
        </PixelButton>
      </div>
    </div>
  );
}

// ============================================================
// 🔖 레퍼런스 — 내 보드
// ============================================================
type RefItem = {
  id: string; domain: string | null; title: string; memo: string;
  tags: string[]; previewImage: string | null; fitScore: number;
  isStarred: boolean; source: string;
};

export function ReferenceBoardTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  const [items, setItems] = useState<RefItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newMemo, setNewMemo] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/references");
      const d = await r.json();
      if (d.ok) setItems(d.items);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addUrl = useCallback(async () => {
    try {
      const r = await fetch("/api/references", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "user_url", url: newUrl, memo: newMemo, title: newUrl }),
      });
      const d = await r.json();
      if (!r.ok) { showToast(d.error || "추가 실패", { color: "#ff6688", icon: "⚠" }); return; }
      showToast("레퍼런스 추가 완료", { color: a.accent, icon: "🔖" });
      setNewUrl(""); setNewMemo(""); setShowAdd(false);
      refresh();
    } catch { showToast("네트워크 오류", { color: "#ff6688", icon: "⚠" }); }
  }, [newUrl, newMemo, a.accent, refresh]);

  const toggleStar = useCallback(async (id: string, value: boolean) => {
    await fetch(`/api/references/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isStarred: value }),
    });
    refresh();
  }, [refresh]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        title="🔖 내 레퍼런스 보드"
        sub="마키가 자동 스카우트한 레퍼런스 + 사용자가 직접 추가한 자료. 별표를 누르면 디자인 템플릿 후보로 승격."
        accent={a.accent}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <PixelButton onClick={() => setShowAdd((v) => !v)} color={a.accent}>+ URL로 추가</PixelButton>
        <GhostButton onClick={refresh}>↻ 새로고침</GhostButton>
      </div>

      {showAdd && (
        <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}55`, padding: 14 }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginBottom: 4 }}>URL (인스타/핀터레스트/네이버 블로그/티스토리)</p>
          <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://www.instagram.com/p/..."
            style={{ width: "100%", background: "#060920", border: "1px solid #1f2a6b", padding: 8, color: "#cfe9ff", fontFamily: FONT_KR, fontSize: 13, marginBottom: 8 }} />
          <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginBottom: 4 }}>메모 (선택)</p>
          <input value={newMemo} onChange={(e) => setNewMemo(e.target.value)} placeholder="이 레퍼런스의 마음에 드는 점"
            style={{ width: "100%", background: "#060920", border: "1px solid #1f2a6b", padding: 8, color: "#cfe9ff", fontFamily: FONT_KR, fontSize: 13, marginBottom: 8 }} />
          <PixelButton onClick={addUrl} color={a.accent}>저장</PixelButton>
        </div>
      )}

      {loading ? (
        <p style={{ color: "#7e94c8", fontFamily: FONT_KR }}>불러오는 중…</p>
      ) : items.length === 0 ? (
        <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px dashed ${a.accent}55`, padding: 20, textAlign: "center" }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", marginBottom: 8 }}>아직 모은 레퍼런스가 없습니다.</p>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8" }}>&quot;자동 스카우트&quot;에서 마키에게 한 번 시키거나, 위에서 직접 URL을 추가하세요.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {items.map((it) => (
            <div key={it.id} className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}22`, padding: 10 }}>
              <div style={{ height: 100, background: "#060920", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {it.previewImage ? (
                  <img src={it.previewImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ color: "#4a5a8a", fontFamily: FONT_MONO, fontSize: 10 }}>{it.domain || "preview"}</span>
                )}
              </div>
              <p style={{ fontFamily: FONT_KR, fontSize: 11, color: "#cfe9ff", lineHeight: 1.4, minHeight: 28, marginBottom: 4 }}>
                {it.title.slice(0, 60)}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#7e94c8" }}>{it.fitScore}%</span>
                <button onClick={() => toggleStar(it.id, !it.isStarred)} style={{ background: "transparent", border: "none", cursor: "pointer", color: it.isStarred ? "#ffd84d" : "#4a5a8a", fontSize: 16 }}>
                  ★
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 🔖 자동 스카우트
// ============================================================
export function ReferenceScoutTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  const [category, setCategory] = useState("");
  const [voice, setVoice] = useState("");
  const [hints, setHints] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ inserted: number; candidates: any[]; apiKeyMissing: boolean } | null>(null);

  const run = async () => {
    setRunning(true);
    try {
      const r = await fetch("/api/references/scout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, voice: voice || undefined, hints: hints ? hints.split(",").map((s) => s.trim()).filter(Boolean) : undefined }),
      });
      const d = await r.json();
      if (!r.ok) { showToast(d.error || "스카우트 실패", { color: "#ff6688", icon: "⚠" }); return; }
      setResult(d);
      if (d.inserted > 0) {
        showToast(`마키가 ${d.inserted}건의 레퍼런스를 보드에 추가했습니다`, { color: a.accent, icon: "🔖" });
      } else if (d.apiKeyMissing) {
        showToast("외부 검색 API 키 미설정 — '내 보드'에서 직접 URL을 추가하거나 BRAVE_API_KEY를 환경변수에 등록하세요", { color: "#ffd84d", icon: "ⓘ" });
      } else {
        showToast("적합한 후보를 찾지 못했습니다 — 키워드 힌트를 더 구체적으로 입력해보세요", { color: "#ffd84d", icon: "ⓘ" });
      }
    } finally { setRunning(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        title="🔖 자동 스카우트"
        sub="마키가 카테고리·톤을 받아 외부 웹을 직접 검색해 적합한 레퍼런스를 자동 적재합니다. 별표한 항목은 디자인 템플릿으로 승격할 수 있습니다."
        accent={a.accent}
      />

      <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}33`, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div>
            <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginBottom: 4 }}>카테고리 *</p>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="예: 가을 신상, 스타일링"
              style={{ width: "100%", background: "#060920", border: "1px solid #1f2a6b", padding: 8, color: "#cfe9ff", fontFamily: FONT_KR, fontSize: 13 }} />
          </div>
          <div>
            <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginBottom: 4 }}>브랜드 톤 (선택)</p>
            <input value={voice} onChange={(e) => setVoice(e.target.value)} placeholder="예: 미니멀, 감성, 시크"
              style={{ width: "100%", background: "#060920", border: "1px solid #1f2a6b", padding: 8, color: "#cfe9ff", fontFamily: FONT_KR, fontSize: 13 }} />
          </div>
        </div>
        <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginBottom: 4 }}>키워드 힌트 (쉼표 구분, 선택)</p>
        <input value={hints} onChange={(e) => setHints(e.target.value)} placeholder="20대 여성, 카페룩, 빈티지"
          style={{ width: "100%", background: "#060920", border: "1px solid #1f2a6b", padding: 8, color: "#cfe9ff", fontFamily: FONT_KR, fontSize: 13, marginBottom: 12 }} />
        <PixelButton onClick={run} disabled={running || !category} color={a.accent}>
          {running ? "🤖 마키가 웹 탐색 중…" : "🤖 마키에게 자동 스카우트 시키기"}
        </PixelButton>

        {result && (
          <div style={{ marginTop: 12, padding: 12, background: "#060920", border: `1px solid ${result.inserted > 0 ? a.accent : "#ffd84d"}55` }}>
            {result.inserted > 0 ? (
              <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff" }}>
                ✓ {result.inserted}건 적재 완료. <strong>내 보드</strong>에서 확인하세요.
              </p>
            ) : (
              <>
                <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#ffd84d", fontWeight: 700, marginBottom: 6 }}>
                  ⓘ 자동 적재 0건
                </p>
                {result.apiKeyMissing ? (
                  <>
                    <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#cfe9ff", lineHeight: 1.6, marginBottom: 6 }}>
                      외부 검색 API 키(BRAVE_API_KEY)가 설정되지 않아 사용자 자료에서만 추첨하는 fallback 모드로 동작했고, 매칭 자료가 없습니다.
                    </p>
                    <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", lineHeight: 1.6 }}>
                      해결 방법:<br />
                      ① <a href="https://api.search.brave.com/app/keys" target="_blank" rel="noreferrer" style={{ color: "#5ce5ff" }}>Brave Search API</a>에서 무료 키 발급 → .env에 BRAVE_API_KEY 추가 후 dev 서버 재시작<br />
                      ② 또는 <strong>내 보드</strong>에서 인스타·핀터레스트 URL을 직접 5~10건 추가
                    </p>
                  </>
                ) : (
                  <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#cfe9ff", lineHeight: 1.6 }}>
                    검색 결과는 있었으나 도메인 화이트리스트(인스타/핀터레스트/네이버블로그/티스토리/베한스)에 매칭되는 게 없습니다. 키워드 힌트를 다르게 입력해보세요.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 🔖 브랜드 DNA
// ============================================================
type Insights = {
  total: number;
  domains: Array<{ domain: string; count: number; pct: number }>;
  topTags: Array<{ tag: string; count: number }>;
  paletteFrequency: Array<{ color: string; count: number }>;
  avgFitScore: number;
  starredCount: number;
  inferredMood: string[];
};

export function BrandDNATab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  const [ins, setIns] = useState<Insights | null>(null);

  useEffect(() => {
    fetch("/api/references/board-insights").then((r) => r.json()).then((d) => { if (d.ok) setIns(d.insights); });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="🔖 브랜드 DNA" sub="레퍼런스 보드에 모인 자료들로 자동 추출한 브랜드의 디자인 정체성." accent={a.accent} />
      {!ins || ins.total === 0 ? (
        <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px dashed ${a.accent}55`, padding: 20, textAlign: "center" }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#7e94c8" }}>레퍼런스 5건 이상부터 분석 가능합니다.</p>
        </div>
      ) : (
        <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}33`, padding: 20 }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", marginBottom: 14 }}>
            총 {ins.total}건 분석 · 평균 적합도 {ins.avgFitScore}% · 별표 {ins.starredCount}건
          </p>

          {ins.inferredMood.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginBottom: 4 }}>추론된 무드</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ins.inferredMood.map((m, i) => (
                  <span key={i} style={{ background: `${a.accent}22`, color: a.accent, padding: "4px 10px", fontFamily: FONT_KR, fontSize: 11, fontWeight: 700 }}>{m}</span>
                ))}
              </div>
            </div>
          )}

          {ins.paletteFrequency.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginBottom: 4 }}>주요 색상</p>
              <div style={{ display: "flex", gap: 4 }}>
                {ins.paletteFrequency.map((p) => (
                  <div key={p.color} title={`${p.color} · ${p.count}회`} style={{ width: 36, height: 36, background: p.color, border: "1px solid #1f2a6b" }} />
                ))}
              </div>
            </div>
          )}

          {ins.domains.length > 0 && (
            <div>
              <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginBottom: 4 }}>출처 분포</p>
              {ins.domains.map((d) => (
                <p key={d.domain} style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#cfe9ff" }}>
                  {d.domain}: {d.count}건 ({d.pct}%)
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 📦 카드뉴스 보관함
// ============================================================
type LibItem = {
  id: string;
  title: string;
  category: string;
  cardCount: number;
  reviewState: "draft" | "needs_review" | "approved";
  thumb: string | null;
  isFavorite: boolean;
  updatedAt: string;
};

export function CardLibraryTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  const [items, setItems] = useState<LibItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/card-library${filter ? `?reviewState=${filter}` : ""}`);
      const d = await r.json();
      if (d.ok) setItems(d.items);
    } catch {}
    setLoading(false);
  }, [filter]);

  useEffect(() => { refresh(); }, [refresh]);

  const STATE_COLOR: Record<string, string> = {
    draft: "#7e94c8",
    needs_review: "#ffd84d",
    approved: "#66ff9d",
  };
  const STATE_LABEL: Record<string, string> = {
    draft: "초안",
    needs_review: "검토 필요",
    approved: "승인 완료",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        title="📦 카드뉴스 보관함"
        sub="AI가 만든 + 사람이 편집한 카드뉴스 결과물. 클릭하면 편집 워크스페이스가 열립니다."
        accent={a.accent}
      />

      <div style={{ display: "flex", gap: 6 }}>
        {[
          { id: "", label: "전체" },
          { id: "draft", label: "초안" },
          { id: "needs_review", label: "검토 필요" },
          { id: "approved", label: "승인" },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{
              background: filter === f.id ? `${a.accent}22` : "transparent",
              color: filter === f.id ? a.accent : "#cfe9ff",
              border: `1px solid ${filter === f.id ? a.accent : "#1f2a6b"}`,
              padding: "6px 14px", fontFamily: FONT_KR, fontSize: 12, fontWeight: 700,
              cursor: "pointer",
            }}>{f.label}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#7e94c8", fontFamily: FONT_KR }}>불러오는 중…</p>
      ) : items.length === 0 ? (
        <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px dashed ${a.accent}55`, padding: 20, textAlign: "center" }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff" }}>아직 보관된 카드뉴스가 없습니다.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {items.map((it) => (
            <Link
              key={it.id}
              href={`/library/${it.id}`}
              className="pixel-frame"
              style={{
                background: "#0a0e27", border: `1px solid ${a.accent}22`,
                padding: 12, textDecoration: "none", display: "block",
                transition: "all 0.15s",
              }}
            >
              <div style={{ height: 140, background: "#060920", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {it.thumb ? (
                  <img src={it.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ color: "#4a5a8a", fontFamily: FONT_MONO, fontSize: 10 }}>{it.cardCount} cards</span>
                )}
              </div>
              <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 4, lineHeight: 1.4 }}>
                {it.title}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: STATE_COLOR[it.reviewState] }}>
                  ● {STATE_LABEL[it.reviewState]}
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8" }}>{it.cardCount}장</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 📦 발행 큐
// ============================================================
export function PublishQueueTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="📦 발행 큐" sub="인스타·블로그·스레드 등 외부 채널에 예약 발행 대기 중인 카드뉴스." accent={a.accent} />
      <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px dashed ${a.accent}33`, padding: 20, textAlign: "center" }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#7e94c8" }}>(Phase F — 외부 채널 OAuth 연동 시 활성화)</p>
      </div>
    </div>
  );
}
