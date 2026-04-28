"use client";

interface BarProps {
  v: number; // 0-100
  c: string; // hex color
  segments?: number;
  label?: string;
}

export function Bar({ v, c, segments = 20, label }: BarProps) {
  const filled = Math.round((v / 100) * segments);
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          <span className="text-xs" style={{ color: "#7e94c8" }}>{label}</span>
          <span className="text-xs" style={{ color: c }}>{v}%</span>
        </div>
      )}
      <div className="flex gap-px">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            style={{
              width: `${100 / segments}%`,
              height: 8,
              background: i < filled ? c : "#1f2a6b",
              opacity: i < filled ? 1 : 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
}
