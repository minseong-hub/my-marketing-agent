"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppError]", error);
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
        border: "2px solid #ffd84d",
        padding: "28px 24px",
        maxWidth: 480,
        width: "100%",
      }}>
        <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "#ffd84d", letterSpacing: "0.08em", marginBottom: 12 }}>
          ⚠ 데스크 영역 오류
        </p>
        <h1 style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 18, fontWeight: 700, color: "#cfe9ff", lineHeight: 1.4, marginBottom: 10 }}>
          이 페이지를 불러오는 중 문제가 발생했어요
        </h1>
        <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#cfe9ff", lineHeight: 1.7, marginBottom: 14 }}>
          새로고침하거나 비서 현황판으로 돌아가 주세요.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={reset} className="pixel-frame" style={{ background: "#5ce5ff", color: "#060920", border: "2px solid #5ce5ff", boxShadow: "3px 3px 0 #2a86a8", padding: "8px 16px", fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, fontWeight: 700, cursor: "pointer" }}>↻ 다시 시도</button>
          <Link href="/desk/marky" style={{ background: "transparent", color: "#7e94c8", border: "1px solid #1f2a6b", padding: "8px 14px", fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, cursor: "pointer", textDecoration: "none" }}>데스크로</Link>
        </div>
      </div>
    </div>
  );
}
