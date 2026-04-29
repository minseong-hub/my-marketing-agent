"use client";

import { useState } from "react";
import { ChatPanel } from "./ChatPanel";
import { DESKS, type DeskAgentId } from "@/data/desks";

export function ChatBubble({ agentId }: { agentId: DeskAgentId }) {
  const [open, setOpen] = useState(false);
  const a = DESKS[agentId].agent;

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`${a.name}와 대화`}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          background: a.accent,
          border: `3px solid ${a.accent}`,
          boxShadow: `0 0 24px ${a.accent}88, 4px 4px 0 ${a.accentDark}`,
          cursor: "pointer",
          zIndex: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#060920",
          fontFamily: '"IBM Plex Sans KR", sans-serif',
          fontSize: 22,
          fontWeight: 800,
        }}
        className="pixel-frame"
      >
        {open ? "✕" : "💬"}
      </button>
      {open && <ChatPanel agentId={agentId} onClose={() => setOpen(false)} />}
    </>
  );
}
