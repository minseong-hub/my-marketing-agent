"use client";

interface PixelAvatarProps {
  data: string[];
  palette: Record<string, string>;
  scale?: number;
  className?: string;
}

export function PixelAvatar({ data, palette, scale = 4, className = "" }: PixelAvatarProps) {
  const rows = data.length;
  const cols = data[0]?.length ?? 0;
  const w = cols * scale;
  const h = rows * scale;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${cols} ${rows}`}
      style={{ imageRendering: "pixelated" }}
      className={className}
    >
      {data.map((row, y) =>
        row.split("").map((ch, x) => {
          const fill = palette[ch];
          if (!fill || fill === "transparent") return null;
          return <rect key={`${y}-${x}`} x={x} y={y} width={1} height={1} fill={fill} />;
        })
      )}
    </svg>
  );
}
