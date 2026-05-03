"use client";

import { useState } from "react";
import Link from "next/link";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

const SCOPE_LABEL: Record<string, { name: string; agent: string; color: string }> = {
  marketing:   { name: "마케팅",     agent: "마키",   color: "#ff4ec9" },
  detail_page: { name: "상세페이지", agent: "데일리", color: "#5ce5ff" },
  ads:         { name: "광고",       agent: "애디",   color: "#ffd84d" },
  finance:     { name: "재무",       agent: "페니",   color: "#66ff9d" },
};

export function PlanDetailClient({
  id, scope, input, spec, thinking, cost, executionLog,
  isFavorite: initialFavorite, createdAt, updatedAt,
}: {
  id: string;
  scope: string;
  input: Record<string, unknown>;
  spec: Record<string, unknown>;
  thinking: { text: string }[];
  cost: Record<string, unknown>;
  executionLog: Record<string, unknown>[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const meta = SCOPE_LABEL[scope] || SCOPE_LABEL.marketing;
  const accent = meta.color;

  const toggleFav = async () => {
    const next = !favorite;
    setFavorite(next);
    try {
      await fetch(`/api/plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: next }),
      });
    } catch {
      setFavorite(!next);
    }
  };

  const summary = (spec.summary as Record<string, unknown>) || {};
  const brandRules = (spec.brandRules as { voice?: string; forbidden?: string[]; requiredElements?: string[] }) || {};
  const publishingPlan = (spec.publishingPlan as Array<{ channel: string; frequency: string; bestSlots: string[]; contentMix: { category: string; ratio: number }[] }>) || [];
  const contentSeeds = (spec.contentSeeds as Array<{ week: number; date: string; channel: string; category: string; title: string; angle: string; hashtags: string[]; autoExecutable: boolean }>) || [];
  const phases = (spec.phases as Array<{ name: string; description: string; deliverables: string[]; estimatedDuration: string; ownerAgent: string }>) || [];
  const successMetrics = (spec.successMetrics as string[]) || [];
  const risks = (spec.risks as string[]) || [];
  const automationHooks = (spec.automationHooks as Array<{ triggerEvent: string; action: string; params: Record<string, unknown>; requiresApproval: boolean }>) || [];

  return (
    <div style={{ background: "#060920", minHeight: "100vh", color: "#cfe9ff" }}>
      {/* Top */}
      <nav style={{ padding: "10px 20px", borderBottom: "1px solid #1f2a6b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/app/plans" style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", textDecoration: "none", fontWeight: 500 }}>
            ← 기획서 목록
          </Link>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8" }}>#{id.slice(-6).toUpperCase()}</span>
        </div>
        <button
          onClick={toggleFav}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: favorite ? "#ffd84d" : "#4a5a8a", fontSize: 22, padding: 0 }}
        >
          {favorite ? "★" : "☆"}
        </button>
      </nav>

      <div style={{ padding: "30px 24px", maxWidth: 1100, margin: "0 auto" }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: accent, border: `1px solid ${accent}66`, padding: "3px 10px" }}>
            {meta.agent} · {meta.name}
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8" }}>
            생성 {new Date(createdAt).toLocaleString("ko-KR")} · 수정 {new Date(updatedAt).toLocaleString("ko-KR")}
          </span>
        </div>

        <h1 style={{ fontFamily: FONT_KR, fontSize: 32, fontWeight: 800, color: "#ffffff", lineHeight: 1.3, marginBottom: 10 }}>
          {String(summary.headline || "(헤드라인 없음)")}
        </h1>
        {summary.hookInsight ? (
          <p style={{ fontFamily: FONT_KR, fontSize: 16, color: "#ffd84d", fontStyle: "italic", lineHeight: 1.6, marginBottom: 24 }}>
            &quot;{String(summary.hookInsight)}&quot;
          </p>
        ) : null}

        {/* 비용 + 보안 패널 */}
        <Section title="💰 비용 + 모델 정보" accent="#66ff9d">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
            <Stat label="총 비용 USD" value={`$${(cost.costUsd as number || 0).toFixed(5)}`} />
            <Stat label="총 비용 KRW" value={`₩${((cost.costKrw as number) || 0).toLocaleString()}`} color="#66ff9d" />
            <Stat label="입력 토큰"    value={`${((cost.inputTokens as number) || 0).toLocaleString()}`} />
            <Stat label="출력 토큰"    value={`${((cost.outputTokens as number) || 0).toLocaleString()}`} />
            <Stat label="캐시 read"    value={`${((cost.cacheReadTokens as number) || 0).toLocaleString()}`} color="#5ce5ff" />
            <Stat label="캐시 write"   value={`${((cost.cacheCreationTokens as number) || 0).toLocaleString()}`} color="#5ce5ff" />
            <Stat label="캐시 절감률"  value={`${(((cost.cacheSavingRatio as number) || 0) * 100).toFixed(1)}%`} color="#ffd84d" />
            <Stat label="모델"         value={String(cost.model || "")} />
          </div>
        </Section>

        {/* 브랜드 룰 */}
        <Section title="🎯 BRAND RULES — 매 콘텐츠 호출에 자동 주입" accent={accent}>
          <Field label="VOICE" value={brandRules.voice || "(없음)"} />
          <ListField label="FORBIDDEN — 자동 검열어" items={brandRules.forbidden || []} color="#ff6688" />
          <ListField label="REQUIRED ELEMENTS — 매 콘텐츠 필수" items={brandRules.requiredElements || []} color="#66ff9d" />
        </Section>

        {/* 발행 운영 */}
        <Section title="📅 PUBLISHING PLAN — 채널·빈도·시간대" accent="#5ce5ff">
          {publishingPlan.length === 0 ? <p style={emptyStyle}>(데이터 없음)</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {publishingPlan.map((p, i) => (
                <div key={i} style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                    <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, color: "#cfe9ff" }}>{p.channel}</p>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8" }}>{p.frequency}</span>
                  </div>
                  <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8", marginBottom: 6 }}>
                    슬롯: {Array.isArray(p.bestSlots) ? p.bestSlots.join(", ") : "—"}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {Array.isArray(p.contentMix) && p.contentMix.map((m, mi) => (
                      <span key={mi} style={{ fontFamily: FONT_KR, fontSize: 12, color: "#cfe9ff", border: "1px solid #1f2a6b", padding: "2px 8px" }}>
                        {m.category} {Math.round((m.ratio || 0) * 100)}%
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* 콘텐츠 시드 — 4주치 */}
        <Section title={`📦 CONTENT SEEDS — 4주치 (${contentSeeds.length}건)`} accent={accent}>
          {contentSeeds.length === 0 ? <p style={emptyStyle}>(시드 없음)</p> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT_KR, fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#060920", borderBottom: "1px solid #1f2a6b" }}>
                    {["주차", "날짜", "채널", "카테고리", "제목 / 각도", "자동"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.1em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contentSeeds.map((s, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #1f2a6b22" }}>
                      <td style={{ padding: "8px 10px", color: "#7e94c8", fontFamily: FONT_MONO, fontSize: 11 }}>W{s.week}</td>
                      <td style={{ padding: "8px 10px", fontFamily: FONT_MONO, fontSize: 11, color: "#cfe9ff" }}>{s.date}</td>
                      <td style={{ padding: "8px 10px", fontFamily: FONT_MONO, fontSize: 11, color: "#5ce5ff" }}>{s.channel}</td>
                      <td style={{ padding: "8px 10px", color: "#cfe9ff" }}>{s.category}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <p style={{ fontWeight: 700, color: "#cfe9ff", marginBottom: 2 }}>{s.title}</p>
                        <p style={{ color: "#7e94c8", fontSize: 12 }}>{s.angle}</p>
                        {Array.isArray(s.hashtags) && s.hashtags.length > 0 && (
                          <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#5ce5ff", marginTop: 4 }}>{s.hashtags.join(" ")}</p>
                        )}
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "center" }}>
                        {s.autoExecutable
                          ? <span style={{ color: "#66ff9d", fontFamily: FONT_MONO, fontSize: 11 }}>✓ 자동</span>
                          : <span style={{ color: "#ffd84d", fontFamily: FONT_MONO, fontSize: 11 }}>승인 필요</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* 단계별 로드맵 */}
        <Section title="🗺️ ROADMAP — 단계별" accent={accent}>
          {phases.length === 0 ? <p style={emptyStyle}>(단계 없음)</p> : phases.map((p, i) => (
            <div key={i} style={{ ...cardStyle, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, color: "#cfe9ff" }}>{i + 1}. {p.name}</p>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8", border: "1px solid #1f2a6b", padding: "2px 8px" }}>{p.estimatedDuration}</span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: accent, border: `1px solid ${accent}66`, padding: "2px 8px" }}>{p.ownerAgent}</span>
                </div>
              </div>
              <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", lineHeight: 1.6, marginBottom: 6 }}>{p.description}</p>
              {Array.isArray(p.deliverables) && p.deliverables.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {p.deliverables.map((d, di) => <li key={di} style={{ fontFamily: FONT_KR, fontSize: 12, color: "#cfe9ff", lineHeight: 1.7 }}>{d}</li>)}
                </ul>
              )}
            </div>
          ))}
        </Section>

        {/* KPI + 리스크 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          <Section title="📊 KPI" accent="#66ff9d">
            <ListField label="" items={successMetrics} color="#66ff9d" />
          </Section>
          <Section title="⚠️ RISKS" accent="#ffd84d">
            <ListField label="" items={risks} color="#ffd84d" />
          </Section>
        </div>

        {/* 자동화 훅 */}
        <Section title="🔒 AUTOMATION HOOKS — 보안 가드 적용됨" accent="#ff6688">
          {automationHooks.length === 0 ? <p style={emptyStyle}>(훅 없음)</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {automationHooks.map((h, i) => (
                <div key={i} style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
                    <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff" }}>
                      {h.action}
                    </p>
                    {h.requiresApproval ? (
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#ffd84d", border: "1px solid #ffd84d66", padding: "2px 8px" }}>
                        🔒 사용자 승인 필수
                      </span>
                    ) : (
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#66ff9d", border: "1px solid #66ff9d66", padding: "2px 8px" }}>
                        자동 실행 가능
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8" }}>
                    트리거: {h.triggerEvent}
                  </p>
                  {h.params && Object.keys(h.params).length > 0 && (
                    <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8", marginTop: 4 }}>
                      params: {JSON.stringify(h.params)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* 추론 과정 — 접기 */}
        <CollapsibleSection title={`🧠 추론 과정 — Opus 4.7 thinking (${thinking.length}개 블록)`} accent="#5ce5ff">
          {thinking.length === 0 ? <p style={emptyStyle}>(thinking 데이터 없음)</p> : thinking.map((t, i) => (
            <div key={i} style={{ ...cardStyle, marginBottom: 8 }}>
              <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#5ce5ff", letterSpacing: "0.1em", marginBottom: 6 }}>
                THINKING #{i + 1}
              </p>
              <pre style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
                {t.text}
              </pre>
            </div>
          ))}
        </CollapsibleSection>

        {/* 입력값 (검증용) */}
        <CollapsibleSection title="📝 입력값 (이 기획서를 만든 원본)" accent="#7e94c8">
          {Object.entries(input).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 6 }}>
              <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.1em" }}>{k.toUpperCase()}</p>
              <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", lineHeight: 1.6 }}>
                {Array.isArray(v) ? v.join(", ") : String(v)}
              </p>
            </div>
          ))}
        </CollapsibleSection>

        {/* 실행 로그 */}
        <Section title={`📈 EXECUTION LOG — 후속 작업 (${executionLog.length}건)`} accent="#5ce5ff">
          {executionLog.length === 0 ? (
            <p style={emptyStyle}>아직 이 기획서로부터 파생된 자동 실행 작업이 없습니다.<br />
            (Phase C 자동 위임 기능 추가 예정)</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {executionLog.map((entry, i) => (
                <div key={i} style={{ ...cardStyle, padding: 10 }}>
                  <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#5ce5ff" }}>
                    {String(entry.ts || "")} — {String(entry.action || "")}
                  </p>
                  <pre style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8", margin: "2px 0 0", whiteSpace: "pre-wrap" }}>
                    {JSON.stringify(entry, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#060920",
  border: "1px solid #1f2a6b",
  padding: 12,
};
const emptyStyle: React.CSSProperties = {
  fontFamily: FONT_KR,
  fontSize: 13,
  color: "#7e94c8",
  textAlign: "center",
  padding: "20px 0",
};

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${accent}33`, padding: 16, marginBottom: 12 }}>
      <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: accent, letterSpacing: "0.1em", marginBottom: 12 }}>▌ {title}</p>
      {children}
    </div>
  );
}

function CollapsibleSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${accent}33`, padding: 16, marginBottom: 12 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", background: "transparent", border: "none", textAlign: "left", cursor: "pointer",
          padding: 0, color: accent, fontFamily: FONT_PIX, fontSize: 11, letterSpacing: "0.1em",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <span>▌ {title}</span>
        <span>{open ? "▼" : "▶"}</span>
      </button>
      {open && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.1em" }}>{label}</p>
      <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", lineHeight: 1.6 }}>{value}</p>
    </div>
  );
}

function ListField({ label, items, color }: { label: string; items: string[]; color: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      {label && <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map((it, i) => (
          <span key={i} style={{ fontFamily: FONT_KR, fontSize: 12, color, border: `1px solid ${color}55`, padding: "3px 10px" }}>{it}</span>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: "#060920", border: `1px solid ${color || "#1f2a6b"}33`, padding: 10 }}>
      <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#7e94c8", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: color || "#cfe9ff" }}>{value || "—"}</p>
    </div>
  );
}
