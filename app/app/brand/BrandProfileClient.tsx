"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BrandData {
  brand_voice: string;
  target_audience: string;
  unique_value: string;
  brand_story: string;
  do_not_use: string;
  hashtag_library: string[];
  competitor_urls: string[];
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
};

const LABEL_FONT = '"IBM Plex Sans KR", sans-serif';

function Field({
  title, hint, children,
}: { title: string; hint?: string; children: React.ReactNode }) {
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

export default function BrandProfileClient() {
  const router = useRouter();
  const [data, setData] = useState<BrandData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hashInput, setHashInput] = useState("");
  const [compInput, setCompInput] = useState("");

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
        body: JSON.stringify(data),
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
    <div style={{ background: "#060920", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "10px 20px", borderBottom: "1px solid #1f2a6b", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#060920" }}>
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 14, color: "#ff4ec9", textShadow: "2px 2px 0 #8a2877" }}>CREWMATE AI</span>
        <Link href="/app/assistants" style={{ fontFamily: LABEL_FONT, fontSize: 14, color: "#cfe9ff", textDecoration: "none", fontWeight: 500 }}>
          ← 비서 현황판
        </Link>
      </nav>

      <div style={{ flex: 1, padding: "24px 20px", maxWidth: 760, width: "100%", margin: "0 auto" }}>
        <p style={{ fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 600, color: "#5ce5ff", marginBottom: 6 }}>
          브랜드 프로필
        </p>
        <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: "clamp(18px, 2vw, 22px)", color: "#cfe9ff", textShadow: "3px 3px 0 #8a2877", marginBottom: 12 }}>
          내 브랜드 정체성
        </h1>
        <p style={{ fontFamily: LABEL_FONT, fontSize: 16, color: "#cfe9ff", lineHeight: 1.7, marginBottom: 24 }}>
          여기에 한 번 입력해 두면 4명의 비서가 모든 임무에서 자동으로 반영합니다. 일반론 답변 대신 내 브랜드에 맞춘 결과물을 받을 수 있어요.
        </p>

        {loading ? (
          <p style={{ fontFamily: LABEL_FONT, fontSize: 15, color: "#7e94c8" }}>불러오는 중...</p>
        ) : (
          <div className="pixel-frame" style={{ border: "1px solid #5ce5ff44", background: "#0a0e27", padding: "20px 22px" }}>
            <Field
              title="브랜드 보이스 / 톤"
              hint="비서가 카피를 작성할 때 이 톤을 따릅니다. 예: '친근하고 유머 있게 / 전문가스럽게 / 감성적으로'"
            >
              <input
                style={inputStyle}
                value={data.brand_voice}
                onChange={(e) => setData({ ...data, brand_voice: e.target.value })}
                placeholder="예: 친근하고 자신감 있는 20대 친구 같은 말투"
              />
            </Field>

            <Field
              title="타겟 고객"
              hint="누구에게 팔고 있나요? 비서가 그 고객 관점에서 메시지를 만듭니다."
            >
              <input
                style={inputStyle}
                value={data.target_audience}
                onChange={(e) => setData({ ...data, target_audience: e.target.value })}
                placeholder="예: 25~34세 직장 여성, 가성비 좋은 데일리 룩 선호"
              />
            </Field>

            <Field
              title="차별점 / USP"
              hint="다른 브랜드 대비 무엇이 특별한가요?"
            >
              <input
                style={inputStyle}
                value={data.unique_value}
                onChange={(e) => setData({ ...data, unique_value: e.target.value })}
                placeholder="예: 100% 국내 봉제, 사이즈 5종, 평균 배송 1일"
              />
            </Field>

            <Field
              title="브랜드 스토리 (선택)"
              hint="브랜드의 시작·철학. 콘텐츠/상세페이지에서 설득력을 더합니다."
            >
              <textarea
                rows={4}
                style={textareaStyle}
                value={data.brand_story}
                onChange={(e) => setData({ ...data, brand_story: e.target.value })}
                placeholder="예: 2024년 자취생 두 명이 시작한 작은 브랜드. 가성비와 디자인을 동시에 잡는 게 목표."
              />
            </Field>

            <Field
              title="사용 금지 표현 (선택)"
              hint="비서가 절대 쓰지 않을 단어/문구를 콤마로 구분하여 입력하세요."
            >
              <input
                style={inputStyle}
                value={data.do_not_use}
                onChange={(e) => setData({ ...data, do_not_use: e.target.value })}
                placeholder="예: 최고, 최저가, 무료(허위 표시 위험)"
              />
            </Field>

            <Field
              title="자주 쓰는 해시태그"
              hint="마키가 SNS 캡션을 만들 때 우선적으로 사용합니다. 엔터로 추가."
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHashtag(); } }}
                  placeholder="해시태그 (# 없이)"
                />
                <button
                  type="button"
                  onClick={addHashtag}
                  style={{ background: "#5ce5ff", color: "#060920", border: "2px solid #5ce5ff", padding: "8px 16px", fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                >
                  추가
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.hashtag_library.map((h, i) => (
                  <span
                    key={i}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "1px solid #5ce5ff66", background: "#5ce5ff11", color: "#5ce5ff", padding: "4px 10px", fontFamily: LABEL_FONT, fontSize: 13 }}
                  >
                    #{h}
                    <button
                      type="button"
                      onClick={() => removeHashtag(i)}
                      style={{ background: "none", border: "none", color: "#5ce5ff", cursor: "pointer", padding: 0, marginLeft: 4 }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </Field>

            <Field
              title="경쟁사 / 벤치마킹 대상 URL (선택)"
              hint="데일리/마키가 분석 임무에서 참고합니다."
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={compInput}
                  onChange={(e) => setCompInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCompetitor(); } }}
                  placeholder="https://smartstore.naver.com/..."
                />
                <button
                  type="button"
                  onClick={addCompetitor}
                  style={{ background: "#5ce5ff", color: "#060920", border: "2px solid #5ce5ff", padding: "8px 16px", fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                >
                  추가
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {data.competitor_urls.map((u, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #1f2a6b", background: "#060920", padding: "6px 10px" }}
                  >
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: "#cfe9ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u}</span>
                    <button
                      type="button"
                      onClick={() => removeCompetitor(i)}
                      style={{ background: "none", border: "none", color: "#ff4ec9", cursor: "pointer", fontFamily: LABEL_FONT, fontSize: 13 }}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </Field>

            <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
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
                onClick={() => router.push("/app/assistants")}
                style={{ background: "none", color: "#7e94c8", border: "1px solid #1f2a6b", padding: "10px 18px", fontFamily: LABEL_FONT, fontSize: 14, cursor: "pointer", fontWeight: 500 }}
              >
                돌아가기
              </button>
              {data.updated_at && (
                <span style={{ fontFamily: LABEL_FONT, fontSize: 13, color: "#7e94c8", alignSelf: "center", marginLeft: "auto" }}>
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
