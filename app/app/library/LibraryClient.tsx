"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/primitives/EmptyState";
import { SkeletonGrid } from "@/components/primitives/Skeleton";

interface LibraryItem {
  id: string;
  agent_type: string;
  kind: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  tags: string[];
  is_favorite: boolean;
  source_session_id: string | null;
  created_at: string;
  updated_at: string;
}

const LABEL_FONT = '"IBM Plex Sans KR", sans-serif';

const KIND_LABEL: Record<string, string> = {
  content_draft: "SNS 콘텐츠",
  detail_section: "상세페이지",
  ad_campaign: "광고 캠페인",
  ad_creative: "🎯 광고 소재",
  card_news: "📱 카드뉴스",
  agent_response: "비서 응답",
  finance_report: "재무 리포트",
  note: "메모",
  user: "내 메모",
};

const AGENT_LABEL: Record<string, string> = {
  marketing: "마키",
  detail_page: "데일리",
  ads: "애디",
  finance: "페니",
  user: "사용자",
};

const AGENT_COLOR: Record<string, string> = {
  marketing: "#ff4ec9",
  detail_page: "#5ce5ff",
  ads: "#ffd84d",
  finance: "#66ff9d",
  user: "#7e94c8",
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#060920", border: "1px solid #1f2a6b",
  padding: "9px 12px", fontFamily: LABEL_FONT, fontSize: 15, color: "#cfe9ff",
  outline: "none", borderRadius: 0, boxSizing: "border-box",
};

