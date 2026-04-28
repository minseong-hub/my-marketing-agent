"use client";
import { useState } from "react";

const FAQS = [
  {
    q: "실제로 쇼핑몰에 연동이 되나요?",
    a: "스마트스토어, 카페24, 쇼피파이 API를 통해 직접 연동됩니다. 설정은 5분 이내로 완료됩니다.",
  },
  {
    q: "AI가 직접 광고를 집행하나요?",
    a: "현재는 분석 및 제안 단계입니다. 실제 집행은 셀러가 승인 후 진행하며, 2026 Q3에 자동 집행 기능 출시 예정입니다.",
  },
  {
    q: "14일 무료 체험 후 자동으로 결제되나요?",
    a: "아닙니다. 무료 기간 종료 후 플랜을 선택하셔야 결제가 시작됩니다. 카드 정보 없이도 체험 가능합니다.",
  },
  {
    q: "크루를 중간에 바꿀 수 있나요?",
    a: "플랜 내 허용 인원 범위에서 언제든 크루를 교체할 수 있습니다. 전환 비용은 없습니다.",
  },
  {
    q: "데이터는 어디에 저장되나요?",
    a: "국내 서버(AWS Seoul)에 저장되며, 개인정보는 암호화되어 관리됩니다. 제3자 제공은 하지 않습니다.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section style={{ padding: "64px 32px", background: "#0a0e27" }}>
      <div className="max-w-3xl mx-auto">
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9,
            color: "#5ce5ff",
            letterSpacing: "0.12em",
            marginBottom: 12,
          }}
        >
          › 교신_로그
        </p>
        <h2
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "clamp(14px, 2vw, 18px)",
            color: "#cfe9ff",
            textShadow: "4px 4px 0 #8a2877",
            marginBottom: 32,
          }}
        >
          교신 로그
        </h2>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="pixel-frame"
              style={{
                border: `1px solid ${open === i ? "#5ce5ff" : "#1f2a6b"}`,
                background: "#0f1640",
                overflow: "hidden",
                transition: "border-color 0.15s",
              }}
            >
              <button
                className="w-full flex items-start justify-between gap-4 p-4 text-left cursor-pointer"
                style={{ background: "none", border: "none" }}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span
                  style={{
                    fontFamily: '"IBM Plex Sans KR", sans-serif',
                    fontSize: 13,
                    color: "#cfe9ff",
                    fontWeight: 600,
                    lineHeight: 1.6,
                  }}
                >
                  {faq.q}
                </span>
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 10,
                    color: "#5ce5ff",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {open === i ? "[-]" : "[+]"}
                </span>
              </button>

              {open === i && (
                <div
                  style={{
                    padding: "0 16px 16px",
                    fontFamily: '"IBM Plex Sans KR", sans-serif',
                    fontSize: 13,
                    color: "#7e94c8",
                    lineHeight: 1.8,
                    borderTop: "1px solid #1f2a6b",
                    paddingTop: 12,
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
