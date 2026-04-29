"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ReferenceSample {
  id: string;
  label?: string;
  source?: string;
  source_url?: string;
  text: string;
  hashtags?: string[];
  added_at: string;
}

interface StyleGuide {
  sentence_length?: "short" | "medium" | "long" | "mixed";
  emoji_policy?: "none" | "minimal" | "moderate" | "rich";
  tone_keywords?: string[];
  formality?: "casual" | "polite" | "formal";
  paragraph_pattern?: string;
  signature_phrases?: string[];
}

interface StructureTemplate {
  id: string;
  name: string;
  agent_type?: string;
  body: string;
  added_at: string;
}

interface VisualRef {
  id: string;
  url?: string;
  description: string;
  keywords?: string[];
  added_at: string;
}

interface BrandData {
  brand_voice: string;
  target_audience: string;
  unique_value: string;
  brand_story: string;
  do_not_use: string;
  hashtag_library: string[];
  competitor_urls: string[];
  reference_samples: ReferenceSample[];
  style_guide: StyleGuide;
  structure_templates: StructureTemplate[];
  visual_refs: VisualRef[];
  updated_at?: string;
}

const EMPTY: BrandData = {
  brand_voice: "",
  target_audience: "",
  unique_value: "",
  brand_story: "",
  do_not_use: "",
  hashtag_library: [],
  competitor_urls: [],
  reference_samples: [],
  style_guide: {},
  structure_templates: [],
  visual_refs: [],
};

const LABEL_FONT = '"IBM Plex Sans KR", sans-serif';
const PIX_FONT = '"Press Start 2P", monospace';

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#060920",
  border: "1px solid #1f2a6b",
  padding: "10px 12px",
  fontFamily: LABEL_FONT,
  fontSize: 15,
  color: "#cfe9ff",
  outline: "none",
  borderRadius: 0,
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  lineHeight: 1.6,
};

