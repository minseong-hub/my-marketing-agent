"use client";

import { useId } from "react";
import type { EditableCard } from "@/lib/studio/card-types";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_MONO = '"JetBrains Mono", monospace';

const CANVAS_W = 540;
const CANVAS_H = 540;

/** SVG 패턴 오버레이 — 캔버스 전체에 absolute로 깔리는 레이어 */
function PatternOverlay({ kind, accentColor }: { kind: string; accentColor: string }) {
  const uid = useId().replace(/:/g, "");
  if (kind === "none" || !kind) return null;

  if (kind === "dots") {
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.18 }}>
        <defs>
          <pattern id={`p-dots-${uid}`} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="1.4" fill={accentColor} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p-dots-${uid})`} />
      </svg>
    );
  }

  if (kind === "grid") {
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.16 }}>
        <defs>
          <pattern id={`p-grid-${uid}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke={accentColor} strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p-grid-${uid})`} />
      </svg>
    );
  }

  if (kind === "noise") {
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.12, mixBlendMode: "overlay" }}>
        <defs>
          <filter id={`p-noise-${uid}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#p-noise-${uid})`} />
      </svg>
    );
  }

  if (kind === "gradient_mesh") {
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.55, mixBlendMode: "screen" }}>
        <defs>
          <radialGradient id={`p-mesh-a-${uid}`} cx="20%" cy="20%" r="55%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.65" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`p-mesh-b-${uid}`} cx="85%" cy="80%" r="55%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p-mesh-a-${uid})`} />
        <rect width="100%" height="100%" fill={`url(#p-mesh-b-${uid})`} />
      </svg>
    );
  }

  return null;
}

