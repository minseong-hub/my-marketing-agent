"use client";

import { AstronautAvatar } from "@/components/primitives/AstronautAvatar";
import { Bar } from "@/components/primitives/Bar";
import { DESKS, type DeskAgentId } from "@/data/desks";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

const BASE_TABS = [
  "오버뷰",
  "히스토리",
  "성과 분석",
  "지식 베이스",
  "팀 협업",
  "리포트",
  "설정",
];

const SPECIAL: Record<DeskAgentId, [string, string]> = {
  marky: ["콘텐츠 캘린더", "오디언스"],
  dali: ["템플릿 갤러리", "A/B 테스트"],
  addy: ["캠페인", "지출 모니터"],
  penny: ["장부", "세금·정산"],
};

export function DeskSidebar({
  agentId,
  activeTab,
  onTabChange,
}: {
  agentId: DeskAgentId;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const desk = DESKS[agentId];
  const a = desk.agent;
  const tabs = ["오버뷰", ...SPECIAL[agentId], ...BASE_TABS.slice(1)];

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: "#060920",
        borderRight: "1px solid #1f2a6b",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 비서 카드 */}
      <div style={{ padding: 16, borderBottom: "1px solid #1f2a6b" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ filter: `drop-shadow(0 0 12px ${a.accent}88)` }}>
            <AstronautAvatar agent={a} scale={3} idle={true} />
          </div>
          <div>
            <p style={{ fontFamily: FONT_PIX, fontSize: 12, color: a.accent, marginBottom: 4 }}>
              {a.englishName.toUpperCase()}
            </p>
            <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#66ff9d", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, background: "#66ff9d", borderRadius: "50%", animation: "led-pulse 1.5s infinite" }} />
              근무 중
            </p>
          </div>
        </div>
        <p style={{ fontFamily: FONT_KR, fontSize: 11, color: "#7e94c8", marginTop: 8, lineHeight: 1.5 }}>
          {a.tagline}
        </p>
      </div>

      {/* 메뉴 */}
      <div style={{ padding: "12px 8px", flex: 1, overflowY: "auto" }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#4a5a8a", letterSpacing: "0.16em", padding: "6px 8px", marginBottom: 4 }}>
          MENU
        </p>
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                marginBottom: 2,
                background: isActive ? `${a.accent}18` : "transparent",
                border: "none",
                borderLeft: isActive ? `3px solid ${a.accent}` : "3px solid transparent",
                color: isActive ? a.accent : "#cfe9ff",
                fontFamily: FONT_KR,
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.12s",
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#0f164055"; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Trust Level */}
      <div style={{ padding: 12, borderTop: "1px solid #1f2a6b" }}>
        <div style={{ border: "1px dashed #1f2a6b", padding: 10 }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.16em", marginBottom: 6 }}>
            TRUST LEVEL
          </p>
          <Bar v={desk.trustLevel} c={a.accent} segments={14} />
          <p style={{ fontFamily: FONT_KR, fontSize: 12, color: a.accent, fontWeight: 700, marginTop: 4 }}>
            {desk.trustLevel}%
          </p>
          <p style={{ fontFamily: FONT_KR, fontSize: 10, color: "#7e94c8", marginTop: 4, lineHeight: 1.5 }}>
            함장님과의 협업 신뢰도
          </p>
        </div>
      </div>
    </aside>
  );
}
