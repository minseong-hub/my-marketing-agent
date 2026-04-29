"use client";
import { ReactNode } from "react";

type Pos = "tl" | "tr" | "bl" | "br";

interface CornerLabelProps {
  pos: Pos;
  color?: string;
  children: ReactNode;
}

const posStyle: Record<Pos, React.CSSProperties> = {
  tl: { top: 6, left: 8 },
  tr: { top: 6, right: 8 },
  bl: { bottom: 6, left: 8 },
  br: { bottom: 6, right: 8 },
};

export function CornerLabel({ pos, color = "#7e94c8", children }: CornerLabelProps) {
  return (
    <div
      style={{
        position: "absolute",
        ...posStyle[pos],
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 13,
        color,
        letterSpacing: "0.08em",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {children}
    </div>
  );
}
