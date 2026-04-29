"use client";
import { useEffect, useRef, useState } from "react";
import { PixelAvatar } from "@/components/primitives/PixelAvatar";
import { SUIT } from "@/data/avatars";
import type { Agent } from "@/data/agents";

export interface OrbitPath {
  cx: number; // % of container
  cy: number;
  rx: number;
  ry: number;
  dur: number; // seconds
  phase: number; // 0~1
  rotate: number; // base tilt deg
}

interface FloatingAstronautProps {
  agent: Agent;
  path: OrbitPath;
  onOpen: (agent: Agent) => void;
}

export function FloatingAstronaut({ agent, path, onOpen }: FloatingAstronautProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const suit = SUIT[agent.id];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { cx, cy, rx, ry, dur, phase, rotate } = path;
    let raf: number;
    const t0 = performance.now() - phase * dur * 1000;

    const tick = (now: number) => {
      const t = ((now - t0) / 1000) % dur;
      const ang = (t / dur) * Math.PI * 2;
      const x = cx + Math.cos(ang) * rx;
      const y = cy + Math.sin(ang * 1.3) * ry;
      const tilt = Math.sin(ang) * 6 + rotate;
      el.style.left = x + "%";
      el.style.top = y + "%";
      el.style.transform = `translate(-50%,-50%) rotate(${tilt}deg)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [path]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        pointerEvents: "auto",
        cursor: "pointer",
        filter: `drop-shadow(0 0 ${hovered ? 22 : 10}px ${agent.accent}aa)`,
        transition: "filter 0.2s",
        zIndex: 4,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(agent)}
    >
      <PixelAvatar data={suit.data} palette={suit.palette} scale={5} />

      {/* Nameplate */}
      <div
        style={{
          textAlign: "center",
          marginTop: 4,
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 7,
          color: hovered ? "#060920" : agent.accent,
          background: hovered ? agent.accent : "transparent",
          border: `1px solid ${agent.accent}`,
          padding: "2px 5px",
          letterSpacing: "0.05em",
          transition: "all 0.15s",
        }}
      >
        {agent.englishName.toUpperCase()}
      </div>

      {/* Tooltip on hover */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: 6,
            background: "#0f1640",
            border: `1px solid ${agent.accent}`,
            padding: "4px 8px",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            color: agent.accent,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {agent.tagline}
        </div>
      )}
    </div>
  );
}
