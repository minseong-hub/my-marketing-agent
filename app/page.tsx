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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

// ── S 심볼 컴포넌트
function SSymbol({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="s-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#s-grad)" />
      <path
        d="M30 16H20a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h8a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H18"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── S 심볼 Large (랜딩 그래픽용)
function SSymbolLarge() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="s-grad-lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <filter id="s-glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="120" height="120" rx="30" fill="url(#s-grad-lg)" opacity="0.9" />
      <rect width="120" height="120" rx="30" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <path
        d="M76 40H50a10 10 0 0 0-10 10v0a10 10 0 0 0 10 10h20a10 10 0 0 1 10 10v0a10 10 0 0 1-10 10H44"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
        filter="url(#s-glow)"
      />
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

// ── Floating 글래스 카드들 (그래픽 주변)
function FloatingCards() {
  const cards = [
    {
      title: "인스타그램",
      desc: "성주참외 신상품",
      badge: "예약됨",
      badgeColor: "bg-violet-400/80",
      dot: "bg-pink-400",
      delay: 0,
      pos: "-top-6 -right-8",
    },
    {
      title: "블로그",
      desc: "봄 제철 과일 특집",
      badge: "작성중",
      badgeColor: "bg-amber-400/80",
      dot: "bg-orange-400",
      delay: 0.3,
      pos: "-bottom-4 -left-10",
    },
    {
      title: "오픈채팅",
      desc: "회원 혜택 공지",
      badge: "업로드완료",
      badgeColor: "bg-emerald-400/80",
      dot: "bg-amber-400",
      delay: 0.6,
      pos: "top-1/2 -right-16 -translate-y-1/2",
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
          <GlassCardDark className="p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-2 h-2 rounded-full ${card.dot}`} />
              <span className="text-white/90 text-xs font-semibold">{card.title}</span>
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
function InteractiveGraphic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(false);
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

  useEffect(() => {
    if (isNear) {
      const t = setTimeout(() => setLoginVisible(true), 100);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setLoginVisible(false), 200);
      return () => clearTimeout(t);
    }
  }, [isNear]);

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
          opacity: isNear ? 0 : 1,
          scale: isNear ? 0.85 : 1,
          filter: isNear ? "blur(6px)" : "blur(0px)",
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
            <p className="text-white/70 text-xs text-center mt-3 font-medium tracking-wide">
              S Marketing Lab
            </p>
          </GlassCardDark>
        </motion.div>

        {/* 플로팅 카드들 */}
        <FloatingCards />
      </motion.div>

      {/* 로그인 폼 레이어 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: loginVisible ? 1 : 0,
          y: loginVisible ? 0 : 20,
          pointerEvents: loginVisible ? "auto" : "none",
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <GlassCardDark className="w-full p-6">
          <div className="flex items-center gap-2 mb-5">
            <SSymbol size={32} />
            <div>
              <p className="text-white font-bold text-sm leading-none">심플 마케팅 랩</p>
              <p className="text-white/50 text-[10px] mt-0.5">S Marketing Lab</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <Label className="text-white/70 text-xs mb-1 block">이메일</Label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
                className="h-9 bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm focus:border-blue-400 focus:ring-blue-400/30"
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
                  className="h-9 bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm pr-9 focus:border-blue-400 focus:ring-blue-400/30"
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
              className="w-full h-9 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
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
      </motion.div>

      {/* 마우스 힌트 */}
      <motion.p
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-xs whitespace-nowrap"
        animate={{ opacity: isNear ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        마우스를 올려 로그인
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
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── 네비게이션 바 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-900/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SSymbol size={32} />
            <div>
              <span className="text-sm font-bold text-white leading-none block">심플 마케팅 랩</span>
              <span className="text-[10px] text-white/50 leading-none">S Marketing Lab</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 font-medium">
                로그인
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-white text-blue-700 hover:bg-blue-50 shadow-sm font-semibold">
                무료로 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero 섹션 */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 flex items-center overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl animate-orb pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl animate-orb-delay pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-400/15 blur-3xl animate-orb-slow pointer-events-none" />
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
                브랜드 마케팅, 이제 더 심플하게
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
                모든 채널 콘텐츠를<br />
                <span className="text-blue-200">한 곳</span>에서 관리하세요
              </h1>

              <p className="text-lg text-blue-100/80 leading-relaxed mb-8 max-w-xl">
                심플 마케팅 랩은 브랜드별 독립 공간에서 SNS 콘텐츠 기획부터 발행
                스케줄링까지 모든 마케팅 운영을 통합 관리하는 SaaS 도구입니다.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg gap-2 font-semibold px-8">
                    무료로 시작하기
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent font-semibold px-8">
                    로그인
                  </Button>
                </Link>
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
              <InteractiveGraphic />
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
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-violet-400/10 blur-3xl animate-float-delay" />
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
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-blue-50 shadow-md gap-2 font-semibold px-8"
                >
                  무료로 시작하기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white border border-white/30 hover:bg-white/10 font-semibold px-8"
                >
                  이미 계정이 있나요?
                </Button>
              </Link>
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
              <span className="text-xs font-bold text-slate-300 block">심플 마케팅 랩</span>
              <span className="text-[10px] text-slate-600">S Marketing Lab</span>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            © 2026 S Marketing Lab. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
