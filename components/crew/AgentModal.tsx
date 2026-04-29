"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AstronautAvatar } from "@/components/primitives/AstronautAvatar";
import { Typewriter } from "@/components/primitives/Typewriter";
import { PixelButton } from "@/components/primitives/PixelButton";
import { Bar } from "@/components/primitives/Bar";
import type { Agent } from "@/data/agents";

interface AgentModalProps {
  agent: Agent | null;
  onClose: () => void;
  onCTA?: () => void;
}

const STATS: Record<string, { label: string; v: number; c: string }[]> = {
  marky: [
    { label: "SNS 참여율 부스트", v: 92, c: "#ff4ec9" },
    { label: "콘텐츠 생산 속도", v: 97, c: "#ff4ec9" },
    { label: "트렌드 감지", v: 88, c: "#ff86dc" },
    { label: "브랜드 일관성", v: 95, c: "#ff86dc" },
  ],
  dali: [
    { label: "전환률 개선", v: 89, c: "#5ce5ff" },
    { label: "페이지 체류시간", v: 94, c: "#5ce5ff" },
    { label: "카피 설득력", v: 91, c: "#9af0ff" },
    { label: "섹션 구조화", v: 96, c: "#9af0ff" },
  ],
  addy: [
    { label: "ROAS 최적화", v: 93, c: "#ffd84d" },
    { label: "예산 효율", v: 88, c: "#ffd84d" },
    { label: "채널 분석", v: 95, c: "#fff0a8" },
    { label: "소재 A/B 테스트", v: 82, c: "#fff0a8" },
  ],
  penny: [
    { label: "손익 정확도", v: 99, c: "#66ff9d" },
    { label: "현금흐름 추적", v: 96, c: "#66ff9d" },
    { label: "비용 최적화", v: 87, c: "#b8ffd1" },
    { label: "세금 시뮬레이션", v: 90, c: "#b8ffd1" },
  ],
};

export function AgentModal({ agent, onClose, onCTA }: AgentModalProps) {
  const [typeKey, setTypeKey] = useState(0);

  useEffect(() => {
    if (!agent) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    // Refresh typewriter every 14 seconds
    const tid = setInterval(() => setTypeKey(k => k + 1), 14000);
    return () => { window.removeEventListener("keydown", handler); clearInterval(tid); };
  }, [agent, onClose]);

  return (
    <AnimatePresence>
      {agent && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(6,9,32,0.85)", backdropFilter: "blur(4px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="pixel-frame relative overflow-hidden"
            style={{
              background: "#0a0e27",
              border: `2px solid ${agent.accent}`,
              boxShadow: `8px 8px 0 0 ${agent.accentDark}`,
              width: "min(880px, 96vw)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header strip */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ borderBottom: `1px solid ${agent.accent}44`, background: "#060920" }}
            >
              <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 15, fontWeight: 600, color: agent.accent }}>
                ● 비서 상세 · {agent.name}
              </span>
              <button
                onClick={onClose}
                style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#cfe9ff", cursor: "pointer", background: "none", border: "none", fontWeight: 500 }}
              >
                닫기 (ESC) ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col md:flex-row gap-0">
              {/* Left: Avatar + Stats */}
              <div
                className="flex flex-col items-center gap-4 p-6 shrink-0"
                style={{ borderRight: `1px solid ${agent.accent}33`, minWidth: 200, background: "#0a0e27" }}
              >
                <div style={{ filter: `drop-shadow(0 0 28px ${agent.accent}88)` }}>
                  <AstronautAvatar agent={agent} scale={9} idle={true} />
                </div>
                <div className="w-full space-y-2 mt-2">
                  {STATS[agent.id]?.map(s => (
                    <Bar key={s.label} v={s.v} c={s.c} label={s.label} segments={16} />
                  ))}
                </div>
              </div>

              {/* Right: Info */}
              <div className="flex-1 p-6 space-y-4">
                <div>
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: agent.accent, letterSpacing: "0.1em" }}>
                    {agent.title}
                  </p>
                  <h2
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: 22,
                      color: "#cfe9ff",
                      marginTop: 8,
                      lineHeight: 1.4,
                      textShadow: `4px 4px 0 ${agent.accentDark}`,
                    }}
                  >
                    {agent.name}
                  </h2>
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: agent.accent, marginTop: 6 }}>
                    » {agent.tagline}
                  </p>
                </div>

                <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 17, color: "#cfe9ff", lineHeight: 1.8 }}>
                  {agent.desc}
                </p>

                {/* Skills */}
                <div>
                  <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#cfe9ff", marginBottom: 8 }}>
                    ▸ 잘하는 일
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {agent.skills.map(skill => (
                      <span
                        key={skill}
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: 13,
                          color: agent.accent,
                          border: `1px solid ${agent.accentDark}`,
                          padding: "3px 8px",
                          background: `${agent.accentDark}22`,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sample Transmission */}
                <div>
                  <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#cfe9ff", marginBottom: 8 }}>
                    ▸ 비서가 어떻게 말하는지 미리보기
                  </p>
                  <div
                    style={{
                      background: "#060920",
                      border: `1px solid ${agent.accent}44`,
                      padding: 12,
                      minHeight: 80,
                    }}
                  >
                    <Typewriter key={typeKey} lines={agent.sample} loop={true} />
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex gap-3 pt-2 flex-wrap">
                  <PixelButton variant="primary" size="md" onClick={onCTA ?? (() => onClose())}>
                    ▶ {agent.name} 함께하기
                  </PixelButton>
                  <PixelButton variant="secondary" size="md" onClick={onClose}>
                    닫기
                  </PixelButton>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
