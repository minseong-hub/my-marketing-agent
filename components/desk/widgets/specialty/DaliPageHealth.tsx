"use client";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';
const ACC = "#5ce5ff";

const PAGES = [
  { name: "가을 트렌치 V3",        lcp: 1.4, cvr: 4.2, status: "good" },
  { name: "베이직 라운드 니트",    lcp: 1.8, cvr: 3.8, status: "good" },
  { name: "와이드 슬랙스",          lcp: 2.6, cvr: 2.4, status: "warn" },
  { name: "캐시미어 머플러",        lcp: 1.2, cvr: 5.1, status: "good" },
  { name: "스니커즈 화이트",        lcp: 3.4, cvr: 1.2, status: "bad" },
];

const STATUS_COLOR: Record<string, string> = { good: "#66ff9d", warn: "#ffd84d", bad: "#ff4ec9" };
const STATUS_LABEL: Record<string, string> = { good: "건강", warn: "점검", bad: "개선 필요" };

export function DaliPageHealth() {
  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${ACC}22` }}>
      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${ACC}22`, background: "#060920" }}>
        <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: ACC, letterSpacing: "0.08em" }}>
          🎯 SPECIALTY · 페이지 건강도
        </p>
      </div>
      <div style={{ padding: "0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#060920", borderBottom: `1px solid ${ACC}22` }}>
              <th style={{ textAlign: "left", padding: "10px 14px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", fontWeight: 600 }}>상품</th>
              <th style={{ textAlign: "right", padding: "10px 8px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", fontWeight: 600 }}>LCP</th>
              <th style={{ textAlign: "right", padding: "10px 8px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", fontWeight: 600 }}>전환률</th>
              <th style={{ textAlign: "right", padding: "10px 14px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", fontWeight: 600 }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {PAGES.map((p) => {
              const c = STATUS_COLOR[p.status];
              return (
                <tr key={p.name} style={{ borderBottom: "1px solid #1f2a6b" }}>
                  <td style={{ padding: "10px 14px", fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: FONT_MONO, fontSize: 13, color: p.lcp > 2.5 ? "#ff4ec9" : "#cfe9ff" }}>{p.lcp.toFixed(1)}s</td>
                  <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: FONT_MONO, fontSize: 13, color: p.cvr > 3 ? "#66ff9d" : p.cvr > 2 ? "#ffd84d" : "#ff4ec9", fontWeight: 700 }}>{p.cvr.toFixed(1)}%</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: FONT_KR, fontSize: 12, color: c, fontWeight: 600 }}>● {STATUS_LABEL[p.status]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
