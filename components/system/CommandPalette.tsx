"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

type CmdKind = "nav" | "library";

interface Command {
  id: string;
  kind: CmdKind;
  title: string;
  hint?: string;
  href: string;
  icon?: string;
  accent?: string;
}

const NAV_COMMANDS: Command[] = [
  { id: "nav-desk-marky", kind: "nav", title: "마키 데스크", hint: "마케팅 비서", href: "/desk/marky", icon: "📱", accent: "#ff4ec9" },
  { id: "nav-desk-dali", kind: "nav", title: "데일리 데스크", hint: "상세페이지 비서", href: "/desk/dali", icon: "📄", accent: "#5ce5ff" },
  { id: "nav-desk-addy", kind: "nav", title: "애디 데스크", hint: "광고 전문가", href: "/desk/addy", icon: "🎯", accent: "#ffd84d" },
  { id: "nav-desk-penny", kind: "nav", title: "페니 데스크", hint: "재무 비서", href: "/desk/penny", icon: "💰", accent: "#66ff9d" },
  { id: "nav-assist", kind: "nav", title: "비서 현황판", hint: "전체 4명 한 화면", href: "/app/assistants", icon: "🛰️", accent: "#5ce5ff" },
  { id: "nav-studio", kind: "nav", title: "스튜디오", hint: "카드뉴스·광고 자동 생성", href: "/app/studio", icon: "🎨", accent: "#ff4ec9" },
  { id: "nav-auto", kind: "nav", title: "자동화 허브", hint: "사용량·임무·승인", href: "/app/automation", icon: "⚡", accent: "#5ce5ff" },
  { id: "nav-library", kind: "nav", title: "보관함", hint: "AI 결과물 + 메모", href: "/app/library", icon: "📦", accent: "#5ce5ff" },
  { id: "nav-brand", kind: "nav", title: "브랜드 프로필", hint: "비서가 자동 참조", href: "/app/brand", icon: "✨", accent: "#5ce5ff" },
  { id: "nav-products", kind: "nav", title: "상품 카탈로그", hint: "비서 자동 컨텍스트", href: "/app/products", icon: "🏷️", accent: "#5ce5ff" },
  { id: "nav-billing", kind: "nav", title: "결제 / 플랜", hint: "구독 관리", href: "/app/billing", icon: "💳", accent: "#cfe9ff" },
  { id: "nav-settings", kind: "nav", title: "설정", hint: "계정·환경", href: "/app/settings", icon: "⚙️", accent: "#cfe9ff" },
];

interface LibrarySearchHit {
  id: string;
  title: string;
  agent_type: string;
  kind: string;
  is_favorite: boolean;
}

