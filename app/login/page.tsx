"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SSymbol({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="uf-login-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#uf-login-g)" />
      <rect width="48" height="48" rx="12" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <text
        x="24" y="31"
        textAnchor="middle"
        fill="white"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="16"
        fontWeight="800"
        letterSpacing="-0.5"
      >UpF</text>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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

      if (!res.ok) {
        setError(data.error || "로그인에 실패했습니다.");
        return;
      }

      router.push("/app/select-tool");
      router.refresh();
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-500 flex flex-col relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-blue-400/20 blur-3xl animate-orb pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-500/25 blur-3xl animate-orb-delay pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-blue-400/15 blur-3xl animate-float pointer-events-none" />

      {/* 헤더 */}
      <header className="relative z-10 px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <SSymbol size={32} />
          <div>
            <span className="text-sm font-bold text-white block leading-none">업플로</span>
            <span className="text-[10px] text-white/50">UpFlow</span>
          </div>
        </Link>
      </header>

      {/* 폼 영역 */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-white mb-2">
              다시 돌아오셨군요!
            </h1>
            <p className="text-sm text-blue-100/70">
              계정에 로그인하여 대시보드로 이동하세요.
            </p>
          </div>

          {/* 글래스 카드 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-white/80">
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-500 focus:ring-blue-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-white/80">
                  비밀번호
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호 입력"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-10 focus:border-blue-500 focus:ring-blue-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/20 border border-red-400/30 px-4 py-2.5">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-xl transition-colors disabled:opacity-60 text-sm mt-2"
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-white/50 mt-5">
            계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-200 hover:text-white transition-colors"
            >
              무료로 시작하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