/** 카드 1장 캔버스 렌더러 — 1080×1080의 1/2 스케일 미리보기 */
export function CardCanvas({ card }: { card: EditableCard }) {
  const { design, effects, background, text } = card;
  const palette = design.palette;
  const fontScale = design.fontScale;

  // 배경
  let bgStyle: React.CSSProperties = { background: palette.bg };
  if (background.kind === "color" && background.color) bgStyle = { background: background.color };
  if (background.kind === "gradient") {
    bgStyle = { background: `linear-gradient(135deg, ${background.gradientFrom ?? palette.bg}, ${background.gradientTo ?? palette.accent})` };
  }
  if (background.kind === "image" && background.image) {
    bgStyle = {
      backgroundImage: `linear-gradient(rgba(0,0,0,${background.imageOverlay ?? 0.4}), rgba(0,0,0,${background.imageOverlay ?? 0.4})), url(${background.image})`,
      backgroundSize: "cover", backgroundPosition: "center",
    };
  }

  // 효과
  const glow = effects.glow ? `0 0 ${20 * effects.glow.intensity}px ${effects.glow.color}` : undefined;
  const stroke = effects.stroke ? `-${effects.stroke.width}px 0 ${effects.stroke.color}, ${effects.stroke.width}px 0 ${effects.stroke.color}, 0 -${effects.stroke.width}px ${effects.stroke.color}, 0 ${effects.stroke.width}px ${effects.stroke.color}` : undefined;

  // 레이아웃별 위치
  let alignItems = "center";
  let justifyContent = "center";
  let textAlign: React.CSSProperties["textAlign"] = "center";
  if (design.layout === "left_align") { alignItems = "flex-start"; justifyContent = "center"; textAlign = "left"; }
  if (design.layout === "split_top") { justifyContent = "flex-start"; }
  if (design.layout === "split_bottom") { justifyContent = "flex-end"; }

  return (
    <div
      style={{
        width: CANVAS_W, height: CANVAS_H,
        display: "flex", flexDirection: "column",
        alignItems, justifyContent,
        padding: 36,
        boxSizing: "border-box",
        position: "relative",
        boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
        ...bgStyle,
      }}
    >
      {/* 패턴 오버레이 */}
      <PatternOverlay kind={effects.pattern ?? "none"} accentColor={palette.accent} />

      {/* 페이지 번호 */}
      <div style={{ position: "absolute", top: 16, right: 20, fontFamily: FONT_MONO, fontSize: 11, color: palette.muted, letterSpacing: "0.1em", zIndex: 2 }}>
        {String(card.page).padStart(2, "0")}
      </div>

      {/* 헤드라인 */}
      {text.headline && (
        <h2 style={{
          fontFamily: FONT_KR,
          fontSize: 36 * fontScale,
          fontWeight: 800,
          color: palette.text,
          textAlign,
          lineHeight: 1.25,
          margin: 0,
          marginBottom: 14,
          textShadow: glow ? `${glow}` : undefined,
          WebkitTextStroke: undefined,
          letterSpacing: "-0.02em",
          maxWidth: "100%",
          wordBreak: "keep-all",
          ...(stroke ? { textShadow: stroke } : {}),
        }}>
          {text.headline}
        </h2>
      )}

      {/* 서브 */}
      {text.sub && (
        <p style={{
          fontFamily: FONT_KR, fontSize: 16 * fontScale, color: palette.accent, textAlign,
          margin: 0, marginBottom: 12, fontWeight: 600,
        }}>
          {text.sub}
        </p>
      )}

      {/* stat 카드 */}
      {text.stat && (
        <div style={{ textAlign: "center", margin: "8px 0" }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 64 * fontScale, fontWeight: 900, color: palette.accent, margin: 0, lineHeight: 1 }}>
            {text.stat.value}
            {text.stat.unit && <span style={{ fontSize: 32 * fontScale, marginLeft: 6, color: palette.text }}>{text.stat.unit}</span>}
          </p>
          {text.stat.caption && (
            <p style={{ fontFamily: FONT_KR, fontSize: 14 * fontScale, color: palette.muted, marginTop: 6 }}>
              {text.stat.caption}
            </p>
          )}
        </div>
      )}

      {/* 비교 카드 */}
      {text.compare && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
          <div style={{ background: `${palette.surface}aa`, padding: 14, border: `1px solid ${palette.muted}55` }}>
            {text.compare.leftLabel && <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: palette.muted, marginBottom: 6 }}>{text.compare.leftLabel}</p>}
            <p style={{ fontFamily: FONT_KR, fontSize: 14 * fontScale, color: palette.text }}>{text.compare.left}</p>
          </div>
          <div style={{ background: `${palette.accent}22`, padding: 14, border: `1px solid ${palette.accent}` }}>
            {text.compare.rightLabel && <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: palette.accent, marginBottom: 6 }}>{text.compare.rightLabel}</p>}
            <p style={{ fontFamily: FONT_KR, fontSize: 14 * fontScale, color: palette.text, fontWeight: 700 }}>{text.compare.right}</p>
          </div>
        </div>
      )}

      {/* 인용 */}
      {text.quote && (
        <div style={{ textAlign: "center", maxWidth: "90%" }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 22 * fontScale, color: palette.text, lineHeight: 1.5, fontStyle: "italic", margin: 0 }}>
            &ldquo;{text.quote.text}&rdquo;
          </p>
          {text.quote.attribution && (
            <p style={{ fontFamily: FONT_KR, fontSize: 12 * fontScale, color: palette.muted, marginTop: 10 }}>
              — {text.quote.attribution}
            </p>
          )}
        </div>
      )}

      {/* 본문 */}
      {text.body && (
        <p style={{
          fontFamily: FONT_KR, fontSize: 16 * fontScale, color: palette.text, textAlign,
          lineHeight: 1.7, margin: 0, marginTop: 8, opacity: 0.92,
          maxWidth: "100%", wordBreak: "keep-all",
        }}>
          {text.body}
        </p>
      )}

      {/* CTA */}
      {text.cta && (
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 24 * fontScale, fontWeight: 800, color: palette.text, margin: 0 }}>
            {text.cta.headline}
          </p>
          {text.cta.sub && <p style={{ fontFamily: FONT_KR, fontSize: 13 * fontScale, color: palette.muted, marginTop: 6 }}>{text.cta.sub}</p>}
          {text.cta.button && (
            <div style={{ marginTop: 14, display: "inline-block", background: palette.accent, color: palette.bg, padding: "10px 26px", fontFamily: FONT_KR, fontSize: 14 * fontScale, fontWeight: 700 }}>
              {text.cta.button}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
