"use client";
import { PixelButton } from "@/components/primitives/PixelButton";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";

export function CtaSection() {
  const { loggedIn } = useAuth();
  const primaryHref = loggedIn ? "/desk/marky" : "/signup";
  const primaryLabel = loggedIn ? "▶ 데스크 진입" : "▶ 무료로 시작";
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
          fontSize: 13,
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
          fontSize: "clamp(18px, 2.5vw, 22px)",
          color: "#cfe9ff",
          textShadow: "4px 4px 0 #ff4ec9, 8px 8px 0 #060920",
          lineHeight: 1.8,
          marginBottom: 24,
        }}
      >
        크루를 만나보세요.{"\n"}
        <span style={{ color: "#5ce5ff" }}>무료로 시작.</span>
      </h2>
      <p
        style={{
          fontFamily: '"IBM Plex Sans KR", sans-serif',
          fontSize: 18,
          color: "#7e94c8",
          marginBottom: 32,
        }}
      >
        신용카드 없이 가입. 호출 횟수가 늘면 단계별 업그레이드.
      </p>

      <div className="flex gap-4 justify-center flex-wrap">
        <Link href={primaryHref} style={{ textDecoration: "none" }}>
          <PixelButton variant="primary" size="lg">{primaryLabel}</PixelButton>
        </Link>
        <Link href="/pricing" style={{ textDecoration: "none" }}>
          <PixelButton variant="secondary" size="lg">플랜 비교</PixelButton>
        </Link>
      </div>
    </section>
  );
}
