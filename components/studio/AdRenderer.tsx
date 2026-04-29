"use client";

import { forwardRef } from "react";
import type { AdVariant } from "@/lib/studio/templates";
import { AD_RATIO_PIXELS } from "@/lib/studio/templates";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';

interface RendererProps {
  variant: AdVariant;
  brandName: string;
  brandColor: string;
  accentColor: string;
  imageUrl?: string | null;
}

/**
 * 메타 광고 소재 1장 렌더러. 비율(1:1, 4:5, 9:16)에 따라 레이아웃 자동 조정.
 */
export const AdRenderer = forwardRef<HTMLDivElement, RendererProps>(function AdRenderer(
  { variant, brandName, brandColor, accentColor, imageUrl },
  ref
) {
  const dim = AD_RATIO_PIXELS[variant.ratio];
  const isVertical = variant.ratio !== "1:1";
  const isStory = variant.ratio === "9:16";

  const bgGradient = `linear-gradient(135deg, ${brandColor} 0%, ${accentColor} 100%)`;

  return (
    <div
      ref={ref}
      style={{
        width: dim.w, height: dim.h,
        background: imageUrl ? "#000" : bgGradient,
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT_KR,
        color: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      {imageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            crossOrigin="anonymous"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: isStory
              ? "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 35%, rgba(0,0,0,0.85) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)",
          }} />
        </>
      )}

      {/* 시그니처 텍스처 */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06, pointerEvents: "none" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Badge (할인 등) */}
      {variant.badge && (
        <div style={{
          position: "absolute",
          top: 56, right: 56,
          background: accentColor, color: "#0a0e27",
          padding: "14px 24px",
          fontSize: isStory ? 36 : 32, fontWeight: 800,
          letterSpacing: "-0.01em",
          boxShadow: "0 4px 0 rgba(0,0,0,0.25)",
        }}>
          {variant.badge}
        </div>
      )}

      {/* 후킹 (큰 글자) */}
      {variant.hook && (
        <div style={{
          position: "absolute",
          top: isStory ? 200 : isVertical ? 140 : 140,
          left: 56, right: 56,
        }}>
          <p style={{
            fontSize: isStory ? 140 : isVertical ? 110 : 100,
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            color: "#ffffff",
            textShadow: "0 4px 16px rgba(0,0,0,0.35)",
          }}>
            {variant.hook}
          </p>
        </div>
      )}

      {/* 메인 카피 + CTA — 하단 정렬 */}
      <div style={{
        position: "absolute",
        left: 56, right: 56,
        bottom: isStory ? 140 : 120,
      }}>
        <p style={{
          fontSize: isStory ? 56 : isVertical ? 52 : 48,
          fontWeight: 800,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          color: "#ffffff",
          marginBottom: 20,
        }}>
          {variant.headline}
        </p>
        <p style={{
          fontSize: isStory ? 30 : 28,
          color: "rgba(255,255,255,0.85)",
          lineHeight: 1.5,
          fontWeight: 500,
          marginBottom: 36,
          maxWidth: "92%",
        }}>
          {variant.body}
        </p>
        <div style={{
          display: "inline-block",
          background: brandColor, color: "#0a0e27",
          padding: isStory ? "22px 44px" : "18px 36px",
          fontSize: isStory ? 38 : 32,
          fontWeight: 800,
          letterSpacing: "-0.01em",
          boxShadow: "0 6px 0 rgba(0,0,0,0.3)",
        }}>
          ▶ {variant.cta}
        </div>
      </div>

      {/* 하단 브랜드 라인 */}
      <div style={{
        position: "absolute",
        bottom: 56, left: 56, right: 56,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 14, height: 14, background: accentColor }} />
          <span style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", letterSpacing: "0.05em" }}>
            {brandName.toUpperCase()}
          </span>
        </div>
        <span style={{ fontSize: 18, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
          AD · {variant.ratio}
        </span>
      </div>
    </div>
  );
});
