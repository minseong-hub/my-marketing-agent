"use client";
import { useState } from "react";
import { CockpitPanel } from "@/components/primitives/CockpitPanel";
import { AstronautAvatar } from "@/components/primitives/AstronautAvatar";
import { AGENTS } from "@/data/agents";
import type { Agent } from "@/data/agents";

const EXP: Record<string, string> = {
  marky: "+4.2k", dali: "+3.8k", addy: "+5.1k", penny: "+2.9k",
};

interface CrewRosterProps {
  onOpen: (agent: Agent) => void;
}

export function CrewRoster({ onOpen }: CrewRosterProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <CockpitPanel title="CREW ROSTER" status="4 ACTIVE" statusColor="#66ff9d" accent="#5ce5ff" className="h-full">
      <div className="space-y-1">
        {AGENTS.map(agent => (
          <button
            key={agent.id}
            onClick={() => onOpen(agent)}
            onMouseEnter={() => setHovered(agent.id)}
            onMouseLeave={() => setHovered(null)}
            className="w-full text-left flex items-center gap-3 p-2 transition-all duration-150 cursor-pointer"
            style={{
              background: hovered === agent.id ? `${agent.accentDark}33` : "transparent",
              border: `1px solid ${hovered === agent.id ? agent.accent : "transparent"}`,
            }}
          >
            <AstronautAvatar agent={agent} scale={3} idle={true} />
            <div className="flex-1 min-w-0">
              <p
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 7,
                  color: agent.accent,
                  letterSpacing: "0.05em",
                }}
              >
                {agent.englishName.toUpperCase()}
              </p>
              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 8,
                  color: "#7e94c8",
                  marginTop: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {agent.role}
              </p>
            </div>
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 8,
                color: "#66ff9d",
              }}
            >
              {EXP[agent.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Hint */}
      <div
        style={{
          marginTop: 12,
          borderTop: "1px dashed #1f2a6b",
          paddingTop: 8,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 8,
          color: "#4a5a8a",
          textAlign: "center",
        }}
      >
        ▸ DOSSIER 열람 · 행을 클릭
      </div>
    </CockpitPanel>
  );
}
