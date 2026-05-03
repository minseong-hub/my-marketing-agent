"use client";

import { useMemo } from "react";
import { CardRenderer } from "./CardRenderer";
import type { BrandTemplate, PlannedCard, CardSlot } from "@/lib/studio/templates";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_MONO = '"JetBrains Mono", monospace';

interface Props {
  cards: PlannedCard[];
  template: BrandTemplate;
  /** 셀 클릭 — 6장 모달 */
  onCellClick?: (card: PlannedCard) => void;
  /** 제외 토글 */
  onToggleExclude?: (cardId: string) => void;
  /** 드래그 정렬 콜백 (옵션) */
  onReorder?: (cards: PlannedCard[]) => void;
}

/**
 * 인스타그램 피드 미리보기 (3컬럼 그리드).
 * 각 셀 = 카드뉴스 1세트의 첫 장 (hook 카드).
 * placeholder 카피로 즉시 렌더 (LLM 호출 0).
 */
export function FeedGridPreview({ cards, template, onCellClick, onToggleExclude }: Props) {
  // 발행일 기준 최신순 정렬 (인스타 피드는 위가 최신)
  const sorted = useMemo(() => {
    return [...cards].sort((a, b) => b.planDate.localeCompare(a.planDate));
  }, [cards]);

  return (
    <div>
      {/* 인스타 프로필 헤더 흉내 */}
      <div style={{ background: "#0a0e27", border: "1px solid #1f2a6b", padding: "14px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${template.tokens.palette.accent} 0%, ${template.tokens.palette.bg} 100%)`, border: `2px solid ${template.tokens.palette.accent}`, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 16, fontWeight: 800, color: "#ffffff", marginBottom: 2 }}>
            @your_brand <span style={{ fontSize: 11, color: "#7e94c8", fontWeight: 500 }}>(미리보기)</span>
          </p>
          <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8" }}>
            적용 템플릿: <span style={{ color: template.tokens.palette.accent, fontWeight: 700 }}>{template.name}</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, fontFamily: FONT_KR, fontSize: 12, color: "#cfe9ff", textAlign: "center" }}>
          <div><b style={{ fontSize: 16 }}>{cards.length}</b><br /><span style={{ color: "#7e94c8" }}>예정</span></div>
          <div><b style={{ fontSize: 16 }}>{cards.filter((c) => !c.excluded).length}</b><br /><span style={{ color: "#7e94c8" }}>활성</span></div>
        </div>
      </div>

      {/* 3컬럼 그리드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, background: "#1f2a6b", padding: 0 }}>
        {sorted.map((card) => (
          <FeedCell
            key={card.id}
            card={card}
            template={template}
            onClick={() => onCellClick?.(card)}
            onToggleExclude={() => onToggleExclude?.(card.id)}
          />
        ))}
        {/* 빈칸 채우기 — 9칸이 안 차면 placeholder */}
        {Array.from({ length: Math.max(0, (Math.ceil(sorted.length / 3) * 3) - sorted.length) }).map((_, i) => (
          <div key={`empty-${i}`} style={{ aspectRatio: "1 / 1", background: "#060920" }} />
        ))}
      </div>

      <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", textAlign: "center", marginTop: 12 }}>
        💡 셀을 클릭하면 카드뉴스 6장 미리보기 / × 버튼으로 제외 / 색감과 통일감 확인 후 다음 단계
      </p>
    </div>
  );
}

function FeedCell({
  card, template, onClick, onToggleExclude,
}: {
  card: PlannedCard;
  template: BrandTemplate;
  onClick: () => void;
  onToggleExclude: () => void;
}) {
  // 카드뉴스 첫 장(hook)을 placeholder 카피로 렌더
  const placeholderHook: CardSlot = useMemo(() => ({
    kind: "hook",
    index: 1,
    label: `01. ${card.category}`,
    title: card.title.slice(0, 14) || "제목 미정",
    body: (card.angle || "후킹 각도").slice(0, 80),
  }), [card]);

  const excluded = !!card.excluded;

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        background: template.tokens.palette.bg,
        cursor: "pointer",
        opacity: excluded ? 0.3 : 1,
        overflow: "hidden",
      }}
      onClick={onClick}
    >
      {/* 카드 1장을 셀 크기로 축소 — 1080 → 셀 크기 (CSS scale) */}
      <div style={{ position: "absolute", top: 0, left: 0, transform: "scale(0.30)", transformOrigin: "top left", width: 1080, height: 1080 }}>
        <CardRenderer card={placeholderHook} template={template} preview={true} />
      </div>

      {/* 오버레이 — 발행일 + 카테고리 */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)",
        padding: "8px 8px 6px",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      }}>
        <div>
          <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#ffffff", lineHeight: 1.2 }}>
            {card.planDate.slice(5).replace("-", "/")}
          </p>
          <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#ffd84d", lineHeight: 1.2 }}>
            {card.category}
          </p>
        </div>
        {!excluded && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExclude(); }}
            style={{
              width: 22, height: 22, padding: 0,
              background: "rgba(0,0,0,0.6)", color: "#ffffff",
              border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 800, lineHeight: 1,
            }}
            aria-label="제외"
          >
            ×
          </button>
        )}
        {excluded && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExclude(); }}
            style={{
              padding: "2px 6px",
              background: "#66ff9d", color: "#0a0e27",
              border: "none", cursor: "pointer",
              fontFamily: FONT_KR, fontSize: 10, fontWeight: 700,
            }}
          >
            복원
          </button>
        )}
      </div>
      {excluded && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}>
          <span style={{ fontFamily: FONT_KR, fontSize: 14, color: "#ffd84d", fontWeight: 700 }}>제외됨</span>
        </div>
      )}
    </div>
  );
}
