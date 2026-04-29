"use client";

import { useState, useEffect, useRef } from "react";
import { DESKS, type DeskAgentId } from "@/data/desks";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_MONO = '"JetBrains Mono", monospace';
const FONT_PIX = '"Press Start 2P", monospace';

interface Msg {
  id: number;
  who: "me" | "agent";
  text: string;
}

const REPLIES: Record<DeskAgentId, string[]> = {
  marky: [
    "확인했습니다, 함장님. 제가 큐에 추가해 둘게요.",
    "지금 트렌드 데이터로 다시 보내드릴게요.",
    "발행 직전에 한 번 더 확인 요청 드리겠습니다.",
  ],
  dali: [
    "관련 페이지를 분석해서 곧 결과 드리겠습니다.",
    "셀링포인트 다시 정리해서 보내드릴게요.",
    "A/B 테스트 결과 모이면 보고서로 정리합니다.",
  ],
  addy: [
    "ROAS 추이 다시 확인하고 알려드리겠습니다.",
    "예산 재분배 시뮬레이션 결과 곧 보내드릴게요.",
    "비효율 캠페인 후보 추려서 승인 요청 드리겠습니다.",
  ],
  penny: [
    "장부에서 해당 거래 다시 확인해 보겠습니다.",
    "이번 달 손익 추정치로 답변 드릴게요.",
    "정산 매칭 다시 점검 후 보고드리겠습니다.",
  ],
};

export function ChatPanel({ agentId, onClose }: { agentId: DeskAgentId; onClose: () => void }) {
  const a = DESKS[agentId].agent;
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 1, who: "agent", text: `안녕하세요 함장님, ${a.name}입니다. 어떻게 도와드릴까요?` },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(2);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [msgs]);

  function send() {
    const v = input.trim();
    if (!v) return;
    setMsgs((m) => [...m, { id: idRef.current++, who: "me", text: v }]);
    setInput("");
    setTimeout(() => {
      const replies = REPLIES[agentId];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setMsgs((m) => [...m, { id: idRef.current++, who: "agent", text: reply }]);
    }, 700);
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 100,
        right: 24,
        width: 380,
        height: 520,
        background: "#0a0e27",
        border: `2px solid ${a.accent}`,
        boxShadow: `0 0 32px ${a.accent}44, 6px 6px 0 ${a.accentDark}`,
        zIndex: 79,
        display: "flex",
        flexDirection: "column",
      }}
      className="pixel-frame"
    >
      {/* 헤더 */}
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${a.accent}33`, background: "#060920", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: a.accent, letterSpacing: "0.08em" }}>
            ● DM · {a.englishName.toUpperCase()}
          </p>
          <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginTop: 2 }}>
            실시간 응답 · 평균 {a.id === "penny" ? "1초" : "2초"}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{ background: "transparent", border: "none", color: "#7e94c8", fontSize: 18, cursor: "pointer", padding: 4 }}
        >
          ✕
        </button>
      </div>

      {/* 메시지 */}
      <div ref={scrollRef} style={{ flex: 1, padding: "12px 16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m) => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.who === "me" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "78%",
              background: m.who === "me" ? "#1f2a6b" : `${a.accentDark}33`,
              border: m.who === "me" ? "1px solid #2a86a8" : `1px solid ${a.accent}55`,
              padding: "8px 12px",
              fontFamily: FONT_KR,
              fontSize: 14,
              color: "#cfe9ff",
              lineHeight: 1.5,
            }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* 입력 */}
      <div style={{ padding: "10px 14px", borderTop: `1px solid ${a.accent}33`, background: "#060920", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder={`${a.name}에게 메시지...`}
          style={{
            flex: 1,
            background: "#0a0e27",
            border: `1px solid ${a.accent}44`,
            color: "#cfe9ff",
            padding: "8px 10px",
            fontFamily: FONT_KR,
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          style={{
            background: a.accent,
            color: "#060920",
            border: `2px solid ${a.accent}`,
            padding: "6px 14px",
            fontFamily: FONT_KR,
            fontSize: 13,
            fontWeight: 700,
            cursor: input.trim() ? "pointer" : "not-allowed",
            opacity: input.trim() ? 1 : 0.5,
          }}
        >
          전송
        </button>
      </div>
    </div>
  );
}
