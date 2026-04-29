"use client";

import { DESKS, type DeskAgentId } from "@/data/desks";
import { showToast } from "./ToastHost";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';

export function DeskTitleBar({ agentId }: { agentId: DeskAgentId }) {
  const desk = DESKS[agentId];
  const a = desk.agent;

  return (
    <header
      style={{
        padding: "20px 28px 18px",
        borderBottom: "1px solid #1f2a6b",
        background: "linear-gradient(180deg, #0a0e27 0%, #060920 100%)",
      }}
    >
      <p style={{
        fontFamily: FONT_PIX, fontSize: 11, color: a.accent,
        letterSpacing: "0.08em", marginBottom: 8,
      }}>
        ▌ DESK / {a.englishName.toUpperCase()} · {a.role.toUpperCase()}
      </p>
      <h1 style={{
        fontFamily: FONT_KR, fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 800,
        letterSpacing: "-0.025em", lineHeight: 1.05, marginBottom: 10,
        color: "#ffffff",
      }}>
        <span style={{ color: a.accent }}>{a.name}</span>
        <span style={{ color: "#ffffff" }}>의 데스크</span>
      </h1>
      <p style={{
        fontFamily: FONT_KR, fontSize: 15, color: "#cfe9ff",
        lineHeight: 1.55, marginBottom: 14,
      }}>
        <span style={{ color: a.accent, fontWeight: 600 }}>{a.tagline}</span>
        <span style={{ color: "#7e94c8" }}> — 실시간으로 자동 운영 중인 작업과 결과를 한 화면에서.</span>
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => showToast(`${a.name}의 주간 리포트를 PDF로 내보냄`, { color: a.accent, icon: "▤" })}
          className="pixel-frame"
          style={{
            background: a.accent, color: "#060920",
            border: `2px solid ${a.accent}`, boxShadow: `3px 3px 0 ${a.accentDark}`,
            padding: "9px 18px", fontFamily: FONT_KR, fontSize: 14, fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ▤ 리포트 다운로드
        </button>
        <button
          onClick={() => showToast(`새 임무 입력 — ${a.name}에게 작업 큐 추가`, { color: a.accent, icon: "▶" })}
          style={{
            background: "transparent", color: a.accent,
            border: `1px solid ${a.accent}66`,
            padding: "9px 16px", fontFamily: FONT_KR, fontSize: 14, fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ▶ 새 임무 부여
        </button>
      </div>
    </header>
  );
}
