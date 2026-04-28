"use client";
import { ReactNode, useState } from "react";
import { CockpitNav } from "./CockpitNav";
import { Footer } from "./Footer";
import { HudStrip } from "@/components/primitives/HudStrip";
import { CornerLabel } from "@/components/primitives/CornerLabel";
import { CrewRoster } from "@/components/crew/CrewRoster";
import { AgentModal } from "@/components/crew/AgentModal";
import type { Agent } from "@/data/agents";

interface CockpitShellProps {
  children: ReactNode;
  leftConsole?: ReactNode;
  rightConsole?: ReactNode;
  sector?: string;
  accent?: string;
  viewport?: boolean;
  minHeight?: number;
  bootMessage?: string;
}

export function CockpitShell({
  children,
  leftConsole,
  rightConsole,
  sector = "SECTOR-7G · SHIP CREWMATE-04",
  accent = "#5ce5ff",
  viewport = false,
  minHeight = 600,
  bootMessage = "BOOT SEQ COMPLETE · ALL SYSTEMS ONLINE · STORE LINK: SECURE",
}: CockpitShellProps) {
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [mobileTab, setMobileTab] = useState<"main" | "left" | "right">("main");

  return (
    <div style={{ background: "#060920", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <CockpitNav />

      {/* Outer frame */}
      <div className="flex-1 flex flex-col" style={{ padding: "12px 16px 0" }}>
        <div
          className="pixel-frame flex-1 flex flex-col"
          style={{ border: `2px solid ${accent}`, background: "#0a0e27", position: "relative" }}
        >
          {/* Top strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "6px 16px",
              borderBottom: `1px solid ${accent}33`,
              background: "#060920",
            }}
          >
            {["#ff4ec9","#ffd84d","#66ff9d"].map((c, i) => (
              <div key={i} style={{ width: 8, height: 8, background: c }} />
            ))}
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 8, color: "#5ce5ff", letterSpacing: "0.08em",
                flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              ▸ {bootMessage}
            </span>
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 8, color: "#4a5a8a", letterSpacing: "0.08em", flexShrink: 0,
              }}
              className="hidden sm:inline"
            >
              {sector}
            </span>
          </div>

          {/* ── Desktop 3-column ── */}
          <div
            className="hidden lg:grid flex-1"
            style={{
              gridTemplateColumns: leftConsole ? "260px 1fr 260px" : "1fr 260px",
              minHeight,
            }}
          >
            {leftConsole && (
              <div
                style={{
                  borderRight: `1px solid ${accent}22`,
                  padding: 12,
                  display: "flex", flexDirection: "column", gap: 12,
                  overflowY: "auto",
                }}
              >
                {leftConsole}
              </div>
            )}

            <div
              className={`relative overflow-auto ${viewport ? "scanlines" : ""}`}
              style={{ borderRight: `1px solid ${accent}22` }}
            >
              {viewport && (
                <>
                  <CornerLabel pos="tl">VIEW_PORT 01</CornerLabel>
                  <CornerLabel pos="tr">42.7°N · 126.8°E</CornerLabel>
                  <CornerLabel pos="bl">ZOOM ×1.0</CornerLabel>
                  <CornerLabel pos="br" color="#ff4ec9">REC ●</CornerLabel>
                </>
              )}
              {children}
            </div>

            <div style={{ padding: 12, overflowY: "auto" }}>
              {rightConsole ?? <CrewRoster onOpen={setActiveAgent} />}
            </div>
          </div>

          {/* ── Mobile tab bar ── */}
          <div
            className="lg:hidden flex"
            style={{ borderBottom: `1px solid ${accent}22`, background: "#060920" }}
          >
            {(leftConsole ? [
              { id: "main" as const,  label: "메인" },
              { id: "left" as const,  label: "콘솔" },
              { id: "right" as const, label: "크루" },
            ] : [
              { id: "main" as const,  label: "메인" },
              { id: "right" as const, label: "크루" },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setMobileTab(tab.id)}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 8,
                  letterSpacing: "0.08em",
                  color: mobileTab === tab.id ? accent : "#4a5a8a",
                  background: "none", border: "none", cursor: "pointer",
                  borderBottom: mobileTab === tab.id ? `2px solid ${accent}` : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Mobile content ── */}
          <div className="lg:hidden flex-1 overflow-auto" style={{ minHeight: 400 }}>
            {mobileTab === "main" && (
              <div className={`relative ${viewport ? "scanlines" : ""}`}>
                {viewport && (
                  <>
                    <CornerLabel pos="tl">VIEW_PORT 01</CornerLabel>
                    <CornerLabel pos="br" color="#ff4ec9">REC ●</CornerLabel>
                  </>
                )}
                {children}
              </div>
            )}
            {mobileTab === "left" && leftConsole && (
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                {leftConsole}
              </div>
            )}
            {mobileTab === "right" && (
              <div style={{ padding: 12 }}>
                {rightConsole ?? <CrewRoster onOpen={setActiveAgent} />}
              </div>
            )}
          </div>

          <HudStrip />
        </div>
      </div>

      <Footer />
      <AgentModal agent={activeAgent} onClose={() => setActiveAgent(null)} />
    </div>
  );
}
