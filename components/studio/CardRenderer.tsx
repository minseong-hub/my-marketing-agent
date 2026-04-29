"use client";

import { forwardRef } from "react";
import type { CardSlot } from "@/lib/studio/templates";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';

interface RendererProps {
  card: CardSlot;
  brandColor: string;
  accentColor: string;
  imageUrl?: string | null;
}

/**
 * 1080×1080 인스타 카드뉴스 1장 렌더러.
 * html2canvas로 캡처할 수 있도록 외부 폰트·SVG·CSS 변수 사용 최소화.
 */
export const CardRenderer = forwardRef<HTMLDivElement, RendererProps>(function CardRenderer(
  { card, brandColor, accentColor, imageUrl },
  ref
) {
  const isHook = card.kind === "hook";
  const isCta = card.kind === "cta";
  const isProof = card.kind === "proof" && !!card.stat;
  const isCompare = card.kind === "compare" && !!card.compare;

  const bgGradient = `linear-gradient(135deg, ${brandColor} 0%, ${accentColor} 100%)`;

  // title 안에서 highlight 단어 컬러 칠하기
  const renderTitle = () => {
    if (!card.highlight || !card.title.includes(card.highlight)) {
      return <span style={{ color: "#ffffff" }}>{card.title}</span>;
    }
    const parts = card.title.split(card.highlight);
    return (
      <>
        {parts.map((p, i) => (
          <span key={i}>
            <span style={{ color: "#ffffff" }}>{p}</span>
            {i < parts.length - 1 && <span style={{ color: accentColor }}>{card.highlight}</span>}
          </span>
        ))}
      </>
    );
  };

  return (
    <div
      ref={ref}
      style={{
        width: 1080, height: 1080,
        background: imageUrl ? "#000" : bgGradient,
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT_KR,
        color: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      {/* 배경 이미지 (있으면) + 어둡게 오버레이 — html2canvas 호환 위해 일반 img */}
      {imageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            crossOrigin="anonymous"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.78) 100%)" }} />
        </>
      )}

      {/* 텍스처 도트 패턴 (시그니처) */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#ffffff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* 상단 라벨 + 페이지 인디케이터 */}
      <div style={{
        position: "absolute", top: 64, left: 64, right: 64,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{
          background: brandColor, color: "#0a0e27",
          padding: "10px 20px",
          fontSize: 22, fontWeight: 800, letterSpacing: "0.05em",
        }}>
          {card.label}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i + 1 === card.index ? 32 : 12,
                height: 6,
                background: i + 1 <= card.index ? "#ffffff" : "rgba(255,255,255,0.32)",
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{
        position: "absolute",
        top: 200, left: 64, right: 64, bottom: 160,
        display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        {isProof && card.stat ? (
          // 사례·수치 카드 — 큰 통계 강조
          <div>
            <p style={{ fontSize: 36, fontWeight: 600, color: accentColor, marginBottom: 24, lineHeight: 1.4 }}>
              {card.title}
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 28 }}>
              <span style={{ fontSize: 220, fontWeight: 900, color: "#ffffff", lineHeight: 0.9, letterSpacing: "-0.04em" }}>
                {card.stat.value}
              </span>
              <span style={{ fontSize: 64, fontWeight: 700, color: accentColor }}>
                {card.stat.unit}
              </span>
            </div>
            <p style={{ fontSize: 28, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
              {card.stat.caption}
            </p>
            <p style={{ fontSize: 26, color: "rgba(255,255,255,0.7)", marginTop: 24, lineHeight: 1.6 }}>
              {card.body}
            </p>
          </div>
        ) : isCompare && card.compare ? (
          // 비교 카드 — 좌우 분할
          <div>
            <p style={{ fontSize: isHook ? 96 : 56, fontWeight: 800, lineHeight: 1.2, marginBottom: 36, letterSpacing: "-0.02em" }}>
              {renderTitle()}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 24, alignItems: "center" }}>
              <div style={{ background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.2)", padding: "28px 24px" }}>
                <p style={{ fontSize: 24, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>{card.compare.leftLabel}</p>
                <p style={{ fontSize: 36, fontWeight: 700, color: "#ffffff", lineHeight: 1.3 }}>{card.compare.left}</p>
              </div>
              <div style={{ fontSize: 60, fontWeight: 800, color: accentColor }}>→</div>
              <div style={{ background: brandColor, padding: "28px 24px" }}>
                <p style={{ fontSize: 24, color: "rgba(10,14,39,0.7)", marginBottom: 10 }}>{card.compare.rightLabel}</p>
                <p style={{ fontSize: 36, fontWeight: 800, color: "#0a0e27", lineHeight: 1.3 }}>{card.compare.right}</p>
              </div>
            </div>
            <p style={{ fontSize: 26, color: "rgba(255,255,255,0.78)", marginTop: 28, lineHeight: 1.6 }}>
              {card.body}
            </p>
          </div>
        ) : isCta && card.cta ? (
          // CTA 카드 — 큰 한 마디
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 32, fontWeight: 600, color: accentColor, marginBottom: 24 }}>
              {card.cta.brand}
            </p>
            <p style={{ fontSize: 110, fontWeight: 900, color: "#ffffff", lineHeight: 1.0, marginBottom: 32, letterSpacing: "-0.03em" }}>
              {card.cta.headline}
            </p>
            <div style={{
              display: "inline-block",
              background: brandColor, color: "#0a0e27",
              padding: "20px 48px", marginTop: 24,
              fontSize: 38, fontWeight: 800,
            }}>
              {card.cta.sub}
            </div>
            <p style={{ fontSize: 26, color: "rgba(255,255,255,0.7)", marginTop: 36, lineHeight: 1.6 }}>
              {card.body}
            </p>
          </div>
        ) : (
          // 기본 (hook / problem / solution)
          <div>
            <p style={{
              fontSize: isHook ? 96 : 80, fontWeight: 900,
              lineHeight: 1.15, letterSpacing: "-0.03em",
              marginBottom: 36,
            }}>
              {renderTitle()}
            </p>
            <p style={{ fontSize: 32, color: "rgba(255,255,255,0.85)", lineHeight: 1.55, fontWeight: 500 }}>
              {card.body}
            </p>
          </div>
        )}
      </div>

      {/* 하단 브랜딩 */}
      <div style={{
        position: "absolute", bottom: 56, left: 64, right: 64,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 12, height: 12, background: accentColor }} />
          <span style={{ fontSize: 22, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
            CREWMATE
          </span>
        </div>
        <span style={{ fontSize: 22, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
          {card.index} / 6
        </span>
      </div>
    </div>
  );
});
