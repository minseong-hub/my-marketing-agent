"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Sparkles,
  BarChart3,
  CalendarCheck,
  Layers,
  ArrowRight,
  Zap,
  ShieldCheck,
  Eye,
  EyeOff,
  Instagram,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

// ── UpFlow 로고 심볼
function SSymbol({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="uf-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#uf-grad)" />
      <rect width="48" height="48" rx="12" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
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

// ── UpFlow 로고 심볼 Large (랜딩 그래픽용)
function SSymbolLarge() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="uf-grad-lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="uf-glow">
          <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="120" height="120" rx="30" fill="url(#uf-grad-lg)" opacity="0.9" />
      <rect width="120" height="120" rx="30" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <text
        x="60" y="74"
        textAnchor="middle"
        fill="white"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="40"
        fontWeight="800"
        letterSpacing="-2"
        filter="url(#uf-glow)"
      >UpF</text>
    </svg>
  );
}

// ── 글래스 카드 (어두운 배경)
function GlassCardDark({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl ${className}`}>
      {children}
    </div>
  );
}

// ── "이미 회원" 모달
function AlreadyMemberModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-[#145CFF]" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900 mb-1.5">이미 회원입니다</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          이미 로그인된 상태입니다.<br />대시보드로 이동하세요.
        </p>
        <Link href="/app/select-tool" onClick={onClose}>
          <button className="w-full h-11 bg-[#145CFF] hover:bg-[#0D47D9] text-white font-semibold rounded-xl transition-colors text-sm mb-2.5">
            도구 선택으로 이동
          </button>
        </Link>
        <button
          onClick={onClose}
          className="w-full h-9 text-slate-400 hover:text-slate-600 text-sm transition-colors"
        >
          닫기
        </button>
      </motion.div>
    </div>
  );
}

// ── Floating 글래스 카드들 (그래픽 주변)
function FloatingCards() {
  const cards: {
    title: string;
    desc: string;
    badge: string;
    badgeColor: string;
    brand: React.ReactNode;
    delay: number;
    pos: string;
  }[] = [
    {
      title: "인스타그램",
      desc: "비주얼 중심 + 반응 끌어올리기",
      badge: "예약됨",
      badgeColor: "bg-violet-400/80",
      brand: <Instagram className="w-7 h-7 text-pink-300 shrink-0" strokeWidth={1.9} />,
      delay: 0,
      pos: "-top-14 -right-24",
    },
    {
      title: "블로그",
      desc: "SEO최적화 + 정보형 글쓰기",
      badge: "작성중",
      badgeColor: "bg-amber-400/80",
      brand: (
        <span className="text-green-300 text-[26px] font-extrabold leading-none shrink-0 translate-y-[-0.5px]">N</span>
      ),
      delay: 0.3,
      pos: "-bottom-12 -left-24",
    },
    {
      title: "오픈채팅",
      desc: "회원 공지 + 즉시 전환 유도",
      badge: "업로드완료",
      badgeColor: "bg-emerald-400/80",
      brand: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-yellow-300 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C6.477 3 2 6.58 2 11c0 2.8 1.82 5.26 4.57 6.69L5.5 21.5a.7.7 0 0 0 1 .77l4.53-2.78c.32.03.64.05.97.05 5.523 0 10-3.58 10-8S17.523 3 12 3z" />
        </svg>
      ),
      delay: 0.6,
      pos: "top-1/2 -right-32 -translate-y-1/2",
    },
    {
      title: "스레드",
      desc: "분위기 예열 + 짧은 반응 테스트",
      badge: "기획중",
      badgeColor: "bg-sky-400/80",
      brand: (
        <span className="text-white text-[21px] font-semibold leading-none shrink-0">@</span>
      ),
      delay: 0.9,
      pos: "top-1/2 -left-32 -translate-y-1/2",
    },
  ];

  return (
    <>
      {cards.map((card, i) => (
        <motion.div
          key={i}
          className={`absolute ${card.pos} w-44`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { delay: card.delay + 0.5, duration: 0.5 },
            y: {
              delay: card.delay,
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <GlassCardDark className="p-3.5 min-h-[78px] flex flex-col justify-between">
            <div className="flex items-center gap-2.5 mb-1.5 min-h-[28px] -translate-y-1">
              {card.brand}
              <span className="text-white/90 text-xs font-semibold leading-none">{card.title}</span>
              <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full text-white ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
            <p className="text-white/60 text-[11px] truncate">{card.desc}</p>
          </GlassCardDark>
        </motion.div>
      ))}
    </>
  );
}

// ── 마우스 인터랙션 메인 그래픽
function InteractiveGraphic({
  isLoggedIn,
  onAlreadyMember,
}: {
  isLoggedIn: boolean;
  onAlreadyMember: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(false);
  const [formFocused, setFormFocused] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  const router = useRouter();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      setIsNear(dist < 220);
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Keep popup open while mouse is near OR the form has focus
  useEffect(() => {
    const shouldShow = isNear || formFocused;
    if (shouldShow) {
      const t = setTimeout(() => setLoginVisible(true), 100);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setLoginVisible(false), 200);
      return () => clearTimeout(t);
    }
  }, [isNear, formFocused]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "로그인에 실패했습니다.");
        return;
      }
      router.push("/app/select-tool");
      router.refresh();
    } catch {
      setLoginError("서버 오류가 발생했습니다.");
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-[320px] h-[320px] mx-auto">
      {/* S 심볼 + 플로팅 카드 레이어 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          opacity: (isNear || loginVisible) ? 0 : 1,
          scale: (isNear || loginVisible) ? 0.85 : 1,
          filter: (isNear || loginVisible) ? "blur(6px)" : "blur(0px)",
        }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        {/* 중앙 원형 글로우 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-blue-400/20 blur-3xl" />
        </div>

        {/* S 심볼 */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10"
        >
          <GlassCardDark className="p-8">
            <SSymbolLarge />
            <p className="text-white text-xl text-center mt-3 font-semibold tracking-widest">
              시작하기
            </p>
          </GlassCardDark>
        </motion.div>

        {/* 플로팅 카드들 */}
        <FloatingCards />
      </motion.div>

      {/* 호버 레이어: 로그인 폼 (비로그인) / 이미 회원 안내 (로그인) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, y: 20, scale: 0.85 }}
        animate={{
          opacity: loginVisible ? 1 : 0,
          y: loginVisible ? 0 : 16,
          scale: loginVisible ? 1.2 : 0.85,
        }}
        style={{ pointerEvents: loginVisible ? "auto" : "none" }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {isLoggedIn ? (
          /* 이미 로그인 — 대시보드 안내 카드 */
          <GlassCardDark className="w-full p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </div>
            <p className="text-white font-extrabold text-base mb-1">이미 회원입니다</p>
            <p className="text-white/50 text-xs mb-4">이미 로그인된 상태입니다.</p>
            <Link href="/app/select-tool">
              <button className="w-full h-9 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-colors">
                도구 선택으로 이동 →
              </button>
            </Link>
          </GlassCardDark>
        ) : (
          /* 비로그인 — 기존 로그인 폼 */
          <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <GlassCardDark className="w-full p-6">
            <div className="flex items-center gap-2 mb-5">
              <SSymbol size={32} />
              <div>
                <p className="text-white font-extrabold text-base leading-none">업플로</p>
                <p className="text-white/50 text-[10px] mt-0.5 tracking-widest font-semibold">UpFlow</p>
              </div>
            </div>
            <form
              onSubmit={handleLogin}
              onFocus={() => setFormFocused(true)}
              onBlur={(e) => {
                // Only mark as unfocused when focus leaves the entire form
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setFormFocused(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <Label className="text-white/70 text-xs mb-1 block">이메일</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                  className="h-9 bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm focus:border-blue-500 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <Label className="text-white/70 text-xs mb-1 block">비밀번호</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="비밀번호 입력"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    className="h-9 bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm pr-9 focus:border-blue-500 focus:ring-blue-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                  >
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              {loginError && (
                <p className="text-red-300 text-xs">{loginError}</p>
              )}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full h-9 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 shadow-lg shadow-blue-600/30"
              >
                {loginLoading ? "로그인 중..." : "로그인"}
              </button>
            </form>
            <p className="text-center text-white/40 text-xs mt-3">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="text-blue-300 hover:text-blue-200 font-medium">
                회원가입
              </Link>
            </p>
          </GlassCardDark>
          </div>
        )}
      </motion.div>

      {/* 마우스 힌트 */}
      <motion.p
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-xs whitespace-nowrap"
        animate={{ opacity: isNear ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {isLoggedIn ? "마우스를 올려 대시보드로" : "마우스를 올려 로그인"}
      </motion.p>
    </div>
  );
}

// ── 기능 목록
const features = [
  {
    icon: Layers,
    title: "콘텐츠 통합 관리",
    desc: "블로그, 인스타그램, 틱톡, 오픈채팅까지 모든 채널을 한 곳에서 관리하세요.",
    gradient: "from-blue-500 to-blue-600",
    glow: "shadow-blue-500/20",
  },
  {
    icon: CalendarCheck,
    title: "스마트 스케줄링",
    desc: "콘텐츠 캘린더로 발행 일정을 한눈에 파악하고, 놓치는 스케줄 없이 운영하세요.",
    gradient: "from-violet-500 to-violet-600",
    glow: "shadow-violet-500/20",
  },
  {
    icon: BarChart3,
    title: "브랜드 분석 대시보드",
    desc: "상태별·플랫폼별 콘텐츠 현황을 실시간으로 파악하고 전략을 조정하세요.",
    gradient: "from-emerald-500 to-emerald-600",
    glow: "shadow-emerald-500/20",
  },
  {
    icon: Zap,
    title: "템플릿 자동화",
    desc: "반복되는 콘텐츠 유형을 템플릿으로 저장하고 빠르게 재사용하세요.",
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/20",
  },
  {
    icon: ShieldCheck,
    title: "브랜드별 독립 공간",
    desc: "회원가입 시 입력한 브랜드 정보가 앱 전역에 자동 반영됩니다.",
    gradient: "from-rose-500 to-pink-500",
    glow: "shadow-rose-500/20",
  },
  {
    icon: Sparkles,
    title: "AI 콘텐츠 초안",
    desc: "핵심 메시지와 CTA를 입력하면 채널별 초안을 자동으로 생성해드립니다.",
    gradient: "from-sky-500 to-cyan-500",
    glow: "shadow-sky-500/20",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // Auth check on mount — determines whether to show modal or navigate
  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((d) => { if (d.loggedIn) setIsLoggedIn(true); })
      .catch(() => {});
  }, []);

  function handleAuthClick(dest: string) {
    if (isLoggedIn) {
      setShowMemberModal(true);
    } else {
      router.push(dest);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* 이미 회원 모달 */}
      {showMemberModal && (
        <AlreadyMemberModal onClose={() => setShowMemberModal(false)} />
      )}

      {/* ── 네비게이션 바 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-[88px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-[#145CFF]/15 blur-md" />
              <svg width="42" height="42" viewBox="0 0 48 48" fill="none" className="relative">
                <defs>
                  <linearGradient id="uf-grad-premium" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8FC2FF" />
                    <stop offset="55%" stopColor="#145CFF" />
                    <stop offset="100%" stopColor="#0D47D9" />
                  </linearGradient>
                </defs>
                <rect width="48" height="48" rx="14" fill="url(#uf-grad-premium)" />
                <rect width="48" height="48" rx="14" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
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
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[27px] md:text-[30px] font-extrabold text-[#0D47D9] leading-none tracking-[-0.03em]">
                UpFlow
              </span>
              <span className="text-[12px] text-slate-400 font-medium mt-1 tracking-[0.01em]">
                온라인 비즈니스 운영을 한 곳에서
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* 로그인 버튼 */}
            <button
              onClick={() => handleAuthClick("/login")}
              className="inline-flex items-center justify-center whitespace-nowrap transition-all duration-300 h-10 rounded-xl px-4 text-sm font-semibold text-[#145CFF] border border-[#145CFF]/20 bg-blue-50/60 hover:bg-blue-100/70 hover:border-[#145CFF]/40 hover:-translate-y-[1px] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145CFF] focus-visible:ring-offset-2"
            >
              로그인
            </button>
            {/* 무료로 시작하기 버튼 */}
            <button
              onClick={() => handleAuthClick("/signup")}
              className="inline-flex items-center justify-center whitespace-nowrap transition-all duration-300 h-10 rounded-xl px-5 text-sm font-semibold text-white bg-[#145CFF] hover:bg-[#0D47D9] hover:shadow-[0_10px_30px_rgba(20,92,255,0.30)] hover:-translate-y-[1px] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145CFF] focus-visible:ring-offset-2"
            >
              무료로 시작하기
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero 섹션 */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-500 flex items-center overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl animate-orb pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-blue-500/25 blur-3xl animate-orb-delay pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-400/15 blur-3xl animate-orb-slow pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-blue-300/10 blur-2xl animate-float pointer-events-none" />

        {/* 그리드 패턴 오버레이 */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)]">
            {/* 좌측: 타이포 + CTA */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                온라인 비즈니스 운영, 이제 자동으로
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
                모든 채널 콘텐츠를<br />
                <span className="text-blue-200">한 곳</span>에서 관리하세요
              </h1>

              <p className="text-lg text-blue-100/80 leading-relaxed mb-8 max-w-xl">
                업플로는 온라인 쇼핑몰 셀러를 위한 멀티툴 SaaS 플랫폼입니다.<br />스토어 운영부터 SNS 마케팅, 광고, CRM까지 한 곳에서 자동화하세요.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg gap-2 font-semibold px-8" onClick={() => handleAuthClick("/signup")}>
                  무료로 시작하기
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent font-semibold px-8" onClick={() => handleAuthClick("/login")}>
                  로그인
                </Button>
              </div>

              {/* 통계 배지들 */}
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "5가지 채널", sub: "통합 관리" },
                  { label: "실시간", sub: "콘텐츠 현황" },
                  { label: "AI 초안", sub: "자동 생성" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/15">
                    <p className="text-white font-bold text-sm">{stat.label}</p>
                    <p className="text-white/50 text-xs">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 우측: 인터랙티브 그래픽 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <InteractiveGraphic
                isLoggedIn={isLoggedIn}
                onAlreadyMember={() => setShowMemberModal(true)}
              />
            </motion.div>
          </div>
        </div>

        {/* 하단 페이드 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
      </section>

      {/* ── 기능 소개 섹션 */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-900 to-indigo-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">
              마케팅 운영의 모든 것
            </h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
              콘텐츠 기획부터 발행까지, 브랜드에 필요한 모든 기능을 제공합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${f.gradient} shadow-lg ${f.glow}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white mb-2 text-[15px]">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA 섹션 */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-500 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-blue-400/15 blur-3xl animate-float-delay" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <SSymbol size={56} />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">
              지금 바로 시작해보세요
            </h2>
            <p className="text-blue-100/80 mb-8 text-base leading-relaxed">
              회원가입 후 5분이면 브랜드 전용 마케팅 스튜디오가 준비됩니다.
              <br />
              무료로, 지금 바로 시작하세요.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 shadow-md gap-2 font-semibold px-8"
                onClick={() => handleAuthClick("/signup")}
              >
                무료로 시작하기
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-white border border-white/30 hover:bg-white/10 font-semibold px-8"
                onClick={() => handleAuthClick("/login")}
              >
                이미 계정이 있나요?
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 푸터 */}
      <footer className="py-8 px-6 bg-slate-950 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SSymbol size={24} />
            <div>
              <span className="text-sm font-extrabold text-slate-300 block">업플로</span>
              <span className="text-[10px] text-slate-600 tracking-widest font-semibold">UpFlow</span>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            © 2026 UpFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
