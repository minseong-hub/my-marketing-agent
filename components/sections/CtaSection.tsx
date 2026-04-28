"use client";
import { PixelButton } from "@/components/primitives/PixelButton";
import Link from "next/link";

export function CtaSection() {
  return (
    <section
      style={{
        padding: "80px 32px",
        background: "#060920",
        borderTop: "2px solid #1f2a6b",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 9,
          color: "#ff4ec9",
          letterSpacing: "0.12em",
          marginBottom: 16,
        }}
      >
        ▸ READY_FOR_LAUNCH
      </p>
      <h2
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "clamp(14px, 2.5vw, 22px)",
          color: "#cfe9ff",
          textShadow: "4px 4px 0 #ff4ec9, 8px 8px 0 #060920",
          lineHeight: 1.8,
          marginBottom: 24,
        }}
      >
        크루를 만나보세요.{"\n"}
        <span style={{ color: "#5ce5ff" }}>14일은 공짜.</span>
      </h2>
      <p
        style={{
          fontFamily: '"IBM Plex Sans KR", sans-serif',
          fontSize: 14,
          color: "#7e94c8",
          marginBottom: 32,
        }}
      >
        신용카드 없이 시작. 언제든 취소.
      </p>

      <div className="flex gap-4 justify-center flex-wrap">
        <Link href="/signup" style={{ textDecoration: "none" }}>
          <PixelButton variant="primary" size="lg">▶ 무료로 시작</PixelButton>
        </Link>
        <Link href="/pricing" style={{ textDecoration: "none" }}>
          <PixelButton variant="secondary" size="lg">상담 예약</PixelButton>
        </Link>
      </div>
    </section>
  );
}
