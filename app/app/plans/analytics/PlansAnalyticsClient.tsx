"use client";

import { useMemo } from "react";
import Link from "next/link";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

const SCOPE_META: Record<string, { name: string; agent: string; color: string }> = {
  marketing:   { name: "마케팅",     agent: "마키",   color: "#ff4ec9" },
  detail_page: { name: "상세페이지", agent: "데일리", color: "#5ce5ff" },
  ads:         { name: "광고",       agent: "애디",   color: "#ffd84d" },
  finance:     { name: "재무",       agent: "페니",   color: "#66ff9d" },
};

interface AnalyticsItem {
  id: string;
  scope: string;
  cost: { costUsd: number; costKrw: number; model: string; inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheCreationTokens: number };
  summary: { headline?: string; hookInsight?: string; nextSevenDaysCount?: number };
  seedsCount: number;
  autoExecutableCount: number;
  executionLogCount: number;
  createdAt: string;
}

export function PlansAnalyticsClient({ items }: { items: AnalyticsItem[] }) {
  const totals = useMemo(() => {
    let usd = 0, krw = 0, input = 0, output = 0, cacheRead = 0, cacheCreate = 0, seeds = 0, auto = 0, exec = 0;
    for (const it of items) {
      usd += it.cost.costUsd || 0;
      krw += it.cost.costKrw || 0;
      input += it.cost.inputTokens || 0;
      output += it.cost.outputTokens || 0;
      cacheRead += it.cost.cacheReadTokens || 0;
      cacheCreate += it.cost.cacheCreationTokens || 0;
      seeds += it.seedsCount || 0;
      auto += it.autoExecutableCount || 0;
      exec += it.executionLogCount || 0;
    }
    return { usd, krw, input, output, cacheRead, cacheCreate, seeds, auto, exec };
  }, [items]);

  const byScope = useMemo(() => {
    const map: Record<string, { count: number; usd: number; krw: number }> = {};
    for (const it of items) {
      if (!map[it.scope]) map[it.scope] = { count: 0, usd: 0, krw: 0 };
      map[it.scope].count++;
      map[it.scope].usd += it.cost.costUsd || 0;
      map[it.scope].krw += it.cost.costKrw || 0;
    }
    return map;
  }, [items]);

  // 일별 비용 (최근 14일)
  const dailyCost = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of items) {
      const d = it.createdAt.slice(0, 10);
      map.set(d, (map.get(d) || 0) + (it.cost.costKrw || 0));
    }
    const days: { date: string; krw: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, krw: map.get(key) || 0 });
    }
    return days;
  }, [items]);
  const maxDaily = Math.max(1, ...dailyCost.map((d) => d.krw));

  return (
    <div style={{ background: "#060920", minHeight: "100vh", color: "#cfe9ff" }}>
      <nav style={{ padding: "10px 20px", borderBottom: "1px solid #1f2a6b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: FONT_PIX, fontSize: 14, color: "#5ce5ff", textShadow: "2px 2px 0 #1a4a6b" }}>STRATEGY ANALYTICS</span>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/app/plans" style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", textDecoration: "none", fontWeight: 500 }}>
            ← 기획서 목록
          </Link>
        </div>
      </nav>

      <div style={{ padding: "30px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, color: "#5ce5ff", marginBottom: 6 }}>분석 모드</p>
        <h1 style={{ fontFamily: FONT_KR, fontSize: 32, fontWeight: 800, color: "#ffffff", marginBottom: 24 }}>
          기획 코어 누적 분석 ({items.length}건)
        </h1>

        {/* 핵심 지표 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
          <Stat label="총 호출" value={`${items.length}회`} color="#5ce5ff" />
          <Stat label="누적 비용 (KRW)" value={`₩${Math.round(totals.krw).toLocaleString()}`} color="#66ff9d" />
          <Stat label="누적 비용 (USD)" value={`$${totals.usd.toFixed(4)}`} color="#66ff9d" />
          <Stat label="입력 토큰" value={totals.input.toLocaleString()} />
          <Stat label="출력 토큰" value={totals.output.toLocaleString()} />
          <Stat label="캐시 read" value={totals.cacheRead.toLocaleString()} color="#5ce5ff" />
          <Stat label="콘텐츠 시드" value={`${totals.seeds}건`} color="#ff4ec9" />
          <Stat label="자동 실행 가능" value={`${totals.auto}건`} color="#ffd84d" />
        </div>

        {/* 일별 비용 차트 */}
        <Section title="📈 일별 비용 (최근 14일)" accent="#66ff9d">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 180, padding: "10px 0" }}>
            {dailyCost.map((d) => {
              const h = (d.krw / maxDaily) * 160;
              return (
                <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#cfe9ff" }}>
                    {d.krw > 0 ? `₩${Math.round(d.krw).toLocaleString()}` : ""}
                  </span>
                  <div style={{ width: "100%", height: h, background: d.krw > 0 ? "#66ff9d" : "#1f2a6b", boxShadow: d.krw > 0 ? "0 0 8px #66ff9d66" : "none", minHeight: 2 }} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#7e94c8" }}>
                    {d.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>

        {/* 비서별 분포 */}
        <Section title="🤖 비서별 호출 분포" accent="#ff4ec9">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {(["marketing","detail_page","ads","finance"] as const).map((s) => {
              const meta = SCOPE_META[s];
              const data = byScope[s] || { count: 0, usd: 0, krw: 0 };
              const ratio = items.length > 0 ? (data.count / items.length) * 100 : 0;
              return (
                <div key={s} style={{ background: "#060920", border: `1px solid ${meta.color}33`, padding: 14 }}>
                  <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: meta.color, letterSpacing: "0.1em", marginBottom: 6 }}>
                    {meta.agent.toUpperCase()} · {meta.name}
                  </p>
                  <p style={{ fontFamily: FONT_KR, fontSize: 22, fontWeight: 800, color: "#ffffff" }}>
                    {data.count}건
                    <span style={{ fontSize: 11, color: "#7e94c8", fontWeight: 500, marginLeft: 8 }}>
                      ({ratio.toFixed(0)}%)
                    </span>
                  </p>
                  <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#66ff9d", marginTop: 6 }}>
                    누적 ₩{Math.round(data.krw).toLocaleString()}
                  </p>
                  {/* 막대 */}
                  <div style={{ width: "100%", height: 4, background: "#1f2a6b", marginTop: 8 }}>
                    <div style={{ width: `${ratio}%`, height: "100%", background: meta.color, transition: "width 0.3s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* 비용 큰 순 Top 5 */}
        <Section title="💸 비용 Top 5" accent="#ffd84d">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...items].sort((a, b) => b.cost.costUsd - a.cost.costUsd).slice(0, 5).map((it) => {
              const meta = SCOPE_META[it.scope] || SCOPE_META.marketing;
              return (
                <Link
                  key={it.id}
                  href={`/app/plans/${it.id}`}
                  style={{ background: "#060920", border: `1px solid ${meta.color}33`, padding: 12, textDecoration: "none", display: "block" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: meta.color }}>{meta.agent} · {meta.name}</span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: "#66ff9d", fontWeight: 700 }}>
                      ₩{Math.round(it.cost.costKrw).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", fontWeight: 600 }}>
                    {it.summary.headline || "(제목 없음)"}
                  </p>
                  <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", marginTop: 2 }}>
                    {new Date(it.createdAt).toLocaleString("ko-KR")} · 시드 {it.seedsCount}건 / 실행 {it.executionLogCount}건
                  </p>
                </Link>
              );
            })}
            {items.length === 0 && <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", textAlign: "center" }}>(데이터 없음)</p>}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${accent}33`, padding: 16, marginBottom: 14 }}>
      <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: accent, letterSpacing: "0.1em", marginBottom: 12 }}>▌ {title}</p>
      {children}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${color || "#1f2a6b"}33`, padding: 12 }}>
      <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#7e94c8", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: color || "#cfe9ff" }}>{value}</p>
    </div>
  );
}
