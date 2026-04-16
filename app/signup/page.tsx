"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SSymbol({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="s-signup-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#s-signup-grad)" />
      <path
        d="M30 16H20a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h8a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H18"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    brandDisplayName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "회원가입에 실패했습니다.");
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

  const benefits = [
    "브랜드 전용 콘텐츠 관리 공간",
    "5가지 채널 통합 스케줄링",
    "스마트 분석 대시보드",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-500 flex flex-col relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-blue-400/20 blur-3xl animate-orb pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-500/25 blur-3xl animate-orb-delay pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-48 h-48 rounded-full bg-blue-300/15 blur-3xl animate-float-slow pointer-events-none" />

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
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-white mb-2">
              브랜드 스튜디오 만들기
            </h1>
            <p className="text-sm text-blue-100/70">
              무료로 시작하고 브랜드 전용 마케팅 공간을 만드세요.
            </p>
          </div>

          {/* 혜택 배지 */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {benefits.map((b) => (
              <div
                key={b}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                {b}
              </div>
            ))}
          </div>

          {/* 글래스 카드 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 이름 */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-white/80">
                  이름
                </Label>
                <Input
                  id="name"
                  placeholder="홍길동"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-500 focus:ring-blue-500/40"
                />
              </div>

              {/* 이메일 */}
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

              {/* 비밀번호 */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-white/80">
                  비밀번호
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="6자 이상 입력"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
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

              {/* 구분선 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-transparent text-xs text-white/40 font-medium">
                    브랜드 정보
                  </span>
                </div>
              </div>

              {/* 상호명 */}
              <div className="space-y-1.5">
                <Label htmlFor="businessName" className="text-sm font-medium text-white/80">
                  상호명
                  <span className="text-xs text-white/40 ml-1.5 font-normal">
                    (사업자 등록 상호)
                  </span>
                </Label>
                <Input
                  id="businessName"
                  placeholder="예: 홍길동 쇼핑"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  required
                  className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-500 focus:ring-blue-500/40"
                />
              </div>

              {/* 브랜드 표시명 */}
              <div className="space-y-1.5">
                <Label htmlFor="brandDisplayName" className="text-sm font-medium text-white/80">
                  브랜드 표시명
                  <span className="text-xs text-white/40 ml-1.5 font-normal">
                    (앱 전역에 표시)
                  </span>
                </Label>
                <Input
                  id="brandDisplayName"
                  placeholder="예: 홍길동샵"
                  value={form.brandDisplayName}
                  onChange={(e) =>
                    setForm({ ...form, brandDisplayName: e.target.value })
                  }
                  required
                  className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-500 focus:ring-blue-500/40"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/20 border border-red-400/30 px-4 py-2.5">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-xl transition-colors disabled:opacity-60 text-sm mt-1"
              >
                {loading ? "가입 중..." : "무료로 시작하기"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-white/50 mt-5">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-200 hover:text-white transition-colors"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
