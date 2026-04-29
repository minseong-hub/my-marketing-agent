"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러를 콘솔에 기록 (운영 환경에선 Sentry 등으로 전송)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060920",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div className="pixel-frame" style={{
        background: "#0a0e27",
        border: "2px solid #ff4ec9",
        boxShadow: "8px 8px 0 #8a2877",
        padding: "32px 28px",
        maxWidth: 520,
        width: "100%",
      }}>
        <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 11, color: "#ff4ec9", letterSpacing: "0.08em", marginBottom: 14 }}>
          ⚠ 통신 장애 — 시스템 점검 필요
        </p>
        <h1 style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 22, fontWeight: 800, color: "#cfe9ff", lineHeight: 1.4, marginBottom: 12 }}>
          예상치 못한 오류가 발생했습니다
        </h1>
        <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 15, color: "#cfe9ff", lineHeight: 1.7, marginBottom: 16 }}>
          잠시 후 다시 시도하시거나, 첫 화면으로 돌아가 주세요. 같은 오류가 반복되면 관제 센터에 알려 주세요.
        </p>
        {error.digest && (
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: "#7e94c8", marginBottom: 18, padding: "6px 10px", background: "#060920", border: "1px solid #1f2a6b" }}>
            오류 추적 ID: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={reset}
            className="pixel-frame"
            style={{
              background: "#ff4ec9", color: "#060920",
              border: "2px solid #ff4ec9", boxShadow: "3px 3px 0 #8a2877",
              padding: "9px 18px",
              fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ↻ 다시 시도
          </button>
          <Link
            href="/"
            style={{
              background: "transparent", color: "#7e94c8",
              border: "1px solid #1f2a6b",
              padding: "9px 16px",
              fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 500,
              cursor: "pointer", textDecoration: "none",
            }}
          >
            첫 화면으로
          </Link>
        </div>
      </div>
    </div>
  );
}
