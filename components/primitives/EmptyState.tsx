"use client";

import { ReactNode } from "react";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  primaryAction?: { label: string; onClick?: () => void; href?: string };
  secondaryAction?: { label: string; onClick?: () => void; href?: string };
  accent?: string;
  example?: string;
  children?: ReactNode;
}

/**
 * 데이터 없음/첫 진입 사용자에게 보여주는 일관된 빈 상태.
 * 우주선 + 텍스트 + 다음 액션 1~2개 + 사용 예시.
 */
export function EmptyState({
  icon = "🚀",
  title,
  description,
  primaryAction,
  secondaryAction,
  accent = "#5ce5ff",
  example,
  children,
}: EmptyStateProps) {
  return (
    <div
      className="pixel-frame"
      style={{
        border: `1px dashed ${accent}55`,
        background: "#0a0e27",
        padding: "40px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 14,
      }}
    >
      <div style={{
        fontSize: 48,
        filter: `drop-shadow(0 0 12px ${accent}66)`,
        opacity: 0.85,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: accent, letterSpacing: "0.08em", marginBottom: 6 }}>
          ▸ 시작하기
        </p>
        <h3 style={{ fontFamily: FONT_KR, fontSize: 18, fontWeight: 700, color: "#cfe9ff", marginBottom: 8 }}>
          {title}
        </h3>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#7e94c8", lineHeight: 1.7, maxWidth: 480 }}>
          {description}
        </p>
        {example && (
          <p style={{
            fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff",
            background: "#060920", border: `1px solid ${accent}33`,
            padding: "8px 12px",
            marginTop: 12,
            display: "inline-block",
          }}>
            예시 — <span style={{ color: accent }}>{example}</span>
          </p>
        )}
      </div>
      {(primaryAction || secondaryAction) && (
        <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap", justifyContent: "center" }}>
          {primaryAction && (
            primaryAction.href ? (
              <a
                href={primaryAction.href}
                className="pixel-frame"
                style={{
                  background: accent, color: "#060920",
                  border: `2px solid ${accent}`, boxShadow: `3px 3px 0 ${accent}88`,
                  padding: "9px 18px",
                  fontFamily: FONT_KR, fontSize: 14, fontWeight: 700,
                  cursor: "pointer", textDecoration: "none",
                }}
              >
                ▶ {primaryAction.label}
              </a>
            ) : (
              <button
                onClick={primaryAction.onClick}
                className="pixel-frame"
                style={{
                  background: accent, color: "#060920",
                  border: `2px solid ${accent}`, boxShadow: `3px 3px 0 ${accent}88`,
                  padding: "9px 18px",
                  fontFamily: FONT_KR, fontSize: 14, fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ▶ {primaryAction.label}
              </button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <a
                href={secondaryAction.href}
                style={{
                  background: "transparent", color: "#7e94c8",
                  border: "1px solid #1f2a6b",
                  padding: "9px 16px",
                  fontFamily: FONT_KR, fontSize: 14, fontWeight: 500,
                  cursor: "pointer", textDecoration: "none",
                }}
              >
                {secondaryAction.label}
              </a>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                style={{
                  background: "transparent", color: "#7e94c8",
                  border: "1px solid #1f2a6b",
                  padding: "9px 16px",
                  fontFamily: FONT_KR, fontSize: 14, fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
      {children}
    </div>
  );
}
