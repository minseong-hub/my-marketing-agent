"use client";

import { useState } from "react";
import type { EditableCard, AutoFlag } from "@/lib/studio/card-types";
import { EDITABLE_LAYOUTS, EDITABLE_KIND_LABELS } from "@/lib/studio/card-types";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_MONO = '"JetBrains Mono", monospace';

type Tab = "text" | "design" | "effects" | "meta";

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#060920", border: "1px solid #1f2a6b",
  padding: "8px 10px", fontFamily: FONT_KR, fontSize: 12, color: "#cfe9ff",
  outline: "none", borderRadius: 0, boxSizing: "border-box",
};

export function CardInspector({
  card, onChange, caption, hashtags, onMetaChange, cardFlags,
}: {
  card: EditableCard;
  onChange: (patch: Partial<EditableCard>) => void;
  caption: string[];
  hashtags: string[];
  onMetaChange: (patch: { caption?: { variants: string[] }; hashtags?: string[] }) => void;
  cardFlags: AutoFlag[];
}) {
  const [tab, setTab] = useState<Tab>("text");

  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 14, borderBottom: "1px solid #1f2a6b", paddingBottom: 8 }}>
        {([
          { id: "text", label: "텍스트" },
          { id: "design", label: "디자인" },
          { id: "effects", label: "효과" },
          { id: "meta", label: "메타" },
        ] as Array<{ id: Tab; label: string }>).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: "6px 4px",
              background: tab === t.id ? "#ff4ec918" : "transparent",
              color: tab === t.id ? "#ff4ec9" : "#cfe9ff",
              border: `1px solid ${tab === t.id ? "#ff4ec9" : "#1f2a6b"}`,
              fontFamily: FONT_KR, fontSize: 11, fontWeight: 700, cursor: "pointer",
            }}>{t.label}</button>
        ))}
      </div>

      {tab === "text" && <TextTab card={card} onChange={onChange} />}
      {tab === "design" && <DesignTab card={card} onChange={onChange} />}
      {tab === "effects" && <EffectsTab card={card} onChange={onChange} />}
      {tab === "meta" && <MetaTab caption={caption} hashtags={hashtags} onChange={onMetaChange} />}

      {cardFlags.length > 0 && (
        <div style={{ marginTop: 14, padding: 10, background: "#0a0e27", border: "1px solid #ffd84d44" }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#ffd84d", letterSpacing: "0.16em", marginBottom: 6 }}>
            ⚠ 자동 검수 — 이 카드
          </p>
          {cardFlags.map((f, i) => (
            <p key={i} style={{ fontFamily: FONT_KR, fontSize: 11, color: f.severity === "error" ? "#ff6688" : "#ffd84d", lineHeight: 1.5 }}>
              · {f.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: FONT_KR, fontSize: 11, color: "#7e94c8", marginBottom: 4, marginTop: 8 }}>{children}</p>;
}

function TextTab({ card, onChange }: { card: EditableCard; onChange: (patch: Partial<EditableCard>) => void }) {
  return (
    <div>
      <Label>카드 종류</Label>
      <select value={card.kind} onChange={(e) => onChange({ kind: e.target.value as any })} style={inputStyle as any}>
        {Object.entries(EDITABLE_KIND_LABELS).map(([k, label]) => (
          <option key={k} value={k}>{label}</option>
        ))}
      </select>

      <Label>헤드라인 ({card.text.headline.length}/28)</Label>
      <textarea
        value={card.text.headline}
        onChange={(e) => onChange({ text: { ...card.text, headline: e.target.value } })}
        rows={2}
        style={{ ...inputStyle, resize: "vertical" } as any}
      />

      <Label>서브카피</Label>
      <input value={card.text.sub ?? ""} onChange={(e) => onChange({ text: { ...card.text, sub: e.target.value } })} style={inputStyle} />

      <Label>본문 ({(card.text.body ?? "").length}/220)</Label>
      <textarea
        value={card.text.body ?? ""}
        onChange={(e) => onChange({ text: { ...card.text, body: e.target.value } })}
        rows={4}
        style={{ ...inputStyle, resize: "vertical" } as any}
      />

      {card.kind === "stat" && (
        <>
          <Label>통계 — 값/단위/캡션</Label>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 6 }}>
            <input value={card.text.stat?.value ?? ""} onChange={(e) => onChange({ text: { ...card.text, stat: { ...(card.text.stat ?? { value: "" }), value: e.target.value } } })} placeholder="값 (예: 87)" style={inputStyle} />
            <input value={card.text.stat?.unit ?? ""} onChange={(e) => onChange({ text: { ...card.text, stat: { ...(card.text.stat ?? { value: "" }), unit: e.target.value } } })} placeholder="단위 (%)" style={inputStyle} />
          </div>
          <input value={card.text.stat?.caption ?? ""} onChange={(e) => onChange({ text: { ...card.text, stat: { ...(card.text.stat ?? { value: "" }), caption: e.target.value } } })} placeholder="캡션" style={{ ...inputStyle, marginTop: 6 }} />
        </>
      )}

      {card.kind === "compare" && (
        <>
          <Label>비교 — 좌</Label>
          <input value={card.text.compare?.leftLabel ?? ""} onChange={(e) => onChange({ text: { ...card.text, compare: { ...(card.text.compare ?? { left: "", right: "" }), leftLabel: e.target.value } } })} placeholder="좌측 라벨" style={inputStyle} />
          <input value={card.text.compare?.left ?? ""} onChange={(e) => onChange({ text: { ...card.text, compare: { ...(card.text.compare ?? { left: "", right: "" }), left: e.target.value } } })} placeholder="좌측 내용" style={{ ...inputStyle, marginTop: 4 }} />
          <Label>비교 — 우</Label>
          <input value={card.text.compare?.rightLabel ?? ""} onChange={(e) => onChange({ text: { ...card.text, compare: { ...(card.text.compare ?? { left: "", right: "" }), rightLabel: e.target.value } } })} placeholder="우측 라벨" style={inputStyle} />
          <input value={card.text.compare?.right ?? ""} onChange={(e) => onChange({ text: { ...card.text, compare: { ...(card.text.compare ?? { left: "", right: "" }), right: e.target.value } } })} placeholder="우측 내용" style={{ ...inputStyle, marginTop: 4 }} />
        </>
      )}

      {card.kind === "quote" && (
        <>
          <Label>인용</Label>
          <textarea value={card.text.quote?.text ?? ""} onChange={(e) => onChange({ text: { ...card.text, quote: { ...(card.text.quote ?? { text: "" }), text: e.target.value } } })} rows={3} style={{ ...inputStyle, resize: "vertical" } as any} />
          <input value={card.text.quote?.attribution ?? ""} onChange={(e) => onChange({ text: { ...card.text, quote: { ...(card.text.quote ?? { text: "" }), attribution: e.target.value } } })} placeholder="출처/말한 사람" style={{ ...inputStyle, marginTop: 4 }} />
        </>
      )}

      {card.kind === "cta" && (
        <>
          <Label>CTA</Label>
          <input value={card.text.cta?.headline ?? ""} onChange={(e) => onChange({ text: { ...card.text, cta: { ...(card.text.cta ?? { headline: "" }), headline: e.target.value } } })} placeholder="CTA 헤드라인" style={inputStyle} />
          <input value={card.text.cta?.sub ?? ""} onChange={(e) => onChange({ text: { ...card.text, cta: { ...(card.text.cta ?? { headline: "" }), sub: e.target.value } } })} placeholder="서브" style={{ ...inputStyle, marginTop: 4 }} />
          <input value={card.text.cta?.button ?? ""} onChange={(e) => onChange({ text: { ...card.text, cta: { ...(card.text.cta ?? { headline: "" }), button: e.target.value } } })} placeholder="버튼 라벨" style={{ ...inputStyle, marginTop: 4 }} />
        </>
      )}
    </div>
  );
}

function DesignTab({ card, onChange }: { card: EditableCard; onChange: (patch: Partial<EditableCard>) => void }) {
  return (
    <div>
      <Label>레이아웃</Label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
        {EDITABLE_LAYOUTS.map((l) => (
          <button key={l.id} onClick={() => onChange({ design: { ...card.design, layout: l.id } })}
            style={{
              padding: "6px 8px",
              background: card.design.layout === l.id ? "#ff4ec918" : "transparent",
              color: card.design.layout === l.id ? "#ff4ec9" : "#cfe9ff",
              border: `1px solid ${card.design.layout === l.id ? "#ff4ec9" : "#1f2a6b"}`,
              fontFamily: FONT_KR, fontSize: 11, cursor: "pointer", textAlign: "left",
            }}>
            <p style={{ fontWeight: 700 }}>{l.label}</p>
            <p style={{ fontSize: 9, color: "#7e94c8" }}>{l.hint}</p>
          </button>
        ))}
      </div>

      <Label>색상 토큰</Label>
      {(["bg", "surface", "text", "accent", "muted"] as const).map((key) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", width: 60 }}>{key}</span>
          <input type="color" value={card.design.palette[key]}
            onChange={(e) => onChange({ design: { ...card.design, palette: { ...card.design.palette, [key]: e.target.value } } })}
            style={{ width: 36, height: 26, border: "1px solid #1f2a6b", background: "transparent", cursor: "pointer" }} />
          <input value={card.design.palette[key]}
            onChange={(e) => onChange({ design: { ...card.design, palette: { ...card.design.palette, [key]: e.target.value } } })}
            style={{ ...inputStyle, fontSize: 11, padding: "4px 6px" }} />
        </div>
      ))}

      <Label>폰트 크기 ({card.design.fontScale.toFixed(2)}x)</Label>
      <input type="range" min={0.7} max={1.4} step={0.05} value={card.design.fontScale}
        onChange={(e) => onChange({ design: { ...card.design, fontScale: parseFloat(e.target.value) } })}
        style={{ width: "100%" }} />

      <Label>배경</Label>
      <select value={card.background.kind} onChange={(e) => onChange({ background: { ...card.background, kind: e.target.value as any } })} style={inputStyle as any}>
        <option value="color">단색</option>
        <option value="gradient">그라데이션</option>
        <option value="image">이미지</option>
      </select>
      {card.background.kind === "color" && (
        <input type="color" value={card.background.color ?? card.design.palette.bg}
          onChange={(e) => onChange({ background: { ...card.background, color: e.target.value } })}
          style={{ width: "100%", height: 32, border: "1px solid #1f2a6b", background: "transparent", cursor: "pointer", marginTop: 6 }} />
      )}
      {card.background.kind === "gradient" && (
        <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
          <input type="color" value={card.background.gradientFrom ?? card.design.palette.bg}
            onChange={(e) => onChange({ background: { ...card.background, gradientFrom: e.target.value } })}
            style={{ flex: 1, height: 28, border: "1px solid #1f2a6b", background: "transparent", cursor: "pointer" }} />
          <input type="color" value={card.background.gradientTo ?? card.design.palette.accent}
            onChange={(e) => onChange({ background: { ...card.background, gradientTo: e.target.value } })}
            style={{ flex: 1, height: 28, border: "1px solid #1f2a6b", background: "transparent", cursor: "pointer" }} />
        </div>
      )}
    </div>
  );
}

function EffectsTab({ card, onChange }: { card: EditableCard; onChange: (patch: Partial<EditableCard>) => void }) {
  const glow = card.effects.glow;
  const stroke = card.effects.stroke;
  return (
    <div>
      <Label>글로우</Label>
      <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontFamily: FONT_KR, fontSize: 11, color: "#cfe9ff" }}>
        <input type="checkbox" checked={!!glow}
          onChange={(e) => onChange({ effects: { ...card.effects, glow: e.target.checked ? { color: card.design.palette.accent, intensity: 0.6 } : undefined } })} />
        텍스트 글로우 사용
      </label>
      {glow && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <input type="color" value={glow.color}
              onChange={(e) => onChange({ effects: { ...card.effects, glow: { ...glow, color: e.target.value } } })}
              style={{ width: 36, height: 26, border: "1px solid #1f2a6b", background: "transparent", cursor: "pointer" }} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8" }}>강도 {glow.intensity.toFixed(2)}</span>
          </div>
          <input type="range" min={0} max={1} step={0.05} value={glow.intensity}
            onChange={(e) => onChange({ effects: { ...card.effects, glow: { ...glow, intensity: parseFloat(e.target.value) } } })}
            style={{ width: "100%" }} />
        </>
      )}

      <Label>테두리 스트로크</Label>
      <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontFamily: FONT_KR, fontSize: 11, color: "#cfe9ff" }}>
        <input type="checkbox" checked={!!stroke}
          onChange={(e) => onChange({ effects: { ...card.effects, stroke: e.target.checked ? { color: card.design.palette.accent, width: 2 } : undefined } })} />
        텍스트 테두리 사용
      </label>
      {stroke && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="color" value={stroke.color}
            onChange={(e) => onChange({ effects: { ...card.effects, stroke: { ...stroke, color: e.target.value } } })}
            style={{ width: 36, height: 26, border: "1px solid #1f2a6b", background: "transparent", cursor: "pointer" }} />
          <input type="number" min={0} max={6} value={stroke.width}
            onChange={(e) => onChange({ effects: { ...card.effects, stroke: { ...stroke, width: parseInt(e.target.value) || 0 } } })}
            style={{ ...inputStyle, fontSize: 11, padding: "4px 6px", width: 70 }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8" }}>px</span>
        </div>
      )}

      <Label>패턴 오버레이</Label>
      <select value={card.effects.pattern ?? "none"}
        onChange={(e) => onChange({ effects: { ...card.effects, pattern: e.target.value as any } })}
        style={inputStyle as any}>
        <option value="none">없음</option>
        <option value="dots">도트</option>
        <option value="grid">그리드</option>
        <option value="noise">노이즈</option>
        <option value="gradient_mesh">그라데이션 메시</option>
      </select>
    </div>
  );
}

