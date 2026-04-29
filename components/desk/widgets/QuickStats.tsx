"use client";

import { DESKS, type DeskAgentId } from "@/data/desks";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_MONO = '"JetBrains Mono", monospace';

const TONE_COLOR: Record<string, string> = {
  good: "#66ff9d",
  warn: "#ffd84d",
  bad: "#ff4ec9",
  neutral: "#5ce5ff",
};

export function QuickStats({ agentId }: { agentId: DeskAgentId }) {
  const desk = DESKS[agentId];
  const a = desk.agent;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
      {desk.quickStats.map((s) => {
        const c = TONE_COLOR[s.tone || "neutral"];
        return (
          <div key={s.label} className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}22`, padding: "12px 14px" }}>
            <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", marginBottom: 6 }}>
              {s.label.toUpperCase()}
            </p>
            <p style={{ fontFamily: FONT_KR, fontSize: 22, fontWeight: 800, color: "#ffffff", lineHeight: 1.1, marginBottom: 4, letterSpacing: "-0.02em" }}>
              {s.value}
            </p>
            {s.delta && (
              <p style={{ fontFamily: FONT_KR, fontSize: 12, color: c, fontWeight: 600 }}>
                {s.delta}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
