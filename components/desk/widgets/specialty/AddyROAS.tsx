"use client";

import { useState } from "react";
import { showToast } from "../../ToastHost";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';
const ACC = "#ffd84d";

const CAMPAIGNS = [
  { name: "Meta · 가을 신상", spend: 480000, roas: 4.2, ctr: 2.8, status: "good" as const },
  { name: "Google · 브랜드 키워드", spend: 220000, roas: 6.8, ctr: 4.1, status: "good" as const },
  { name: "Meta · 리타겟 30일", spend: 360000, roas: 3.1, ctr: 1.9, status: "good" as const },
  { name: "Google · 쇼핑 전상품", spend: 540000, roas: 2.4, ctr: 1.4, status: "warn" as const },
  { name: "Meta · 신규 콜렉션 #7", spend: 180000, roas: 1.2, ctr: 0.8, status: "bad" as const },
  { name: "Naver SA · 일반키워드", spend: 280000, roas: 1.8, ctr: 2.2, status: "warn" as const },
];

const STATUS_COLOR = { good: "#66ff9d", warn: "#ffd84d", bad: "#ff4ec9" };
const STATUS_LABEL = { good: "유지", warn: "주시", bad: "정지 후보" };

export function AddyROAS() {
  const [budget, setBudget] = useState(6000000);
  const used = 4200000;
  const usedPct = Math.round((used / budget) * 100);

  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${ACC}22` }}>
      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${ACC}22`, background: "#060920" }}>
        <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: ACC, letterSpacing: "0.08em" }}>
          🎯 SPECIALTY · 활성 캠페인 · ROAS
        </p>
      </div>

      {/* 예산 슬라이더 */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${ACC}22`, background: "#060920" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", fontWeight: 600 }}>월 광고 예산</span>
          <span style={{ fontFamily: FONT_KR, fontSize: 13, color: ACC, fontWeight: 700 }}>
            ₩{used.toLocaleString()} / ₩{budget.toLocaleString()} ({usedPct}%)
          </span>
        </div>
        <input
          type="range"
          min={1000000}
          max={20000000}
          step={500000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          onMouseUp={() => showToast(`월 광고 예산 ₩${budget.toLocaleString()}로 조정 — 채널별 자동 재분배`, { color: ACC, icon: "▤" })}
          style={{ width: "100%", accentColor: ACC }}
        />
        <div style={{ marginTop: 8, height: 6, background: "#0a0e27", border: `1px solid ${ACC}44` }}>
          <div style={{ height: "100%", width: `${usedPct}%`, background: usedPct > 80 ? "#ff4ec9" : ACC }} />
        </div>
      </div>

      {/* 캠페인 표 */}
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#060920", borderBottom: `1px solid ${ACC}22` }}>
              <th style={{ textAlign: "left", padding: "10px 14px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", fontWeight: 600 }}>캠페인</th>
              <th style={{ textAlign: "right", padding: "10px 8px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", fontWeight: 600 }}>지출</th>
              <th style={{ textAlign: "right", padding: "10px 8px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", fontWeight: 600 }}>ROAS</th>
              <th style={{ textAlign: "right", padding: "10px 8px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", fontWeight: 600 }}>CTR</th>
              <th style={{ textAlign: "right", padding: "10px 14px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", fontWeight: 600 }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {CAMPAIGNS.map((c) => {
              const sc = STATUS_COLOR[c.status];
              return (
                <tr key={c.name} style={{ borderBottom: "1px solid #1f2a6b" }}>
                  <td style={{ padding: "10px 14px", fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: FONT_MONO, fontSize: 12, color: "#cfe9ff" }}>₩{c.spend.toLocaleString()}</td>
                  <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: FONT_MONO, fontSize: 13, color: c.roas >= 3 ? "#66ff9d" : c.roas >= 2 ? "#ffd84d" : "#ff4ec9", fontWeight: 700 }}>{c.roas.toFixed(1)}x</td>
                  <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: FONT_MONO, fontSize: 12, color: "#cfe9ff" }}>{c.ctr.toFixed(1)}%</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: FONT_KR, fontSize: 12, color: sc, fontWeight: 600 }}>● {STATUS_LABEL[c.status]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
