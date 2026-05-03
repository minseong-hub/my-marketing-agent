"use client";

import { forwardRef } from "react";
import type { CardSlot, BrandTemplate } from "@/lib/studio/templates";

const FONT_FAMILY_MAP = {
  sans: '"IBM Plex Sans KR", "Pretendard", sans-serif',
  serif: '"Noto Serif KR", "IBM Plex Serif", serif',
  mono: '"JetBrains Mono", "D2Coding", monospace',
  display: '"Press Start 2P", "IBM Plex Sans KR", sans-serif',
} as const;

interface RendererProps {
  card: CardSlot;
  /** 호환성 — template 없을 때만 사용 */
  brandColor?: string;
  accentColor?: string;
  imageUrl?: string | null;
  /** BrandTemplate으로 디자인 토큰 전체를 덮어쓰기. 있으면 brandColor/accentColor 무시. */
  template?: BrandTemplate;
  /** 미리보기 모드 — 텍스처/그림자 일부 단순화 (빠른 그리드 렌더용) */
  preview?: boolean;
}

/**
 * 1080×1080 인스타 카드뉴스 1장 렌더러.
 * BrandTemplate를 받으면 색·폰트·코너·정렬·패턴이 토큰대로 적용됨.
 * 호환성: template 없으면 기존 brandColor/accentColor 방식 유지.
 */
