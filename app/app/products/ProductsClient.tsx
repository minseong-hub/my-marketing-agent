"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number | null;
  cost: number | null;
  features: string[];
  selling_points: string[];
  target_keywords: string[];
  image_urls: string[];
  external_url: string | null;
  notes: string | null;
  is_active: boolean;
  updated_at: string;
}

const LABEL_FONT = '"IBM Plex Sans KR", sans-serif';
const inputStyle: React.CSSProperties = {
  width: "100%", background: "#060920", border: "1px solid #1f2a6b",
  padding: "9px 12px", fontFamily: LABEL_FONT, fontSize: 15, color: "#cfe9ff",
  outline: "none", borderRadius: 0, boxSizing: "border-box",
};

function ChipInput({ value, onChange, placeholder, max }: { value: string[]; onChange: (v: string[]) => void; placeholder: string; max: number }) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim();
    if (!v || value.includes(v)) { setInput(""); return; }
    onChange([...value, v].slice(0, max));
    setInput("");
  }
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
        />
        <button type="button" onClick={add} style={{ background: "#5ce5ff", color: "#060920", border: "2px solid #5ce5ff", padding: "6px 14px", fontFamily: LABEL_FONT, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          추가
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {value.map((v, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "1px solid #5ce5ff66", background: "#5ce5ff11", color: "#5ce5ff", padding: "3px 8px", fontFamily: LABEL_FONT, fontSize: 12 }}>
            {v}
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: "#5ce5ff", cursor: "pointer", padding: 0, marginLeft: 2 }}>✕</button>
          </span>
        ))}
      </div>
    </div>
  );
}

