"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M9 0C4.029 0 0 3.168 0 7.08c0 2.502 1.665 4.71 4.185 5.958L3.15 17.1c-.09.36.315.645.63.42L8.91 13.95c.03 0 .06.005.09.008.03.003.06.005.09.005C13.97 13.963 18 10.796 18 7.08 18 3.168 13.971 0 9 0Z" fill="#3A1D1D" />
    </svg>
  );
}

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

          {/* 소셜 로그인 */}
          <div className="space-y-2.5 mb-5">
            <a
              href="/api/auth/google"
              className="flex items-center justify-center gap-3 w-full h-11 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors text-sm shadow-sm"
            >
              <GoogleIcon />
              Google로 로그인
            </a>
            <a
              href="/api/auth/kakao"
              className="flex items-center justify-center gap-3 w-full h-11 font-semibold rounded-xl transition-colors text-sm shadow-sm"
              style={{ backgroundColor: "#FEE500", color: "#3A1D1D" }}
            >
              <KakaoIcon />
              카카오로 로그인
            </a>
          </div>

          {/* 구분선 */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20" /></div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-transparent text-xs text-white/40 font-medium">또는 이메일로 로그인</span>
            </div>
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