export const CardRenderer = forwardRef<HTMLDivElement, RendererProps>(function CardRenderer(
  { card, brandColor, accentColor, imageUrl, template, preview },
  ref
) {
  // 템플릿 토큰 또는 기본값
  const tokens = template?.tokens;
  const palette = tokens?.palette ?? {
    bg: brandColor ?? "#ff4ec9",
    surface: "#0a0e27",
    text: "#ffffff",
    accent: accentColor ?? "#5ce5ff",
    muted: "rgba(255,255,255,0.6)",
  };
  const typo = tokens?.typography ?? { titleFamily: "sans" as const, titleWeight: 900, titleSizeRatio: 0.085, bodyFamily: "sans" as const, bodyLineHeight: 1.55 };
  const layout = tokens?.layout ?? { padding: 64, contentAlign: "center" as const, textAlign: "left" as const };
  const decor = tokens?.decorations ?? { cornerStyle: "sharp" as const, borderWidth: 0, borderStyle: "none" as const, patternOverlay: "dots" as const, shadowDepth: 0, showBranding: true, showPageIndicator: true };
  const imagery = tokens?.imagery ?? { preferredImageStyle: "photo_realistic" as const, stylePrompt: "", overlayDarkness: 0.6 };

  const titleFontFamily = FONT_FAMILY_MAP[typo.titleFamily];
  const bodyFontFamily = FONT_FAMILY_MAP[typo.bodyFamily];
  const titleSizePx = Math.round(1080 * typo.titleSizeRatio);

  // 배경 — template 있으면 palette.bg, 없으면 기존 그라디언트
  const bgFill = tokens
    ? palette.bg
    : `linear-gradient(135deg, ${brandColor ?? "#ff4ec9"} 0%, ${accentColor ?? "#5ce5ff"} 100%)`;

  // 코너 라디우스
  const cornerRadius =
    decor.cornerStyle === "soft" ? 24 :
    decor.cornerStyle === "hard" ? 64 : 0;

  const isHook = card.kind === "hook";
  const isCta = card.kind === "cta";
  const isProof = card.kind === "proof" && !!card.stat;
  const isCompare = card.kind === "compare" && !!card.compare;

  // 텍스트 색 — 배경이 어두우면 밝게, 밝으면 어둡게 (template.text 우선)
  const textColor = palette.text;
  const subTextColor = palette.muted;

  // 라벨 박스
  const labelBg = palette.accent;
  const labelText = palette.bg;  // 액센트 위에 배경색 (대비)

  // title highlight
  const renderTitle = () => {
    if (!card.highlight || !card.title.includes(card.highlight)) {
      return <span style={{ color: textColor }}>{card.title}</span>;
    }
    const parts = card.title.split(card.highlight);
    return (
      <>
        {parts.map((p, i) => (
          <span key={i}>
            <span style={{ color: textColor }}>{p}</span>
            {i < parts.length - 1 && <span style={{ color: palette.accent }}>{card.highlight}</span>}
          </span>
        ))}
      </>
    );
  };

  // 패턴 오버레이
  const renderPattern = () => {
    if (preview) return null;  // preview 모드에서는 패턴 생략 (성능)
    if (decor.patternOverlay === "none") return null;
    if (decor.patternOverlay === "dots") {
      return (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`dots-${card.index}`} width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill={textColor} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#dots-${card.index})`} />
        </svg>
      );
    }
    if (decor.patternOverlay === "grid") {
      return (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06, pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`grid-${card.index}`} width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke={textColor} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${card.index})`} />
        </svg>
      );
    }
    if (decor.patternOverlay === "noise") {
      return (
        <div style={{
          position: "absolute", inset: 0, opacity: 0.08, pointerEvents: "none",
          backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.7%22/></filter><rect width=%22100%22 height=%22100%22 filter=%22url(%23n)%22/></svg>')",
        }} />
      );
    }
    if (decor.patternOverlay === "gradient_mesh") {
      return (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(circle at 20% 30%, ${palette.accent}33 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${palette.muted}22 0%, transparent 50%)`,
        }} />
      );
    }
    return null;
  };

  // 그림자
  const cardShadow =
    decor.shadowDepth === 0 ? "none" :
    decor.shadowDepth === 1 ? "0 4px 12px rgba(0,0,0,0.15)" :
    decor.shadowDepth === 2 ? "0 8px 24px rgba(0,0,0,0.25)" :
    "0 16px 48px rgba(0,0,0,0.4)";

  // 보더
  const cardBorder = decor.borderWidth > 0 && decor.borderStyle !== "none"
    ? `${decor.borderWidth}px ${decor.borderStyle} ${palette.accent}`
    : "none";

  return (
    <div
      ref={ref}
      style={{
        width: 1080, height: 1080,
        background: imageUrl ? "#000" : bgFill,
        position: "relative",
        overflow: "hidden",
        fontFamily: bodyFontFamily,
        color: textColor,
        boxSizing: "border-box",
        borderRadius: cornerRadius,
        border: cardBorder,
        boxShadow: cardShadow,
      }}
    >
      {/* 배경 이미지 + 어둡게 오버레이 */}
      {imageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            crossOrigin="anonymous"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(0,0,0,${imagery.overlayDarkness * 0.7}) 0%, rgba(0,0,0,${imagery.overlayDarkness}) 100%)` }} />
        </>
      )}

      {renderPattern()}

      {/* 상단 라벨 + 페이지 인디케이터 */}
      <div style={{
        position: "absolute", top: layout.padding, left: layout.padding, right: layout.padding,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{
          background: labelBg, color: labelText,
          padding: "10px 20px",
          fontSize: 22, fontWeight: 800, letterSpacing: "0.05em",
          fontFamily: titleFontFamily,
        }}>
          {card.label}
        </div>
        {decor.showPageIndicator && (
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i + 1 === card.index ? 32 : 12,
                  height: 6,
                  background: i + 1 <= card.index ? palette.accent : `${palette.muted}55`,
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{
        position: "absolute",
        top: layout.padding + 130,
        left: layout.padding, right: layout.padding,
        bottom: layout.padding + 80,
        display: "flex", flexDirection: "column",
        justifyContent: layout.contentAlign === "top" ? "flex-start" : layout.contentAlign === "bottom" ? "flex-end" : "center",
        textAlign: layout.textAlign,
      }}>
        {isProof && card.stat ? (
          <div>
            <p style={{ fontSize: 36, fontWeight: 600, color: palette.accent, marginBottom: 24, lineHeight: 1.4 }}>
              {card.title}
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 28, justifyContent: layout.textAlign === "center" ? "center" : "flex-start" }}>
              <span style={{ fontSize: 220, fontWeight: 900, color: textColor, lineHeight: 0.9, letterSpacing: "-0.04em", fontFamily: titleFontFamily }}>
                {card.stat.value}
              </span>
              <span style={{ fontSize: 64, fontWeight: 700, color: palette.accent }}>
                {card.stat.unit}
              </span>
            </div>
            <p style={{ fontSize: 28, color: subTextColor, lineHeight: typo.bodyLineHeight }}>
              {card.stat.caption}
            </p>
            <p style={{ fontSize: 26, color: subTextColor, marginTop: 24, lineHeight: typo.bodyLineHeight }}>
              {card.body}
            </p>
          </div>
        ) : isCompare && card.compare ? (
          <div>
            <p style={{ fontSize: isHook ? Math.round(titleSizePx * 1.15) : Math.round(titleSizePx * 0.7), fontWeight: typo.titleWeight, lineHeight: 1.2, marginBottom: 36, letterSpacing: "-0.02em", fontFamily: titleFontFamily }}>
              {renderTitle()}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 24, alignItems: "center" }}>
              <div style={{ background: `${palette.surface}cc`, border: `2px solid ${palette.muted}55`, padding: "28px 24px", borderRadius: cornerRadius / 2 }}>
                <p style={{ fontSize: 24, color: subTextColor, marginBottom: 10 }}>{card.compare.leftLabel}</p>
                <p style={{ fontSize: 36, fontWeight: 700, color: textColor, lineHeight: 1.3 }}>{card.compare.left}</p>
              </div>
              <div style={{ fontSize: 60, fontWeight: 800, color: palette.accent }}>→</div>
              <div style={{ background: palette.accent, padding: "28px 24px", borderRadius: cornerRadius / 2 }}>
                <p style={{ fontSize: 24, color: `${palette.bg}b3`, marginBottom: 10 }}>{card.compare.rightLabel}</p>
                <p style={{ fontSize: 36, fontWeight: 800, color: palette.bg, lineHeight: 1.3 }}>{card.compare.right}</p>
              </div>
            </div>
            <p style={{ fontSize: 26, color: subTextColor, marginTop: 28, lineHeight: typo.bodyLineHeight }}>
              {card.body}
            </p>
          </div>
        ) : isCta && card.cta ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 32, fontWeight: 600, color: palette.accent, marginBottom: 24 }}>
              {card.cta.brand}
            </p>
            <p style={{ fontSize: Math.round(titleSizePx * 1.3), fontWeight: typo.titleWeight, color: textColor, lineHeight: 1.0, marginBottom: 32, letterSpacing: "-0.03em", fontFamily: titleFontFamily }}>
              {card.cta.headline}
            </p>
            <div style={{
              display: "inline-block",
              background: palette.accent, color: palette.bg,
              padding: "20px 48px", marginTop: 24,
              fontSize: 38, fontWeight: 800,
              borderRadius: cornerRadius / 2,
            }}>
              {card.cta.sub}
            </div>
            <p style={{ fontSize: 26, color: subTextColor, marginTop: 36, lineHeight: typo.bodyLineHeight }}>
              {card.body}
            </p>
          </div>
        ) : (
          <div>
            <p style={{
              fontSize: isHook ? Math.round(titleSizePx * 1.15) : titleSizePx,
              fontWeight: typo.titleWeight,
              lineHeight: 1.15, letterSpacing: "-0.03em",
              marginBottom: 36,
              fontFamily: titleFontFamily,
            }}>
              {renderTitle()}
            </p>
            <p style={{ fontSize: 32, color: subTextColor, lineHeight: typo.bodyLineHeight, fontWeight: 500 }}>
              {card.body}
            </p>
          </div>
        )}
      </div>

      {/* 하단 브랜딩 */}
      {decor.showBranding && (
        <div style={{
          position: "absolute", bottom: layout.padding - 8, left: layout.padding, right: layout.padding,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 12, height: 12, background: palette.accent }} />
            <span style={{ fontSize: 22, color: subTextColor, fontWeight: 600 }}>
              {template?.name || "CREWMATE"}
            </span>
          </div>
          <span style={{ fontSize: 22, color: subTextColor, fontWeight: 600 }}>
            {card.index} / 6
          </span>
        </div>
      )}
    </div>
  );
});
