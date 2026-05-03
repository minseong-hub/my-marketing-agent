"use client";

import { useEffect, useState, useCallback } from "react";
import type { BrandTemplate, CardSlot } from "@/lib/studio/templates";
import { CardRenderer } from "./CardRenderer";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

const PREVIEW_CARD: CardSlot = {
  kind: "hook",
  index: 1,
  label: "01. 후킹",
  title: "디자인 미리보기",
  body: "이 템플릿으로 카드뉴스가 만들어집니다.",
};

/**
 * 디자인 갤러리 — 사용자별 BrandTemplate 관리.
 * 활성 토글 / 즐겨찾기 / 삭제 / 미리보기.
 */
export function TemplateGalleryStudio() {
  const [items, setItems] = useState<BrandTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch("/api/templates?limit=100");
      const d = await r.json();
      if (!r.ok) { setError(d.error || "로드 실패"); return; }
      setItems(d.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "네트워크 오류");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const seedPresets = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/templates/seed-presets", { method: "POST" });
      setSeeded(true);
      await reload();
    } catch {} finally { setLoading(false); }
  }, [reload]);

  const activate = useCallback(async (id: string) => {
    setItems((prev) => prev.map((t) => ({ ...t, isActive: t.id === id })));
    try {
      await fetch(`/api/templates/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: true }) });
    } catch { reload(); }
  }, [reload]);

  const toggleFav = useCallback(async (id: string, current: boolean) => {
    setItems((prev) => prev.map((t) => t.id === id ? { ...t, isFavorite: !current } : t));
    try {
      await fetch(`/api/templates/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isFavorite: !current }) });
    } catch { reload(); }
  }, [reload]);

  const remove = useCallback(async (id: string) => {
    if (!confirm("이 템플릿을 삭제하시겠습니까?")) return;
    try {
      const r = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok) { alert(d.error || "삭제 실패"); return; }
      reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제 실패");
    }
  }, [reload]);

  return (
    <div>
      <div className="pixel-frame" style={{ background: "#0a0e27", border: "1px solid #ff4ec944", padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: "#ff4ec9", letterSpacing: "0.08em", marginBottom: 4 }}>
              ▌ 내 디자인 템플릿 ({items.length})
            </p>
            <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8" }}>
              사용자별 최대 30개. 활성 템플릿 1개가 카드뉴스 생성에 적용됩니다.
            </p>
          </div>
          {items.length === 0 && !loading && (
            <button
              onClick={seedPresets}
              style={{ background: "#5ce5ff", color: "#0a0e27", border: "2px solid #5ce5ff", padding: "8px 18px", fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              🎁 프리셋 8종 시드
            </button>
          )}
        </div>
        {seeded && <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#66ff9d", marginTop: 6 }}>✓ 프리셋이 시드되었습니다.</p>}
      </div>

      {error && (
        <div style={{ marginBottom: 12, padding: "10px 14px", border: "1px solid #ff6688", background: "#ff668811", color: "#ff6688", fontFamily: FONT_KR, fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", textAlign: "center", padding: 30 }}>로드 중...</p>
      ) : items.length === 0 ? (
        <div className="pixel-frame" style={{ background: "#0a0e27", border: "1px dashed #1f2a6b", padding: 30, textAlign: "center" }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#7e94c8" }}>
            아직 템플릿이 없습니다. 프리셋을 시드하거나 위저드의 1단계에서 인스타 레퍼런스로 만들어보세요.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {items.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onActivate={() => activate(t.id)}
              onToggleFav={() => toggleFav(t.id, t.isFavorite)}
              onDelete={() => remove(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template, onActivate, onToggleFav, onDelete }: {
  template: BrandTemplate;
  onActivate: () => void;
  onToggleFav: () => void;
  onDelete: () => void;
}) {
  const accent = template.tokens?.palette?.accent || "#5ce5ff";
  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${template.isActive ? "#66ff9d" : "#1f2a6b"}`, padding: 12 }}>
      {/* 미리보기 (1080 → ~260) */}
      <div style={{ width: "100%", aspectRatio: "1 / 1", overflow: "hidden", position: "relative", background: template.tokens?.palette?.bg || "#0a0e27", marginBottom: 10 }}>
        <div style={{ position: "absolute", top: 0, left: 0, transform: "scale(0.24)", transformOrigin: "top left" }}>
          <CardRenderer card={PREVIEW_CARD} template={template} preview={true} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 4 }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, color: "#ffffff" }}>
          {template.name}
        </p>
        <button onClick={onToggleFav} style={{ background: "transparent", border: "none", cursor: "pointer", color: template.isFavorite ? "#ffd84d" : "#4a5a8a", fontSize: 16 }}>
          {template.isFavorite ? "★" : "☆"}
        </button>
      </div>

      <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", marginBottom: 8 }}>
        {template.source} · 사용 {template.usageCount}회
      </p>

      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {[template.tokens?.palette?.bg, template.tokens?.palette?.accent, template.tokens?.palette?.text, template.tokens?.palette?.muted]
          .filter(Boolean)
          .map((c, i) => (
            <div key={i} style={{ width: 18, height: 18, background: c, border: "1px solid #1f2a6b" }} />
          ))}
      </div>

      <div style={{ display: "flex", gap: 4 }}>
        {template.isActive ? (
          <span style={{ background: "#66ff9d", color: "#0a0e27", padding: "5px 10px", fontFamily: FONT_KR, fontSize: 11, fontWeight: 700, flex: 1, textAlign: "center" }}>
            ✓ 활성
          </span>
        ) : (
          <button
            onClick={onActivate}
            style={{ background: "transparent", color: accent, border: `1px solid ${accent}`, padding: "5px 10px", fontFamily: FONT_KR, fontSize: 11, fontWeight: 700, cursor: "pointer", flex: 1 }}
          >
            활성화
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={template.isActive}
          style={{ background: "transparent", color: "#ff6688", border: "1px solid #ff668866", padding: "5px 8px", fontFamily: FONT_KR, fontSize: 11, fontWeight: 700, cursor: template.isActive ? "not-allowed" : "pointer", opacity: template.isActive ? 0.3 : 1 }}
        >
          삭제
        </button>
      </div>
    </div>
  );
}
