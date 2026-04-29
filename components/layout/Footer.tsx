"use client";
import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{ background: "#060920", borderTop: "1px solid #1f2a6b", padding: "20px 24px" }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <span
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 12,
            color: "#ff4ec9",
            letterSpacing: "0.05em",
          }}
        >
          CREWMATE AI
        </span>
        <div className="flex gap-5">
          {[
            { href: "/terms", label: "이용약관" },
            { href: "/privacy", label: "개인정보" },
            { href: "/docs", label: "도큐" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 12,
                color: "#7e94c8",
                textDecoration: "none",
                letterSpacing: "0.08em",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            color: "#7e94c8",
            letterSpacing: "0.06em",
          }}
        >
          © 2026 CREWMATE AI · 모든 크루원 보호중
        </span>
      </div>
    </footer>
  );
}