function MetaTab({ caption, hashtags, onChange }: { caption: string[]; hashtags: string[]; onChange: (patch: { caption?: { variants: string[] }; hashtags?: string[] }) => void }) {
  const [editingCaption, setEditingCaption] = useState<string>(caption[0] ?? "");
  const [editingHashtags, setEditingHashtags] = useState<string>(hashtags.join(" "));

  return (
    <div>
      <Label>캡션 (인스타 게시 시 본문)</Label>
      <textarea value={editingCaption}
        onChange={(e) => setEditingCaption(e.target.value)}
        onBlur={() => onChange({ caption: { variants: [editingCaption, ...(caption.slice(1))] } })}
        rows={6} style={{ ...inputStyle, resize: "vertical" } as any} />

      <Label>해시태그 (공백 구분)</Label>
      <textarea value={editingHashtags}
        onChange={(e) => setEditingHashtags(e.target.value)}
        onBlur={() => onChange({ hashtags: editingHashtags.split(/\s+/).filter(Boolean).map((h) => h.replace(/^#/, "")).slice(0, 30) })}
        rows={3} style={{ ...inputStyle, resize: "vertical" } as any} />

      <p style={{ fontFamily: FONT_KR, fontSize: 11, color: "#7e94c8", marginTop: 8, lineHeight: 1.6 }}>
        ⓘ 변경 후 입력란을 벗어나면 자동 저장됩니다.
      </p>
    </div>
  );
}
