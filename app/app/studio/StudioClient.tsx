"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { CardRenderer } from "@/components/studio/CardRenderer";
import { AdRenderer } from "@/components/studio/AdRenderer";
import type { CardNewsSpec, AdCreativeSpec } from "@/lib/studio/templates";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#060920", border: "1px solid #1f2a6b",
  padding: "10px 12px", fontFamily: FONT_KR, fontSize: 15, color: "#cfe9ff",
  outline: "none", borderRadius: 0, boxSizing: "border-box",
};

type Mode = "cards" | "ads";

async function renderToPng(node: HTMLElement, scale = 1): Promise<Blob | null> {
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(node, {
    backgroundColor: null,
    scale,
    useCORS: true,
    allowTaint: false,
    logging: false,
  });
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png", 0.95);
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
}

export default function StudioClient() {
  const [mode, setMode] = useState<Mode>("cards");

  // ===== 카드뉴스 상태 =====
  const [cardTopic, setCardTopic] = useState("");
  const [cardNotes, setCardNotes] = useState("");
  const [cardSpec, setCardSpec] = useState<(CardNewsSpec & { imagePrompt?: string }) | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardImageLoading, setCardImageLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardLibraryId, setCardLibraryId] = useState<string | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ===== 광고 소재 상태 =====
  const [adTopic, setAdTopic] = useState("");
  const [adGoal, setAdGoal] = useState("");
  const [adNotes, setAdNotes] = useState("");
  const [adSpec, setAdSpec] = useState<(AdCreativeSpec & { imagePrompt?: string }) | null>(null);
  const [adLoading, setAdLoading] = useState(false);
  const [adImageLoading, setAdImageLoading] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [adLibraryId, setAdLibraryId] = useState<string | null>(null);
  const adRefs = useRef<(HTMLDivElement | null)[]>([]);

  // === 카드뉴스 생성 ===
  const generateCards = useCallback(async () => {
    if (!cardTopic.trim()) return;
    setCardLoading(true); setCardError(null); setCardSpec(null); setCardLibraryId(null);
    try {
      const res = await fetch("/api/studio/generate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: cardTopic, notes: cardNotes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCardError(data.error || "생성 실패");
        return;
      }
      setCardSpec(data.spec);
      setCardLibraryId(data.libraryId);
    } catch (e) {
      setCardError(e instanceof Error ? e.message : "네트워크 오류");
    } finally {
      setCardLoading(false);
    }
  }, [cardTopic, cardNotes]);

  // === 카드뉴스 이미지 생성 ===
  const generateCardImage = useCallback(async () => {
    if (!cardSpec?.imagePrompt) return;
    setCardImageLoading(true);
    try {
      const res = await fetch("/api/studio/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: cardSpec.imagePrompt, ratio: "1:1" }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setCardSpec({ ...cardSpec, imageUrl: data.imageUrl });
      } else {
        setCardError(`이미지 생성 폴백: ${data.reason || "API 키 미설정"}. 그라디언트 배경 사용.`);
      }
    } catch (e) {
      setCardError(e instanceof Error ? e.message : "이미지 생성 오류");
    } finally {
      setCardImageLoading(false);
    }
  }, [cardSpec]);

  // === 카드 PNG 다운로드 (개별 또는 전체) ===
  const downloadCard = useCallback(async (idx: number) => {
    const node = cardRefs.current[idx];
    if (!node) return;
    const blob = await renderToPng(node, 1);
    if (blob) downloadBlob(blob, `card-${idx + 1}-${cardSpec?.cards[idx].kind ?? "card"}.png`);
  }, [cardSpec]);

  const downloadAllCards = useCallback(async () => {
    if (!cardSpec) return;
    for (let i = 0; i < cardSpec.cards.length; i++) {
      const node = cardRefs.current[i];
      if (!node) continue;
      const blob = await renderToPng(node, 1);
      if (blob) downloadBlob(blob, `card-${i + 1}-${cardSpec.cards[i].kind}.png`);
      await new Promise((r) => setTimeout(r, 250));
    }
  }, [cardSpec]);

  // === 광고 생성 ===
  const generateAds = useCallback(async () => {
    if (!adTopic.trim()) return;
    setAdLoading(true); setAdError(null); setAdSpec(null); setAdLibraryId(null);
    try {
      const res = await fetch("/api/studio/generate-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: adTopic, goal: adGoal || undefined, notes: adNotes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdError(data.error || "생성 실패");
        return;
      }
      setAdSpec(data.spec);
      setAdLibraryId(data.libraryId);
    } catch (e) {
      setAdError(e instanceof Error ? e.message : "네트워크 오류");
    } finally {
      setAdLoading(false);
    }
  }, [adTopic, adGoal, adNotes]);

  const generateAdImage = useCallback(async () => {
    if (!adSpec?.imagePrompt) return;
    setAdImageLoading(true);
    try {
      const res = await fetch("/api/studio/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: adSpec.imagePrompt, ratio: "1:1" }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setAdSpec({ ...adSpec, imageUrl: data.imageUrl });
      } else {
        setAdError(`이미지 생성 폴백: ${data.reason || "API 키 미설정"}. 그라디언트 배경 사용.`);
      }
    } catch (e) {
      setAdError(e instanceof Error ? e.message : "이미지 생성 오류");
    } finally {
      setAdImageLoading(false);
    }
  }, [adSpec]);

  const downloadAd = useCallback(async (idx: number) => {
    const node = adRefs.current[idx];
    if (!node || !adSpec) return;
    const blob = await renderToPng(node, 1);
    if (blob) downloadBlob(blob, `ad-${adSpec.variants[idx].ratio.replace(":", "x")}.png`);
  }, [adSpec]);

  const downloadAllAds = useCallback(async () => {
    if (!adSpec) return;
    for (let i = 0; i < adSpec.variants.length; i++) {
      const node = adRefs.current[i];
      if (!node) continue;
      const blob = await renderToPng(node, 1);
      if (blob) downloadBlob(blob, `ad-${adSpec.variants[i].ratio.replace(":", "x")}.png`);
      await new Promise((r) => setTimeout(r, 250));
    }
  }, [adSpec]);

  return (
    <div style={{ background: "#060920", minHeight: "100vh", color: "#cfe9ff" }}>
      {/* 상단 nav */}
      <nav style={{ padding: "10px 20px", borderBottom: "1px solid #1f2a6b", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#060920" }}>
        <span style={{ fontFamily: FONT_PIX, fontSize: 14, color: "#ff4ec9", textShadow: "2px 2px 0 #8a2877" }}>CREWMATE STUDIO</span>
        <Link href="/desk/marky" style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", textDecoration: "none", fontWeight: 500 }}>
          ← 마키 데스크
        </Link>
      </nav>

      <div style={{ padding: "24px 20px", maxWidth: 1280, margin: "0 auto" }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, color: "#ff4ec9", marginBottom: 6 }}>
          스튜디오 · 자동 콘텐츠 생성
        </p>
        <h1 style={{ fontFamily: FONT_KR, fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.025em", marginBottom: 10 }}>
          인스타 카드뉴스 + 메타 광고
        </h1>
        <p style={{ fontFamily: FONT_KR, fontSize: 16, color: "#cfe9ff", lineHeight: 1.7, marginBottom: 24 }}>
          주제만 입력하면 마키·애디가 카피 + 디자인 + 이미지를 한 번에 만들어 드립니다. PNG로 즉시 다운로드 가능, 결과물은 자동으로 보관함에 저장됩니다.
        </p>

        {/* 모드 전환 */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, border: "1px solid #1f2a6b" }}>
          {(["cards", "ads"] as Mode[]).map((m) => {
            const active = mode === m;
            const c = m === "cards" ? "#ff4ec9" : "#ffd84d";
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  background: active ? `${c}22` : "transparent",
                  border: "none",
                  borderRight: m === "cards" ? "1px solid #1f2a6b" : "none",
                  borderBottom: active ? `2px solid ${c}` : "2px solid transparent",
                  color: active ? c : "#cfe9ff",
                  fontFamily: FONT_KR, fontSize: 16, fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  textAlign: "left", padding: "14px 18px",
                }}
              >
                <p>{m === "cards" ? "📱 인스타 카드뉴스 (6장)" : "🎯 메타 광고 소재 (3변형)"}</p>
                <p style={{ fontSize: 12, color: active ? c : "#7e94c8", marginTop: 4 }}>
                  {m === "cards" ? "후킹 → 문제 → 해결 → 사례 → 비교 → CTA" : "1:1 피드 / 4:5 세로 / 9:16 스토리"}
                </p>
              </button>
            );
          })}
        </div>

        {/* === 카드뉴스 === */}
        {mode === "cards" && (
          <div>
            {/* 입력 폼 */}
            <div className="pixel-frame" style={{ background: "#0a0e27", border: "1px solid #ff4ec944", padding: 20, marginBottom: 20 }}>
              <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>주제 *</p>
              <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginBottom: 8 }}>
                상품·캠페인·메시지 — 마키가 6장 카드 카피 + 해시태그까지 자동 작성합니다.
              </p>
              <input
                style={inputStyle}
                value={cardTopic}
                onChange={(e) => setCardTopic(e.target.value)}
                placeholder="예: 가을 베이직 라운드 니트 신상 출시 알림"
              />
              <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, color: "#cfe9ff", marginTop: 14, marginBottom: 4 }}>
                추가 메모 (선택)
              </p>
              <textarea
                rows={2}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                value={cardNotes}
                onChange={(e) => setCardNotes(e.target.value)}
                placeholder="톤·각도·금기 사항 등. 비우면 브랜드 보이스 자동 적용."
              />
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                <button
                  onClick={generateCards}
                  disabled={!cardTopic.trim() || cardLoading}
                  className="pixel-frame"
                  style={{
                    background: "#ff4ec9", color: "#060920",
                    border: "2px solid #ff4ec9", boxShadow: "3px 3px 0 #8a2877",
                    padding: "10px 22px",
                    fontFamily: FONT_KR, fontSize: 15, fontWeight: 700,
                    cursor: !cardTopic.trim() || cardLoading ? "not-allowed" : "pointer",
                    opacity: !cardTopic.trim() || cardLoading ? 0.5 : 1,
                  }}
                >
                  {cardLoading ? "마키가 작업 중..." : "▶ 카드뉴스 6장 생성"}
                </button>
                {cardSpec && (
                  <>
                    <button
                      onClick={generateCardImage}
                      disabled={cardImageLoading}
                      style={{
                        background: "transparent", color: "#ff4ec9",
                        border: "1px solid #ff4ec966",
                        padding: "10px 18px",
                        fontFamily: FONT_KR, fontSize: 14, fontWeight: 600,
                        cursor: cardImageLoading ? "not-allowed" : "pointer",
                        opacity: cardImageLoading ? 0.6 : 1,
                      }}
                    >
                      {cardImageLoading ? "이미지 생성 중..." : "🎨 배경 이미지 생성"}
                    </button>
                    <button
                      onClick={downloadAllCards}
                      style={{ background: "transparent", color: "#5ce5ff", border: "1px solid #5ce5ff66", padding: "10px 18px", fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                    >
                      📦 6장 모두 PNG 다운로드
                    </button>
                  </>
                )}
              </div>
              {cardError && (
                <div style={{ marginTop: 12, padding: "10px 14px", border: "1px solid #ffd84d", background: "#ffd84d11", color: "#ffd84d", fontFamily: FONT_KR, fontSize: 13 }}>
                  ⚠ {cardError}
                </div>
              )}
              {cardLibraryId && (
                <p style={{ marginTop: 8, fontFamily: FONT_KR, fontSize: 13, color: "#66ff9d" }}>
                  ✓ 보관함에 저장됨 — <Link href="/app/library" style={{ color: "#5ce5ff", textDecoration: "underline" }}>보관함에서 보기</Link>
                </p>
              )}
            </div>

            {/* 결과 미리보기 */}
            {cardSpec && (
              <>
                <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, color: "#7e94c8", marginBottom: 12 }}>
                  미리보기 (1080×1080 — 화면에서는 축소 표시)
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16, marginBottom: 24 }}>
                  {cardSpec.cards.map((card, i) => (
                    <div key={i} className="pixel-frame" style={{ background: "#0a0e27", border: "1px solid #ff4ec933", padding: 12 }}>
                      <div style={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                        overflow: "hidden",
                        position: "relative",
                        marginBottom: 10,
                      }}>
                        <div style={{
                          position: "absolute", top: 0, left: 0,
                          transform: "scale(0.34)",
                          transformOrigin: "top left",
                        }}>
                          <CardRenderer
                            card={card}
                            brandColor={cardSpec.brandColor}
                            accentColor={cardSpec.accentColor}
                            imageUrl={cardSpec.imageUrl}
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", fontWeight: 600 }}>{card.label}</span>
                        <button
                          onClick={() => downloadCard(i)}
                          style={{ background: "#ff4ec9", color: "#060920", border: "2px solid #ff4ec9", padding: "5px 14px", fontFamily: FONT_KR, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        >
                          PNG
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 캡션 + 해시태그 */}
                <div className="pixel-frame" style={{ background: "#0a0e27", border: "1px solid #5ce5ff44", padding: 18, marginBottom: 16 }}>
                  <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, color: "#5ce5ff", marginBottom: 6 }}>📝 발행 캡션</p>
                  <p style={{ fontFamily: FONT_KR, fontSize: 15, color: "#cfe9ff", lineHeight: 1.7, marginBottom: 12, whiteSpace: "pre-wrap" }}>
                    {cardSpec.caption}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {cardSpec.hashtags.map((h, i) => (
                      <span key={i} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: "#5ce5ff", border: "1px solid #5ce5ff44", padding: "3px 8px" }}>{h}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(cardSpec.caption + "\n\n" + cardSpec.hashtags.join(" "))}
                    style={{ background: "transparent", color: "#5ce5ff", border: "1px solid #5ce5ff66", padding: "6px 14px", fontFamily: FONT_KR, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    📋 캡션 + 해시태그 복사
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* === 광고 소재 === */}
        {mode === "ads" && (
          <div>
            {/* 입력 폼 */}
            <div className="pixel-frame" style={{ background: "#0a0e27", border: "1px solid #ffd84d44", padding: 20, marginBottom: 20 }}>
              <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>주제 *</p>
              <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginBottom: 8 }}>
                광고할 상품·캠페인 — 애디가 1:1 / 4:5 / 9:16 세 변형을 동시에 만듭니다.
              </p>
              <input
                style={inputStyle}
                value={adTopic}
                onChange={(e) => setAdTopic(e.target.value)}
                placeholder="예: 가을 라운드 니트 - 30대 직장 여성 타겟"
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                <div>
                  <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", fontWeight: 600, marginBottom: 4 }}>광고 목적</p>
                  <select
                    style={{ ...inputStyle, cursor: "pointer" }}
                    value={adGoal}
                    onChange={(e) => setAdGoal(e.target.value)}
                  >
                    <option value="">자동 (매출)</option>
                    <option value="매출 증대">매출 증대</option>
                    <option value="신상 출시 알림">신상 출시 알림</option>
                    <option value="브랜드 인지도">브랜드 인지도</option>
                    <option value="앱 다운로드">앱 다운로드</option>
                    <option value="리타겟팅">리타겟팅 (재방문 유도)</option>
                  </select>
                </div>
                <div>
                  <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", fontWeight: 600, marginBottom: 4 }}>추가 메모</p>
                  <input
                    style={inputStyle}
                    value={adNotes}
                    onChange={(e) => setAdNotes(e.target.value)}
                    placeholder="할인율·기간·금기 표현 등"
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                <button
                  onClick={generateAds}
                  disabled={!adTopic.trim() || adLoading}
                  className="pixel-frame"
                  style={{
                    background: "#ffd84d", color: "#060920",
                    border: "2px solid #ffd84d", boxShadow: "3px 3px 0 #a08820",
                    padding: "10px 22px",
                    fontFamily: FONT_KR, fontSize: 15, fontWeight: 700,
                    cursor: !adTopic.trim() || adLoading ? "not-allowed" : "pointer",
                    opacity: !adTopic.trim() || adLoading ? 0.5 : 1,
                  }}
                >
                  {adLoading ? "애디가 작업 중..." : "▶ 광고 소재 3변형 생성"}
                </button>
                {adSpec && (
                  <>
                    <button
                      onClick={generateAdImage}
                      disabled={adImageLoading}
                      style={{
                        background: "transparent", color: "#ffd84d",
                        border: "1px solid #ffd84d66",
                        padding: "10px 18px",
                        fontFamily: FONT_KR, fontSize: 14, fontWeight: 600,
                        cursor: adImageLoading ? "not-allowed" : "pointer",
                        opacity: adImageLoading ? 0.6 : 1,
                      }}
                    >
                      {adImageLoading ? "이미지 생성 중..." : "🎨 배경 이미지 생성"}
                    </button>
                    <button
                      onClick={downloadAllAds}
                      style={{ background: "transparent", color: "#5ce5ff", border: "1px solid #5ce5ff66", padding: "10px 18px", fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                    >
                      📦 3변형 모두 PNG 다운로드
                    </button>
                  </>
                )}
              </div>
              {adError && (
                <div style={{ marginTop: 12, padding: "10px 14px", border: "1px solid #ffd84d", background: "#ffd84d11", color: "#ffd84d", fontFamily: FONT_KR, fontSize: 13 }}>
                  ⚠ {adError}
                </div>
              )}
              {adLibraryId && (
                <p style={{ marginTop: 8, fontFamily: FONT_KR, fontSize: 13, color: "#66ff9d" }}>
                  ✓ 보관함에 저장됨 — <Link href="/app/library" style={{ color: "#5ce5ff", textDecoration: "underline" }}>보관함에서 보기</Link>
                </p>
              )}
            </div>

            {/* 결과 미리보기 */}
            {adSpec && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginBottom: 24 }}>
                {adSpec.variants.map((v, i) => {
                  const aspectStyle = v.ratio === "1:1" ? "1 / 1" : v.ratio === "4:5" ? "4 / 5" : "9 / 16";
                  // 미리보기 스케일 계산
                  const scale = v.ratio === "9:16" ? 0.18 : v.ratio === "4:5" ? 0.27 : 0.34;
                  return (
                    <div key={i} className="pixel-frame" style={{ background: "#0a0e27", border: "1px solid #ffd84d33", padding: 12 }}>
                      <p style={{ fontFamily: FONT_KR, fontSize: 12, fontWeight: 700, color: "#ffd84d", marginBottom: 6 }}>
                        {v.ratio === "1:1" ? "📱 피드 정방형" : v.ratio === "4:5" ? "📐 피드 세로" : "📲 스토리·릴스"} · {v.ratio}
                      </p>
                      <div style={{
                        width: "100%",
                        aspectRatio: aspectStyle,
                        overflow: "hidden",
                        position: "relative",
                        marginBottom: 10,
                        background: "#060920",
                      }}>
                        <div style={{
                          position: "absolute", top: 0, left: 0,
                          transform: `scale(${scale})`,
                          transformOrigin: "top left",
                        }}>
                          <AdRenderer
                            variant={v}
                            brandName={adSpec.brandName}
                            brandColor={adSpec.brandColor}
                            accentColor={adSpec.accentColor}
                            imageUrl={adSpec.imageUrl}
                          />
                        </div>
                      </div>
                      <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>{v.headline}</p>
                      <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", lineHeight: 1.5, marginBottom: 8 }}>{v.body}</p>
                      <button
                        onClick={() => downloadAd(i)}
                        style={{ width: "100%", background: "#ffd84d", color: "#060920", border: "2px solid #ffd84d", padding: "6px", fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                      >
                        PNG 다운로드
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* off-screen 1080×1080 정확한 크기 렌더 영역 — html2canvas는 실제 크기로 캡처 */}
      <div style={{ position: "fixed", top: -99999, left: -99999, pointerEvents: "none" }} aria-hidden="true">
        {cardSpec && cardSpec.cards.map((card, i) => (
          <CardRenderer
            key={`raw-${i}`}
            ref={(el) => { cardRefs.current[i] = el; }}
            card={card}
            brandColor={cardSpec.brandColor}
            accentColor={cardSpec.accentColor}
            imageUrl={cardSpec.imageUrl}
          />
        ))}
        {adSpec && adSpec.variants.map((v, i) => (
          <AdRenderer
            key={`raw-ad-${i}`}
            ref={(el) => { adRefs.current[i] = el; }}
            variant={v}
            brandName={adSpec.brandName}
            brandColor={adSpec.brandColor}
            accentColor={adSpec.accentColor}
            imageUrl={adSpec.imageUrl}
          />
        ))}
      </div>
    </div>
  );
}
