"use client";

import { Bar } from "@/components/primitives/Bar";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';
const ACC = "#ff4ec9";

const HOURS_HEATMAP: number[] = [
  // 0~23시 (각 시간 평균 참여율 0~100)
  8, 6, 4, 3, 2, 3, 6, 12, 22, 28, 32, 36,
  44, 48, 52, 60, 68, 76, 88, 92, 84, 64, 36, 18,
];

export function MarkyAudience() {
  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${ACC}22` }}>
      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${ACC}22`, background: "#060920" }}>
        <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: ACC, letterSpacing: "0.08em" }}>
          🎯 SPECIALTY · 오디언스 · 시간대별 참여율
        </p>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", marginBottom: 12 }}>
          최근 30일 평균. 18~20시가 황금 시간대 — 콘텐츠 발행 자동 우선순위에 반영됩니다.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 2, marginBottom: 8 }}>
          {HOURS_HEATMAP.map((v, h) => (
            <div key={h} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{
                height: 60,
                width: "100%",
                background: `${ACC}${Math.floor(0x14 + (v / 100) * 0xc0).toString(16).padStart(2, "0")}`,
                border: `1px solid ${v > 70 ? ACC : "transparent"}`,
                position: "relative",
              }} title={`${h}시 · ${v}%`}>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${v}%`, background: ACC, opacity: 0.6 }} />
              </div>
              {(h % 6 === 0) && (
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#7e94c8" }}>{h}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", marginBottom: 8 }}>
              팔로워 성장 · 7일
            </p>
            <Bar v={82} c={ACC} label="인스타그램 +1,420" segments={14} />
            <Bar v={64} c={ACC} label="스레드 +680" segments={14} />
            <Bar v={42} c={ACC} label="블로그 +210" segments={14} />
          </div>
          <div>
            <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", marginBottom: 8 }}>
              주요 관심사
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {["#가을룩", "#데일리룩", "#오피스룩", "#직장인패션", "#가성비코디", "#한국브랜드"].map(t => (
                <span key={t} style={{ fontFamily: FONT_MONO, fontSize: 11, color: ACC, border: `1px solid ${ACC}55`, padding: "3px 8px" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
