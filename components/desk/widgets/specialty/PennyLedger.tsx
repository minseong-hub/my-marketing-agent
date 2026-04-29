"use client";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';
const ACC = "#66ff9d";

const ROWS = [
  { date: "04/29", channel: "스마트스토어 정산", amount: 4_280_000, type: "in", matched: true },
  { date: "04/29", channel: "Meta 광고비", amount: -480_000, type: "out", matched: true },
  { date: "04/28", channel: "카페24 정산", amount: 1_120_000, type: "in", matched: true },
  { date: "04/28", channel: "공급사 매입대금", amount: -2_400_000, type: "out", matched: true },
  { date: "04/27", channel: "스마트스토어 정산", amount: 12_800, type: "in", matched: false },
  { date: "04/27", channel: "Google 광고비", amount: -220_000, type: "out", matched: true },
  { date: "04/26", channel: "스마트스토어 정산", amount: 43_200, type: "in", matched: false },
  { date: "04/26", channel: "물류·CJ", amount: -342_000, type: "out", matched: true },
];

export function PennyLedger() {
  const total = ROWS.reduce((s, r) => s + r.amount, 0);
  const inSum = ROWS.filter(r => r.type === "in").reduce((s, r) => s + r.amount, 0);
  const outSum = Math.abs(ROWS.filter(r => r.type === "out").reduce((s, r) => s + r.amount, 0));

  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${ACC}22` }}>
      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${ACC}22`, background: "#060920" }}>
        <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: ACC, letterSpacing: "0.08em" }}>
          🎯 SPECIALTY · 자동 정산 매칭 · 실시간 장부
        </p>
      </div>

      {/* 요약 */}
      <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, borderBottom: `1px solid ${ACC}22`, background: "#060920" }}>
        <div>
          <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", marginBottom: 4 }}>입금 (4월)</p>
          <p style={{ fontFamily: FONT_KR, fontSize: 17, fontWeight: 800, color: "#66ff9d" }}>+₩{inSum.toLocaleString()}</p>
        </div>
        <div>
          <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", marginBottom: 4 }}>출금 (4월)</p>
          <p style={{ fontFamily: FONT_KR, fontSize: 17, fontWeight: 800, color: "#ff4ec9" }}>-₩{outSum.toLocaleString()}</p>
        </div>
        <div>
          <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", marginBottom: 4 }}>순이익</p>
          <p style={{ fontFamily: FONT_KR, fontSize: 17, fontWeight: 800, color: total > 0 ? "#66ff9d" : "#ff4ec9" }}>{total > 0 ? "+" : ""}₩{Math.abs(total).toLocaleString()}</p>
        </div>
      </div>

      {/* 거래 표 */}
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#060920", borderBottom: `1px solid ${ACC}22` }}>
              <th style={{ textAlign: "left", padding: "10px 14px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", fontWeight: 600 }}>날짜</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", fontWeight: 600 }}>채널</th>
              <th style={{ textAlign: "right", padding: "10px 8px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", fontWeight: 600 }}>금액</th>
              <th style={{ textAlign: "right", padding: "10px 14px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", fontWeight: 600 }}>매칭</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #1f2a6b" }}>
                <td style={{ padding: "8px 14px", fontFamily: FONT_MONO, fontSize: 12, color: "#7e94c8" }}>{r.date}</td>
                <td style={{ padding: "8px 8px", fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff" }}>{r.channel}</td>
                <td style={{ padding: "8px 8px", textAlign: "right", fontFamily: FONT_MONO, fontSize: 13, color: r.amount > 0 ? "#66ff9d" : "#ff4ec9", fontWeight: 700 }}>
                  {r.amount > 0 ? "+" : ""}₩{Math.abs(r.amount).toLocaleString()}
                </td>
                <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: FONT_KR, fontSize: 12, color: r.matched ? "#66ff9d" : "#ffd84d", fontWeight: 600 }}>
                  {r.matched ? "● 매칭" : "⚠ 미매칭"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
