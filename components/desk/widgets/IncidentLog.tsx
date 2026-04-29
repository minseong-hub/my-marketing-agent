"use client";

import { DESKS, type DeskAgentId } from "@/data/desks";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

const LEVEL_LABEL: Record<string, string> = { info: "정보", warn: "주의", error: "오류" };
const LEVEL_COLOR: Record<string, string> = { info: "#5ce5ff", warn: "#ffd84d", error: "#ff4ec9" };

export function IncidentLog({ agentId }: { agentId: DeskAgentId }) {
  const desk = DESKS[agentId];
  const a = desk.agent;

  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}22` }}>
      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${a.accent}22`, background: "#060920" }}>
        <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: a.accent, letterSpacing: "0.08em" }}>
          ⚠ INCIDENT LOG — 문제·조치 보고
        </p>
      </div>
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {desk.incidents.map((it) => {
          const c = LEVEL_COLOR[it.level];
          return (
            <div key={it.id} style={{ borderLeft: `3px solid ${c}`, paddingLeft: 12, paddingTop: 4, paddingBottom: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: c, fontWeight: 700, letterSpacing: "0.1em" }}>
                  [{LEVEL_LABEL[it.level].toUpperCase()}]
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8" }}>{it.at}</span>
              </div>
              <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>
                {it.title}
              </p>
              <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", lineHeight: 1.5, marginBottom: 4 }}>
                {it.detail}
              </p>
              <p style={{ fontFamily: FONT_KR, fontSize: 12, color: c, fontWeight: 600 }}>
                ▸ {it.action}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
