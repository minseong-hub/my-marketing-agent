"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { CardCanvas } from "./CardCanvas";
import { CardInspector } from "./CardInspector";
import type { EditableCard, AutoFlag } from "@/lib/studio/card-types";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

type LibraryItem = {
  id: string;
  title: string;
  category: string;
  cards: EditableCard[];
  caption: { variants?: string[] };
  hashtags: string[];
  reviewState: "draft" | "needs_review" | "approved";
  autoFlags: AutoFlag[];
  templateSnapshot: any;
};

export function CardWorkspaceClient({ libraryId }: { libraryId: string }) {
  const [item, setItem] = useState<LibraryItem | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 초기 로드
  useEffect(() => {
    fetch(`/api/card-library/${libraryId}`).then((r) => r.json()).then((d) => {
      if (d.ok) setItem(d.item);
      else setError(d.error || "불러오기 실패");
    }).catch(() => setError("네트워크 오류"));
  }, [libraryId]);

  // 자동 저장 — dirty 1.5초 디바운스
  useEffect(() => {
    if (!dirty || !item) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const res = await fetch(`/api/card-library/${libraryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cards: item.cards,
            caption: item.caption,
            hashtags: item.hashtags,
            title: item.title,
            changeNote: "자동 저장",
          }),
        });
        const d = await res.json();
        if (res.ok) {
          setDirty(false);
          setSavedAt(new Date().toLocaleTimeString());
          // auto-flags 갱신을 위해 다시 로드
          const r2 = await fetch(`/api/card-library/${libraryId}`);
          const d2 = await r2.json();
          if (d2.ok) setItem(d2.item);
        } else { setError(d.error || "저장 실패"); }
      } catch { setError("네트워크 오류"); }
      finally { setSaving(false); }
    }, 1500);

    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [dirty, item, libraryId]);

  const updateCard = useCallback((idx: number, patch: Partial<EditableCard>) => {
    setItem((prev) => {
      if (!prev) return prev;
      const next = [...prev.cards];
      next[idx] = { ...next[idx], ...patch, design: { ...next[idx].design, ...(patch.design ?? {}) }, text: { ...next[idx].text, ...(patch.text ?? {}) }, effects: { ...next[idx].effects, ...(patch.effects ?? {}) }, background: { ...next[idx].background, ...(patch.background ?? {}) } };
      return { ...prev, cards: next };
    });
    setDirty(true);
  }, []);

  const addCard = useCallback(() => {
    setItem((prev) => {
      if (!prev) return prev;
      if (prev.cards.length >= 10) return prev;
      const last = prev.cards[prev.cards.length - 1];
      const newCard: EditableCard = {
        id: `c_${Date.now()}_${prev.cards.length}`,
        kind: "feature",
        page: prev.cards.length + 1,
        text: { headline: "", sub: "", body: "" },
        design: { ...last.design },
        effects: { ...last.effects },
        background: { ...last.background },
      };
      return { ...prev, cards: [...prev.cards, newCard] };
    });
    setDirty(true);
  }, []);

  const removeCard = useCallback((idx: number) => {
    setItem((prev) => {
      if (!prev) return prev;
      if (prev.cards.length <= 1) return prev;
      const next = prev.cards.filter((_, i) => i !== idx).map((c, i) => ({ ...c, page: i + 1 }));
      return { ...prev, cards: next };
    });
    setActiveIdx((i) => Math.max(0, i - 1));
    setDirty(true);
  }, []);

  const moveCard = useCallback((idx: number, dir: -1 | 1) => {
    setItem((prev) => {
      if (!prev) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.cards.length) return prev;
      const next = [...prev.cards];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return { ...prev, cards: next.map((c, i) => ({ ...c, page: i + 1 })) };
    });
    setActiveIdx((i) => i + dir);
    setDirty(true);
  }, []);

  const updateMeta = useCallback((patch: { title?: string; caption?: { variants: string[] }; hashtags?: string[] }) => {
    setItem((prev) => prev ? { ...prev, ...patch } : prev);
    setDirty(true);
  }, []);

  const setReviewState = useCallback(async (state: "draft" | "needs_review" | "approved") => {
    if (!item) return;
    await fetch(`/api/card-library/${libraryId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewState: state }),
    });
    setItem({ ...item, reviewState: state });
  }, [item, libraryId]);

  const [regenerating, setRegenerating] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<Array<{ id: string; version: number; changeNote: string; createdAt: string }>>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const loadVersions = useCallback(async () => {
    setVersionsLoading(true);
    try {
      const r = await fetch(`/api/card-library/${libraryId}/versions`);
      const d = await r.json();
      if (d.ok) setVersions(d.versions);
    } catch {}
    finally { setVersionsLoading(false); }
  }, [libraryId]);

  const restoreVersion = useCallback(async (versionId: string) => {
    if (!confirm("이 버전으로 되돌립니다. 현재 상태는 새 버전으로 자동 보관됩니다.")) return;
    try {
      const r = await fetch(`/api/card-library/${libraryId}/restore`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "복원 실패"); return; }
      const r2 = await fetch(`/api/card-library/${libraryId}`);
      const d2 = await r2.json();
      if (d2.ok) { setItem(d2.item); setDirty(false); }
      loadVersions();
    } catch { setError("네트워크 오류"); }
  }, [libraryId, loadVersions]);

  useEffect(() => { if (historyOpen) loadVersions(); }, [historyOpen, loadVersions]);

  const regenerate = useCallback(async (mode: "text" | "design" | "palette" | "all", scope: "card" | "all") => {
    if (!item) return;
    setRegenerating(true);
    try {
      const r = await fetch(`/api/card-library/${libraryId}/regenerate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, ...(scope === "card" ? { cardIndex: activeIdx } : {}) }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "재생성 실패"); return; }
      // 다시 로드
      const r2 = await fetch(`/api/card-library/${libraryId}`);
      const d2 = await r2.json();
      if (d2.ok) { setItem(d2.item); setDirty(false); }
    } catch { setError("네트워크 오류"); }
    finally { setRegenerating(false); }
  }, [item, libraryId, activeIdx]);

  // 단축키
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName?.match(/INPUT|TEXTAREA|SELECT/)) return;
      if (e.key === "ArrowLeft") setActiveIdx((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setActiveIdx((i) => item ? Math.min(item.cards.length - 1, i + 1) : i);
      if ((e.key === "r" || e.key === "R") && !e.ctrlKey && !e.metaKey) { e.preventDefault(); regenerate("text", "card"); }
      if ((e.key === "h" || e.key === "H") && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setHistoryOpen((v) => !v); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [item, regenerate]);

  if (error) return (
    <div style={{ padding: 40, color: "#ff6688", fontFamily: FONT_KR, background: "#060920", minHeight: "100vh" }}>
      ⚠ {error} <Link href="/library" style={{ color: "#5ce5ff", marginLeft: 12 }}>← 보관함으로</Link>
    </div>
  );
  if (!item) return <div style={{ padding: 40, color: "#7e94c8", fontFamily: FONT_KR, background: "#060920", minHeight: "100vh" }}>불러오는 중…</div>;

  const card = item.cards[activeIdx];
  const flagsForActive = item.autoFlags.filter((f) => f.cardIndex === activeIdx);
  const STATE_LABEL: Record<string, string> = { draft: "초안", needs_review: "검토 필요", approved: "승인 완료" };
  const STATE_COLOR: Record<string, string> = { draft: "#7e94c8", needs_review: "#ffd84d", approved: "#66ff9d" };

  return (
    <div style={{ background: "#060920", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 상단바 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid #1f2a6b" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/library" style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", textDecoration: "none" }}>← 보관함</Link>
          <input
            value={item.title}
            onChange={(e) => updateMeta({ title: e.target.value })}
            style={{ background: "transparent", border: "1px solid transparent", color: "#fff", fontFamily: FONT_KR, fontSize: 16, fontWeight: 700, padding: "4px 8px", minWidth: 300 }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#1f2a6b")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: STATE_COLOR[item.reviewState] }}>● {STATE_LABEL[item.reviewState]}</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8" }}>
            {saving ? "저장 중…" : dirty ? "변경됨" : savedAt ? `${savedAt} 저장됨` : "동기화됨"}
          </span>
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            style={{
              background: historyOpen ? "#5ce5ff22" : "transparent",
              color: "#5ce5ff",
              border: "1px solid #5ce5ff", padding: "6px 14px", fontFamily: FONT_KR, fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}
          >
            🕘 히스토리 (H)
          </button>
          <button
            onClick={() => setReviewState(item.reviewState === "approved" ? "draft" : "approved")}
            style={{
              background: item.reviewState === "approved" ? "#66ff9d" : "transparent",
              color: item.reviewState === "approved" ? "#0a0e27" : "#66ff9d",
              border: "1px solid #66ff9d", padding: "6px 14px", fontFamily: FONT_KR, fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}
          >
            {item.reviewState === "approved" ? "승인 취소" : "✓ 승인"}
          </button>
        </div>
      </div>

      {/* 히스토리 드로어 */}
      {historyOpen && (
        <div onClick={() => setHistoryOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", justifyContent: "flex-end" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 380, height: "100%", background: "#0a0e27", borderLeft: "1px solid #5ce5ff44", padding: 18, overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ fontFamily: FONT_PIX, fontSize: 12, color: "#5ce5ff", letterSpacing: "0.08em" }}>▌ VERSION HISTORY</p>
              <button onClick={() => setHistoryOpen(false)} style={{ background: "transparent", border: "1px solid #1f2a6b", color: "#cfe9ff", padding: "4px 10px", fontFamily: FONT_KR, fontSize: 11, cursor: "pointer" }}>닫기</button>
            </div>
            {versionsLoading ? (
              <p style={{ color: "#7e94c8", fontFamily: FONT_KR, fontSize: 13 }}>불러오는 중…</p>
            ) : versions.length === 0 ? (
              <p style={{ color: "#7e94c8", fontFamily: FONT_KR, fontSize: 13 }}>버전이 없습니다.</p>
            ) : (
              versions.map((v) => (
                <div key={v.id} className="pixel-frame" style={{ background: "#060920", border: "1px solid #1f2a6b", padding: 12, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#5ce5ff", fontWeight: 700 }}>v{v.version}</p>
                    <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#7e94c8" }}>{new Date(v.createdAt).toLocaleString()}</p>
                  </div>
                  <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#cfe9ff", lineHeight: 1.5, marginBottom: 8 }}>
                    {v.changeNote || "(변경 기록 없음)"}
                  </p>
                  <button onClick={() => restoreVersion(v.id)}
                    style={{ background: "#5ce5ff", border: "none", color: "#0a0e27", padding: "5px 12px", fontFamily: FONT_KR, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    이 버전으로 복원
                  </button>
                </div>
              ))
            )}
            <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#4a5a8a", marginTop: 12, lineHeight: 1.6 }}>
              · 최대 30버전 보관<br />
              · 복원도 새 버전으로 기록됨<br />
              · 텍스트/디자인/캡션/해시태그 변경 시 자동 스냅샷
            </p>
          </div>
        </div>
      )}

      {/* 자기검수 플래그 — 상단 띠 */}
      {item.autoFlags.length > 0 && (
        <div style={{ padding: "8px 24px", background: "#0a0e27", borderBottom: "1px solid #1f2a6b", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {item.autoFlags.slice(0, 5).map((f, i) => (
            <span key={i} style={{
              background: f.severity === "error" ? "#ff668822" : f.severity === "warn" ? "#ffd84d22" : "#5ce5ff22",
              color: f.severity === "error" ? "#ff6688" : f.severity === "warn" ? "#ffd84d" : "#5ce5ff",
              border: `1px solid ${f.severity === "error" ? "#ff6688" : f.severity === "warn" ? "#ffd84d" : "#5ce5ff"}`,
              padding: "3px 8px", fontFamily: FONT_KR, fontSize: 11,
            }}>{f.message}</span>
          ))}
        </div>
      )}

      {/* 3컬럼 본문 */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* 좌: 카드 목록 */}
        <aside style={{ width: 200, borderRight: "1px solid #1f2a6b", overflowY: "auto", padding: 12 }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#4a5a8a", letterSpacing: "0.16em", marginBottom: 8 }}>
            CARDS · {item.cards.length}/10
          </p>
          {item.cards.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveIdx(i)}
              style={{
                width: "100%", padding: 8, marginBottom: 6, textAlign: "left",
                background: i === activeIdx ? "#ff4ec918" : "#0a0e27",
                border: `1px solid ${i === activeIdx ? "#ff4ec9" : "#1f2a6b"}`,
                color: "#cfe9ff", fontFamily: FONT_KR, fontSize: 11, cursor: "pointer",
              }}
            >
              <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#7e94c8", letterSpacing: "0.1em", marginBottom: 4 }}>
                {String(i + 1).padStart(2, "0")} · {c.kind}
              </p>
              <p style={{ fontWeight: 600, lineHeight: 1.3, minHeight: 26 }}>
                {c.text.headline || <span style={{ color: "#4a5a8a" }}>(빈 카드)</span>}
              </p>
              {item.autoFlags.some((f) => f.cardIndex === i) && (
                <span style={{ fontSize: 9, color: "#ffd84d", marginTop: 2 }}>⚠ 검토 필요</span>
              )}
            </button>
          ))}
          <button onClick={addCard} disabled={item.cards.length >= 10}
            style={{ width: "100%", padding: 8, marginTop: 4, background: "transparent", border: "1px dashed #ff4ec955", color: "#ff4ec9", fontFamily: FONT_KR, fontSize: 11, cursor: item.cards.length >= 10 ? "not-allowed" : "pointer", opacity: item.cards.length >= 10 ? 0.4 : 1 }}>
            + 카드 추가
          </button>
        </aside>

        {/* 중앙: 캔버스 */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "auto", padding: 24 }}>
          {card && <CardCanvas card={card} />}
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => moveCard(activeIdx, -1)} disabled={activeIdx === 0}
              style={{ background: "transparent", border: "1px solid #1f2a6b", color: "#cfe9ff", padding: "6px 14px", fontFamily: FONT_KR, fontSize: 12, cursor: activeIdx === 0 ? "not-allowed" : "pointer" }}>← 앞으로</button>
            <button onClick={() => moveCard(activeIdx, 1)} disabled={activeIdx === item.cards.length - 1}
              style={{ background: "transparent", border: "1px solid #1f2a6b", color: "#cfe9ff", padding: "6px 14px", fontFamily: FONT_KR, fontSize: 12, cursor: activeIdx === item.cards.length - 1 ? "not-allowed" : "pointer" }}>뒤로 →</button>
            <button onClick={() => removeCard(activeIdx)} disabled={item.cards.length <= 1}
              style={{ background: "transparent", border: "1px solid #ff668866", color: "#ff6688", padding: "6px 14px", fontFamily: FONT_KR, fontSize: 12, cursor: item.cards.length <= 1 ? "not-allowed" : "pointer" }}>삭제</button>
          </div>

          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", justifyContent: "center", padding: "8px 12px", border: "1px dashed #ff4ec955", background: "#0a0e2766" }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#ff4ec9", letterSpacing: "0.1em", alignSelf: "center", marginRight: 4 }}>RE-GEN</span>
            <button onClick={() => regenerate("text", "card")} disabled={regenerating}
              style={{ background: "#ff4ec9", border: "none", color: "#0a0e27", padding: "5px 10px", fontFamily: FONT_KR, fontSize: 11, fontWeight: 700, cursor: regenerating ? "wait" : "pointer", opacity: regenerating ? 0.5 : 1 }}>
              📝 텍스트만 (R)
            </button>
            <button onClick={() => regenerate("palette", "card")} disabled={regenerating}
              style={{ background: "transparent", border: "1px solid #ff4ec9", color: "#ff4ec9", padding: "5px 10px", fontFamily: FONT_KR, fontSize: 11, fontWeight: 700, cursor: regenerating ? "wait" : "pointer", opacity: regenerating ? 0.5 : 1 }}>
              🎨 색상만
            </button>
            <button onClick={() => regenerate("design", "card")} disabled={regenerating}
              style={{ background: "transparent", border: "1px solid #ff4ec9", color: "#ff4ec9", padding: "5px 10px", fontFamily: FONT_KR, fontSize: 11, fontWeight: 700, cursor: regenerating ? "wait" : "pointer", opacity: regenerating ? 0.5 : 1 }}>
              🖼 디자인만
            </button>
            <button onClick={() => regenerate("all", "card")} disabled={regenerating}
              style={{ background: "transparent", border: "1px solid #ff4ec9", color: "#ff4ec9", padding: "5px 10px", fontFamily: FONT_KR, fontSize: 11, fontWeight: 700, cursor: regenerating ? "wait" : "pointer", opacity: regenerating ? 0.5 : 1 }}>
              ♻ 전부 다시
            </button>
            <button onClick={() => regenerate("text", "all")} disabled={regenerating}
              style={{ background: "transparent", border: "1px solid #5ce5ff", color: "#5ce5ff", padding: "5px 10px", fontFamily: FONT_KR, fontSize: 11, fontWeight: 700, cursor: regenerating ? "wait" : "pointer", opacity: regenerating ? 0.5 : 1 }}>
              📚 모든 카드 텍스트
            </button>
          </div>

          <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#4a5a8a", marginTop: 12 }}>
            ←/→ 카드 전환 · R 텍스트 재생성 · H 히스토리 · 자동 저장
          </p>
        </main>

        {/* 우: 인스펙터 */}
        <aside style={{ width: 320, borderLeft: "1px solid #1f2a6b", overflowY: "auto" }}>
          {card && (
            <CardInspector
              card={card}
              onChange={(patch) => updateCard(activeIdx, patch)}
              caption={item.caption.variants ?? []}
              hashtags={item.hashtags}
              onMetaChange={(p) => updateMeta(p)}
              cardFlags={flagsForActive}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
