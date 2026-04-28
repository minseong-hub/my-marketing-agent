"use client";

const STEPS = [
  {
    n: "01",
    title: "스토어 연결",
    color: "#5ce5ff",
    desc: "스마트스토어, 카페24, 쇼피파이 등 연결. 5분이면 끝납니다.",
  },
  {
    n: "02",
    title: "크루 배정",
    color: "#ff4ec9",
    desc: "필요한 크루를 선택하고 톤·예산·목표를 설정합니다.",
  },
  {
    n: "03",
    title: "임무 시작",
    color: "#ffd84d",
    desc: "크루들이 자동으로 협업합니다. 당신은 승인만 하면 됩니다.",
  },
  {
    n: "04",
    title: "성과 관측",
    color: "#66ff9d",
    desc: "실시간 대시보드로 ROAS, 매출, 재고를 한눈에.",
  },
];

export function HowItWorks() {
  return (
    <section style={{ padding: "64px 32px", background: "#0a0e27" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9,
            color: "#5ce5ff",
            letterSpacing: "0.12em",
            marginBottom: 12,
          }}
        >
          › MISSION_FLOW
        </p>
        <h2
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "clamp(14px, 2vw, 20px)",
            color: "#cfe9ff",
            textShadow: "4px 4px 0 #8a2877",
            marginBottom: 40,
          }}
        >
          이렇게 작동합니다
        </h2>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="pixel-frame"
              style={{
                border: `2px solid ${step.color}44`,
                background: "#0f1640",
                padding: "20px 16px",
                position: "relative",
              }}
            >
              <p
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 18,
                  color: step.color,
                  opacity: 0.3,
                  position: "absolute",
                  top: 12,
                  right: 14,
                }}
              >
                {step.n}
              </p>
              <h3
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 10,
                  color: step.color,
                  marginBottom: 12,
                  lineHeight: 1.6,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: '"IBM Plex Sans KR", sans-serif',
                  fontSize: 13,
                  color: "#7e94c8",
                  lineHeight: 1.8,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
