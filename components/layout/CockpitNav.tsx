"use client";
import Link from "next/link";
import { useState } from "react";

export function CockpitNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-30 flex items-center justify-between px-4 py-2"
      style={{ background: "#060920", borderBottom: "1px solid #1f2a6b" }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <span
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 11,
            color: "#ff4ec9",
            textShadow: "2px 2px 0 #8a2877",
            letterSpacing: "0.05em",
          }}
        >
          CREWMATE AI
        </span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        {[
          { href: "/crew", label: "CREW" },
          { href: "/pricing", label: "PRICING" },
          { href: "/docs", label: "DOCS" },
          { href: "/blog", label: "LOG" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9,
              color: "#7e94c8",
              letterSpacing: "0.1em",
              textDecoration: "none",
            }}
            className="hover:text-[#5ce5ff] transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="hidden md:flex items-center gap-3">
        <Link
          href="/login"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9,
            color: "#7e94c8",
            letterSpacing: "0.08em",
            textDecoration: "none",
          }}
        >
          입항
        </Link>
        <Link
          href="/signup"
          className="pixel-frame"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 8,
            color: "#060920",
            background: "#ff4ec9",
            border: "2px solid #ff4ec9",
            boxShadow: "3px 3px 0 0 #8a2877",
            padding: "7px 14px",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          탑승하기
        </Link>
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ color: "#5ce5ff", fontFamily: '"JetBrains Mono", monospace', fontSize: 10, background: "none", border: "none", cursor: "pointer" }}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 md:hidden flex flex-col p-4 gap-3"
          style={{ background: "#0a0e27", borderBottom: "1px solid #1f2a6b" }}
        >
          {[
            { href: "/crew", label: "CREW" },
            { href: "/pricing", label: "PRICING" },
            { href: "/docs", label: "DOCS" },
            { href: "/blog", label: "LOG" },
            { href: "/login", label: "입항" },
            { href: "/signup", label: "▶ 탑승하기" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 9,
                color: label.startsWith("▶") ? "#ff4ec9" : "#cfe9ff",
                letterSpacing: "0.1em",
                textDecoration: "none",
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
