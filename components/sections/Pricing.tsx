"use client";
import { PixelButton } from "@/components/primitives/PixelButton";
import Link from "next/link";
import { PLAN_DEFINITIONS, PLAN_ORDER, formatKRW, type PlanSlug } from "@/lib/plans";

const ACCENT: Record<PlanSlug, { accent: string; accentDark: string }> = {
  free:    { accent: "#7e94c8", accentDark: "#3a4570" },
  starter: { accent: "#5ce5ff", accentDark: "#2a86a8" },
  growth:  { accent: "#ff4ec9", accentDark: "#8a2877" },
  pro:     { accent: "#66ff9d", accentDark: "#2a8a55" },
};

export function Pricing() {
  return (
    <section style={{ padding: "64px 32px", background: "#060920" }}>
      <div className="max-w-6xl mx-auto">
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13,
            color: "#ffd84d",
            letterSpacing: "0.12em",
            marginBottom: 12,
          }}
        >
          › SUPPLY_DEPOT
        </p>
        <h2
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "clamp(18px, 2vw, 20px)",
            color: "#cfe9ff",
            textShadow: "4px 4px 0 #8a2877",
            marginBottom: 8,
          }}
        >
          크루를 고용하세요
        </h2>
        <p
          style={{
            fontFamily: '"IBM Plex Sans KR", sans-serif',
            fontSize: 17,
            color: "#7e94c8",
            marginBottom: 40,
          }}
        >
          무료로 시작하고, AI 호출 횟수에 따라 단계별로 업그레이드. 언제든 취소 가능.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLAN_ORDER.map((slug) => {
            const plan = PLAN_DEFINITIONS[slug];
            const c = ACCENT[slug];
            const highlight = plan.recommended;
            return (
              <div
                key={slug}
                className="pixel-frame flex flex-col"
                style={{
                  border: `2px solid ${c.accent}`,
                  background: highlight ? "#0f1640" : "#0a0e27",
                  padding: "24px 20px",
                  boxShadow: highlight ? `4px 4px 0 0 ${c.accentDark}` : "none",
                  position: "relative",
                }}
              >
                {highlight && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: c.accent,
                      color: "#060920",
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: 11,
                      padding: "3px 10px",
                    }}
                  >
                    인기
                  </div>
                )}

                <p
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    color: c.accent,
                    letterSpacing: "0.08em",
                    marginBottom: 4,
                  }}
                >
                  {plan.stageLabel}
                </p>
                <p
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 14,
                    color: "#cfe9ff",
                    marginBottom: 8,
                  }}
                >
                  {plan.name}
                </p>
                <p
                  style={{
                    fontFamily: '"IBM Plex Sans KR", sans-serif',
                    fontSize: 14,
                    color: "#7e94c8",
                    marginBottom: 16,
                    lineHeight: 1.5,
                    minHeight: 42,
                  }}
                >
                  {plan.tagline}
                </p>

                <div className="flex items-baseline gap-1 mb-4">
                  <span
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: "clamp(20px, 2vw, 24px)",
                      color: "#cfe9ff",
                    }}
                  >
                    {formatKRW(plan.price_monthly)}
                  </span>
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 13,
                      color: "#7e94c8",
                    }}
                  >
                    {plan.price_monthly === 0 ? "" : "/월"}
                  </span>
                </div>

                <div
                  style={{
                    border: `1px solid ${c.accent}33`,
                    background: `${c.accentDark}11`,
                    padding: "8px 10px",
                    marginBottom: 16,
                  }}
                >
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: c.accent, letterSpacing: "0.08em" }}>
                    AI 호출 한도
                  </p>
                  <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 13, color: "#cfe9ff", marginTop: 4 }}>
                    {plan.monthly_generation_limit === null
                      ? "무제한"
                      : `${plan.monthly_generation_limit.toLocaleString()}회 / 월`}
                  </p>
                </div>

                <ul className="flex-1 space-y-2 mb-6">
                  {plan.highlights.map((f) => (
                    <li
                      key={f}
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 13,
                        color: "#cfe9ff",
                        paddingLeft: 12,
                        position: "relative",
                        lineHeight: 1.5,
                      }}
                    >
                      <span style={{ position: "absolute", left: 0, color: c.accent }}>›</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/signup" style={{ textDecoration: "none" }}>
                  <PixelButton
                    variant={highlight ? "primary" : slug === "free" ? "ghost" : "secondary"}
                    size="sm"
                    full
                  >
                    ▶ {plan.cta}
                  </PixelButton>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
