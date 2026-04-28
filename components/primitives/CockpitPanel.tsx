"use client";
import { ReactNode, useState, useEffect } from "react";

interface CockpitPanelProps {
  title: string;
  status?: string;
  statusColor?: string;
  accent?: string;
  height?: number | string;
  children: ReactNode;
  className?: string;
}

const LED_PHASES = [0, 400, 800, 1200];

export function CockpitPanel({
  title,
  status = "ONLINE",
  statusColor = "#66ff9d",
  accent = "#5ce5ff",
  height,
  children,
  className = "",
}: CockpitPanelProps) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 200);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`pixel-frame flex flex-col overflow-hidden ${className}`}
      style={{
        border: `2px solid ${accent}`,
        background: "#0f1640",
        height: height,
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0"
        style={{ borderBottom: `1px solid ${accent}33`, background: "#0a0e27" }}
      >
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9,
            color: accent,
            letterSpacing: "0.1em",
          }}
        >
          ● {title}
        </span>
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9,
            color: statusColor,
            letterSpacing: "0.08em",
            animation: "blink 1s steps(2) infinite",
          }}
        >
          ● {status}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 relative scanlines">{children}</div>

      {/* LED strip */}
      <div className="flex gap-2 px-3 py-1.5 shrink-0" style={{ borderTop: `1px solid ${accent}22` }}>
        {LED_PHASES.map((phase, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 0,
              background: ["#5ce5ff","#ff4ec9","#66ff9d","#ffd84d"][i],
              opacity: (tick * 200 + phase) % 1600 < 800 ? 1 : 0.2,
              transition: "opacity 0.2s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
