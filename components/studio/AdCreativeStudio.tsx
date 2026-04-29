"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { AdRenderer } from "./AdRenderer";
import type { AdCreativeSpec } from "@/lib/studio/templates";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const ACC = "#ffd84d";
const ACC_DARK = "#a08820";

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
 * 애디 데스크 광고 소재 제작 탭에 임베드되는 위젯.
 * 메타 광고 1:1 / 4:5 / 9:16 — 입력 → AI 카피 3변형 → 디자인 → PNG 다운로드.
 */
export function AdCreativeStudio() {
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [notes, setNotes] = useState("");
  const [spec, setSpec] = useState<(AdCreativeSpec & { imagePrompt?: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libraryId, setLibraryId] = useState<string | null>(null);
  const adRefs = useRef<(HTMLDivElement | null)[]>([]);

  const generate = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true); setError(null); setSpec(null); setLibraryId(null);
    try {
      const res = await fetch("/api/studio/generate-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, goal: goal || undefined, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "생성 실패"); return; }
      setSpec(data.spec); setLibraryId(data.libraryId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "네트워크 오류");
    } finally { setLoading(false); }
  }, [topic, goal, notes]);

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
    const node = adRefs.current[idx];
    if (!node || !spec) return;
    const blob = await renderToPng(node, 1);
    if (blob) downloadBlob(blob, `ad-${spec.variants[idx].ratio.replace(":", "x")}.png`);
  }, [spec]);

  const downloadAll = useCallback(async () => {
    if (!spec) return;
    for (let i = 0; i < spec.variants.length; i++) {
      const node = adRefs.current[i];
      if (!node) continue;
      const blob = await renderToPng(node, 1);
      if (blob) downloadBlob(blob, `ad-${spec.variants[i].ratio.replace(":", "x")}.png`);
      await new Promise((r) => setTimeout(r, 250));
    }
  }, [spec]);

  return (
    <div>
      {/* 입력 폼 */}
      <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${ACC}44`, padding: 20, marginBottom: 20 }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>주제 *</p>
        <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginBottom: 8 }}>
          광고할 상품·캠페인 — 애디가 1:1 / 4:5 / 9:16 세 변형을 동시에 만듭니다.
        </p>
        <input
          style={inputStyle}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="예: 가을 라운드 니트 - 30대 직장 여성 타겟"
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          <div>
            <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", fontWeight: 600, marginBottom: 4 }}>광고 목적</p>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="할인율·기간·금기 표현 등"
            />
          </div>
        </div>
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
            {loading ? "애디가 작업 중..." : "▶ 광고 소재 3변형 생성"}
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
                📦 3변형 모두 PNG 다운로드
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginBottom: 24 }}>
          {spec.variants.map((v, i) => {
            const aspectStyle = v.ratio === "1:1" ? "1 / 1" : v.ratio === "4:5" ? "4 / 5" : "9 / 16";
            const scale = v.ratio === "9:16" ? 0.16 : v.ratio === "4:5" ? 0.24 : 0.30;
            return (
              <div key={i} className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${ACC}33`, padding: 12 }}>
                <p style={{ fontFamily: FONT_KR, fontSize: 12, fontWeight: 700, color: ACC, marginBottom: 6 }}>
                  {v.ratio === "1:1" ? "📱 피드 정방형" : v.ratio === "4:5" ? "📐 피드 세로" : "📲 스토리·릴스"} · {v.ratio}
                </p>
                <div style={{
                  width: "100%", aspectRatio: aspectStyle,
                  overflow: "hidden", position: "relative",
                  marginBottom: 10, background: "#060920",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0,
                    transform: `scale(${scale})`, transformOrigin: "top left",
                  }}>
                    <AdRenderer
                      variant={v}
                      brandName={spec.brandName}
                      brandColor={spec.brandColor}
                      accentColor={spec.accentColor}
                      imageUrl={spec.imageUrl}
                    />
                  </div>
                </div>
                <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>{v.headline}</p>
                <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", lineHeight: 1.5, marginBottom: 8 }}>{v.body}</p>
                <button
                  onClick={() => downloadOne(i)}
                  style={{ width: "100%", background: ACC, color: "#060920", border: `2px solid ${ACC}`, padding: "6px", fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  PNG 다운로드
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* off-screen 정확한 크기 노드 — 캡처 전용 */}
      <div style={{ position: "fixed", top: -99999, left: -99999, pointerEvents: "none" }} aria-hidden="true">
        {spec && spec.variants.map((v, i) => (
          <AdRenderer
            key={`raw-${i}`}
            ref={(el) => { adRefs.current[i] = el; }}
            variant={v}
            brandName={spec.brandName}
            brandColor={spec.brandColor}
            accentColor={spec.accentColor}
            imageUrl={spec.imageUrl}
          />
        ))}
      </div>
    </div>
  );
}