function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function Field({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontFamily: LABEL_FONT, fontSize: 15, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>
        {title}
      </p>
      {hint && (
        <p style={{ fontFamily: LABEL_FONT, fontSize: 13, color: "#7e94c8", marginBottom: 8, lineHeight: 1.6 }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

const TABS = ["정체성", "레퍼런스 팩", "스타일 가이드", "템플릿"] as const;
type TabId = typeof TABS[number];

export default function BrandProfileClient() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("정체성");
  const [data, setData] = useState<BrandData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/brand", { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setData({
          brand_voice: d.brand_voice ?? "",
          target_audience: d.target_audience ?? "",
          unique_value: d.unique_value ?? "",
          brand_story: d.brand_story ?? "",
          do_not_use: d.do_not_use ?? "",
          hashtag_library: Array.isArray(d.hashtag_library) ? d.hashtag_library : [],
          competitor_urls: Array.isArray(d.competitor_urls) ? d.competitor_urls : [],
          reference_samples: Array.isArray(d.reference_samples) ? d.reference_samples : [],
          style_guide: d.style_guide && typeof d.style_guide === "object" ? d.style_guide : {},
          structure_templates: Array.isArray(d.structure_templates) ? d.structure_templates : [],
          visual_refs: Array.isArray(d.visual_refs) ? d.visual_refs : [],
          updated_at: d.updated_at,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/brand", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_voice: data.brand_voice,
          target_audience: data.target_audience,
          unique_value: data.unique_value,
          brand_story: data.brand_story,
          do_not_use: data.do_not_use,
          hashtag_library: data.hashtag_library,
          competitor_urls: data.competitor_urls,
          reference_samples: data.reference_samples,
          style_guide: data.style_guide,
          structure_templates: data.structure_templates,
          visual_refs: data.visual_refs,
        }),
      });
      if (res.ok) {
        setMessage("✓ 저장되었습니다. 비서들이 즉시 반영합니다.");
        load();
      } else {
        const d = await res.json();
        setMessage(`✗ ${d.error || "저장 실패"}`);
      }
    } catch {
      setMessage("✗ 네트워크 오류");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ background: "#060920", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "10px 20px", borderBottom: "1px solid #1f2a6b", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#060920" }}>
        <span style={{ fontFamily: PIX_FONT, fontSize: 14, color: "#ff4ec9", textShadow: "2px 2px 0 #8a2877" }}>CREWMATE AI</span>
        <Link href="/desk/marky" style={{ fontFamily: LABEL_FONT, fontSize: 14, color: "#cfe9ff", textDecoration: "none", fontWeight: 500 }}>
          ← 데스크로
        </Link>
      </nav>

      <div style={{ flex: 1, padding: "24px 20px", maxWidth: 880, width: "100%", margin: "0 auto" }}>
        <p style={{ fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 600, color: "#5ce5ff", marginBottom: 6 }}>
          브랜드 프로필
        </p>
        <h1 style={{ fontFamily: PIX_FONT, fontSize: "clamp(18px, 2vw, 22px)", color: "#cfe9ff", textShadow: "3px 3px 0 #8a2877", marginBottom: 12 }}>
          내 브랜드 정체성 + 레퍼런스
        </h1>
        <p style={{ fontFamily: LABEL_FONT, fontSize: 16, color: "#cfe9ff", lineHeight: 1.7, marginBottom: 24 }}>
          여기에 입력하면 4명의 비서가 모든 임무에서 자동 반영합니다. 레퍼런스 팩에 좋아하는 글을 넣으면 그 톤·구조를 학습해 맞춤 컨텐츠를 생성합니다.
        </p>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1f2a6b", marginBottom: 20 }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "10px 18px",
                background: "none",
                border: "none",
                borderBottom: tab === t ? "2px solid #ff4ec9" : "2px solid transparent",
                color: tab === t ? "#ff4ec9" : "#7e94c8",
                fontFamily: LABEL_FONT,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ fontFamily: LABEL_FONT, fontSize: 15, color: "#7e94c8" }}>불러오는 중...</p>
        ) : (
          <div className="pixel-frame" style={{ border: "1px solid #5ce5ff44", background: "#0a0e27", padding: "20px 22px" }}>
            {tab === "정체성" && <IdentityTab data={data} setData={setData} />}
            {tab === "레퍼런스 팩" && <ReferencePackTab data={data} setData={setData} />}
            {tab === "스타일 가이드" && <StyleGuideTab data={data} setData={setData} />}
            {tab === "템플릿" && <StructureTemplatesTab data={data} setData={setData} />}

            <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={save}
                disabled={saving}
                className="pixel-frame"
                style={{
                  background: "#ff4ec9", color: "#060920",
                  border: "2px solid #ff4ec9", boxShadow: "3px 3px 0 #8a2877",
                  padding: "10px 22px",
                  fontFamily: LABEL_FONT, fontSize: 15, fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "저장 중..." : "▶ 저장"}
              </button>
              <button
                onClick={() => router.push("/desk/marky")}
                style={{ background: "none", color: "#7e94c8", border: "1px solid #1f2a6b", padding: "10px 18px", fontFamily: LABEL_FONT, fontSize: 14, cursor: "pointer", fontWeight: 500 }}
              >
                돌아가기
              </button>
              {data.updated_at && (
                <span style={{ fontFamily: LABEL_FONT, fontSize: 13, color: "#7e94c8", marginLeft: "auto" }}>
                  마지막 저장: {new Date(data.updated_at).toLocaleString("ko-KR")}
                </span>
              )}
            </div>

            {message && (
              <div
                style={{
                  marginTop: 16,
                  padding: "10px 14px",
                  border: `1px solid ${message.startsWith("✗") ? "#ff4ec9" : "#66ff9d"}`,
                  background: message.startsWith("✗") ? "#ff4ec911" : "#66ff9d11",
                  fontFamily: LABEL_FONT,
                  fontSize: 14,
                  color: message.startsWith("✗") ? "#ff4ec9" : "#66ff9d",
                }}
              >
                {message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 탭 1: 정체성 (기존) ─────────────────────────────────────
function IdentityTab({ data, setData }: { data: BrandData; setData: React.Dispatch<React.SetStateAction<BrandData>> }) {
  const [hashInput, setHashInput] = useState("");
  const [compInput, setCompInput] = useState("");

  function addHashtag() {
    const v = hashInput.trim().replace(/^#/, "");
    if (!v) return;
    if (data.hashtag_library.includes(v)) { setHashInput(""); return; }
    setData((d) => ({ ...d, hashtag_library: [...d.hashtag_library, v].slice(0, 50) }));
    setHashInput("");
  }
  function removeHashtag(i: number) {
    setData((d) => ({ ...d, hashtag_library: d.hashtag_library.filter((_, idx) => idx !== i) }));
  }
  function addCompetitor() {
    const v = compInput.trim();
    if (!v) return;
    if (data.competitor_urls.includes(v)) { setCompInput(""); return; }
    setData((d) => ({ ...d, competitor_urls: [...d.competitor_urls, v].slice(0, 20) }));
    setCompInput("");
  }
  function removeCompetitor(i: number) {
    setData((d) => ({ ...d, competitor_urls: d.competitor_urls.filter((_, idx) => idx !== i) }));
  }

  return (
    <div>
      <Field title="브랜드 보이스 / 톤" hint="비서가 카피를 작성할 때 이 톤을 따릅니다.">
        <input style={inputStyle} value={data.brand_voice} onChange={(e) => setData({ ...data, brand_voice: e.target.value })} placeholder="예: 친근하고 자신감 있는 20대 친구 같은 말투" />
      </Field>
      <Field title="타겟 고객" hint="누구에게 팔고 있나요?">
        <input style={inputStyle} value={data.target_audience} onChange={(e) => setData({ ...data, target_audience: e.target.value })} placeholder="예: 25~34세 직장 여성, 가성비 좋은 데일리 룩 선호" />
      </Field>
      <Field title="차별점 / USP" hint="다른 브랜드 대비 무엇이 특별한가요?">
        <input style={inputStyle} value={data.unique_value} onChange={(e) => setData({ ...data, unique_value: e.target.value })} placeholder="예: 100% 국내 봉제, 사이즈 5종, 평균 배송 1일" />
      </Field>
      <Field title="브랜드 스토리 (선택)" hint="브랜드의 시작·철학.">
        <textarea rows={4} style={textareaStyle} value={data.brand_story} onChange={(e) => setData({ ...data, brand_story: e.target.value })} />
      </Field>
      <Field title="사용 금지 표현 (선택)" hint="비서가 절대 쓰지 않을 단어/문구.">
        <input style={inputStyle} value={data.do_not_use} onChange={(e) => setData({ ...data, do_not_use: e.target.value })} placeholder="예: 최고, 최저가, 무료(허위 표시 위험)" />
      </Field>
      <Field title="자주 쓰는 해시태그" hint="엔터로 추가.">
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input style={{ ...inputStyle, flex: 1 }} value={hashInput} onChange={(e) => setHashInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHashtag(); } }} placeholder="해시태그 (# 없이)" />
          <button type="button" onClick={addHashtag} style={{ background: "#5ce5ff", color: "#060920", border: "2px solid #5ce5ff", padding: "8px 16px", fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>추가</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {data.hashtag_library.map((h, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "1px solid #5ce5ff66", background: "#5ce5ff11", color: "#5ce5ff", padding: "4px 10px", fontFamily: LABEL_FONT, fontSize: 13 }}>
              #{h}
              <button type="button" onClick={() => removeHashtag(i)} style={{ background: "none", border: "none", color: "#5ce5ff", cursor: "pointer", padding: 0, marginLeft: 4 }}>✕</button>
            </span>
          ))}
        </div>
      </Field>
      <Field title="경쟁사 / 벤치마킹 URL (선택)">
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input style={{ ...inputStyle, flex: 1 }} value={compInput} onChange={(e) => setCompInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCompetitor(); } }} placeholder="https://..." />
          <button type="button" onClick={addCompetitor} style={{ background: "#5ce5ff", color: "#060920", border: "2px solid #5ce5ff", padding: "8px 16px", fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>추가</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {data.competitor_urls.map((u, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #1f2a6b", background: "#060920", padding: "6px 10px" }}>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: "#cfe9ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u}</span>
              <button type="button" onClick={() => removeCompetitor(i)} style={{ background: "none", border: "none", color: "#ff4ec9", cursor: "pointer", fontFamily: LABEL_FONT, fontSize: 13 }}>삭제</button>
            </div>
          ))}
        </div>
      </Field>
    </div>
  );
}

// ─── 탭 2: 레퍼런스 팩 (URL 수집 + 텍스트 직접 입력) ─────────────
function ReferencePackTab({ data, setData }: { data: BrandData; setData: React.Dispatch<React.SetStateAction<BrandData>> }) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [pulling, setPulling] = useState(false);
  const [pullMsg, setPullMsg] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [textLabel, setTextLabel] = useState("");

  async function pullUrl() {
    if (!url.trim()) return;
    setPulling(true);
    setPullMsg(null);
    try {
      const res = await fetch("/api/brand/pull-reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), label: label.trim() || undefined }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        setPullMsg(`✗ ${j.error || "수집 실패"}`);
        return;
      }
      const sample: ReferenceSample = {
        id: genId("ref"),
        label: j.pull.label || j.pull.platform_label,
        source: j.pull.platform,
        source_url: j.pull.url,
        text: j.pull.content,
        hashtags: j.pull.hashtags,
        added_at: new Date().toISOString(),
      };
      setData((d) => ({ ...d, reference_samples: [sample, ...d.reference_samples].slice(0, 20) }));
      setUrl("");
      setLabel("");
      setPullMsg(`✓ ${j.pull.platform_label}에서 ${j.pull.content.length}자 수집 완료. 저장 버튼을 눌러 비서에게 반영하세요.`);
    } catch {
      setPullMsg("✗ 네트워크 오류");
    } finally {
      setPulling(false);
    }
  }

  function addText() {
    const t = textInput.trim();
    if (t.length < 10) { setPullMsg("✗ 본문은 10자 이상 입력해 주세요."); return; }
    const sample: ReferenceSample = {
      id: genId("ref"),
      label: textLabel.trim() || "직접 입력",
      source: "manual",
      text: t,
      added_at: new Date().toISOString(),
    };
    setData((d) => ({ ...d, reference_samples: [sample, ...d.reference_samples].slice(0, 20) }));
    setTextInput("");
    setTextLabel("");
    setPullMsg("✓ 레퍼런스가 추가되었습니다. 저장 버튼을 눌러 반영하세요.");
  }

  function remove(id: string) {
    setData((d) => ({ ...d, reference_samples: d.reference_samples.filter((s) => s.id !== id) }));
  }

  return (
    <div>
      <p style={{ fontFamily: LABEL_FONT, fontSize: 14, color: "#cfe9ff", lineHeight: 1.7, marginBottom: 16 }}>
        좋아하는 톤·구조의 글을 3~10개 모아두면, 비서들이 그 패턴을 분석하여 비슷한 결의 컨텐츠를 자동 생성합니다.
        <br />
        지원 플랫폼: <span style={{ color: "#5ce5ff" }}>네이버 블로그 · 스마트스토어 · 인스타그램 · 스레드 · 티스토리 · 일반 웹</span>
      </p>

      {/* URL 수집 */}
      <Field title="🔗 URL로 수집" hint="블로그/스마트스토어 등 공개 URL을 붙여넣으면 본문을 자동 추출합니다.">
        <input
          style={inputStyle}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://blog.naver.com/... 또는 https://www.instagram.com/p/..."
        />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="라벨 (선택) — 예: '내가 좋아하는 카피 톤'"
          />
          <button
            type="button"
            onClick={pullUrl}
            disabled={pulling || !url.trim()}
            style={{ background: "#ff4ec9", color: "#060920", border: "2px solid #ff4ec9", padding: "8px 18px", fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 700, cursor: pulling || !url.trim() ? "not-allowed" : "pointer", opacity: pulling || !url.trim() ? 0.5 : 1 }}
          >
            {pulling ? "수집 중..." : "▶ 수집"}
          </button>
        </div>
      </Field>

      {/* 텍스트 직접 입력 */}
      <Field title="✍️ 텍스트 직접 붙여넣기" hint="직접 작성한 글이나 캡쳐한 카피를 붙여넣어도 됩니다.">
        <input
          style={inputStyle}
          value={textLabel}
          onChange={(e) => setTextLabel(e.target.value)}
          placeholder="라벨 (선택)"
        />
        <textarea
          rows={5}
          style={{ ...textareaStyle, marginTop: 8 }}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="좋아하는 게시물 본문 / 카피 / 글을 붙여넣으세요"
        />
        <button
          type="button"
          onClick={addText}
          style={{ marginTop: 8, background: "none", color: "#5ce5ff", border: "1px solid #5ce5ff", padding: "6px 14px", fontFamily: LABEL_FONT, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          + 추가
        </button>
      </Field>

      {pullMsg && (
        <div
          style={{
            marginBottom: 16,
            padding: "8px 12px",
            border: `1px solid ${pullMsg.startsWith("✗") ? "#ff4ec9" : "#66ff9d"}`,
            background: pullMsg.startsWith("✗") ? "#ff4ec911" : "#66ff9d11",
            fontFamily: LABEL_FONT,
            fontSize: 13,
            color: pullMsg.startsWith("✗") ? "#ff4ec9" : "#66ff9d",
          }}
        >
          {pullMsg}
        </div>
      )}

      {/* 수집된 레퍼런스 목록 */}
      <p style={{ fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 700, color: "#5ce5ff", marginTop: 24, marginBottom: 8 }}>
        수집된 레퍼런스 ({data.reference_samples.length}/20)
      </p>
      {data.reference_samples.length === 0 ? (
        <p style={{ fontFamily: LABEL_FONT, fontSize: 13, color: "#7e94c8", padding: "16px 0" }}>
          아직 수집한 레퍼런스가 없습니다.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.reference_samples.map((s) => (
            <div key={s.id} style={{ border: "1px solid #1f2a6b", background: "#060920", padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                <div>
                  <span style={{ fontFamily: LABEL_FONT, fontSize: 12, color: "#ff4ec9", fontWeight: 700 }}>{s.label || "(라벨 없음)"}</span>
                  {s.source && s.source !== "manual" && (
                    <span style={{ fontFamily: LABEL_FONT, fontSize: 11, color: "#7e94c8", marginLeft: 8 }}>· {s.source}</span>
                  )}
                </div>
                <button type="button" onClick={() => remove(s.id)} style={{ background: "none", border: "none", color: "#ff4ec9", cursor: "pointer", fontFamily: LABEL_FONT, fontSize: 12 }}>삭제</button>
              </div>
              {s.source_url && (
                <a href={s.source_url} target="_blank" rel="noreferrer" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: "#5ce5ff", display: "block", marginBottom: 6, textDecoration: "none", wordBreak: "break-all" }}>
                  {s.source_url}
                </a>
              )}
              <p style={{ fontFamily: LABEL_FONT, fontSize: 13, color: "#cfe9ff", lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 120, overflow: "auto" }}>
                {s.text.slice(0, 600)}{s.text.length > 600 ? "..." : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 탭 3: 스타일 가이드 (구조화된 톤 룰) ────────────────────
function StyleGuideTab({ data, setData }: { data: BrandData; setData: React.Dispatch<React.SetStateAction<BrandData>> }) {
  const sg = data.style_guide;
  const update = (patch: Partial<StyleGuide>) => setData({ ...data, style_guide: { ...sg, ...patch } });
  const [keywordInput, setKeywordInput] = useState("");
  const [phraseInput, setPhraseInput] = useState("");

  return (
    <div>
      <p style={{ fontFamily: LABEL_FONT, fontSize: 14, color: "#cfe9ff", lineHeight: 1.7, marginBottom: 16 }}>
        구체적 룰을 설정하면 비서가 매번 일관된 결을 유지합니다.
      </p>

      <Field title="문장 길이">
        <select style={inputStyle} value={sg.sentence_length || "mixed"} onChange={(e) => update({ sentence_length: e.target.value as StyleGuide["sentence_length"] })}>
          <option value="short">짧고 임팩트 있게</option>
          <option value="medium">중간 길이 (대화체)</option>
          <option value="long">길고 풍부하게</option>
          <option value="mixed">상황 따라 혼합</option>
        </select>
      </Field>

      <Field title="이모지 사용">
        <select style={inputStyle} value={sg.emoji_policy || "moderate"} onChange={(e) => update({ emoji_policy: e.target.value as StyleGuide["emoji_policy"] })}>
          <option value="none">사용 안 함</option>
          <option value="minimal">아주 가끔 (포인트만)</option>
          <option value="moderate">적당히 (3~5개)</option>
          <option value="rich">풍부하게 (감성 폭발)</option>
        </select>
      </Field>

      <Field title="격식 톤">
        <select style={inputStyle} value={sg.formality || "polite"} onChange={(e) => update({ formality: e.target.value as StyleGuide["formality"] })}>
          <option value="casual">반말/친구톤 (~야, ~지)</option>
          <option value="polite">존댓말 (~요, ~습니다)</option>
          <option value="formal">격식체 (~입니다)</option>
        </select>
      </Field>

      <Field title="톤 키워드 (3~5개 권장)" hint="엔터로 추가. 예: 따뜻함, 위트, 전문성">
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input style={{ ...inputStyle, flex: 1 }} value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = keywordInput.trim();
              if (!v) return;
              const list = sg.tone_keywords || [];
              if (!list.includes(v)) update({ tone_keywords: [...list, v].slice(0, 10) });
              setKeywordInput("");
            }
          }} placeholder="키워드" />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(sg.tone_keywords || []).map((k, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "1px solid #ffd84d66", background: "#ffd84d11", color: "#ffd84d", padding: "4px 10px", fontFamily: LABEL_FONT, fontSize: 13 }}>
              {k}
              <button type="button" onClick={() => update({ tone_keywords: (sg.tone_keywords || []).filter((_, idx) => idx !== i) })} style={{ background: "none", border: "none", color: "#ffd84d", cursor: "pointer", padding: 0, marginLeft: 4 }}>✕</button>
            </span>
          ))}
        </div>
      </Field>

      <Field title="단락 구조 패턴" hint="비서가 글을 짤 때 따를 흐름.">
        <input style={inputStyle} value={sg.paragraph_pattern || ""} onChange={(e) => update({ paragraph_pattern: e.target.value })} placeholder="예: 후킹 → 문제 → 해결 → 증거 → CTA" />
      </Field>

      <Field title="시그니처 마무리 멘트 (선택)" hint="자주 쓰는 마무리 표현. 엔터로 추가.">
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input style={{ ...inputStyle, flex: 1 }} value={phraseInput} onChange={(e) => setPhraseInput(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = phraseInput.trim();
              if (!v) return;
              const list = sg.signature_phrases || [];
              if (!list.includes(v)) update({ signature_phrases: [...list, v].slice(0, 10) });
              setPhraseInput("");
            }
          }} placeholder="예: 오늘도 잘 부탁드려요 :)" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {(sg.signature_phrases || []).map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #1f2a6b", background: "#060920", padding: "6px 10px" }}>
              <span style={{ fontFamily: LABEL_FONT, fontSize: 13, color: "#cfe9ff" }}>{p}</span>
              <button type="button" onClick={() => update({ signature_phrases: (sg.signature_phrases || []).filter((_, idx) => idx !== i) })} style={{ background: "none", border: "none", color: "#ff4ec9", cursor: "pointer", fontFamily: LABEL_FONT, fontSize: 12 }}>삭제</button>
            </div>
          ))}
        </div>
      </Field>
    </div>
  );
}

// ─── 탭 4: 구조 템플릿 ────────────────────────────────────
function StructureTemplatesTab({ data, setData }: { data: BrandData; setData: React.Dispatch<React.SetStateAction<BrandData>> }) {
  const [name, setName] = useState("");
  const [agentType, setAgentType] = useState("");
  const [body, setBody] = useState("");

  function add() {
    if (!name.trim() || !body.trim()) return;
    const tpl: StructureTemplate = {
      id: genId("tpl"),
      name: name.trim(),
      agent_type: agentType || undefined,
      body: body.trim(),
      added_at: new Date().toISOString(),
    };
    setData({ ...data, structure_templates: [tpl, ...data.structure_templates].slice(0, 15) });
    setName("");
    setAgentType("");
    setBody("");
  }
  function remove(id: string) {
    setData({ ...data, structure_templates: data.structure_templates.filter((t) => t.id !== id) });
  }

  return (
    <div>
      <p style={{ fontFamily: LABEL_FONT, fontSize: 14, color: "#cfe9ff", lineHeight: 1.7, marginBottom: 16 }}>
        &ldquo;이런 흐름으로 써줘&rdquo;를 미리 등록하면 비서가 그대로 따라 씁니다. 변수: <code style={{ background: "#1f2a6b", padding: "1px 6px", color: "#5ce5ff" }}>{`{{product}}`}</code>, <code style={{ background: "#1f2a6b", padding: "1px 6px", color: "#5ce5ff" }}>{`{{brand}}`}</code> 사용 가능.
      </p>

      <Field title="템플릿 이름">
        <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 인스타 캡션 7줄 템플릿" />
      </Field>
      <Field title="대상 비서 (선택)">
        <select style={inputStyle} value={agentType} onChange={(e) => setAgentType(e.target.value)}>
          <option value="">전체</option>
          <option value="marketing">마키 (마케팅)</option>
          <option value="detail_page">데일리 (상세페이지)</option>
          <option value="ads">애디 (광고)</option>
          <option value="finance">페니 (재무)</option>
        </select>
      </Field>
      <Field title="템플릿 본문">
        <textarea
          rows={8}
          style={textareaStyle}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`예:\n1줄: {{product}}로 ___\n2줄: 만약 ___였다면\n3줄: 지금 ___해 보세요\n...`}
        />
      </Field>
      <button type="button" onClick={add} disabled={!name.trim() || !body.trim()} style={{ background: "#5ce5ff", color: "#060920", border: "2px solid #5ce5ff", padding: "8px 18px", fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 700, cursor: !name.trim() || !body.trim() ? "not-allowed" : "pointer", opacity: !name.trim() || !body.trim() ? 0.5 : 1 }}>
        + 템플릿 추가
      </button>

      <p style={{ fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 700, color: "#5ce5ff", marginTop: 24, marginBottom: 8 }}>
        등록된 템플릿 ({data.structure_templates.length}/15)
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.structure_templates.map((t) => (
          <div key={t.id} style={{ border: "1px solid #1f2a6b", background: "#060920", padding: "10px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div>
                <span style={{ fontFamily: LABEL_FONT, fontSize: 13, fontWeight: 700, color: "#ffd84d" }}>{t.name}</span>
                {t.agent_type && <span style={{ fontFamily: LABEL_FONT, fontSize: 11, color: "#7e94c8", marginLeft: 8 }}>· {t.agent_type}</span>}
              </div>
              <button type="button" onClick={() => remove(t.id)} style={{ background: "none", border: "none", color: "#ff4ec9", cursor: "pointer", fontFamily: LABEL_FONT, fontSize: 12 }}>삭제</button>
            </div>
            <p style={{ fontFamily: LABEL_FONT, fontSize: 13, color: "#cfe9ff", lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 160, overflow: "auto" }}>
              {t.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
