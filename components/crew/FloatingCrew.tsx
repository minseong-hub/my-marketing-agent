"use client";
import type { Agent, AgentId } from "@/data/agents";
import type { OrbitPath } from "./FloatingAstronaut";
import { FloatingAstronaut } from "./FloatingAstronaut";

const PATHS: Record<AgentId, OrbitPath> = {
  marky: { cx: 72, cy: 28, rx: 10, ry: 6,  dur: 14, phase: 0,    rotate: -8 },
  dali:  { cx: 58, cy: 68, rx: 8,  ry: 8,  dur: 17, phase: 0.25, rotate:  6 },
  addy:  { cx: 86, cy: 52, rx: 6,  ry: 10, dur: 13, phase: 0.5,  rotate:  4 },
  penny: { cx: 76, cy: 80, rx: 12, ry: 5,  dur: 19, phase: 0.75, rotate: -5 },
};

interface FloatingCrewProps {
  agents: Agent[];
  onOpen: (agent: Agent) => void;
}

export function FloatingCrew({ agents, onOpen }: FloatingCrewProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      {agents.map(agent => (
        <FloatingAstronaut
          key={agent.id}
          agent={agent}
          path={PATHS[agent.id]}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
