"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INDUSTRY_OPTIONS = [
  "식품 / 농산물", "의류 / 패션", "뷰티 / 화장품", "전자제품 / 디지털",
  "생활용품 / 인테리어", "스포츠 / 레저", "유아 / 완구", "반려동물", "기타",
];
const BUSINESS_TYPE_OPTIONS = [
  "개인 사업자", "법인 사업자", "개인 (사업자 미등록)", "프리랜서",
];
const SALES_CHANNEL_OPTIONS = [
  "스마트스토어", "쿠팡", "11번가", "G마켓 / 옥션", "카카오쇼핑", "자사몰", "인스타그램 쇼핑", "기타",
];

const PROVIDER_LABEL: Record<string, string> = { google: "Google", kakao: "카카오" };

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function ConsentRow({
  checked, onChange, children,
}: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group">
      <div className="relative mt-0.5 flex-shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? "bg-blue-500 border-blue-400" : "bg-white/10 border-white/30 group-hover:border-white/50"}`}>
          {checked && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-xs text-white/60 leading-relaxed">{children}</span>
    </label>
  );
}

export default function SocialCompleteForm({
  provider, email, name: initialName,
}: { provider: "google" | "kakao"; email: string; name: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    phone: "",
    businessName: "",
    brandDisplayName: "",
    businessType: "",
    industry: "",
    productCategories: "",
  });
  const [salesChannels, setSalesChannels] = useState<string[]>([]);
  const [consent, setConsent] = useState({ terms: false, privacy: false, marketing: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleChannel(ch: string) {
    setSalesChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!consent.terms || !consent.privacy) {
      setError("이용약관 및 개인정보처리방침 동의는 필수입니다.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/social/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salesChannels,
          productCategories: form.productCategories ? [form.productCategories] : [],
          termsAgreed: consent.terms,
          privacyAgreed: consent.privacy,
          marketingConsent: consent.marketing,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "가입에 실패했습니다.");
        return;
      }
      router.push("/app/assistants");
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
              <linearGradient id="uf-sc-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="12" fill="url(#uf-sc-g)" />
            <text x="24" y="31" textAnchor="middle" fill="white" fontFamily="-apple-system,sans-serif" fontSize="16" fontWeight="800">UpF</text>
          </svg>
          <div>
            <span className="text-sm font-bold text-white block leading-none">업플로</span>
            <span className="text-[10px] text-white/50">UpFlow</span>
          </div>
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              {PROVIDER_LABEL[provider]} 연동 완료
            </div>
            <h1 className="text-xl font-extrabold text-white mb-1">프로필을 완성해주세요</h1>
            <p className="text-sm text-blue-100/70">{email}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 휴대폰번호 */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-white/80">휴대폰번호</Label>
                <Input
                  placeholder="010-0000-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                  required
                  className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-500 focus:ring-blue-500/40"
                />
              </div>

              {/* 구분선 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-transparent text-xs text-white/40 font-medium">브랜드 정보</span>
                </div>
              </div>

              {/* 상호명 */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-white/80">
                  상호명 <span className="text-xs text-white/40 font-normal ml-1">(사업자 등록 상호)</span>
                </Label>
                <Input
                  placeholder="예: 홍길동 쇼핑"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  required
                  className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-500 focus:ring-blue-500/40"
                />
              </div>

              {/* 브랜드 표시명 */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-white/80">
                  브랜드 표시명 <span className="text-xs text-white/40 font-normal ml-1">(앱 전역에 표시)</span>
                </Label>
                <Input
                  placeholder="예: 홍길동샵"
                  value={form.brandDisplayName}
                  onChange={(e) => setForm({ ...form, brandDisplayName: e.target.value })}
                  required
                  className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-500 focus:ring-blue-500/40"
                />
              </div>

              {/* 비즈니스 유형 */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-white/80">비즈니스 유형</Label>
                <select
                  value={form.businessType}
                  onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                  required
                  className="w-full h-10 rounded-xl px-3 text-sm bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 [&>option]:bg-blue-900 [&>option]:text-white"
                >
                  <option value="" disabled>비즈니스 유형을 선택하세요</option>
                  {BUSINESS_TYPE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              {/* 업종 */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-white/80">업종</Label>
                <select
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  required
                  className="w-full h-10 rounded-xl px-3 text-sm bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 [&>option]:bg-blue-900 [&>option]:text-white"
                >
                  <option value="" disabled>업종을 선택하세요</option>
                  {INDUSTRY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              {/* 주요 판매 채널 (선택) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white/80">
                  주요 판매 채널 <span className="text-xs text-white/40 font-normal ml-1">(선택, 복수 선택 가능)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {SALES_CHANNEL_OPTIONS.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChannel(ch)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        salesChannels.includes(ch)
                          ? "bg-blue-500 border-blue-400 text-white"
                          : "bg-white/10 border-white/20 text-white/60 hover:border-white/40"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* 대표 상품군 (선택) */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-white/80">
                  대표 상품군 <span className="text-xs text-white/40 font-normal ml-1">(선택)</span>
                </Label>
                <Input
                  placeholder="예: 유기농 식품, 핸드메이드 액세서리"
                  value={form.productCategories}
                  onChange={(e) => setForm({ ...form, productCategories: e.target.value })}
                  className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-500 focus:ring-blue-500/40"
                />
              </div>

              {/* 약관 동의 */}
              <div className="pt-1 space-y-2.5">
                <ConsentRow checked={consent.terms} onChange={(v) => setConsent((c) => ({ ...c, terms: v }))}>
                  <Link href="/terms" target="_blank" className="text-blue-200 underline hover:text-white">이용약관</Link>에 동의합니다.{" "}
                  <span className="text-white/40">(필수)</span>
                </ConsentRow>
                <ConsentRow checked={consent.privacy} onChange={(v) => setConsent((c) => ({ ...c, privacy: v }))}>
                  <Link href="/privacy" target="_blank" className="text-blue-200 underline hover:text-white">개인정보처리방침</Link>에 동의합니다.{" "}
                  <span className="text-white/40">(필수)</span>
                </ConsentRow>
                <ConsentRow checked={consent.marketing} onChange={(v) => setConsent((c) => ({ ...c, marketing: v }))}>
                  마케팅 정보 수신에 동의합니다. <span className="text-white/40">(선택)</span>
                </ConsentRow>
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/20 border border-red-400/30 px-4 py-2.5">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !consent.terms || !consent.privacy}
                className="w-full h-11 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-1"
              >
                {loading ? "완성 중..." : "프로필 완성 및 시작하기"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
