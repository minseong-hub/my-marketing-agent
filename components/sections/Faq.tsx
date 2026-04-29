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
    q: "무료 플랜은 어떤 제한이 있나요?",
    a: "무료 플랜은 마키(마케팅 비서) 1명을 월 30회까지 수동으로 사용할 수 있습니다. 자동 임무는 유료 1단계부터 활성화됩니다. 카드 정보 없이 시작 가능.",
  },
  {
    q: "플랜은 호출 횟수만 차이가 있나요?",
    a: "네. 무료 30회 → 1단계 500회 → 2단계 2,000회 → 3단계 10,000회로, 월간 AI 호출 횟수가 핵심 차이입니다. 상위 단계에서는 자동 임무 빈도와 추가 크루(데일리·애디)가 함께 풀립니다.",
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
            fontSize: 13,
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
            fontSize: "clamp(18px, 2vw, 22px)",
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
                    fontSize: 17,
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
                    fontSize: 14,
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
                    fontSize: 17,
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