export default function LibraryClient() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [counts, setCounts] = useState<{ total: number; favorites: number; byKind: Record<string, number> }>({ total: 0, favorites: 0, byKind: {} });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ agent_type?: string; kind?: string; favorite?: boolean; q: string }>({ q: "" });
  const [opened, setOpened] = useState<LibraryItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [createMode, setCreateMode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.agent_type) params.set("agent_type", filter.agent_type);
      if (filter.kind) params.set("kind", filter.kind);
      if (filter.favorite) params.set("favorite", "1");
      if (filter.q) params.set("q", filter.q);
      const res = await fetch(`/api/library?${params}`, { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setItems(d.items);
        setCounts(d.counts);
      }
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function toggleFavorite(item: LibraryItem) {
    await fetch(`/api/library/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_favorite: !item.is_favorite }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("이 항목을 삭제할까요?")) return;
    await fetch(`/api/library/${id}`, { method: "DELETE" });
    setOpened(null);
    load();
  }

  async function saveEdit() {
    if (!opened) return;
    const res = await fetch(`/api/library/${opened.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, content: editContent }),
    });
    if (res.ok) {
      setOpened(null);
      load();
    }
  }

  async function createItem() {
    const res = await fetch("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent_type: "user",
        kind: "note",
        title: editTitle || "(제목 없음)",
        content: editContent,
      }),
    });
    if (res.ok) {
      setCreateMode(false);
      setEditTitle("");
      setEditContent("");
      load();
    }
  }

  function copy(content: string) {
    navigator.clipboard.writeText(content);
  }

  return (
    <div style={{ background: "#060920", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "10px 20px", borderBottom: "1px solid #1f2a6b", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#060920" }}>
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 14, color: "#ff4ec9", textShadow: "2px 2px 0 #8a2877" }}>CREWMATE AI</span>
        <Link href="/app/assistants" style={{ fontFamily: LABEL_FONT, fontSize: 14, color: "#cfe9ff", textDecoration: "none", fontWeight: 500 }}>
          ← 비서 현황판
        </Link>
      </nav>

      <div style={{ flex: 1, padding: "24px 20px", maxWidth: 1080, width: "100%", margin: "0 auto" }}>
        <p style={{ fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 600, color: "#5ce5ff", marginBottom: 6 }}>보관함</p>
        <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: "clamp(18px, 2vw, 22px)", color: "#cfe9ff", textShadow: "3px 3px 0 #8a2877", marginBottom: 12 }}>
          모든 결과물 한 곳에서
        </h1>
        <p style={{ fontFamily: LABEL_FONT, fontSize: 16, color: "#cfe9ff", lineHeight: 1.7, marginBottom: 18 }}>
          비서들이 만든 콘텐츠/캠페인/상세페이지 카피와 내가 직접 작성한 메모를 한 곳에서 관리하세요. 좋은 결과는 즐겨찾기 ★ 표시.
        </p>

        {/* 통계 + 필터 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
          <button onClick={() => setFilter({ q: "" })} className="pixel-frame" style={{ background: !filter.kind && !filter.agent_type && !filter.favorite ? "#5ce5ff22" : "#0a0e27", border: "1px solid #5ce5ff44", padding: 12, cursor: "pointer", textAlign: "left" }}>
            <p style={{ fontFamily: LABEL_FONT, fontSize: 13, color: "#7e94c8" }}>전체</p>
            <p style={{ fontFamily: LABEL_FONT, fontSize: 18, fontWeight: 700, color: "#cfe9ff" }}>{counts.total}</p>
          </button>
          <button onClick={() => setFilter({ q: filter.q, favorite: true })} className="pixel-frame" style={{ background: filter.favorite ? "#ffd84d22" : "#0a0e27", border: "1px solid #ffd84d44", padding: 12, cursor: "pointer", textAlign: "left" }}>
            <p style={{ fontFamily: LABEL_FONT, fontSize: 13, color: "#7e94c8" }}>★ 즐겨찾기</p>
            <p style={{ fontFamily: LABEL_FONT, fontSize: 18, fontWeight: 700, color: "#ffd84d" }}>{counts.favorites}</p>
          </button>
          {(["marketing", "detail_page", "ads", "finance"] as const).map((at) => (
            <button
              key={at}
              onClick={() => setFilter({ q: filter.q, agent_type: at })}
              className="pixel-frame"
              style={{ background: filter.agent_type === at ? `${AGENT_COLOR[at]}22` : "#0a0e27", border: `1px solid ${AGENT_COLOR[at]}44`, padding: 12, cursor: "pointer", textAlign: "left" }}
            >
              <p style={{ fontFamily: LABEL_FONT, fontSize: 13, color: "#7e94c8" }}>{AGENT_LABEL[at]}</p>
              <p style={{ fontFamily: LABEL_FONT, fontSize: 18, fontWeight: 700, color: AGENT_COLOR[at] }}>
                {Object.entries(counts.byKind).filter(([k]) => k.startsWith("") /* 모든 kind */).reduce((s, [, v]) => s + v, 0) > 0
                  ? items.filter(i => i.agent_type === at).length
                  : 0}
              </p>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            placeholder="제목/본문 검색"
            value={filter.q}
            onChange={(e) => setFilter({ ...filter, q: e.target.value })}
          />
          <button
            onClick={() => { setCreateMode(true); setEditTitle(""); setEditContent(""); setOpened(null); }}
            className="pixel-frame"
            style={{ background: "#ff4ec9", color: "#060920", border: "2px solid #ff4ec9", boxShadow: "3px 3px 0 #8a2877", padding: "9px 16px", fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            ＋ 메모 추가
          </button>
        </div>

        {createMode && (
          <div className="pixel-frame" style={{ border: "1px solid #ff4ec966", background: "#0a0e27", padding: 16, marginBottom: 16 }}>
            <p style={{ fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 700, color: "#ff4ec9", marginBottom: 8 }}>새 메모</p>
            <input style={inputStyle} placeholder="제목" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <textarea
              rows={6}
              style={{ ...inputStyle, marginTop: 8, resize: "vertical", lineHeight: 1.6 }}
              placeholder="내용"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={createItem} className="pixel-frame" style={{ background: "#ff4ec9", color: "#060920", border: "2px solid #ff4ec9", padding: "8px 18px", fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>저장</button>
              <button onClick={() => setCreateMode(false)} style={{ background: "none", color: "#7e94c8", border: "1px solid #1f2a6b", padding: "8px 16px", fontFamily: LABEL_FONT, fontSize: 14, cursor: "pointer" }}>취소</button>
            </div>
          </div>
        )}

        {loading ? (
          <SkeletonGrid count={6} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="📦"
            accent="#5ce5ff"
            title="아직 보관된 항목이 없어요"
            description="비서에게 임무를 시키면 결과물이 자동으로 이곳에 저장됩니다. 좋은 결과는 ★ 표시로 즐겨찾기 해두면 다음에 빠르게 다시 쓸 수 있어요."
            example="마키에게 '이번 주 인스타 캡션 3개' 시키면 보관함에 자동 저장"
            primaryAction={{ label: "마키에게 임무 시키기", href: "/desk/marky" }}
            secondaryAction={{ label: "메모 직접 추가", onClick: () => { setCreateMode(true); setEditTitle(""); setEditContent(""); } }}
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
            {items.map((it) => (
              <div key={it.id} className="pixel-frame" style={{ border: `1px solid ${AGENT_COLOR[it.agent_type] || "#1f2a6b"}44`, background: "#0a0e27", padding: 14, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontFamily: LABEL_FONT, fontSize: 12, fontWeight: 600, color: AGENT_COLOR[it.agent_type] || "#7e94c8" }}>
                    {AGENT_LABEL[it.agent_type] || it.agent_type} · {KIND_LABEL[it.kind] || it.kind}
                  </span>
                  <button
                    onClick={() => toggleFavorite(it)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: it.is_favorite ? "#ffd84d" : "#1f2a6b" }}
                    title={it.is_favorite ? "즐겨찾기 해제" : "즐겨찾기"}
                  >
                    {it.is_favorite ? "★" : "☆"}
                  </button>
                </div>
                <p style={{ fontFamily: LABEL_FONT, fontSize: 15, fontWeight: 700, color: "#cfe9ff", marginBottom: 6, lineHeight: 1.4 }}>{it.title}</p>
                <p style={{ fontFamily: LABEL_FONT, fontSize: 13, color: "#cfe9ff", lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", flex: 1, marginBottom: 8 }}>
                  {it.content}
                </p>
                <p style={{ fontFamily: LABEL_FONT, fontSize: 11, color: "#7e94c8", marginBottom: 8 }}>
                  {new Date(it.updated_at).toLocaleString("ko-KR")}
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => { setOpened(it); setEditTitle(it.title); setEditContent(it.content); setCreateMode(false); }}
                    style={{ background: "none", color: "#5ce5ff", border: "1px solid #5ce5ff44", padding: "4px 10px", fontFamily: LABEL_FONT, fontSize: 12, cursor: "pointer" }}
                  >
                    열기/편집
                  </button>
                  <button
                    onClick={() => copy(it.content)}
                    style={{ background: "none", color: "#cfe9ff", border: "1px solid #1f2a6b", padding: "4px 10px", fontFamily: LABEL_FONT, fontSize: 12, cursor: "pointer" }}
                  >
                    📋 복사
                  </button>
                  <button
                    onClick={() => remove(it.id)}
                    style={{ background: "none", color: "#ff4ec9", border: "1px solid #ff4ec944", padding: "4px 10px", fontFamily: LABEL_FONT, fontSize: 12, cursor: "pointer", marginLeft: "auto" }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 편집 모달 */}
        {opened && (
          <div
            onClick={() => setOpened(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="pixel-frame"
              style={{ background: "#0a0e27", border: "2px solid #5ce5ff", padding: 20, maxWidth: 720, width: "100%", maxHeight: "85vh", overflow: "auto" }}
            >
              <p style={{ fontFamily: LABEL_FONT, fontSize: 12, color: AGENT_COLOR[opened.agent_type] || "#7e94c8", marginBottom: 6 }}>
                {AGENT_LABEL[opened.agent_type]} · {KIND_LABEL[opened.kind] || opened.kind}
              </p>
              <input style={inputStyle} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              <textarea
                rows={16}
                style={{ ...inputStyle, marginTop: 8, resize: "vertical", lineHeight: 1.7 }}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={saveEdit} className="pixel-frame" style={{ background: "#ff4ec9", color: "#060920", border: "2px solid #ff4ec9", padding: "8px 18px", fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>저장</button>
                <button onClick={() => copy(editContent)} style={{ background: "none", color: "#5ce5ff", border: "1px solid #5ce5ff44", padding: "8px 16px", fontFamily: LABEL_FONT, fontSize: 14, cursor: "pointer" }}>📋 복사</button>
                <button onClick={() => setOpened(null)} style={{ background: "none", color: "#7e94c8", border: "1px solid #1f2a6b", padding: "8px 16px", fontFamily: LABEL_FONT, fontSize: 14, cursor: "pointer", marginLeft: "auto" }}>닫기</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
