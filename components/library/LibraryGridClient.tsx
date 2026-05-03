"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

type LibItem = {
  id: string;
  title: string;
  category: string;
  cardCount: number;
  reviewState: "draft" | "needs_review" | "approved";
  thumb: string | null;
  isFavorite: boolean;
  updatedAt: string;
};

const STATE_LABEL: Record<string, string> = { draft: "초안", needs_review: "검토 필요", approved: "승인 완료" };
const STATE_COLOR: Record<string, string> = { draft: "#7e94c8", needs_review: "#ffd84d", approved: "#66ff9d" };

export function LibraryGridClient() {
  const [items, setItems] = useState<LibItem[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/card-library${filter ? `?reviewState=${filter}` : ""}`)
      .then((r) => r.json()).then((d) => { if (d.ok) setItems(d.items); }).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div style={{ background: "#060920", minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Link href="/desk/marky" style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", textDecoration: "none" }}>← 마키 데스크로</Link>
        <h1 style={{ fontFamily: FONT_PIX, fontSize: 18, color: "#ff4ec9", letterSpacing: "0.08em", marginTop: 12, marginBottom: 6 }}>
          ▌ CARD LIBRARY
        </h1>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#7e94c8", marginBottom: 20 }}>
          AI가 만든 + 사람이 편집한 모든 카드뉴스. 카드를 클릭해서 워크스페이스로 진입하세요.
        </p>

        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[{ id: "", label: "전체" }, { id: "draft", label: "초안" }, { id: "needs_review", label: "검토 필요" }, { id: "approved", label: "승인" }].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{
                background: filter === f.id ? "#ff4ec922" : "transparent",
                color: filter === f.id ? "#ff4ec9" : "#cfe9ff",
                border: `1px solid ${filter === f.id ? "#ff4ec9" : "#1f2a6b"}`,
                padding: "6px 14px", fontFamily: FONT_KR, fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>{f.label}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "#7e94c8", fontFamily: FONT_KR }}>불러오는 중…</p>
        ) : items.length === 0 ? (
          <p style={{ color: "#7e94c8", fontFamily: FONT_KR, padding: 40, textAlign: "center" }}>아직 보관된 카드뉴스가 없습니다.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {items.map((it) => (
              <Link key={it.id} href={`/library/${it.id}`}
                className="pixel-frame"
                style={{ background: "#0a0e27", border: "1px solid #ff4ec922", padding: 12, textDecoration: "none", display: "block" }}>
                <div style={{ height: 160, background: "#060920", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {it.thumb ? (
                    <img src={it.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "#4a5a8a", fontFamily: FONT_MONO, fontSize: 10 }}>{it.cardCount} cards</span>
                  )}
                </div>
                <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 4, lineHeight: 1.4 }}>
                  {it.title}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: STATE_COLOR[it.reviewState] }}>● {STATE_LABEL[it.reviewState]}</span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8" }}>{it.cardCount}장</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
