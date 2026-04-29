"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { CardRenderer } from "./CardRenderer";
import type { CardNewsSpec } from "@/lib/studio/templates";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const ACC = "#ff4ec9";
const ACC_DARK = "#8a2877";

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#060920", border: "1px solid #1f2a6b",
  padding: "10px 12px", fontFamily: FONT_KR, fontSize: 15, color: "#cfe9ff",
  outline: "none", borderRadius: 0, boxSizing: "border-box",
};

async function renderToPng(node: HTMLElement, scale = 1): Promise<Blob | null> {
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(node, {
    backgroundColor: null, scale, useCORS: true, allowTaint: false, logging: false,
  });
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png", 0.95);
  });
}
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
}

/**
 * 마키 데스크 카드뉴스 자동화 탭에 임베드되는 위젯.
 * 인스타 1080×1080 카드뉴스 6장 — 입력 → AI 카피 → 디자인 → PNG 다운로드 → 보관함 저장.
 */
export function CardNewsStudio() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [spec, setSpec] = useState<(CardNewsSpec & { imagePrompt?: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libraryId, setLibraryId] = useState<string | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const generate = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true); setError(null); setSpec(null); setLibraryId(null);
    try {
      const res = await fetch("/api/studio/generate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "생성 실패"); return; }
      setSpec(data.spec); setLibraryId(data.libraryId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "네트워크 오류");
    } finally { setLoading(false); }
  }, [topic, notes]);

  const generateImage = useCallback(async () => {
    if (!spec?.imagePrompt) return;
    setImageLoading(true);
    try {
      const res = await fetch("/api/studio/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: spec.imagePrompt, ratio: "1:1" }),
      });
      const data = await res.json();
      if (data.imageUrl) setSpec({ ...spec, imageUrl: data.imageUrl });
      else setError(`이미지 생성 폴백: ${data.reason || "API 키 미설정"}. 그라디언트 배경 사용.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "이미지 생성 오류");
    } finally { setImageLoading(false); }
  }, [spec]);

  const downloadOne = useCallback(async (idx: number) => {
    const node = cardRefs.current[idx];
    if (!node || !spec) return;
    const blob = await renderToPng(node, 1);
    if (blob) downloadBlob(blob, `card-${idx + 1}-${spec.cards[idx].kind}.png`);
  }, [spec]);

  const downloadAll = useCallback(async () => {
    if (!spec) return;
    for (let i = 0; i < spec.cards.length; i++) {
      const node = cardRefs.current[i];
      if (!node) continue;
      const blob = await renderToPng(node, 1);
      if (blob) downloadBlob(blob, `card-${i + 1}-${spec.cards[i].kind}.png`);
      await new Promise((r) => setTimeout(r, 250));
    }
  }, [spec]);

  return (
    <div>
      {/* 입력 폼 */}
      <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${ACC}44`, padding: 20, marginBottom: 20 }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>주제 *</p>
        <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginBottom: 8 }}>
          상품·캠페인·메시지 — 마키가 6장 카드 카피 + 해시태그까지 자동 작성합니다.
        </p>
        <input
          style={inputStyle}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="예: 가을 베이직 라운드 니트 신상 출시 알림"
        />
        <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, color: "#cfe9ff", marginTop: 14, marginBottom: 4 }}>
          추가 메모 (선택)
        </p>
        <textarea
          rows={2}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="톤·각도·금기 사항 등. 비우면 브랜드 보이스 자동 적용."
        />
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <button
            onClick={generate}
            disabled={!topic.trim() || loading}
            className="pixel-frame"
            style={{
              background: ACC, color: "#060920",
              border: `2px solid ${ACC}`, boxShadow: `3px 3px 0 ${ACC_DARK}`,
              padding: "10px 22px",
              fontFamily: FONT_KR, fontSize: 15, fontWeight: 700,
              cursor: !topic.trim() || loading ? "not-allowed" : "pointer",
              opacity: !topic.trim() || loading ? 0.5 : 1,
            }}
          >
            {loading ? "마키가 작업 중..." : "▶ 카드뉴스 6장 생성"}
          </button>
          {spec && (
            <>
              <button
                onClick={generateImage}
                disabled={imageLoading}
                style={{
                  background: "transparent", color: ACC,
                  border: `1px solid ${ACC}66`,
                  padding: "10px 18px",
                  fontFamily: FONT_KR, fontSize: 14, fontWeight: 600,
                  cursor: imageLoading ? "not-allowed" : "pointer",
                  opacity: imageLoading ? 0.6 : 1,
                }}
              >
                {imageLoading ? "이미지 생성 중..." : "🎨 배경 이미지 생성"}
              </button>
              <button
                onClick={downloadAll}
                style={{ background: "transparent", color: "#5ce5ff", border: "1px solid #5ce5ff66", padding: "10px 18px", fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                📦 6장 모두 PNG 다운로드
              </button>
            </>
          )}
        </div>
        {error && (
          <div style={{ marginTop: 12, padding: "10px 14px", border: "1px solid #ffd84d", background: "#ffd84d11", color: "#ffd84d", fontFamily: FONT_KR, fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}
        {libraryId && (
          <p style={{ marginTop: 8, fontFamily: FONT_KR, fontSize: 13, color: "#66ff9d" }}>
            ✓ 보관함에 저장됨 — <Link href="/app/library" style={{ color: "#5ce5ff", textDecoration: "underline" }}>보관함에서 보기</Link>
          </p>
        )}
      </div>

      {/* 결과 미리보기 */}
      {spec && (
        <>
          <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, color: "#7e94c8", marginBottom: 12 }}>
            미리보기 (1080×1080 — 화면에서는 축소 표시)
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginBottom: 24 }}>
            {spec.cards.map((card, i) => (
              <div key={i} className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${ACC}33`, padding: 12 }}>
                <div style={{
                  width: "100%", aspectRatio: "1 / 1",
                  overflow: "hidden", position: "relative", marginBottom: 10,
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0,
                    transform: "scale(0.30)", transformOrigin: "top left",
                  }}>
                    <CardRenderer
                      card={card}
                      brandColor={spec.brandColor}
                      accentColor={spec.accentColor}
                      imageUrl={spec.imageUrl}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", fontWeight: 600 }}>{card.label}</span>
                  <button
                    onClick={() => downloadOne(i)}
                    style={{ background: ACC, color: "#060920", border: `2px solid ${ACC}`, padding: "5px 14px", fontFamily: FONT_KR, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
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
              {spec.caption}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {spec.hashtags.map((h, i) => (
                <span key={i} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: "#5ce5ff", border: "1px solid #5ce5ff44", padding: "3px 8px" }}>{h}</span>
              ))}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(spec.caption + "\n\n" + spec.hashtags.join(" "))}
              style={{ background: "transparent", color: "#5ce5ff", border: "1px solid #5ce5ff66", padding: "6px 14px", fontFamily: FONT_KR, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              📋 캡션 + 해시태그 복사
            </button>
          </div>
        </>
      )}

      {/* off-screen 1080 정확한 크기 노드 — 캡처 전용 */}
      <div style={{ position: "fixed", top: -99999, left: -99999, pointerEvents: "none" }} aria-hidden="true">
        {spec && spec.cards.map((card, i) => (
          <CardRenderer
            key={`raw-${i}`}
            ref={(el) => { cardRefs.current[i] = el; }}
            card={card}
            brandColor={spec.brandColor}
            accentColor={spec.accentColor}
            imageUrl={spec.imageUrl}
          />
        ))}
      </div>
    </div>
  );
}
