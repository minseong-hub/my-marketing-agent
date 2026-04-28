"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CockpitShell } from "@/components/layout/CockpitShell";
import { CockpitPanel } from "@/components/primitives/CockpitPanel";
import { AstronautAvatar } from "@/components/primitives/AstronautAvatar";
import { Typewriter } from "@/components/primitives/Typewriter";
import { PixelButton } from "@/components/primitives/PixelButton";
import { Bar } from "@/components/primitives/Bar";
import { AGENTS } from "@/data/agents";
import type { Agent } from "@/data/agents";

const STATS: Record<string, { label: string; v: number; c: string }[]> = {
  marky: [
    { label: "SNS 참여율 부스트", v: 92, c: "#ff4ec9" },
    { label: "콘텐츠 생산 속도",  v: 97, c: "#ff4ec9" },
    { label: "트렌드 감지",        v: 88, c: "#ff86dc" },
    { label: "브랜드 일관성",      v: 95, c: "#ff86dc" },
  ],
  dali: [
    { label: "전환률 개선",     v: 89, c: "#5ce5ff" },
    { label: "페이지 체류시간", v: 94, c: "#5ce5ff" },
    { label: "카피 설득력",     v: 91, c: "#9af0ff" },
    { label: "섹션 구조화",     v: 96, c: "#9af0ff" },
  ],
  addy: [
    { label: "ROAS 최적화",      v: 93, c: "#ffd84d" },
    { label: "예산 효율",        v: 88, c: "#ffd84d" },
    { label: "채널 분석",        v: 95, c: "#fff0a8" },
    { label: "소재 A/B 테스트", v: 82, c: "#fff0a8" },
  ],
  penny: [
    { label: "손익 정확도",       v: 99, c: "#66ff9d" },
    { label: "현금흐름 추적",    v: 96, c: "#66ff9d" },
    { label: "비용 최적화",      v: 87, c: "#b8ffd1" },
    { label: "세금 시뮬레이션",  v: 90, c: "#b8ffd1" },
  ],
};

const USE_CASES: Record<string, string[]> = {
  marky: [
    "매일 오전 인스타·블로그 콘텐츠 3개 자동 생성",
    "실시간 트렌드 키워드 감지 → 캡션에 즉시 반영",
    "해시태그 최적화로 노출 +30% 향상",
    "브랜드 톤 학습 → 일관된 감성 유지",
  ],
  dali: [
    "경쟁사 상세페이지 벤치마킹 자동화",
    "5섹션 구조 상세페이지 30분 내 완성",
    "A/B 테스트 시안 2종 동시 생성",
    "체류시간 +42초, 전환률 +11%p 달성 사례",
  ],
  addy: [
    "Meta · Google · 네이버 광고 실시간 성과 분석",
    "ROAS 1.5x 미만 광고 자동 일시정지",
    "고성과 소재 패턴 학습 → 신규 소재 제안",
    "예산 자동 재배분으로 ROAS +0.8x 향상",
  ],
  penny: [
    "일일 매출·비용 자동 집계 및 리포트",
    "카테고리별 지출 분석 → 낭비 포인트 발굴",
    "부가세 시뮬레이션 분기별 자동 생성",
    "현금흐름 예측 30일 롤링 분석",
  ],
};

function LeftConsole({ agent }: { agent: Agent }) {
  const [typeKey, setTypeKey] = useState(0);
  return (
    <>
      <CockpitPanel
        title={`${agent.name.toUpperCase()} · 프로필`}
        accent={agent.accent}
        statusColor={agent.accent}
        status="ACTIVE"
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-4">
          <div style={{ filter: `drop-shadow(0 0 24px ${agent.accent}88)` }}>
            <AstronautAvatar agent={agent} scale={8} idle={true} />
          </div>
          <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, color: agent.accent, textAlign: "center" }}>
            {agent.englishName.toUpperCase()}
          </p>
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#7e94c8", textAlign: "center" }}>
            {agent.role}
          </p>
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: agent.accent, textAlign: "center", lineHeight: 1.6 }}>
            {agent.tagline}
          </p>

          {/* Stats */}
          <div className="w-full space-y-2 mt-2">
            {STATS[agent.id]?.map(s => (
              <Bar key={s.label} v={s.v} c={s.c} label={s.label} segments={14} />
            ))}
          </div>
        </div>
      </CockpitPanel>

      <CockpitPanel
        title="SAMPLE TRANSMISSION"
        accent={agent.accent}
        statusColor="#66ff9d"
        status="LIVE"
        height={200}
      >
        <Typewriter key={typeKey} lines={agent.sample} loop={true} />
        <button
          onClick={() => setTypeKey(k => k + 1)}
          style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 7, color: "#4a5a8a", background: "none", border: "none", cursor: "pointer", marginTop: 6 }}
        >
          ↻ 재생
        </button>
      </CockpitPanel>
    </>
  );
}