const EMPTY_FORM: Omit<Product, "id" | "updated_at"> = {
  name: "", category: "", price: null, cost: null,
  features: [], selling_points: [], target_keywords: [], image_urls: [],
  external_url: null, notes: null, is_active: true,
};

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setProducts(d.products);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function startCreate() {
    setForm(EMPTY_FORM);
    setEditing(null);
    setCreating(true);
  }
  function startEdit(p: Product) {
    setForm({ ...p });
    setEditing(p.id);
    setCreating(false);
  }
  function cancel() { setEditing(null); setCreating(false); }

  async function save() {
    setMessage(null);
    const url = editing ? `/api/products/${editing}` : "/api/products";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMessage(editing ? "✓ 수정되었습니다." : "✓ 등록되었습니다. 비서들이 즉시 반영합니다.");
      cancel();
      load();
    } else {
      const d = await res.json();
      setMessage(`✗ ${d.error || "저장 실패"}`);
    }
  }

  async function remove(id: string) {
    if (!confirm("이 상품을 삭제할까요?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <div style={{ background: "#060920", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "10px 20px", borderBottom: "1px solid #1f2a6b", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#060920" }}>
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 14, color: "#ff4ec9", textShadow: "2px 2px 0 #8a2877" }}>CREWMATE AI</span>
        <Link href="/app/assistants" style={{ fontFamily: LABEL_FONT, fontSize: 14, color: "#cfe9ff", textDecoration: "none", fontWeight: 500 }}>
          ← 비서 현황판
        </Link>
      </nav>

      <div style={{ flex: 1, padding: "24px 20px", maxWidth: 980, width: "100%", margin: "0 auto" }}>
        <p style={{ fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 600, color: "#5ce5ff", marginBottom: 6 }}>상품 카탈로그</p>
        <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: "clamp(18px, 2vw, 22px)", color: "#cfe9ff", textShadow: "3px 3px 0 #8a2877", marginBottom: 12 }}>
          내 상품
        </h1>
        <p style={{ fontFamily: LABEL_FONT, fontSize: 16, color: "#cfe9ff", lineHeight: 1.7, marginBottom: 20 }}>
          한 번 등록하면 데일리(상세페이지), 마키(SNS), 애디(광고) 비서가 자동으로 이 정보를 활용합니다. 매번 상품을 설명하지 않아도 돼요.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button
            onClick={startCreate}
            className="pixel-frame"
            style={{ background: "#ff4ec9", color: "#060920", border: "2px solid #ff4ec9", boxShadow: "3px 3px 0 #8a2877", padding: "9px 18px", fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            ＋ 새 상품 등록
          </button>
          <span style={{ fontFamily: LABEL_FONT, fontSize: 14, color: "#7e94c8", alignSelf: "center" }}>
            등록된 상품: {products.length}개
          </span>
        </div>

        {message && (
          <div style={{ marginBottom: 16, padding: "10px 14px", border: `1px solid ${message.startsWith("✗") ? "#ff4ec9" : "#66ff9d"}`, background: message.startsWith("✗") ? "#ff4ec911" : "#66ff9d11", fontFamily: LABEL_FONT, fontSize: 14, color: message.startsWith("✗") ? "#ff4ec9" : "#66ff9d" }}>
            {message}
          </div>
        )}

        {(creating || editing) && (
          <div className="pixel-frame" style={{ border: "1px solid #5ce5ff66", background: "#0a0e27", padding: 20, marginBottom: 20 }}>
            <h2 style={{ fontFamily: LABEL_FONT, fontSize: 18, fontWeight: 700, color: "#cfe9ff", marginBottom: 12 }}>
              {editing ? "상품 수정" : "새 상품 등록"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontFamily: LABEL_FONT, fontSize: 13, fontWeight: 600, color: "#cfe9ff", display: "block", marginBottom: 4 }}>상품명 *</label>
                <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예: 가을 베이직 니트 라운드" />
              </div>
              <div>
                <label style={{ fontFamily: LABEL_FONT, fontSize: 13, fontWeight: 600, color: "#cfe9ff", display: "block", marginBottom: 4 }}>카테고리</label>
                <input style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="예: 의류 / 여성 니트" />
              </div>
              <div>
                <label style={{ fontFamily: LABEL_FONT, fontSize: 13, fontWeight: 600, color: "#cfe9ff", display: "block", marginBottom: 4 }}>판매가 (원)</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.price ?? ""}
                  onChange={(e) => setForm({ ...form, price: e.target.value ? Number(e.target.value) : null })}
                  placeholder="예: 39000"
                />
              </div>
              <div>
                <label style={{ fontFamily: LABEL_FONT, fontSize: 13, fontWeight: 600, color: "#cfe9ff", display: "block", marginBottom: 4 }}>매입가 (원, 선택)</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.cost ?? ""}
                  onChange={(e) => setForm({ ...form, cost: e.target.value ? Number(e.target.value) : null })}
                  placeholder="예: 18000"
                />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ fontFamily: LABEL_FONT, fontSize: 13, fontWeight: 600, color: "#cfe9ff", display: "block", marginBottom: 4 }}>주요 특징 (엔터로 추가)</label>
              <ChipInput value={form.features} onChange={(v) => setForm({ ...form, features: v })} placeholder="예: 100% 면, 색상 5종, 봄가을용" max={20} />
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ fontFamily: LABEL_FONT, fontSize: 13, fontWeight: 600, color: "#cfe9ff", display: "block", marginBottom: 4 }}>셀링포인트 (엔터로 추가)</label>
              <ChipInput value={form.selling_points} onChange={(v) => setForm({ ...form, selling_points: v })} placeholder="예: 단독 디자인, 1일 배송, 무료 반품" max={10} />
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ fontFamily: LABEL_FONT, fontSize: 13, fontWeight: 600, color: "#cfe9ff", display: "block", marginBottom: 4 }}>타겟 키워드 (SEO/광고용)</label>
              <ChipInput value={form.target_keywords} onChange={(v) => setForm({ ...form, target_keywords: v })} placeholder="예: 가을니트, 여성라운드니트" max={20} />
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ fontFamily: LABEL_FONT, fontSize: 13, fontWeight: 600, color: "#cfe9ff", display: "block", marginBottom: 4 }}>외부 URL (스마트스토어 등)</label>
              <input style={inputStyle} value={form.external_url ?? ""} onChange={(e) => setForm({ ...form, external_url: e.target.value || null })} placeholder="https://smartstore.naver.com/..." />
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ fontFamily: LABEL_FONT, fontSize: 13, fontWeight: 600, color: "#cfe9ff", display: "block", marginBottom: 4 }}>비서에게 전달할 메모 (선택)</label>
              <textarea
                rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                value={form.notes ?? ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
                placeholder="특정 상황·주의사항·구매 후기 핵심 등"
              />
            </div>

            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                id="active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              <label htmlFor="active" style={{ fontFamily: LABEL_FONT, fontSize: 14, color: "#cfe9ff" }}>비서가 자동 참조 (체크 해제 시 카탈로그에 보존하되 컨텍스트에서 제외)</label>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <button
                onClick={save}
                disabled={!form.name.trim()}
                className="pixel-frame"
                style={{ background: "#ff4ec9", color: "#060920", border: "2px solid #ff4ec9", boxShadow: "3px 3px 0 #8a2877", padding: "9px 22px", fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 700, cursor: form.name.trim() ? "pointer" : "not-allowed", opacity: form.name.trim() ? 1 : 0.5 }}
              >
                ▶ {editing ? "수정 저장" : "등록"}
              </button>
              <button onClick={cancel} style={{ background: "none", color: "#7e94c8", border: "1px solid #1f2a6b", padding: "9px 18px", fontFamily: LABEL_FONT, fontSize: 14, cursor: "pointer", fontWeight: 500 }}>
                취소
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ fontFamily: LABEL_FONT, fontSize: 15, color: "#7e94c8" }}>불러오는 중...</p>
        ) : products.length === 0 ? (
          <div style={{ border: "1px dashed #1f2a6b", padding: "40px 20px", textAlign: "center", fontFamily: LABEL_FONT, fontSize: 15, color: "#7e94c8" }}>
            아직 등록된 상품이 없습니다. 상단의 <b style={{ color: "#cfe9ff" }}>＋ 새 상품 등록</b> 버튼을 눌러 시작해 주세요.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
            {products.map((p) => (
              <div key={p.id} className="pixel-frame" style={{ border: `1px solid ${p.is_active ? "#5ce5ff44" : "#1f2a6b"}`, background: "#0a0e27", padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <p style={{ fontFamily: LABEL_FONT, fontSize: 16, fontWeight: 700, color: "#cfe9ff", marginBottom: 2 }}>{p.name}</p>
                    {p.category && <p style={{ fontFamily: LABEL_FONT, fontSize: 13, color: "#7e94c8" }}>{p.category}</p>}
                  </div>
                  {!p.is_active && (
                    <span style={{ fontFamily: LABEL_FONT, fontSize: 11, color: "#7e94c8", border: "1px solid #1f2a6b", padding: "1px 6px" }}>비활성</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 8, fontFamily: LABEL_FONT, fontSize: 14 }}>
                  {p.price !== null && <span style={{ color: "#cfe9ff" }}>판매가 <b>{p.price.toLocaleString()}원</b></span>}
                  {p.cost !== null && <span style={{ color: "#7e94c8" }}>매입가 {p.cost.toLocaleString()}원</span>}
                </div>
                {p.selling_points.length > 0 && (
                  <p style={{ fontFamily: LABEL_FONT, fontSize: 13, color: "#cfe9ff", lineHeight: 1.6, marginBottom: 6 }}>
                    <span style={{ color: "#5ce5ff", fontWeight: 600 }}>셀링포인트</span> · {p.selling_points.join(" / ")}
                  </p>
                )}
                {p.target_keywords.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                    {p.target_keywords.slice(0, 6).map((k) => (
                      <span key={k} style={{ fontFamily: LABEL_FONT, fontSize: 11, color: "#5ce5ff", border: "1px solid #5ce5ff44", padding: "1px 6px" }}>{k}</span>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button onClick={() => startEdit(p)} style={{ background: "none", color: "#5ce5ff", border: "1px solid #5ce5ff44", padding: "5px 12px", fontFamily: LABEL_FONT, fontSize: 13, cursor: "pointer" }}>수정</button>
                  <button onClick={() => remove(p.id)} style={{ background: "none", color: "#ff4ec9", border: "1px solid #ff4ec944", padding: "5px 12px", fontFamily: LABEL_FONT, fontSize: 13, cursor: "pointer" }}>삭제</button>
                  {p.external_url && (
                    <a href={p.external_url} target="_blank" rel="noreferrer" style={{ background: "none", color: "#7e94c8", border: "1px solid #1f2a6b", padding: "5px 12px", fontFamily: LABEL_FONT, fontSize: 13, textDecoration: "none" }}>
                      외부 페이지 ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
