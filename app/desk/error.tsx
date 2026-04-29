"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DeskError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DeskError]", error);
  }, [error]);

  return (
    <div style={{ minHeight: "100vh", background: "#060920", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="pixel-frame" style={{ background: "#0a0e27", border: "2px solid #ff4ec9", padding: "28px 24px", maxWidth: 480, width: "100%" }}>
        <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "#ff4ec9", letterSpacing: "0.08em", marginBottom: 12 }}>
          ⚠ 데스크 시스템 오류
        </p>
        <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 15, color: "#cfe9ff", lineHeight: 1.7, marginBottom: 14 }}>
          이 비서 데스크를 불러오는 중 문제가 발생했어요. 다시 시도하거나 다른 비서로 이동해 주세요.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={reset} className="pixel-frame" style={{ background: "#5ce5ff", color: "#060920", border: "2px solid #5ce5ff", padding: "8px 16px", fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, fontWeight: 700, cursor: "pointer" }}>↻ 다시 시도</button>
          <Link href="/desk/marky" style={{ background: "transparent", color: "#7e94c8", border: "1px solid #1f2a6b", padding: "8px 14px", fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, cursor: "pointer", textDecoration: "none" }}>마키 데스크로</Link>
        </div>
      </div>
    </div>
  );
}
