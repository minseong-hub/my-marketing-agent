"use client";
import { PixelButton } from "@/components/primitives/PixelButton";
import Link from "next/link";

const PLANS = [
  {
    id: "solo",
    name: "솔로",
    price: "₩29,000",
    period: "/월",
    accent: "#5ce5ff",
    accentDark: "#2a86a8",
    highlight: false,
    crew: "크루 1명",
    features: ["월 1,000건", "기본 대시보드", "이메일 지원"],
  },
  {
    id: "duo",
    name: "듀오",
    price: "₩79,000",
    period: "/월",
    accent: "#ff4ec9",
    accentDark: "#8a2877",
    highlight: true,
    badge: "인기",
    crew: "크루 2명",
    features: ["월 5,000건", "통합 대시보드", "우선 채팅 지원"],
  },
  {
    id: "full",
    name: "풀크루",
    price: "₩149,000",
    period: "/월",
    accent: "#66ff9d",
    accentDark: "#2a8a55",
    highlight: false,
    crew: "크루 4명 전원",
    features: ["무제한", "고급 분석 + API", "전담 매니저"],
  },
];

export function Pricing() {
  return (
    <section style={{ padding: "64px 32px", background: "#060920" }}>
      <div className="max-w-4xl mx-auto">
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9,
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
            fontSize: "clamp(14px, 2vw, 20px)",
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
            fontSize: 13,
            color: "#7e94c8",
            marginBottom: 40,
          }}
        >
          14일 무료 체험. 언제든 취소 가능.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="pixel-frame flex flex-col"
              style={{
                border: `2px solid ${plan.accent}`,
                background: plan.highlight ? "#0f1640" : "#0a0e27",
                padding: "24px 20px",
                boxShadow: plan.highlight ? `4px 4px 0 0 ${plan.accentDark}` : "none",
                position: "relative",
              }}
            >
              {plan.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: plan.accent,
                    color: "#060920",
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 7,
                    padding: "3px 10px",
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <p
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 10,
                  color: plan.accent,
                  marginBottom: 8,
                }}
              >
                {plan.name}
              </p>
              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 9,
                  color: "#7e94c8",
                  marginBottom: 16,
                }}
              >
                {plan.crew}
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: "clamp(16px, 2vw, 22px)",
                    color: "#cfe9ff",
                  }}
                >
                  {plan.price}
                </span>
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 9,
                    color: "#7e94c8",
                  }}
                >
                  {plan.period}
                </span>
              </div>

              <ul className="flex-1 space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 9,
                      color: "#cfe9ff",
                      paddingLeft: 12,
                      position: "relative",
                    }}
                  >
                    <span style={{ position: "absolute", left: 0, color: plan.accent }}>›</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/signup" style={{ textDecoration: "none" }}>
                <PixelButton
                  variant={plan.highlight ? "primary" : "secondary"}
                  size="sm"
                  full
                >
                  ▶ 선택하기
                </PixelButton>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
