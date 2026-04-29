"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Starfield } from "@/components/primitives/Starfield";
import { PixelButton } from "@/components/primitives/PixelButton";
import { Typewriter } from "@/components/primitives/Typewriter";

const BOOT_LINES = [
  { prompt: "› ", text: "Crewmate AI 로그인 시스템", color: "#cfe9ff", speed: 20 },
  { prompt: "› ", text: "신원 확인 중...", color: "#5ce5ff", speed: 28, pause: 400 },
  { prompt: "» ", text: "확인 완료 — 로그인해 주세요.", color: "#66ff9d", speed: 22 },
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
      if (!res.ok) { setError(data.error || "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."); return; }
      router.push("/desk/marky");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#060920", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{ padding: "12px 20px", borderBottom: "1px solid #1f2a6b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 14, color: "#ff4ec9", textShadow: "2px 2px 0 #8a2877" }}>
            CREWMATE AI
          </span>
        </Link>
        <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#7e94c8" }}>
          로그인 화면
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
              <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 15, fontWeight: 600, color: "#5ce5ff" }}>
                ● 로그인
              </span>
              <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#66ff9d", animation: "blink 1s steps(2) infinite", fontWeight: 500 }}>
                ● 보안 연결
              </span>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: "#7e94c8", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>
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
                    fontSize: 15,
                    color: "#cfe9ff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => { e.target.style.border = "1px solid #5ce5ff"; }}
                  onBlur={e => { e.target.style.border = "1px solid #1f2a6b"; }}
                />
              </div>

              <div>
                <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: "#7e94c8", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>
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
                    fontSize: 15,
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
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: "#ff4ec9" }}>
                    ✗ {error}
                  </p>
                </div>
              )}

              <PixelButton type="submit" variant="primary" size="md" full disabled={loading}>
                {loading ? "확인 중..." : "▶ 로그인"}
              </PixelButton>

              {/* Social logins */}
              <div style={{ borderTop: "1px solid #1f2a6b", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#7e94c8", textAlign: "center" }}>
                  또는 소셜 계정으로
                </p>
                <a
                  href="/api/auth/google"
                  className="pixel-frame flex items-center justify-center gap-2"
                  style={{ padding: "10px 12px", border: "1px solid #1f2a6b", background: "#0f1640", textDecoration: "none", fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 500, color: "#cfe9ff", textAlign: "center" }}
                >
                  Google로 로그인
                </a>
                <a
                  href="/api/auth/kakao"
                  className="pixel-frame flex items-center justify-center gap-2"
                  style={{ padding: "10px 12px", background: "#FEE500", border: "1px solid #FEE500", textDecoration: "none", fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#3A1D1D", textAlign: "center" }}
                >
                  카카오로 로그인
                </a>
              </div>
            </form>
          </div>

          <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#cfe9ff", textAlign: "center", marginTop: 16 }}>
            아직 계정이 없으신가요?{" "}
            <Link href="/signup" style={{ color: "#5ce5ff", textDecoration: "none", fontWeight: 600 }}>회원가입 →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
