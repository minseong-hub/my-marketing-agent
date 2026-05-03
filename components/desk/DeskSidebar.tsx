"use client";

import { useEffect, useState } from "react";
import { AstronautAvatar } from "@/components/primitives/AstronautAvatar";
import { Bar } from "@/components/primitives/Bar";
import { DESKS, type DeskAgentId } from "@/data/desks";
import { DESK_MENU, findGroupOf } from "@/data/desk-menu";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

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
  const items = DESK_MENU[agentId];

  // 펼친 그룹 — 활성 leaf가 속한 그룹은 자동 펼침
  const initialOpen = (() => {
    const g = findGroupOf(agentId, activeTab);
    return g ? new Set([g]) : new Set<string>();
  })();
  const [openGroups, setOpenGroups] = useState<Set<string>>(initialOpen);

  // 비서 전환 또는 외부에서 탭 강제 변경 시 — 활성 탭의 그룹은 항상 펼쳐 보이게
  useEffect(() => {
    const g = findGroupOf(agentId, activeTab);
    if (g) {
      setOpenGroups((prev) => {
        if (prev.has(g)) return prev;
        const next = new Set(prev);
        next.add(g);
        return next;
      });
    }
  }, [agentId, activeTab]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <aside
      style={{
        width: 232,
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

      {/* 메뉴 — 큰메뉴/작은메뉴 2단 */}
      <div style={{ padding: "12px 8px", flex: 1, overflowY: "auto" }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#4a5a8a", letterSpacing: "0.16em", padding: "6px 8px", marginBottom: 4 }}>
          MENU
        </p>

        {items.map((item) => {
          if (item.kind === "leaf") {
            const isActive = item.id === activeTab;
            return (
              <LeafBtn
                key={item.id}
                label={item.label}
                isActive={isActive}
                accent={a.accent}
                onClick={() => onTabChange(item.id)}
                indent={false}
              />
            );
          }

          // group
          const isOpen = openGroups.has(item.id);
          const hasActive = item.children.some((c) => c.id === activeTab);
          return (
            <div key={item.id} style={{ marginBottom: 2 }}>
              <button
                onClick={() => toggleGroup(item.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  background: hasActive ? `${a.accent}10` : "transparent",
                  border: "none",
                  borderLeft: hasActive ? `3px solid ${a.accent}66` : "3px solid transparent",
                  color: hasActive ? a.accent : "#cfe9ff",
                  fontFamily: FONT_KR,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.12s",
                }}
                onMouseEnter={(e) => { if (!hasActive) (e.currentTarget as HTMLElement).style.background = "#0f164055"; }}
                onMouseLeave={(e) => { if (!hasActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                aria-expanded={isOpen}
              >
                <span>{item.label}</span>
                <span style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: hasActive ? a.accent : "#4a5a8a",
                  transition: "transform 0.15s",
                  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  display: "inline-block",
                }}>
                  ▶
                </span>
              </button>
              {isOpen && (
                <div style={{ paddingLeft: 0, paddingTop: 2, paddingBottom: 4 }}>
                  {item.children.map((c) => {
                    const isActive = c.id === activeTab;
                    return (
                      <LeafBtn
                        key={c.id}
                        label={c.label}
                        isActive={isActive}
                        accent={a.accent}
                        onClick={() => onTabChange(c.id)}
                        indent
                      />
                    );
                  })}
                </div>
              )}
            </div>
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

function LeafBtn({
  label, isActive, accent, onClick, indent,
}: {
  label: string;
  isActive: boolean;
  accent: string;
  onClick: () => void;
  indent: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: indent ? "6px 10px 6px 22px" : "8px 10px",
        marginBottom: 2,
        background: isActive ? `${accent}18` : "transparent",
        border: "none",
        borderLeft: isActive ? `3px solid ${accent}` : "3px solid transparent",
        color: isActive ? accent : "#cfe9ff",
        fontFamily: FONT_KR,
        fontSize: indent ? 12.5 : 13,
        fontWeight: isActive ? 700 : 500,
        cursor: "pointer",
        transition: "all 0.12s",
      }}
      onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#0f164055"; }}
      onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {label}
    </button>
  );
}
