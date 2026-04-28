"use client";
import { useEffect, useRef } from "react";
import { PixelAvatar } from "./PixelAvatar";
import { SUIT } from "@/data/avatars";
import type { Agent } from "@/data/agents";

interface AstronautAvatarProps {
  agent: Agent;
  scale?: number;
  idle?: boolean;
}

export function AstronautAvatar({ agent, scale = 5, idle = true }: AstronautAvatarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const suit = SUIT[agent.id];

  useEffect(() => {
    if (!idle || !ref.current) return;
    // Each agent has a slightly different bob period
    const periods: Record<string, number> = {
      marky: 540, dali: 600, addy: 480, penny: 620,
    };
    const period = periods[agent.id] ?? 560;
    let up = false;
    const tick = setInterval(() => {
      if (!ref.current) return;
      ref.current.style.transform = up ? "translateY(0px)" : "translateY(1px)";
      up = !up;
    }, period);
    return () => clearInterval(tick);
  }, [idle, agent.id]);

  return (
    <div ref={ref} style={{ transition: "transform 0.4s ease-in-out", display: "inline-block" }}>
      <PixelAvatar data={suit.data} palette={suit.palette} scale={scale} />
    </div>
  );
}
