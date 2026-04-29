"use client";

import { DESKS, type DeskAgentId } from "@/data/desks";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

const STATUS_LABEL: Record<string, string> = {
  done: "완료",
  running: "진행",
  queued: "대기",
  warn: "주의",
};
const STATUS_COLOR: Record<string, string> = {
  done: "#66ff9d",
  running: "#5ce5ff",
  queued: "#7e94c8",
  warn: "#ffd84d",
};

export function Timeline({ agentId }: { agentId: DeskAgentId }) {
  const desk = DESKS[agentId];
  const a = desk.agent;

  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}22`, padding: 0 }}>
      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${a.accent}22`, background: "#060920" }}>
        <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: a.accent, letterSpacing: "0.08em" }}>
          ▶ 오늘의 타임라인
        </p>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {desk.timeline.map((t) => {
            const c = STATUS_COLOR[t.status];
            const blink = t.status === "running";
            return (
              <li key={t.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, paddingTop: 4 }}>
                  <span style={{
                    display: "inline-block",
                    width: 6, height: 6, background: c, borderRadius: "50%",
                    boxShadow: blink ? `0 0 8px ${c}` : "none",
                    animation: blink ? "led-pulse 1.5s infinite" : "none",
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8" }}>{t.time}</span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: c, fontWeight: 700, letterSpacing: "0.08em" }}>
                      {STATUS_LABEL[t.status]}
                    </span>
                  </div>
                  <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", lineHeight: 1.5, marginTop: 2 }}>
                    {t.title}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
