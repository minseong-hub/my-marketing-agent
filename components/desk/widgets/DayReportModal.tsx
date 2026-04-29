"use client";

import { useEffect } from "react";
import { DESKS, type DeskAgentId } from "@/data/desks";
import { getReport } from "@/data/dayReports";
import { showToast } from "../ToastHost";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

export function DayReportModal({
  agentId,
  offset,
  onClose,
}: {
  agentId: DeskAgentId;
  offset: number;
  onClose: () => void;
}) {
  const desk = DESKS[agentId];
  const a = desk.agent;
  const report = getReport(agentId, offset, desk.calendar);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const statusLabel =
    report.status === "past" ? `▤ ${Math.abs(offset)}일 전 · 자동 완료`
    : report.status === "today" ? `● 오늘 · 실시간`
    : `▶ ${offset}일 후 · 예약`;

  const statusColor =
    report.status === "past" ? "#7e94c8"
    : report.status === "today" ? a.accent
    : "#ffd84d";

  const date = new Date();
  date.setDate(date.getDate() + offset);
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} (${"일월화수목금토"[date.getDay()]})`;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(6, 9, 32, 0.78)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pixel-frame"
        style={{
          background: "#0a0e27",
          border: `2px solid ${a.accent}`,
          boxShadow: `8px 8px 0 ${a.accentDark}`,
          width: "min(720px, 100%)",
          maxHeight: "86vh",
          overflow: "auto",
        }}
      >
        {/* 헤더 */}
        <div style={{
          padding: "16px 22px",
          borderBottom: `1px solid ${a.accent}33`,
          background: "#060920",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
        }}>
          <div>
            <p style={{
              fontFamily: FONT_MONO, fontSize: 11, color: statusColor,
              letterSpacing: "0.12em", fontWeight: 600, marginBottom: 4,
              animation: report.status === "today" ? "blink 1.5s steps(2) infinite" : "none",
            }}>
              {statusLabel}
            </p>
            <p style={{ fontFamily: FONT_MONO, fontSize: 12, color: "#7e94c8", marginBottom: 6 }}>
              {dateStr}
            </p>
            <h2 style={{ fontFamily: FONT_KR, fontSize: 18, fontWeight: 800, color: "#cfe9ff", lineHeight: 1.3 }}>
              {a.name}의 보고서
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: `1px solid ${a.accent}66`,
              color: a.accent,
              padding: "6px 10px",
              fontFamily: FONT_MONO, fontSize: 11,
              cursor: "pointer", flexShrink: 0,
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = a.accent; (e.currentTarget as HTMLElement).style.color = "#060920"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = a.accent; }}
          >
            ✕ ESC
          </button>
        </div>

        {/* 본문 */}
        <div style={{ padding: "20px 22px" }}>
          {/* 핵심 요약 */}
          <section style={{ marginBottom: 22 }}>
            <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: a.accent, letterSpacing: "0.12em", marginBottom: 8 }}>
              ▸ 핵심 요약
            </p>
            <p style={{ fontFamily: FONT_KR, fontSize: 19, fontWeight: 700, color: "#ffffff", lineHeight: 1.4, marginBottom: 8 }}>
              {report.headline}
            </p>
            <p style={{ fontFamily: FONT_KR, fontSize: 15, color: "#cfe9ff", lineHeight: 1.7 }}>
              {report.summary}
            </p>
          </section>

          {/* 카테고리별 작업 */}
          {report.byCategory.some((c) => c.count > 0) && (
            <section style={{ marginBottom: 22 }}>
              <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: a.accent, letterSpacing: "0.12em", marginBottom: 10 }}>
                ▸ 카테고리별 작업
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {report.byCategory.filter(c => c.count > 0).map((c) => (
                  <div key={c.label} style={{ background: "#060920", border: `1px solid ${a.accent}22`, padding: "8px 12px" }}>
                    <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", fontWeight: 600 }}>{c.label}</p>
                    <p style={{ fontFamily: FONT_MONO, fontSize: 12, color: a.accent, marginTop: 2 }}>{c.note}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 완료 / 진행 */}
          {(report.done.length > 0 || report.inProgress.length > 0) && (
            <section style={{ marginBottom: 22 }}>
              <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: a.accent, letterSpacing: "0.12em", marginBottom: 10 }}>
                ▣ {report.status === "today" ? "진행 중" : report.status === "past" ? "완료" : "예약 등록"}
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(report.status === "today" ? report.inProgress : report.done).map((item, i) => (
                  <li key={i} style={{ borderLeft: `3px solid #66ff9d`, paddingLeft: 10, fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", lineHeight: 1.6 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 지표 */}
          <section style={{ marginBottom: 22 }}>
            <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: a.accent, letterSpacing: "0.12em", marginBottom: 10 }}>
              ▥ 지표
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {report.metrics.map((m) => (
                <div key={m.key} style={{ background: "#060920", border: "1px solid #1f2a6b", padding: 10 }}>
                  <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.1em", marginBottom: 4 }}>
                    {m.key.toUpperCase()}
                  </p>
                  <p style={{ fontFamily: FONT_KR, fontSize: 17, fontWeight: 700, color: "#cfe9ff" }}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 다음 */}
          <section style={{ marginBottom: 8 }}>
            <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: a.accent, letterSpacing: "0.12em", marginBottom: 10 }}>
              ▸ 다음
            </p>
            <div style={{ border: `1px dashed ${a.accent}66`, padding: 12 }}>
              <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {report.next.map((n, i) => (
                  <li key={i} style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", lineHeight: 1.6 }}>
                    · {n}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* 푸터 */}
        <div style={{
          padding: "14px 22px",
          borderTop: `1px solid ${a.accent}22`,
          background: "#060920",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#4a5a8a", letterSpacing: "0.1em" }}>
            AUTO-GENERATED · {a.englishName.toUpperCase()} · CREWMATE AI
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => showToast(`${dateStr} 보고서 PDF 다운로드 완료`, { color: a.accent, icon: "▤" })}
              style={{ background: "transparent", border: `1px solid ${a.accent}66`, color: a.accent, padding: "6px 14px", fontFamily: FONT_KR, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              ▤ PDF 내보내기
            </button>
            <button
              onClick={() => { showToast("함장님께 보고서 전송 완료", { color: a.accent, icon: "✉" }); setTimeout(onClose, 400); }}
              className="pixel-frame"
              style={{ background: a.accent, color: "#060920", border: `2px solid ${a.accent}`, boxShadow: `3px 3px 0 ${a.accentDark}`, padding: "6px 14px", fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              ✉ 함장님께 공유
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
