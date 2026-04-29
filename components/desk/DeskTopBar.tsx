"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DESKS, type DeskAgentId } from "@/data/desks";
import { showToast } from "./ToastHost";

const ORDER: DeskAgentId[] = ["marky", "dali", "addy", "penny"];
const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

export function DeskTopBar({ activeId }: { activeId: DeskAgentId }) {
  const router = useRouter();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000 * 30);
    return () => clearInterval(id);
  }, []);

  async function handleLogout() {
    showToast("자동 운영 일시 정지 — 함장님께 권한 이양 완료", { color: "#ffd84d", icon: "⚠" });
    setTimeout(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    }, 700);
  }

  return (
    <nav
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 22px",
        background: "#060920",
        borderBottom: "1px solid #1f2a6b",
        flexShrink: 0,
      }}
    >
      <Link href="/desk/marky" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <span style={{
          fontFamily: FONT_PIX, fontSize: 13, color: "#ff4ec9",
          textShadow: "2px 2px 0 #8a2877", letterSpacing: "0.04em",
        }}>
          CREWMATE
        </span>
      </Link>

      <span style={{ width: 1, height: 24, background: "#1f2a6b" }} />

      <span style={{ fontFamily: FONT_KR, fontSize: 14, color: "#7e94c8", fontWeight: 500 }}>
        크루 데스크 · 항장실
      </span>

      {/* 비서 전환 pill — 가운데 */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
        {ORDER.map((id) => {
          const a = DESKS[id].agent;
          const active = id === activeId;
          return (
            <button
              key={id}
              onClick={() => router.push(`/desk/${id}`)}
              style={{
                background: active ? `${a.accent}1a` : "transparent",
                border: active ? `2px solid ${a.accent}` : "1px solid #1f2a6b",
                color: active ? a.accent : "#cfe9ff",
                padding: "6px 12px",
                fontFamily: FONT_KR,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ width: 6, height: 6, background: a.accent, borderRadius: "50%", boxShadow: active ? `0 0 8px ${a.accent}` : "none" }} />
              {a.name}
            </button>
          );
        })}
      </div>

      <span style={{ width: 1, height: 24, background: "#1f2a6b" }} />

      <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: "#7e94c8", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#5ce5ff" }}>{time}</span>
        <span style={{ color: "#1f2a6b" }}>·</span>
        <span style={{ color: "#66ff9d" }}>O₂ 정상</span>
      </span>

      <button
        onClick={handleLogout}
        style={{
          background: "none",
          border: "1px solid #1f2a6b",
          color: "#7e94c8",
          padding: "6px 12px",
          fontFamily: FONT_KR,
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        출항
      </button>
    </nav>
  );
}
