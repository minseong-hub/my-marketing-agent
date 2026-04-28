"use client";
import { useState } from "react";
import { CockpitShell } from "@/components/layout/CockpitShell";
import { CockpitPanel } from "@/components/primitives/CockpitPanel";

const TOC = [
  { id: "intro", label: "시작하기", sub: ["Crewmate란?", "설치 & 연동"] },
  { id: "crew", label: "크루 가이드", sub: ["마키", "데일리", "애디", "페니"] },
  { id: "dashboard", label: "대시보드", sub: ["개요", "실시간 지표"] },
  { id: "api", label: "API 레퍼런스", sub: ["인증", "엔드포인트"] },
];

const DOCS: Record<string, { title: string; content: string }> = {
  intro: {
    title: "시작하기",
    content: `Crewmate AI는 온라인 스토어 운영자를 위한 AI 에이전트 플랫폼입니다.

마키(마케팅), 데일리(상세페이지), 애디(광고), 페니(재무) — 4명의 AI 크루가 여러분의 스토어를 24시간 운영합니다.

## 연동 방법

1. 회원가입 후 대시보드 진입
2. 스토어 설정에서 플랫폼 선택 (스마트스토어 / 카페24 / 쇼피파이)
3. API 키 발급 후 붙여넣기
4. 크루 배정 시작

5분 안에 모든 설정이 완료됩니다.`,
  },
  crew: {
    title: "크루 가이드",
    content: `각 크루는 고유한 전문성을 갖고 있습니다.

## 마키 (Marky) — 마케팅 비서
SNS 콘텐츠 기획, 캡션 생성, 해시태그 최적화.
"감성 한 스푼, 데이터 한 트럭."

## 데일리 (Dali) — 상세페이지 비서
상세페이지 5섹션 자동 생성, 전환률 최적화 카피.
"스크롤이 멈추는 그 페이지."

## 애디 (Addy) — 광고 전문가
Meta/Google/네이버 광고 분석 및 예산 최적화.
"ROAS 사냥꾼."

## 페니 (Penny) — 재무 비서
손익 분석, 현금흐름 추적, 세금 시뮬레이션.
"1원도 새지 않게."`,
  },
  dashboard: {
    title: "대시보드",
    content: `대시보드는 4 크루의 활동을 실시간으로 확인하는 중앙 허브입니다.

## 주요 지표
- 매출 성장률 (MoM)
- 광고 ROAS
- 고객 전환률
- 재고 회전율

## 알림 시스템
크루가 중요한 이슈를 감지하면 즉시 신호를 보냅니다.`,
  },
  api: {
    title: "API 레퍼런스",
    content: `Crewmate API를 통해 외부 시스템과 연동할 수 있습니다.

## 인증

\`\`\`
Authorization: Bearer {API_KEY}
\`\`\`

## 주요 엔드포인트

GET /api/v1/agents — 크루 목록
POST /api/v1/tasks — 작업 생성
GET /api/v1/analytics — 성과 데이터`,
  },
};

export default function DocsPage() {
  const [active, setActive] = useState("intro");

  const TocPanel = (
    <CockpitPanel title="TABLE OF CONTENTS" status="INDEXED" accent="#5ce5ff" className="flex-1">
      {TOC.map(item => (
        <div key={item.id} style={{ marginBottom: 8 }}>
          <button
            onClick={() => setActive(item.id)}
            className="w-full text-left cursor-pointer"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9,
              color: active === item.id ? "#5ce5ff" : "#7e94c8",
              background: "none",
              border: "none",
              padding: "3px 0",
              letterSpacing: "0.08em",
            }}
          >
            {active === item.id ? "▶ " : "› "}{item.label}
          </button>
          {active === item.id && item.sub.map(s => (
            <p key={s} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#4a5a8a", paddingLeft: 12, marginTop: 2, animation: "blink 1s steps(2) infinite" }}>
              · {s}
            </p>
          ))}
        </div>
      ))}
    </CockpitPanel>
  );

  const doc = DOCS[active] ?? DOCS.intro;

  return (
    <CockpitShell
      sector="SECTOR-7G · MISSION MANUAL"
      leftConsole={TocPanel}
      bootMessage="MANUAL LOADED · MISSION BRIEFING AVAILABLE · CLEARANCE: STANDARD"
    >
      <div style={{ padding: "32px 28px", maxWidth: 720 }}>
        <h1
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "clamp(13px, 1.8vw, 18px)",
            color: "#cfe9ff",
            textShadow: "4px 4px 0 #8a2877",
            marginBottom: 28,
          }}
        >
          {doc.title}
        </h1>
        <div
          style={{
            fontFamily: '"IBM Plex Sans KR", sans-serif',
            fontSize: 14,
            color: "#cfe9ff",
            lineHeight: 1.9,
            whiteSpace: "pre-line",
          }}
        >
          {doc.content.split(/^##\s+/m).map((block, i) => {
            if (i === 0) return <p key={i}>{block}</p>;
            const [heading, ...rest] = block.split("\n");
            return (
              <div key={i} style={{ marginTop: 24 }}>
                <h2
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 11,
                    color: "#5ce5ff",
                    marginBottom: 12,
                    textShadow: "2px 2px 0 #2a86a8",
                  }}
                >
                  {heading}
                </h2>
                <div style={{ color: "#7e94c8" }}>{rest.join("\n")}</div>
              </div>
            );
          })}
        </div>
      </div>
    </CockpitShell>
  );
}
