"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';

export interface TaskField {
  key: string;
  label: string;
  placeholder?: string;
  hint?: string;
  type?: "text" | "textarea" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  rows?: number;
}

export interface TaskRunnerProps {
  /** 어느 비서가 수행할지 */
  agentType: "marketing" | "detail_page" | "ads" | "finance";
  /** 화면 상단 큰 제목 */
  title: string;
  /** 한 줄 설명 */
  description: string;
  /** 비서별 액센트 컬러 */
  accent: string;
  accentDark: string;
  /** 입력 필드들 */
  fields: TaskField[];
  /** 입력값을 받아서 비서에게 보낼 프롬프트로 변환 */
  buildPrompt: (values: Record<string, string>) => string;
  /** 결과를 보관할 분류 (예: "blog_post", "thread_series", "openchat_notice") */
  kind: string;
  /** 보관함 저장용 제목 생성기 */
  buildSaveTitle?: (values: Record<string, string>) => string;
  /** 결과 후처리 (옵션) */
  resultPostProcess?: (raw: string) => string;
  /** 추가 안내 (예시 결과 미리보기 등) */
  exampleHint?: string;
}

export function TaskRunner({
  agentType,
  title,
  description,
  accent,
  accentDark,
  fields,
  buildPrompt,
  kind,
  buildSaveTitle,
  resultPostProcess,
  exampleHint,
}: TaskRunnerProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, ""]))
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [libraryId, setLibraryId] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#060920", border: "1px solid #1f2a6b",
    padding: "10px 12px", fontFamily: FONT_KR, fontSize: 15, color: "#cfe9ff",
    outline: "none", borderRadius: 0, boxSizing: "border-box",
  };

  const canRun = fields
    .filter((f) => f.required !== false)
    .every((f) => (values[f.key] ?? "").trim().length > 0);

  const handleRun = useCallback(async () => {
    setLoading(true); setError(null); setResult(null); setLibraryId(null);
    try {
      const prompt = buildPrompt(values);
      const taskTitle = buildSaveTitle ? buildSaveTitle(values) : `${title} — ${new Date().toLocaleString("ko-KR")}`;
      const res = await fetch("/api/studio/run-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType, taskTitle, prompt, kind }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "생성 실패");
        return;
      }
      const r = resultPostProcess ? resultPostProcess(data.result) : data.result;
      setResult(r);
      setLibraryId(data.libraryId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "네트워크 오류");
    } finally {
      setLoading(false);
    }
  }, [agentType, buildPrompt, buildSaveTitle, kind, resultPostProcess, title, values]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 헤더 */}
      <div>
        <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: accent, letterSpacing: "0.08em", marginBottom: 6 }}>
          ▌ {title.toUpperCase()}
        </p>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#7e94c8", lineHeight: 1.6 }}>
          {description}
        </p>
      </div>

      {/* 입력 폼 */}
      <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${accent}44`, padding: 18 }}>
        {fields.map((f) => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>
              {f.label} {f.required !== false && <span style={{ color: accent }}>*</span>}
            </p>
            {f.hint && (
              <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginBottom: 6, lineHeight: 1.5 }}>
                {f.hint}
              </p>
            )}
            {f.type === "textarea" ? (
              <textarea
                rows={f.rows ?? 3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                placeholder={f.placeholder}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            ) : f.type === "select" && f.options ? (
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              >
                <option value="">— 선택 —</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <input
                style={inputStyle}
                placeholder={f.placeholder}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            )}
          </div>
        ))}

        <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={handleRun}
            disabled={!canRun || loading}
            className="pixel-frame"
            style={{
              background: accent, color: "#060920",
              border: `2px solid ${accent}`, boxShadow: `3px 3px 0 ${accentDark}`,
              padding: "10px 22px",
              fontFamily: FONT_KR, fontSize: 15, fontWeight: 700,
              cursor: !canRun || loading ? "not-allowed" : "pointer",
              opacity: !canRun || loading ? 0.5 : 1,
            }}
          >
            {loading ? "비서가 작업 중..." : "▶ 작업 시작"}
          </button>
          {result && (
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              style={{ background: "transparent", color: "#5ce5ff", border: "1px solid #5ce5ff66", padding: "10px 18px", fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              📋 결과 복사
            </button>
          )}
          {exampleHint && !result && (
            <span style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8" }}>{exampleHint}</span>
          )}
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: "10px 14px", border: "1px solid #ff4ec9", background: "#ff4ec911", color: "#ff4ec9", fontFamily: FONT_KR, fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}
        {libraryId && (
          <p style={{ marginTop: 8, fontFamily: FONT_KR, fontSize: 13, color: "#66ff9d" }}>
            ✓ 보관함에 저장됨 — <Link href="/app/library" style={{ color: "#5ce5ff", textDecoration: "underline" }}>보관함에서 보기</Link>
          </p>
        )}
      </div>

      {/* 결과 */}
      {result && (
        <div className="pixel-frame" style={{ background: "#060e20", border: `1px solid ${accent}66`, padding: "16px 18px" }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, color: accent, marginBottom: 10 }}>
            ✓ 결과
          </p>
          <pre style={{
            fontFamily: FONT_KR, fontSize: 15, color: "#cfe9ff",
            lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word",
            margin: 0,
          }}>
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
