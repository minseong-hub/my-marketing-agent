"use client";
import { useState } from "react";
import { CockpitShell } from "@/components/layout/CockpitShell";
import { CockpitPanel } from "@/components/primitives/CockpitPanel";
import { AstronautAvatar } from "@/components/primitives/AstronautAvatar";
import { Typewriter } from "@/components/primitives/Typewriter";
import { PixelButton } from "@/components/primitives/PixelButton";
import { AgentModal } from "@/components/crew/AgentModal";
import { AGENTS } from "@/data/agents";
import type { Agent } from "@/data/agents";

export default function CrewPage() {
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [featured, setFeatured] = useState(AGENTS[0]);

  const leftConsole = (
    <CockpitPanel title={`PROFILE · ${featured.englishName.toUpperCase()}`} accent={featured.accent} statusColor={featured.accent} status="ACTIVE" className="flex-1">
      <div className="flex flex-col items-center gap-3">
        <div style={{ filter: `drop-shadow(0 0 20px ${featured.accent}88)` }}>
          <AstronautAvatar agent={featured} scale={7} idle={true} />
        </div>
        <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 13, color: featured.accent, textAlign: "center" }}>
          {featured.name}
        </p>
        <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: "#7e94c8", textAlign: "center" }}>
          {featured.role}
        </p>
        <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: featured.accent, textAlign: "center" }}>
          » {featured.tagline}
        </p>
        <div style={{ width: "100%", background: "#060920", border: `1px solid ${featured.accent}44`, padding: 8, marginTop: 4 }}>
          <Typewriter lines={featured.sample} loop={true} />
        </div>
      </div>
    </CockpitPanel>
  );

  return (
    <>
      <CockpitShell
        sector="크루 명부 · 비서 4명"
        leftConsole={leftConsole}
        bootMessage="크루 명단 로드 완료 · 비서 4명 대기 · 프로필 열람 가능"
      >
        <div style={{ padding: "32px 24px" }}>
          <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#5ce5ff", letterSpacing: "0.04em", marginBottom: 12 }}>
            크루 명단 · 함께 일할 4명의 AI 비서
          </p>
          <h1
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: "clamp(18px, 2vw, 20px)",
              color: "#cfe9ff",
              textShadow: "4px 4px 0 #8a2877",
              marginBottom: 32,
            }}
          >
            AI 크루 소개
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AGENTS.map(agent => (
              <button
                key={agent.id}
                onClick={() => { setFeatured(agent); setActiveAgent(agent); }}
                onMouseEnter={() => setFeatured(agent)}
                className="pixel-frame text-left p-5 flex gap-4 items-start transition-all duration-150 cursor-pointer w-full"
                style={{
                  background: featured.id === agent.id ? `${agent.accentDark}22` : "#0f1640",
                  border: `2px solid ${featured.id === agent.id ? agent.accent : agent.accent + "44"}`,
                  boxShadow: featured.id === agent.id ? `4px 4px 0 ${agent.accentDark}` : "none",
                }}
              >
                <AstronautAvatar agent={agent} scale={4} idle={true} />
                <div className="flex-1">
                  <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 14, color: agent.accent, marginBottom: 6 }}>
                    {agent.englishName.toUpperCase()}
                  </p>
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: "#7e94c8", marginBottom: 8 }}>
                    {agent.role}
                  </p>
                  <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 16, color: "#cfe9ff", lineHeight: 1.7 }}>
                    {agent.desc}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {agent.skills.slice(0, 3).map(s => (
                      <span key={s} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: agent.accent, border: `1px solid ${agent.accentDark}`, padding: "2px 6px", background: `${agent.accentDark}22` }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 32, textAlign: "center" }}>
            <PixelButton variant="primary" size="lg" onClick={() => window.location.href = "/signup"}>
              ▶ 크루와 함께 시작하기
            </PixelButton>
          </div>
        </div>
      </CockpitShell>

      <AgentModal agent={activeAgent} onClose={() => setActiveAgent(null)} />
    </>
  );
}
