"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#060920", border: "1px solid #1f2a6b",
  padding: "10px 12px", fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff",
  outline: "none", borderRadius: 0, boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 4,
};
const helpStyle: React.CSSProperties = {
  fontFamily: FONT_KR, fontSize: 11, color: "#7e94c8", marginBottom: 6,
};

export type PlanScopeV2 = "marketing" | "detail_page" | "ads" | "finance";

type FieldDef = { key: string; label: string; help: string; placeholder: string; multi?: boolean; required?: boolean };

// 비서별 8개 필드 정의 — brandIdentity/targetPersona/voiceTone/forbidden은 공통
const COMMON_FIELDS: FieldDef[] = [
  { key: "brandIdentity",   label: "1. 브랜드 한 줄 정체성 *",   help: "이 한 줄이 모든 콘텐츠의 기준이 됩니다.", placeholder: "예: 30대 직장인을 위한 미니멀 골드 주얼리", required: true },
  { key: "targetPersona",   label: "2. 타겟 페르소나 *",         help: "인구통계 + 심리/행동 패턴 — 구체적일수록 좋습니다.", placeholder: "예: 수도권 거주 28~35세 사무직 여성, 자기보상 소비 성향, 인스타 일평균 60분", multi: true, required: true },
  { key: "voiceTone",       label: "3. 콘텐츠 톤 *",             help: "매번 자동 적용됩니다.", placeholder: "예: 친근하고 솔직, 과장 금지, 이모지 1~2개", multi: true, required: true },
  { key: "forbidden",       label: "4. 금지어/금지주제",         help: "쉼표로 구분 — brandRules.forbidden에 자동 등록 + 매 콘텐츠 검열에 사용", placeholder: "예: 최저가, 의학적 효능, 정치, 종교", multi: true },
];

const SCOPE_FIELDS: Record<PlanScopeV2, FieldDef[]> = {
  marketing: [
    { key: "channelsAndCadence",      label: "5. 주력 채널 + 발행 빈도 *",  help: "자동 캘린더 생성에 사용됩니다.",  placeholder: "예: 인스타 주 5회 / 블로그 주 1회 / 스레드 주 2회", required: true },
    { key: "contentMixHint",          label: "6. 카테고리 비율 *",          help: "자동 주제 분배에 사용됩니다.",     placeholder: "예: 신상 30% / 스타일링 40% / 브랜드스토리 20% / 이벤트 10%", required: true },
    { key: "quarterlyAnchors",        label: "7. 이번 분기 핵심 메시지 3개 *", help: "모든 자동 콘텐츠의 앵커가 됩니다.", placeholder: "예: 1) 데일리 코디 2) 선물 시즌 진주 라인 3) 신년 커스터마이즈 캠페인", multi: true, required: true },
    { key: "operationalConstraints",  label: "8. 운영 제약",                help: "스케줄러 룰에 사용 — 빈 칸 가능",  placeholder: "예: 주말 발행 X, 평일 19시 ±1h, 월 광고비 50만원 한도", multi: true },
  ],
  detail_page: [
    { key: "sectionStructurePreference", label: "5. 5섹션 구조 선호 *",     help: "데일리가 매번 쓸 기본 구조",           placeholder: "예: 후킹/문제/솔루션/사회적증거/CTA. 의류는 사이즈 가이드 추가.", required: true },
    { key: "trustElements",              label: "6. 신뢰 요소 *",            help: "리뷰·인증·수상·미디어 노출",            placeholder: "예: 누적 리뷰 4.8/5 (2,300건), KS 인증, 잡지 ELLE 게재", multi: true, required: true },
    { key: "seoKeywordPool",             label: "7. SEO 타겟 키워드 풀 *",   help: "쉼표로 구분",                           placeholder: "예: 미니멀 주얼리, 14k 골드, 데일리 목걸이, 선물용 주얼리", multi: true, required: true },
    { key: "abTestPriority",             label: "8. A/B 테스트 우선순위",    help: "빈 칸 가능",                            placeholder: "예: 후킹 카피 > 메인 이미지 > CTA 문구 > 가격 표시 방식", multi: true },
  ],
  ads: [
    { key: "channelPriority",       label: "5. 채널 우선순위 *",        help: "예산 비중 + 우선 채널",          placeholder: "예: 메타 60% > 네이버 SA 30% > 구글 SA 10%", required: true },
    { key: "dailyBudget",           label: "6. 일평균 예산 *",          help: "KRW. 한도가 자동 적용됩니다.",    placeholder: "예: ₩50,000/일", required: true },
    { key: "biddingStrategy",       label: "7. 입찰/타겟팅 전략 *",     help: "",                              placeholder: "예: 관심사+룩얼라이크 1%, 자동입찰 ROAS 2.5x 목표", multi: true, required: true },
    { key: "forbiddenAdPatterns",   label: "8. 금지 카피 패턴",         help: "메타 정책 + 자체 금기",          placeholder: "예: 최저가, 즉효, 100%, 의학적 효능, 단정 표현", multi: true },
    { key: "retargetingWindows",    label: "9. 리타겟 윈도우",          help: "옵션",                          placeholder: "예: 장바구니 7일, 페이지뷰 14일, 구매 30일 제외", multi: true },
  ],
  finance: [
    { key: "settlementCycle",   label: "5. 정산 주기 채널별 *",     help: "",                                  placeholder: "예: 스마트스토어 D+8, 카페24 즉시, 라이브11 D+15", required: true },
    { key: "categoryRules",     label: "6. 카테고리 분류 룰 *",     help: "자동 분류에 사용됩니다.",            placeholder: "예: 외주 디자인=COGS, 광고=마케팅비, 배송=물류비", multi: true, required: true },
    { key: "profitThresholds",  label: "7. 손익 임계값 *",           help: "초과 시 자동 알림",                 placeholder: "예: 월 순이익 ₩300만 미만 시 경보, 광고비 비율 15% 초과 시 경보", multi: true, required: true },
    { key: "adBudgetLimit",     label: "8. 광고비 한도",             help: "옵션",                              placeholder: "예: 매출의 12% 초과 금지" },
    { key: "alertRules",        label: "9. 알림 룰",                 help: "옵션",                              placeholder: "예: 정산 미매칭 ≥3건 시 즉시 알림, 일 매출 평균 -20% 시 알림", multi: true },
  ],
};

