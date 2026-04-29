"use client";

import { DESKS, type DeskAgentId } from "@/data/desks";
import { showToast } from "../ToastHost";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

export function TeamHandoff({ agentId }: { agentId: DeskAgentId }) {
  const desk = DESKS[agentId];
  const a = desk.agent;

  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}22` }}>
      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${a.accent}22`, background: "#060920" }}>
        <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: a.accent, letterSpacing: "0.08em" }}>
          ◆ TEAM HANDOFF — 다른 비서로 인계
        </p>
      </div>
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {desk.handoffs.map((h, i) => {
          const target = DESKS[h.toId].agent;
          return (
            <button
              key={i}
              onClick={() => showToast(`${target.name}에게 「${h.subject}」 전달 완료`, { color: target.accent, icon: "▸" })}
              style={{
                background: "#060920",
                border: `1px solid ${target.accent}33`,
                padding: "10px 12px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.12s",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = `${target.accentDark}22`;
                (e.currentTarget as HTMLElement).style.borderColor = target.accent;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#060920";
                (e.currentTarget as HTMLElement).style.borderColor = `${target.accent}33`;
              }}
            >
              <span style={{
                width: 8, height: 8, background: target.accent, borderRadius: "50%",
                marginTop: 5, flexShrink: 0,
                boxShadow: `0 0 6px ${target.accent}`,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: target.accent, letterSpacing: "0.1em", marginBottom: 2 }}>
                  → {target.name.toUpperCase()}
                </p>
                <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 600, color: "#cfe9ff", lineHeight: 1.4 }}>
                  {h.subject}
                </p>
                <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginTop: 2, lineHeight: 1.5 }}>
                  {h.from}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
