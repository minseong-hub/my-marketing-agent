"use client";
import Link from "next/link";
import { PixelAvatar } from "@/components/primitives/PixelAvatar";
import { PixelButton } from "@/components/primitives/PixelButton";
import { Starfield } from "@/components/primitives/Starfield";

// Lost astronaut pixel art
const LOST_DATA = [
  "....kkkkkkkk....",
  "...kWWWWWWWWk...",
  "..kWggggggggWk..",
  "..kWgGGvvgggWk..",
  ".kWggGvvggggWWk.",
  ".kWggggggggggWk.",
  ".kWggggggggggWk.",
  "..kWgggggggWWk..",
  "...kkWWWWWWkk...",
  "..kwwwwwwwwwwk..",
  ".kwwSSSSSSSwwwk.",
  "kbwSSSSSSSSSwwbk",
  "kbwSSkSSkSSwwwbk",
  "kbwwSSkSSkwwwwbk",
  "kbwwwSSSSSwwwwbk",
  "kbwwwwwwwwwwwwbk",
  "kbwwwwccwwwwwwbk",
  ".kwwwwccwwwwwwk.",
  "..kwwwwwwwwwwk..",
  "..kkwwwwwwwwkk..",
  "...kkw....wkk...",
  "...kkk....kkk...",
];

const LOST_PAL = {
  ".": "transparent", "k": "#0a0e27",
  "w": "#e6ecf5", "W": "#ffffff", "S": "#4a5a8a",
  "g": "#0e1430", "G": "#3a4870", "v": "#5a6a90",
  "b": "#3a4870", "c": "#2a86a8",
};

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#060920", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: 32 }}>
      <Starfield density={0.8} />

      <div className="relative z-10 text-center flex flex-col items-center gap-6">
        {/* Broken gauges */}
        <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#7e94c8", fontWeight: 500 }}>
          좌표 미상 · 우주 미아
        </p>

        <h1
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "clamp(44px, 8vw, 72px)",
            color: "#ff4ec9",
            textShadow: "6px 6px 0 #8a2877, 10px 10px 0 #060920",
          }}
        >
          404
        </h1>

        {/* Lost astronaut */}
        <div style={{ filter: "drop-shadow(0 0 20px #5ce5ff66)" }}>
          <PixelAvatar data={LOST_DATA} palette={LOST_PAL} scale={6} />
        </div>

        <div style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 16, color: "#cfe9ff", lineHeight: 1.8 }}>
          <p>이 좌표에는 아무것도 없습니다.</p>
          <p style={{ fontSize: 13, color: "#7e94c8", marginTop: 4 }}>요청한 페이지를 찾을 수 없어요.</p>
        </div>

        <div className="flex gap-3">
          <Link href="/" style={{ textDecoration: "none" }}>
            <PixelButton variant="primary" size="md">▶ 첫 화면으로</PixelButton>
          </Link>
          <Link href="/crew" style={{ textDecoration: "none" }}>
            <PixelButton variant="secondary" size="md">크루 둘러보기</PixelButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
