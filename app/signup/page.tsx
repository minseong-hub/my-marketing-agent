"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Starfield } from "@/components/primitives/Starfield";
import { PixelButton } from "@/components/primitives/PixelButton";

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

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0f1640",
  border: "1px solid #1f2a6b",
  padding: "10px 12px",
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 11,
  color: "#cfe9ff",
  outline: "none",
  boxSizing: "border-box",
};

function CField({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#7e94c8", letterSpacing: "0.08em" }}>
        {label}{required && <span style={{ color: "#ff4ec9", marginLeft: 4 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function PixelCheckbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 14, height: 14, border: `2px solid ${checked ? "#ff4ec9" : "#1f2a6b"}`,
          background: checked ? "#ff4ec9" : "transparent", flexShrink: 0, marginTop: 1,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}
      >
        {checked && <span style={{ color: "#060920", fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 11, color: "#7e94c8", lineHeight: 1.6 }}>
        {children}
      </span>
    </label>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    phone: "", businessName: "", brandDisplayName: "",
    businessType: "", industry: "", productCategories: "",
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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, password: form.password,
          phone: form.phone, businessName: form.businessName,
          brandDisplayName: form.brandDisplayName, businessType: form.businessType,
          industry: form.industry, salesChannels,
          productCategories: form.productCategories ? [form.productCategories] : [],
          termsAgreed: consent.terms, privacyAgreed: consent.privacy,
          marketingConsent: consent.marketing,
        }),
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

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.border = "1px solid #5ce5ff";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.border = "1px solid #1f2a6b";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060920", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{ padding: "12px 20px", borderBottom: "1px solid #1f2a6b", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
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
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px 40px", position: "relative" }}>
        <Starfield density={0.5} />

        <div className="relative z-10 w-full" style={{ maxWidth: 440 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#5ce5ff", letterSpacing: "0.1em", marginBottom: 8 }}>
              ▸ AIRLOCK — 신규 탑승 등록
            </p>
            <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: "clamp(12px, 2vw, 16px)", color: "#cfe9ff", textShadow: "3px 3px 0 #ff4ec9", lineHeight: 1.8 }}>
              크루와 함께<br />탑승하세요
            </h1>
          </div>

          {/* Social login */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            <a
              href="/api/auth/google"
              className="pixel-frame"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 12px", border: "1px solid #1f2a6b", background: "#0f1640", textDecoration: "none", fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: "#cfe9ff", letterSpacing: "0.05em" }}
            >
              Google로 탑승
            </a>
            <a
              href="/api/auth/kakao"
              className="pixel-frame"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 12px", background: "#FEE500", border: "1px solid #FEE500", textDecoration: "none", fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: "#3A1D1D", letterSpacing: "0.05em" }}
            >
              카카오로 탑승
            </a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "#1f2a6b" }} />
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#4a5a8a" }}>또는 이메일로</span>
            <div style={{ flex: 1, height: 1, background: "#1f2a6b" }} />
          </div>

          {/* Main form */}
          <div className="pixel-frame" style={{ border: "2px solid #5ce5ff", background: "#0a0e27", overflow: "hidden" }}>
            {/* Title bar */}
            <div style={{ padding: "8px 16px", borderBottom: "1px solid #5ce5ff33", background: "#060920", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#5ce5ff", letterSpacing: "0.1em" }}>
                ● 신규 승무원 등록
              </span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#66ff9d", animation: "blink 1s steps(2) infinite" }}>
                ● SECURE
              </span>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
              {/* 기본 정보 */}
              <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#4a5a8a", letterSpacing: "0.1em" }}>
                ▸ 기본 정보
              </p>

              <CField label="이름" required>
                <input style={inputStyle} placeholder="홍길동" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onFocus={onFocus} onBlur={onBlur} required />
              </CField>

              <CField label="이메일" required>
                <input style={inputStyle} type="email" placeholder="name@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={onFocus} onBlur={onBlur} required />
              </CField>

              <CField label="비밀번호 (6자 이상)" required>
                <input style={inputStyle} type="password" placeholder="비밀번호 입력" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={onFocus} onBlur={onBlur} required minLength={6} />
              </CField>

              <CField label="휴대폰번호" required>
                <input style={inputStyle} placeholder="010-0000-0000" value={form.phone}
                  onChange={e => setForm({ ...form, phone: formatPhone(e.target.value) })}
                  onFocus={onFocus} onBlur={onBlur} required />
              </CField>

              {/* 브랜드 정보 */}
              <div style={{ borderTop: "1px solid #1f2a6b", paddingTop: 12 }}>
                <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#4a5a8a", letterSpacing: "0.1em", marginBottom: 12 }}>
                  ▸ 브랜드 정보
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <CField label="상호명 (사업자등록 상호)" required>
                    <input style={inputStyle} placeholder="예: 홍길동 쇼핑" value={form.businessName}
                      onChange={e => setForm({ ...form, businessName: e.target.value })}
                      onFocus={onFocus} onBlur={onBlur} required />
                  </CField>

                  <CField label="브랜드 표시명 (앱 전역 표시)" required>
                    <input style={inputStyle} placeholder="예: 홍길동샵" value={form.brandDisplayName}
                      onChange={e => setForm({ ...form, brandDisplayName: e.target.value })}
                      onFocus={onFocus} onBlur={onBlur} required />
                  </CField>

                  <CField label="비즈니스 유형" required>
                    <select
                      style={{ ...inputStyle, background: "#0f1640" } as React.CSSProperties}
                      value={form.businessType}
                      onChange={e => setForm({ ...form, businessType: e.target.value })}
                      onFocus={onFocus} onBlur={onBlur} required
                    >
                      <option value="" disabled>선택하세요</option>
                      {BUSINESS_TYPE_OPTIONS.map(opt => <option key={opt} value={opt} style={{ background: "#0f1640" }}>{opt}</option>)}
                    </select>
                  </CField>

                  <CField label="업종" required>
                    <select
                      style={{ ...inputStyle, background: "#0f1640" } as React.CSSProperties}
                      value={form.industry}
                      onChange={e => setForm({ ...form, industry: e.target.value })}
                      onFocus={onFocus} onBlur={onBlur} required
                    >
                      <option value="" disabled>선택하세요</option>
                      {INDUSTRY_OPTIONS.map(opt => <option key={opt} value={opt} style={{ background: "#0f1640" }}>{opt}</option>)}
                    </select>
                  </CField>

                  <CField label="주요 판매 채널 (선택)">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {SALES_CHANNEL_OPTIONS.map(ch => (
                        <button
                          key={ch} type="button" onClick={() => toggleChannel(ch)}
                          style={{
                            fontFamily: '"JetBrains Mono", monospace', fontSize: 8,
                            padding: "4px 10px", cursor: "pointer",
                            border: `1px solid ${salesChannels.includes(ch) ? "#5ce5ff" : "#1f2a6b"}`,
                            background: salesChannels.includes(ch) ? "#5ce5ff22" : "transparent",
                            color: salesChannels.includes(ch) ? "#5ce5ff" : "#7e94c8",
                          }}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </CField>

                  <CField label="대표 상품군 (선택)">
                    <input style={inputStyle} placeholder="예: 유기농 식품, 핸드메이드 액세서리" value={form.productCategories}
                      onChange={e => setForm({ ...form, productCategories: e.target.value })}
                      onFocus={onFocus} onBlur={onBlur} />
                  </CField>
                </div>
              </div>

              {/* 약관 */}
              <div style={{ borderTop: "1px solid #1f2a6b", paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <PixelCheckbox checked={consent.terms} onChange={v => setConsent(c => ({ ...c, terms: v }))}>
                  <Link href="/terms" target="_blank" style={{ color: "#5ce5ff" }}>이용약관</Link>에 동의합니다. <span style={{ color: "#4a5a8a" }}>(필수)</span>
                </PixelCheckbox>
                <PixelCheckbox checked={consent.privacy} onChange={v => setConsent(c => ({ ...c, privacy: v }))}>
                  <Link href="/privacy" target="_blank" style={{ color: "#5ce5ff" }}>개인정보처리방침</Link>에 동의합니다. <span style={{ color: "#4a5a8a" }}>(필수)</span>
                </PixelCheckbox>
                <PixelCheckbox checked={consent.marketing} onChange={v => setConsent(c => ({ ...c, marketing: v }))}>
                  마케팅 정보 수신에 동의합니다. <span style={{ color: "#4a5a8a" }}>(선택)</span>
                </PixelCheckbox>
              </div>

              {error && (
                <div style={{ border: "1px solid #ff4ec944", background: "#ff4ec911", padding: "8px 12px" }}>
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#ff4ec9" }}>✗ {error}</p>
                </div>
              )}

              <PixelButton type="submit" variant="primary" size="md" full disabled={loading || !consent.terms || !consent.privacy}>
                {loading ? "교신 중..." : "▶ 탑승 등록"}
              </PixelButton>
            </form>
          </div>

          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#4a5a8a", textAlign: "center", marginTop: 16 }}>
            이미 계정 있음?{" "}
            <Link href="/login" style={{ color: "#5ce5ff", textDecoration: "none" }}>입항 →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
