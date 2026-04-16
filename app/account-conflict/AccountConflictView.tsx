"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PROVIDER_LABEL: Record<string, string> = { google: "Google", kakao: "카카오" };
const PROVIDER_COLOR: Record<string, string> = {
  google: "text-red-400",
  kakao: "text-yellow-400",
};

export default function AccountConflictView({
  provider, email,
}: { provider: "google" | "kakao"; email: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"info" | "link">("info");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/social/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "연결에 실패했습니다.");
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
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-500/25 blur-3xl pointer-events-none" />

      <header className="relative z-10 px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="uf-ac-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="12" fill="url(#uf-ac-g)" />
            <text x="24" y="31" textAnchor="middle" fill="white" fontFamily="-apple-system,sans-serif" fontSize="16" fontWeight="800">UpF</text>
          </svg>
          <div>
            <span className="text-sm font-bold text-white block leading-none">업플로</span>
            <span className="text-[10px] text-white/50">UpFlow</span>
          </div>
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* 경고 */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/30 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-300" />
            </div>
            <h1 className="text-xl font-extrabold text-white mb-2">이미 가입된 이메일입니다</h1>
            <p className="text-sm text-blue-100/70">
              <span className="font-medium text-white">{email}</span>은<br />
              이미 이메일로 가입된 계정입니다.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 space-y-4">
            {/* 탭 */}
            <div className="flex rounded-xl overflow-hidden border border-white/20">
              <button
                onClick={() => setTab("info")}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${tab === "info" ? "bg-white text-blue-700" : "text-white/60 hover:text-white"}`}
              >
                이메일로 로그인
              </button>
              <button
                onClick={() => setTab("link")}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${tab === "link" ? "bg-white text-blue-700" : "text-white/60 hover:text-white"}`}
              >
                계정 연결
              </button>
            </div>

            {tab === "info" && (
              <div className="space-y-3">
                <p className="text-sm text-white/70 leading-relaxed">
                  기존 이메일 계정으로 로그인한 후,
                  설정에서 <span className={`font-semibold ${PROVIDER_COLOR[provider]}`}>{PROVIDER_LABEL[provider]}</span> 계정을 연결할 수 있습니다.
                </p>
                <Link
                  href={`/login?email=${encodeURIComponent(email)}`}
                  className="block w-full h-11 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-xl transition-colors text-sm text-center leading-[44px]"
                >
                  이메일로 로그인하기
                </Link>
              </div>
            )}

            {tab === "link" && (
              <form onSubmit={handleLink} className="space-y-4">
                <p className="text-sm text-white/70 leading-relaxed">
                  기존 계정의 비밀번호를 입력하면
                  <span className={`font-semibold ${PROVIDER_COLOR[provider]}`}> {PROVIDER_LABEL[provider]}</span> 계정이 자동으로 연결됩니다.
                </p>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-white/80">비밀번호</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="기존 계정 비밀번호"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-10 focus:border-blue-500 focus:ring-blue-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  disabled={loading || !password}
                  className="w-full h-11 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? "연결 중..." : "비밀번호 확인 및 연결"}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-white/50 mt-5">
            <Link href="/login" className="font-semibold text-blue-200 hover:text-white transition-colors">
              돌아가기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