const AGENT_LABEL: Record<string, string> = {
  marketing: "마키", detail_page: "데일리", ads: "애디", finance: "페니", user: "내 메모",
};
const AGENT_COLOR: Record<string, string> = {
  marketing: "#ff4ec9", detail_page: "#5ce5ff", ads: "#ffd84d", finance: "#66ff9d", user: "#7e94c8",
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [libHits, setLibHits] = useState<LibrarySearchHit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Toggle: ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
    else { setQ(""); setActive(0); setLibHits([]); }
  }, [open]);

  // 보관함 검색 (디바운스)
  useEffect(() => {
    if (!open || q.length < 2) { setLibHits([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/library?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        if (res.ok) {
          const d = await res.json();
          setLibHits((d.items || []).slice(0, 6).map((it: { id: string; title: string; agent_type: string; kind: string; is_favorite: boolean }) => ({
            id: it.id, title: it.title, agent_type: it.agent_type, kind: it.kind, is_favorite: it.is_favorite,
          })));
        }
      } catch {}
    }, 220);
    return () => clearTimeout(t);
  }, [q, open]);

  const filteredNav = useMemo(() => {
    if (!q) return NAV_COMMANDS;
    const lower = q.toLowerCase();
    return NAV_COMMANDS.filter((c) =>
      c.title.toLowerCase().includes(lower) || (c.hint || "").toLowerCase().includes(lower)
    );
  }, [q]);

  const allItems: Array<{ kind: "nav"; cmd: Command } | { kind: "library"; hit: LibrarySearchHit }> = useMemo(() => [
    ...filteredNav.map((c) => ({ kind: "nav" as const, cmd: c })),
    ...libHits.map((h) => ({ kind: "library" as const, hit: h })),
  ], [filteredNav, libHits]);

  useEffect(() => { if (active >= allItems.length) setActive(0); }, [allItems.length, active]);

  const go = useCallback((idx: number) => {
    const item = allItems[idx];
    if (!item) return;
    if (item.kind === "nav") router.push(item.cmd.href);
    else router.push(`/app/library?focus=${item.hit.id}`);
    setOpen(false);
  }, [allItems, router]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="빠른 검색 (⌘K)"
        title="빠른 검색 (⌘K)"
        style={{
          position: "fixed", bottom: 24, left: 24, zIndex: 60,
          background: "#0a0e27", border: "1px solid #1f2a6b",
          padding: "8px 12px",
          fontFamily: FONT_MONO, fontSize: 12, color: "#7e94c8",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
        }}
        className="pixel-frame"
      >
        <span style={{ fontSize: 14 }}>⌘K</span>
        <span style={{ fontFamily: FONT_KR, fontSize: 13 }}>빠른 검색</span>
      </button>
    );
  }

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(6,9,32,0.78)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "10vh", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pixel-frame"
        style={{
          background: "#0a0e27", border: "2px solid #5ce5ff",
          boxShadow: "8px 8px 0 #2a86a8",
          width: "min(640px, 100%)", maxHeight: "70vh",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* 입력 */}
        <div style={{ borderBottom: "1px solid #5ce5ff33", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: FONT_PIX, fontSize: 13, color: "#5ce5ff" }}>›</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(allItems.length - 1, i + 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
              else if (e.key === "Enter") { e.preventDefault(); go(active); }
              else if (e.key === "Escape") setOpen(false);
            }}
            placeholder="페이지 / 보관함 검색 — 화살표 ↑↓ 으로 이동, Enter로 열기"
            style={{
              flex: 1, background: "transparent", border: "none",
              fontFamily: FONT_KR, fontSize: 16, color: "#cfe9ff",
              outline: "none",
            }}
          />
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8", border: "1px solid #1f2a6b", padding: "2px 6px" }}>
            ESC
          </span>
        </div>

        {/* 결과 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {filteredNav.length > 0 && (
            <div>
              <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", padding: "8px 16px 4px" }}>
                페이지 이동
              </p>
              {filteredNav.map((c, i) => {
                const idx = i;
                const isActive = active === idx;
                return (
                  <button
                    key={c.id}
                    onClick={() => go(idx)}
                    onMouseEnter={() => setActive(idx)}
                    style={{
                      width: "100%", textAlign: "left",
                      padding: "10px 16px",
                      background: isActive ? `${c.accent}18` : "transparent",
                      border: "none",
                      borderLeft: isActive ? `3px solid ${c.accent}` : "3px solid transparent",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{c.icon}</span>
                    <span style={{ flex: 1 }}>
                      <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, color: isActive ? c.accent : "#cfe9ff" }}>
                        {c.title}
                      </p>
                      {c.hint && (
                        <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8" }}>{c.hint}</p>
                      )}
                    </span>
                    {isActive && (
                      <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: c.accent }}>↵</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {libHits.length > 0 && (
            <div>
              <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.12em", padding: "8px 16px 4px" }}>
                보관함 (제목·본문 검색)
              </p>
              {libHits.map((h, i) => {
                const idx = filteredNav.length + i;
                const isActive = active === idx;
                const c = AGENT_COLOR[h.agent_type] || "#5ce5ff";
                return (
                  <button
                    key={h.id}
                    onClick={() => go(idx)}
                    onMouseEnter={() => setActive(idx)}
                    style={{
                      width: "100%", textAlign: "left",
                      padding: "10px 16px",
                      background: isActive ? `${c}18` : "transparent",
                      border: "none",
                      borderLeft: isActive ? `3px solid ${c}` : "3px solid transparent",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{h.is_favorite ? "★" : "📄"}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, color: isActive ? c : "#cfe9ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {h.title}
                      </p>
                      <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8" }}>
                        {AGENT_LABEL[h.agent_type] || h.agent_type} · {h.kind}
                      </p>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredNav.length === 0 && libHits.length === 0 && q && (
            <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#7e94c8", padding: "20px 16px", textAlign: "center" }}>
              검색 결과가 없습니다. 다른 키워드를 입력해 보세요.
            </p>
          )}
        </div>

        {/* 푸터 */}
        <div style={{ borderTop: "1px solid #5ce5ff33", padding: "8px 16px", display: "flex", justifyContent: "space-between", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8" }}>
          <span>↑↓ 이동 · ↵ 선택 · ESC 닫기</span>
          <span>⌘K 토글</span>
        </div>
      </div>
    </div>
  );
}
