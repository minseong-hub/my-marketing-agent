"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/useAuth";

export function CockpitNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { loggedIn } = useAuth();

  return (
    <nav
      className="sticky top-0 z-30 flex items-center justify-between px-4 py-2"
      style={{ background: "#060920", borderBottom: "1px solid #1f2a6b" }}
    >
      {/* Logo */}
      <Link href={loggedIn ? "/desk/marky" : "/"} style={{ textDecoration: "none" }}>
        <span
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 15,
            color: "#ff4ec9",
            textShadow: "2px 2px 0 #8a2877",
            letterSpacing: "0.05em",
          }}
        >
          CREWMATE AI
        </span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-5">
        {(loggedIn
          ? [
              { href: "/desk/marky", label: "데스크" },
              { href: "/app/studio", label: "스튜디오" },
              { href: "/app/automation", label: "자동화" },
              { href: "/app/library", label: "보관함" },
              { href: "/app/brand", label: "브랜드" },
              { href: "/app/products", label: "상품" },
              { href: "/app/billing", label: "결제" },
            ]
          : [
              { href: "/crew", label: "크루 소개" },
              { href: "/pricing", label: "요금제" },
              { href: "/docs", label: "도움말" },
              { href: "/blog", label: "운영 일지" },
            ]
        ).map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: '"IBM Plex Sans KR", sans-serif',
              fontSize: 16,
              color: "#cfe9ff",
              letterSpacing: "0.02em",
              textDecoration: "none",
              fontWeight: 500,
            }}
            className="hover:text-[#5ce5ff] transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="hidden md:flex items-center gap-3">
        {loggedIn ? (
          <Link
            href="/desk/marky"
            className="pixel-frame"
            style={{
              fontFamily: '"IBM Plex Sans KR", sans-serif',
              fontSize: 15,
              fontWeight: 700,
              color: "#060920",
              background: "#5ce5ff",
              border: "2px solid #5ce5ff",
              boxShadow: "3px 3px 0 0 #2a86a8",
              padding: "8px 16px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            ▶ 데스크 진입
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              style={{
                fontFamily: '"IBM Plex Sans KR", sans-serif',
                fontSize: 16,
                color: "#cfe9ff",
                letterSpacing: "0.04em",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="pixel-frame"
              style={{
                fontFamily: '"IBM Plex Sans KR", sans-serif',
                fontSize: 15,
                fontWeight: 700,
                color: "#060920",
                background: "#ff4ec9",
                border: "2px solid #ff4ec9",
                boxShadow: "3px 3px 0 0 #8a2877",
                padding: "8px 16px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              회원가입
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ color: "#5ce5ff", fontFamily: '"JetBrains Mono", monospace', fontSize: 14, background: "none", border: "none", cursor: "pointer" }}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 md:hidden flex flex-col p-4 gap-3"
          style={{ background: "#0a0e27", borderBottom: "1px solid #1f2a6b" }}
        >
          {(loggedIn
            ? [
                { href: "/desk/marky", label: "데스크" },
                { href: "/app/studio", label: "스튜디오" },
                { href: "/app/automation", label: "자동화" },
                { href: "/app/library", label: "보관함" },
                { href: "/app/brand", label: "브랜드" },
                { href: "/app/products", label: "상품" },
                { href: "/app/billing", label: "결제" },
                { href: "/desk/marky", label: "▶ 데스크 진입" },
              ]
            : [
                { href: "/crew", label: "크루 소개" },
                { href: "/pricing", label: "요금제" },
                { href: "/docs", label: "도움말" },
                { href: "/blog", label: "운영 일지" },
                { href: "/login", label: "로그인" },
                { href: "/signup", label: "▶ 회원가입" },
              ]
          ).map(({ href, label }, i) => (
            <Link
              key={`${href}-${i}`}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: '"IBM Plex Sans KR", sans-serif',
                fontSize: 17,
                color: label.startsWith("▶") ? "#ff4ec9" : "#cfe9ff",
                letterSpacing: "0.02em",
                textDecoration: "none",
                fontWeight: 500,
                padding: "6px 0",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
