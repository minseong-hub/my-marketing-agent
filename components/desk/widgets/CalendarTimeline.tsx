"use client";

import { useMemo, useState } from "react";
import { DESKS, type DeskAgentId } from "@/data/desks";
import { DayReportModal } from "./DayReportModal";
import { showToast } from "../ToastHost";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

const TOTAL_DAYS = 22;
const PAST = 14;

export function CalendarTimeline({ agentId }: { agentId: DeskAgentId }) {
  const desk = DESKS[agentId];
  const a = desk.agent;
  const [openOffset, setOpenOffset] = useState<number | null>(null);

  const days = useMemo(() => {
    const out: { offset: number; date: Date; label: string; weekday: string; isToday: boolean; isFuture: boolean }[] = [];
    for (let i = 0; i < TOTAL_DAYS; i++) {
      const offset = i - PAST;
      const d = new Date();
      d.setDate(d.getDate() + offset);
      out.push({
        offset,
        date: d,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        weekday: "일월화수목금토"[d.getDay()],
        isToday: offset === 0,
        isFuture: offset > 0,
      });
    }
    return out;
  }, []);

  // 통계
  const past7 = useMemo(() => days.slice(PAST - 7, PAST).reduce((s, d) => s + desk.calendar.reduce((ss, r) => ss + r.cells[d.offset + PAST], 0), 0), [days, desk.calendar]);
  const todayTotal = useMemo(() => desk.calendar.reduce((s, r) => s + r.cells[PAST], 0), [desk.calendar]);
  const future7 = useMemo(() => days.slice(PAST + 1, PAST + 8).reduce((s, d) => s + desk.calendar.reduce((ss, r) => ss + r.cells[d.offset + PAST], 0), 0), [days, desk.calendar]);

  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}33`, padding: 0 }}>
      {/* 헤더 */}
      <div style={{ padding: "12px 18px", borderBottom: `1px solid ${a.accent}22`, background: "#060920", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: a.accent, letterSpacing: "0.08em", marginBottom: 4 }}>
            ● 미션 캘린더
          </p>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8" }}>
            과거 14일 · 오늘 · 앞으로 7일 — 셀을 누르면 자동 보고서가 열립니다
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => showToast("주간 전체 랜지 22일 보고서 생성 중", { color: a.accent, icon: "▤" })}
            style={{ background: "transparent", border: `1px solid ${a.accent}66`, color: a.accent, padding: "5px 12px", fontFamily: FONT_KR, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            전체 보기
          </button>
          <button
            onClick={() => showToast("주간 종합 보고서 생성 중", { color: a.accent, icon: "▨" })}
            className="pixel-frame"
            style={{ background: a.accent, color: "#060920", border: `2px solid ${a.accent}`, boxShadow: `2px 2px 0 ${a.accentDark}`, padding: "5px 12px", fontFamily: FONT_KR, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            ▨ 전체 보고서
          </button>
        </div>
      </div>

      {/* 그리드 */}
      <div style={{ padding: 14, overflowX: "auto" }}>
        <div style={{ minWidth: TOTAL_DAYS * 36 + 100 }}>
          {/* 요일 헤더 */}
          <div style={{ display: "grid", gridTemplateColumns: `120px repeat(${TOTAL_DAYS}, 1fr)`, gap: 2, marginBottom: 4 }}>
            <div />
            {days.map((d) => (
              <button
                key={d.offset}
                onClick={() => setOpenOffset(d.offset)}
                style={{
                  background: "transparent", border: "none",
                  padding: "4px 0",
                  cursor: "pointer",
                  fontFamily: FONT_MONO, fontSize: 10,
                  color: d.isToday ? a.accent : d.isFuture ? "#cfe9ff" : "#7e94c8",
                  fontWeight: d.isToday ? 700 : 500,
                  textAlign: "center",
                  letterSpacing: "0.04em",
                }}
              >
                <div>{d.weekday}</div>
                <div style={{ fontSize: 9, color: d.isToday ? a.accent : "#4a5a8a", marginTop: 2 }}>{d.label}</div>
              </button>
            ))}
          </div>

          {/* 카테고리 행 */}
          {desk.calendar.map((row) => (
            <div key={row.key} style={{ display: "grid", gridTemplateColumns: `120px repeat(${TOTAL_DAYS}, 1fr)`, gap: 2, marginBottom: 2 }}>
              <div style={{ display: "flex", alignItems: "center", padding: "4px 6px" }}>
                <span style={{ fontFamily: FONT_KR, fontSize: 12, color: "#cfe9ff", fontWeight: 500 }}>
                  {row.label}
                </span>
              </div>
              {row.cells.map((count, i) => {
                const offset = i - PAST;
                const isToday = offset === 0;
                const isFuture = offset > 0;
                const isPast = offset < 0;
                const intensity = Math.min(1, count / 8);
                let bg = "transparent", border = "1px solid transparent", color = "#dde7ff";
                if (isPast) {
                  if (count === 0) { bg = "#0f164022"; color = "#4a5a8a"; }
                  else { bg = `rgba(127, 144, 196, ${0.32 + intensity * 0.4})`; color = "#dde7ff"; }
                } else if (isToday) {
                  bg = a.accent;
                  border = `2px solid ${a.accent}`;
                  color = "#060920";
                } else {
                  // future
                  if (count === 0) { bg = "transparent"; border = "1px dashed #1f2a6b"; color = "#4a5a8a"; }
                  else { bg = `${a.accent}${Math.floor(0x22 + intensity * 0x30).toString(16).padStart(2, "0")}`; border = `1px dashed ${a.accent}aa`; color = "#ffffff"; }
                }
                return (
                  <button
                    key={i}
                    onClick={() => setOpenOffset(offset)}
                    style={{
                      background: bg,
                      border,
                      boxShadow: isToday ? `0 0 12px ${a.accent}88` : "none",
                      animation: isToday ? "led-pulse 1.8s infinite" : "none",
                      height: 32,
                      cursor: "pointer",
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                      fontWeight: isToday ? 700 : 500,
                      color,
                      transition: "transform 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                  >
                    {count > 0 ? count : ""}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 푸터 통계 */}
      <div style={{ padding: "10px 18px", borderTop: `1px solid ${a.accent}22`, background: "#060920", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {[
          { label: "지난 7일", count: past7, offset: -1, color: "#7e94c8" },
          { label: "오늘", count: todayTotal, offset: 0, color: a.accent },
          { label: "앞으로 7일", count: future7, offset: 3, color: "#ffd84d" },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setOpenOffset(s.offset)}
            style={{
              background: "transparent", border: "1px solid #1f2a6b",
              padding: "8px 12px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = s.color; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1f2a6b"; }}
          >
            <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", marginBottom: 4 }}>
              {s.label.toUpperCase()}
            </p>
            <p style={{ fontFamily: FONT_KR, fontSize: 17, fontWeight: 700, color: s.color }}>
              {s.count}건
            </p>
          </button>
        ))}
      </div>

      {openOffset !== null && (
        <DayReportModal agentId={agentId} offset={openOffset} onClose={() => setOpenOffset(null)} />
      )}
    </div>
  );
}
