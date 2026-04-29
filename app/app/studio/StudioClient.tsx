"use client";

import Link from "next/link";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';

/**
 * 스튜디오는 비서별 데스크 탭으로 분산되었습니다.
 * 직접 URL 진입 시 적절한 비서로 안내합니다.
 */
export default function StudioClient() {
  return (
    <div style={{ background: "#060920", minHeight: "100vh", color: "#cfe9ff" }}>
      <nav style={{ padding: "10px 20px", borderBottom: "1px solid #1f2a6b", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#060920" }}>
        <span style={{ fontFamily: FONT_PIX, fontSize: 14, color: "#ff4ec9", textShadow: "2px 2px 0 #8a2877" }}>CREWMATE STUDIO</span>
        <Link href="/desk/marky" style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", textDecoration: "none", fontWeight: 500 }}>
          ← 마키 데스크
        </Link>
      </nav>

      <div style={{ padding: "60px 24px", maxWidth: 880, margin: "0 auto" }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, color: "#5ce5ff", marginBottom: 6 }}>
          스튜디오 · 콘텐츠/광고 자동 생성
        </p>
        <h1 style={{ fontFamily: FONT_KR, fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.025em", marginBottom: 14 }}>
          어느 비서에게 부탁할까요?
        </h1>
        <p style={{ fontFamily: FONT_KR, fontSize: 17, color: "#cfe9ff", lineHeight: 1.7, marginBottom: 36 }}>
          카드뉴스는 <b style={{ color: "#ff4ec9" }}>마키</b>가, 광고 소재는 <b style={{ color: "#ffd84d" }}>애디</b>가 담당합니다. 각 비서 데스크의 특화 탭에서 바로 작업하실 수 있어요.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 18 }}>
          <Link
            href="/desk/marky"
            className="pixel-frame"
            style={{
              background: "linear-gradient(135deg, #ff4ec9 0%, #8a2877 100%)",
              border: "2px solid #ff4ec9",
              boxShadow: "6px 6px 0 #8a2877",
              padding: "32px 28px",
              textDecoration: "none",
              display: "block",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translate(-2px, -2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translate(0, 0)"; }}
          >
            <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: "#0a0e27", letterSpacing: "0.08em", marginBottom: 10 }}>
              MARKY · 마케팅 비서
            </p>
            <h2 style={{ fontFamily: FONT_KR, fontSize: 28, fontWeight: 800, color: "#ffffff", marginBottom: 10, letterSpacing: "-0.02em" }}>
              📱 카드뉴스 자동화
            </h2>
            <p style={{ fontFamily: FONT_KR, fontSize: 15, color: "rgba(255,255,255,0.92)", lineHeight: 1.6, marginBottom: 14 }}>
              마키 데스크의 사이드바에서 「🎨 카드뉴스 자동화」 탭을 선택하세요. 6장 카드 + 디자인 + 해시태그까지 한 번에.
            </p>
            <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#0a0e27", fontWeight: 700 }}>
              마키 데스크에서 작업 시작 →
            </p>
          </Link>

          <Link
            href="/desk/addy"
            className="pixel-frame"
            style={{
              background: "linear-gradient(135deg, #ffd84d 0%, #a08820 100%)",
              border: "2px solid #ffd84d",
              boxShadow: "6px 6px 0 #a08820",
              padding: "32px 28px",
              textDecoration: "none",
              display: "block",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translate(-2px, -2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translate(0, 0)"; }}
          >
            <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: "#0a0e27", letterSpacing: "0.08em", marginBottom: 10 }}>
              ADDY · 광고 전문가
            </p>
            <h2 style={{ fontFamily: FONT_KR, fontSize: 28, fontWeight: 800, color: "#0a0e27", marginBottom: 10, letterSpacing: "-0.02em" }}>
              🎯 메타 광고 소재
            </h2>
            <p style={{ fontFamily: FONT_KR, fontSize: 15, color: "rgba(10,14,39,0.85)", lineHeight: 1.6, marginBottom: 14 }}>
              애디 데스크의 사이드바에서 「🎯 광고 소재 제작」 탭. 1:1 / 4:5 / 9:16 세 비율 동시 생성.
            </p>
            <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#0a0e27", fontWeight: 800 }}>
              애디 데스크에서 작업 시작 →
            </p>
          </Link>
        </div>

        <div className="pixel-frame" style={{ background: "#0a0e27", border: "1px dashed #5ce5ff55", padding: 18, marginTop: 28 }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", lineHeight: 1.7 }}>
            💡 결과물은 모두 <Link href="/app/library" style={{ color: "#5ce5ff", textDecoration: "underline" }}>보관함</Link>에 자동 저장됩니다. 좋은 결과는 ★ 표시로 즐겨찾기 해두면 다음에 빠르게 다시 쓸 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
}
