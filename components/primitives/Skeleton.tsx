"use client";

import { CSSProperties } from "react";

const SHIMMER_KEYFRAME = `
  @keyframes skeleton-shimmer {
    0%   { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
`;

let injected = false;
function ensureKeyframe() {
  if (injected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = SHIMMER_KEYFRAME;
  document.head.appendChild(style);
  injected = true;
}

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  rounded?: boolean;
  style?: CSSProperties;
}

/**
 * 픽셀 스타일 스켈레톤 — pixel-frame 코너 클립 유지.
 * 사용 예: <Skeleton width="100%" height={20} />
 */
export function Skeleton({ width = "100%", height = 16, rounded = false, style }: SkeletonProps) {
  if (typeof document !== "undefined") ensureKeyframe();
  return (
    <div
      className={rounded ? "" : "pixel-frame"}
      style={{
        width,
        height,
        background: "linear-gradient(90deg, #0f1640 0%, #1f2a6b 50%, #0f1640 100%)",
        backgroundSize: "200px 100%",
        animation: "skeleton-shimmer 1.4s linear infinite",
        ...style,
      }}
    />
  );
}

/** 카드 형태 스켈레톤 */
export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: "1px solid #1f2a6b", padding: 14 }}>
      <Skeleton height={14} width="60%" style={{ marginBottom: 10 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={10} width={i === rows - 1 ? "40%" : "92%"} style={{ marginBottom: 6 }} />
      ))}
    </div>
  );
}

/** 그리드 스켈레톤 */
export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