export default function CrewDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const agent = AGENTS.find(a => a.id === id);

  if (!agent) notFound();

  return (
    <CockpitShell
      sector="SECTOR-7G · CREW DOSSIER"
      leftConsole={<LeftConsole agent={agent} />}
      bootMessage={`DOSSIER LOADED · ${agent.englishName.toUpperCase()} · STATUS: ACTIVE · CLEARANCE: STANDARD`}
    >
      <div style={{ padding: "32px 28px", maxWidth: 680 }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Link href="/crew" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#4a5a8a", textDecoration: "none" }}>
            CREW
          </Link>
          <span style={{ color: "#1f2a6b" }}>›</span>
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: agent.accent }}>
            {agent.englishName.toUpperCase()}
          </span>
        </div>

        {/* Header */}
        <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: agent.accent, letterSpacing: "0.1em", marginBottom: 8 }}>
          {agent.title}
        </p>
        <h1
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "clamp(16px, 2.5vw, 24px)",
            color: "#cfe9ff",
            textShadow: `4px 4px 0 ${agent.accentDark}`,
            lineHeight: 1.6,
            marginBottom: 12,
          }}
        >
          {agent.name}
        </h1>
        <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: agent.accent, marginBottom: 20 }}>
          » {agent.tagline}
        </p>

        {/* Description */}
        <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#cfe9ff", lineHeight: 1.9, marginBottom: 28 }}>
          {agent.desc}
        </p>

        {/* Equipment */}
        <div className="pixel-frame" style={{ border: `1px solid ${agent.accent}44`, background: "#0f1640", padding: "16px 14px", marginBottom: 20 }}>
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#7e94c8", letterSpacing: "0.1em", marginBottom: 10 }}>
            ▸ EQUIPMENT
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {agent.skills.map(skill => (
              <span
                key={skill}
                style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: agent.accent,
                  border: `1px solid ${agent.accentDark}`, padding: "4px 10px",
                  background: `${agent.accentDark}22`,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="pixel-frame" style={{ border: `1px solid ${agent.accent}44`, background: "#0f1640", padding: "16px 14px", marginBottom: 24 }}>
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#7e94c8", letterSpacing: "0.1em", marginBottom: 12 }}>
            ▸ 실전 사례
          </p>
          <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {USE_CASES[agent.id]?.map((uc, i) => (
              <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: agent.accent, fontFamily: '"JetBrains Mono", monospace', fontSize: 9, flexShrink: 0 }}>›</span>
                <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#cfe9ff", lineHeight: 1.7 }}>{uc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Other crew */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#7e94c8", letterSpacing: "0.1em", marginBottom: 10 }}>
            ▸ 다른 크루원
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {AGENTS.filter(a => a.id !== agent.id).map(other => (
              <Link key={other.id} href={`/crew/${other.id}`} style={{ textDecoration: "none" }}>
                <div
                  className="pixel-frame"
                  style={{
                    border: `1px solid ${other.accent}44`, background: "#0f1640",
                    padding: "6px 12px", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = `1px solid ${other.accent}`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = `1px solid ${other.accent}44`; }}
                >
                  <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: other.accent }}>{other.englishName}</p>
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 7, color: "#7e94c8", marginTop: 2 }}>{other.role}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/signup" style={{ textDecoration: "none" }}>
            <PixelButton variant="primary" size="md">▶ {agent.name} 고용하기</PixelButton>
          </Link>
          <Link href="/crew" style={{ textDecoration: "none" }}>
            <PixelButton variant="secondary" size="md">← 크루 목록</PixelButton>
          </Link>
        </div>
      </div>
    </CockpitShell>
  );
}
