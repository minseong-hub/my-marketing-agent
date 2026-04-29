"use client";

import { useEffect, useState } from "react";
import { DESKS, type DeskAgentId } from "@/data/desks";
import { showToast } from "../ToastHost";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

export function NowWorkingCard({ agentId }: { agentId: DeskAgentId }) {
  const desk = DESKS[agentId];
  const a = desk.agent;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        background: a.accent,
        border: `3px solid ${a.accent}`,
        boxShadow: `0 0 0 4px #060920, 0 0 48px ${a.accent}66, 6px 6px 0 #060920`,
        padding: "16px 18px",
      }}
      className="pixel-frame"
    >
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontFamily: FONT_PIX, fontSize: 12, color: "#060920", letterSpacing: "0.06em" }}>
          ● 지금 작업 중 — 실시간
        </p>
        <span style={{
          background: "#060920", color: a.accent,
          fontFamily: FONT_KR, fontSize: 12, fontWeight: 700,
          padding: "3px 10px",
        }}>
          {desk.now.length}개 진행 중
        </span>
      </div>

      {/* 작업 카드들 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {desk.now.map((t) => {
          const animatedProgress = Math.min(99, (t.progress + tick * 0.3) % 100 || t.progress);
          return (
            <div
              key={t.id}
              style={{
                background: "#0a0e27",
                border: `2px solid ${a.accent}88`,
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                <div>
                  <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: a.accent, marginBottom: 4 }}>
                    {t.id}
                  </p>
                  <p style={{ fontFamily: FONT_KR, fontSize: 16, fontWeight: 700, color: "#ffffff", lineHeight: 1.4, marginBottom: 4 }}>
                    {t.title}
                  </p>
                  <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8" }}>
                    {t.meta}
                  </p>
                </div>
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#cfe9ff", flexShrink: 0 }}>
                  ETA {t.eta}
                </span>
              </div>

              {/* 진행률 */}
              <div style={{ marginTop: 6 }}>
                <div style={{ height: 6, background: "#060920", border: `1px solid ${a.accent}44`, position: "relative", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${animatedProgress}%`,
                    background: a.accent,
                    boxShadow: `0 0 8px ${a.accent}`,
                    transition: "width 0.5s linear",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontFamily: FONT_KR, fontSize: 12, color: "#cfe9ff" }}>
                    {t.step}
                  </span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: a.accent, fontWeight: 700 }}>
                    {Math.round(animatedProgress)}%
                  </span>
                </div>
              </div>

              {/* 승인 알림 */}
              {t.needsApproval && (
                <div style={{
                  marginTop: 10,
                  background: "#ffd84d18",
                  border: "1px solid #ffd84d",
                  padding: "8px 12px",
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                }}>
                  <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#ffd84d", fontWeight: 600 }}>
                    ⚠ 함장님 승인이 필요합니다
                  </p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => showToast(`${t.id} 거부 — ${a.name}이(가) 대안을 준비합니다`, { color: "#ff4ec9", icon: "✕" })}
                      style={{ background: "transparent", border: "1px solid #ff4ec966", color: "#ff4ec9", padding: "4px 12px", fontFamily: FONT_KR, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      거부
                    </button>
                    <button
                      onClick={() => showToast(`${t.id} 승인 — 자동 발행으로 전환`, { color: "#66ff9d", icon: "✓" })}
                      style={{ background: "#66ff9d", border: "1px solid #66ff9d", color: "#060920", padding: "4px 12px", fontFamily: FONT_KR, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      승인
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
