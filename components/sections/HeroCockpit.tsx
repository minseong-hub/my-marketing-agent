"use client";
import { useState } from "react";
import { Starfield } from "@/components/primitives/Starfield";
import { PixelButton } from "@/components/primitives/PixelButton";
import { CornerLabel } from "@/components/primitives/CornerLabel";
import { CockpitPanel } from "@/components/primitives/CockpitPanel";
import { Typewriter } from "@/components/primitives/Typewriter";
import { Bar } from "@/components/primitives/Bar";
import { HudStrip } from "@/components/primitives/HudStrip";
import { FloatingCrew } from "@/components/crew/FloatingCrew";
import { AgentModal } from "@/components/crew/AgentModal";
import { CrewRoster } from "@/components/crew/CrewRoster";
import { AGENTS } from "@/data/agents";
import type { Agent } from "@/data/agents";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";

const VITALS = [
  { label: "매출 성장", v: 78, c: "#66ff9d" },
  { label: "광고 ROAS", v: 82, c: "#ffd84d" },
  { label: "전환률", v: 65, c: "#5ce5ff" },
  { label: "재고 회전", v: 71, c: "#ff4ec9" },
];

export function HeroCockpit() {
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const { loggedIn } = useAuth();
  const primaryHref = loggedIn ? "/desk/marky" : "/signup";
  const primaryLabel = loggedIn ? "▶ 데스크 진입" : "▶ 무료로 시작";

  return (
    <>
      {/* Outer cockpit frame */}
      <div
        className="pixel-frame flex flex-col"
        style={{ border: "2px solid #5ce5ff", background: "#0a0e27" }}
      >
        {/* Top strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "6px 16px",
            borderBottom: "1px solid #5ce5ff33",
            background: "#060920",
          }}
        >
          {["#ff4ec9","#ffd84d","#66ff9d"].map((c, i) => (
            <div key={i} style={{ width: 8, height: 8, background: c }} />
          ))}
          <span
            style={{
              fontFamily: '"IBM Plex Sans KR", sans-serif',
              fontSize: 14,
              color: "#5ce5ff",
              flex: 1,
              fontWeight: 500,
            }}
          >
            ▸ 부팅 완료 · 크루 4명 대기 중 · 스토어 연결 안전
          </span>
          <span
            style={{
              fontFamily: '"IBM Plex Sans KR", sans-serif',
              fontSize: 13,
              color: "#7e94c8",
              flexShrink: 0,
            }}
          >
            크루메이트호 · 7번 구역
          </span>
        </div>

        {/* 3-column grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr 260px",
            minHeight: 640,
          }}
          className="hidden lg:grid"
        >
          {/* Left console */}
          <div
            style={{
              borderRight: "1px solid #5ce5ff22",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              overflowY: "auto",
            }}
          >
            <CockpitPanel title="마키와의 교신" status="실시간" statusColor="#ff4ec9" accent="#ff4ec9" height={220}>
              <Typewriter lines={AGENTS[0].sample} loop={true} />
            </CockpitPanel>
            <CockpitPanel title="스토어 핵심 지표" status="이번 달" statusColor="#66ff9d" accent="#66ff9d" height={260}>
              <div className="space-y-3 mt-1">
                {VITALS.map(v => (
                  <Bar key={v.label} {...v} segments={16} />
                ))}
                <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#7e94c8", marginTop: 10 }}>
                  ▸ 전월 대비 · 2026년 4월 누적
                </p>
              </div>
            </CockpitPanel>
          </div>

          {/* Main viewport */}
          <div
            className="relative scanlines overflow-hidden"
            style={{ borderRight: "1px solid #5ce5ff22" }}
          >
            <Starfield density={1.4} />

            {/* Hero text */}
            <div
              className="relative z-10"
              style={{ padding: "40px 32px", maxWidth: 520, pointerEvents: "auto" }}
            >
              <p
                style={{
                  fontFamily: '"IBM Plex Sans KR", sans-serif',
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#5ce5ff",
                  letterSpacing: "0.04em",
                  marginBottom: 16,
                }}
              >
                ▸ 1번 임무 · 당신의 스토어를 키웁니다
              </p>

              <h1
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: "clamp(20px, 2vw, 24px)",
                  color: "#cfe9ff",
                  lineHeight: 1.8,
                  textShadow: "4px 4px 0 #ff4ec9, 8px 8px 0 #060920",
                  marginBottom: 20,
                  whiteSpace: "pre-line",
                }}
              >
                {"당신의 스토어,\n"}
                <span style={{ color: "#5ce5ff" }}>{"4명의 크루"}</span>
                {"가\n운영합니다."}
              </h1>

              <p
                style={{
                  fontFamily: '"IBM Plex Sans KR", sans-serif',
                  fontSize: 18,
                  color: "#7e94c8",
                  lineHeight: 1.8,
                  marginBottom: 24,
                }}
              >
                마키, 데일리, 애디, 페니 — 24시간 일하는 AI 동료들.
                마케팅·상세페이지·광고·재무를 한 화면에서, 한 팀처럼.
              </p>

              <p
                style={{
                  fontFamily: '"IBM Plex Sans KR", sans-serif',
                  fontSize: 14,
                  color: "#ff4ec9",
                  marginBottom: 20,
                  fontWeight: 500,
                }}
              >
                ▸ TIP — 떠다니는 우주복을 클릭하면 비서 소개가 열립니다
              </p>

              <div className="flex gap-3 flex-wrap">
                <Link href={primaryHref} style={{ textDecoration: "none" }}>
                  <PixelButton variant="primary" size="md">{primaryLabel}</PixelButton>
                </Link>
                <Link href="/pricing" style={{ textDecoration: "none" }}>
                  <PixelButton variant="ghost" size="md">플랜 보기</PixelButton>
                </Link>
              </div>
            </div>

            {/* Floating crew */}
            <FloatingCrew agents={AGENTS} onOpen={setActiveAgent} />

            {/* Corner labels */}
            <CornerLabel pos="tl">VIEW_PORT 01</CornerLabel>
            <CornerLabel pos="tr">42.7°N · 126.8°E</CornerLabel>
            <CornerLabel pos="bl">ZOOM ×1.0</CornerLabel>
            <CornerLabel pos="br" color="#ff4ec9">REC ●</CornerLabel>
          </div>

          {/* Right console */}
          <div style={{ padding: 12, overflowY: "auto" }}>
            <CrewRoster onOpen={setActiveAgent} />
          </div>
        </div>

        {/* Mobile layout */}
        <div className="lg:hidden relative" style={{ minHeight: 480 }}>
          <Starfield density={1} />
          <div className="relative z-10 p-6">
            <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#5ce5ff", letterSpacing: "0.04em", marginBottom: 12 }}>
              ▸ 1번 임무 · 당신의 스토어를 키웁니다
            </p>
            <h1
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 18,
                color: "#cfe9ff",
                lineHeight: 1.8,
                textShadow: "3px 3px 0 #ff4ec9",
                marginBottom: 16,
                whiteSpace: "pre-line",
              }}
            >
              {"당신의 스토어,\n"}
              <span style={{ color: "#5ce5ff" }}>{"4명의 크루"}</span>
              {"가\n운영합니다."}
            </h1>
            <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 17, color: "#7e94c8", lineHeight: 1.8, marginBottom: 20 }}>
              마키, 데일리, 애디, 페니 — AI 크루 4명이 함께 운영합니다.
            </p>

            {/* Mobile crew grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {AGENTS.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgent(agent)}
                  style={{
                    border: `1px solid ${agent.accent}44`,
                    background: "#0f1640",
                    padding: "10px 8px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: agent.accent }}>
                    {agent.englishName.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 7, color: "#7e94c8" }}>
                    {agent.role}
                  </span>
                  <div style={{ width: 6, height: 6, background: agent.accent, animation: "led-pulse 1.5s infinite" }} />
                </button>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              <Link href={primaryHref} style={{ textDecoration: "none" }}>
                <PixelButton variant="primary" size="sm">{primaryLabel}</PixelButton>
              </Link>
              <Link href="/pricing" style={{ textDecoration: "none" }}>
                <PixelButton variant="ghost" size="sm">플랜 보기</PixelButton>
              </Link>
            </div>
          </div>
        </div>

        <HudStrip />
      </div>

      <AgentModal agent={activeAgent} onClose={() => setActiveAgent(null)} />
    </>
  );
}
