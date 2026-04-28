"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Starfield } from "@/components/primitives/Starfield";
import { PixelButton } from "@/components/primitives/PixelButton";
import { Typewriter } from "@/components/primitives/Typewriter";

const BOOT_LINES = [
  { prompt: "› ", text: "CREWMATE AI — AIRLOCK SYSTEM v2.6", color: "#7e94c8", speed: 20 },
  { prompt: "› ", text: "신원 확인 중...", color: "#5ce5ff", speed: 28, pause: 400 },
  { prompt: "» ", text: "ACCESS GRANTED — 입항하세요.", color: "#66ff9d", speed: 22 },
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "통신 장애 — 재교신 시도 중"); return; }
      router.push("/app/assistants");
      router.refresh();
    } catch {
      setError("통신 장애 — 재교신 시도 중");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#060920", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{ padding: "12px 20px", borderBottom: "1px solid #1f2a6b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "#ff4ec9", textShadow: "2px 2px 0 #8a2877" }}>
            CREWMATE AI
          </span>
        </Link>
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#4a5a8a", letterSpacing: "0.1em" }}>
          SECTOR-7G · AIRLOCK
        </span>
      </nav>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px", position: "relative" }}>
        <Starfield density={0.6} />

        <div className="relative z-10 w-full" style={{ maxWidth: 400 }}>
          {/* Boot sequence */}
          <div
            className="pixel-frame"
            style={{ border: "1px solid #1f2a6b", background: "#060920", padding: 12, marginBottom: 16 }}
          >
            <Typewriter lines={BOOT_LINES} loop={false} />
          </div>

          {/* Login form */}
          <div
            className="pixel-frame"
            style={{ border: "2px solid #5ce5ff", background: "#0a0e27", overflow: "hidden" }}
          >
            {/* Title bar */}
            <div style={{ padding: "8px 16px", borderBottom: "1px solid #5ce5ff33", background: "#060920", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#5ce5ff", letterSpacing: "0.1em" }}>
                ● AIRLOCK — 입항
              </span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#66ff9d", animation: "blink 1s steps(2) infinite" }}>
                ● SECURE
              </span>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#7e94c8", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>
                  이메일
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    background: "#0f1640",
                    border: "1px solid #1f2a6b",
                    padding: "10px 12px",
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11,
                    color: "#cfe9ff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => { e.target.style.border = "1px solid #5ce5ff"; }}
                  onBlur={e => { e.target.style.border = "1px solid #1f2a6b"; }}
                />
              </div>

              <div>
                <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#7e94c8", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>
                  비밀번호
                </label>
                <input
                  type="password"
                  placeholder="비밀번호 입력"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    background: "#0f1640",
                    border: "1px solid #1f2a6b",
                    padding: "10px 12px",
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11,
                    color: "#cfe9ff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => { e.target.style.border = "1px solid #5ce5ff"; }}
                  onBlur={e => { e.target.style.border = "1px solid #1f2a6b"; }}
                />
              </div>

              {error && (
                <div style={{ border: "1px solid #ff4ec944", background: "#ff4ec911", padding: "8px 12px" }}>
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#ff4ec9" }}>
                    ✗ {error}
                  </p>
                </div>
              )}

              <PixelButton type="submit" variant="primary" size="md" full disabled={loading}>
                {loading ? "교신 중..." : "▶ 입항"}
              </PixelButton>

              {/* Social logins */}
              <div style={{ borderTop: "1px solid #1f2a6b", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#4a5a8a", textAlign: "center" }}>
                  또는 소셜 입항
                </p>
                <a
                  href="/api/auth/google"
                  className="pixel-frame flex items-center justify-center gap-2"
                  style={{ padding: "9px 12px", border: "1px solid #1f2a6b", background: "#0f1640", textDecoration: "none", fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#cfe9ff", letterSpacing: "0.05em", textAlign: "center" }}
                >
                  Google로 입항
                </a>
                <a
                  href="/api/auth/kakao"
                  className="pixel-frame flex items-center justify-center gap-2"
                  style={{ padding: "9px 12px", background: "#FEE500", border: "1px solid #FEE500", textDecoration: "none", fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#3A1D1D", letterSpacing: "0.05em", textAlign: "center" }}
                >
                  카카오로 입항
                </a>
              </div>
            </form>
          </div>

          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#4a5a8a", textAlign: "center", marginTop: 16 }}>
            계정 없음?{" "}
            <Link href="/signup" style={{ color: "#5ce5ff", textDecoration: "none" }}>탑승하기 →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