interface SummaryResult {
  runId: string;
  summary: {
    headline: string;
    hookInsight: string;
    cadenceSummary: string;
    nextSevenDaysCount: number;
  };
  cost: { costUsd: number; costKrw: number; model: string };
  securityNotes?: { automationHooksGuarded: number; autoExecutableSeeds: number; forbiddenCount: number };
}

export function PlanStudio({ scope, accent }: { scope: PlanScopeV2; accent: string }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);

  const allFields = useMemo(() => [...COMMON_FIELDS, ...SCOPE_FIELDS[scope]], [scope]);

  const setField = (k: string, v: string) => setValues((prev) => ({ ...prev, [k]: v }));

  const generate = useCallback(async () => {
    setError(null); setResult(null);
    // 클라이언트측 필수값 검증
    const missing: string[] = [];
    for (const f of allFields) {
      if (f.required && !(values[f.key] || "").trim()) missing.push(f.label);
    }
    if (missing.length > 0) {
      setError("필수 필드 누락: " + missing.join(", "));
      return;
    }

    // forbidden은 쉼표로 분리 → 배열로 전송
    const forbiddenArr = (values.forbidden || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30);

    const payload: Record<string, unknown> = {
      scope,
      brandIdentity: values.brandIdentity?.trim(),
      targetPersona: values.targetPersona?.trim(),
      voiceTone: values.voiceTone?.trim(),
      forbidden: forbiddenArr,
    };
    for (const f of SCOPE_FIELDS[scope]) {
      const v = values[f.key]?.trim();
      if (v) payload[f.key] = v;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/studio/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "기획 코어 호출 실패"); return; }
      setResult({
        runId: data.runId,
        summary: data.summary,
        cost: data.cost,
        securityNotes: data.securityNotes,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "네트워크 오류");
    } finally {
      setLoading(false);
    }
  }, [allFields, scope, values]);

  return (
    <div>
      {/* 입력 폼 */}
      <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${accent}44`, padding: 20, marginBottom: 20 }}>
        <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: accent, letterSpacing: "0.08em", marginBottom: 8 }}>
          ▌ STRATEGY CORE v2 · OPUS 4.7 · ADAPTIVE THINKING (HIGH)
        </p>
        <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", lineHeight: 1.7, marginBottom: 16 }}>
          비서가 4주 동안 자동 운영할 룰북을 만듭니다. 입력이 구체적일수록 자동화 품질이 올라갑니다.
          모든 결과는 자동 누적되어 <Link href="/app/plans" style={{ color: "#5ce5ff" }}>분석 페이지</Link>에서 확인 가능합니다.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          {allFields.map((f) => (
            <div key={f.key}>
              <p style={labelStyle}>{f.label}</p>
              <p style={helpStyle}>{f.help}</p>
              {f.multi ? (
                <textarea
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                  value={values[f.key] || ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              ) : (
                <input
                  style={inputStyle}
                  value={values[f.key] || ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={generate}
            disabled={loading}
            className="pixel-frame"
            style={{
              background: accent, color: "#060920",
              border: `2px solid ${accent}`, boxShadow: `3px 3px 0 ${accent}66`,
              padding: "10px 22px",
              fontFamily: FONT_KR, fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "기획 코어 추론 중... (약 30~60초)" : "🧠 기획 코어 부팅"}
          </button>
          <Link
            href="/app/plans"
            style={{
              background: "transparent", color: "#5ce5ff",
              border: "1px solid #5ce5ff66",
              padding: "10px 18px",
              fontFamily: FONT_KR, fontSize: 14, fontWeight: 600,
              textDecoration: "none",
            }}
          >
            📂 누적 기획서 보기
          </Link>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8" }}>
            🔒 발행/송신 액션은 모두 사용자 승인 필수
          </span>
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: "10px 14px", border: "1px solid #ffd84d", background: "#ffd84d11", color: "#ffd84d", fontFamily: FONT_KR, fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}
      </div>

      {/* 요약 결과 카드 */}
      {result && <SummaryCard result={result} accent={accent} />}
    </div>
  );
}

function SummaryCard({ result, accent }: { result: SummaryResult; accent: string }) {
  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: `2px solid ${accent}`, padding: 20, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: "#66ff9d", letterSpacing: "0.1em" }}>
          ✓ 기획 코어 #{result.runId.slice(-6).toUpperCase()} 생성 완료
        </p>
        <Link
          href={`/app/plans/${result.runId}`}
          style={{ fontFamily: FONT_KR, fontSize: 13, color: accent, textDecoration: "underline", fontWeight: 700 }}
        >
          📂 상세 보고서 열기 →
        </Link>
      </div>

      <p style={{ fontFamily: FONT_KR, fontSize: 22, fontWeight: 800, color: "#ffffff", lineHeight: 1.4, marginBottom: 10 }}>
        {result.summary.headline}
      </p>

      <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#ffd84d", lineHeight: 1.7, marginBottom: 14, fontStyle: "italic" }}>
        &quot;{result.summary.hookInsight}&quot;
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 14 }}>
        <Stat label="발행 운영"     value={result.summary.cadenceSummary} color="#5ce5ff" />
        <Stat label="7일 내 발행"   value={`${result.summary.nextSevenDaysCount}건`} color="#66ff9d" />
        <Stat label="자동 실행 가능"
              value={`${result.securityNotes?.autoExecutableSeeds ?? 0}건`}
              color={accent} />
        <Stat label="승인 필수 훅"   value={`${result.securityNotes?.automationHooksGuarded ?? 0}건`} color="#ffd84d" />
      </div>

      <div style={{ borderTop: "1px dashed #1f2a6b", paddingTop: 10, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8" }}>
          💰 비용: ${result.cost.costUsd.toFixed(4)} (₩{result.cost.costKrw.toLocaleString()}) · {result.cost.model}
        </span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8" }}>
          🔒 검열어 {result.securityNotes?.forbiddenCount ?? 0}개 등록
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: "#060920", border: `1px solid ${color}33`, padding: 10 }}>
      <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#7e94c8", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, color, lineHeight: 1.4 }}>{value || "—"}</p>
    </div>
  );
}
