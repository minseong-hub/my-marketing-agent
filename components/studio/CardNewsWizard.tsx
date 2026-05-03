"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import type { BrandTemplate, PlannedCard } from "@/lib/studio/templates";
import { FeedGridPreview } from "./FeedGridPreview";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#060920", border: "1px solid #1f2a6b",
  padding: "10px 12px", fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff",
  outline: "none", borderRadius: 0, boxSizing: "border-box",
};

type Step = 1 | 2 | 3 | 4;

/**
 * 카드뉴스 자동화 위저드 (4단계).
 *
 * 1) 레퍼런스 추출 → BrandTemplate 생성/선택
 * 2) 월간 계획 수립 → PlannedCard[] 생성
 * 3) 피드 미리보기 → 사용자 승인
 * 4) 일괄 생성 → 카드뉴스 + 캡션 자동 누적
 */
export function CardNewsWizard() {
  const [step, setStep] = useState<Step>(1);
  const [activeTemplate, setActiveTemplate] = useState<BrandTemplate | null>(null);
  const [monthlyPlan, setMonthlyPlan] = useState<{ id: string; cards: PlannedCard[]; status: string } | null>(null);
  const [approvalToken, setApprovalToken] = useState<string | null>(null);

  // 처음 진입 시 활성 템플릿 자동 로드
  useEffect(() => {
    fetch("/api/templates?activeOnly=true&limit=1")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.items) && data.items.length > 0) {
          setActiveTemplate(data.items[0]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <Stepper current={step} />
      <div style={{ marginTop: 16 }}>
        {step === 1 && (
          <Step1Reference
            activeTemplate={activeTemplate}
            onTemplateActivated={(t) => setActiveTemplate(t)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && activeTemplate && (
          <Step2MonthlyPlan
            activeTemplate={activeTemplate}
            existingPlan={monthlyPlan}
            onPlanReady={(p) => setMonthlyPlan(p)}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && activeTemplate && monthlyPlan && (
          <Step3FeedPreview
            template={activeTemplate}
            plan={monthlyPlan}
            onPlanUpdate={(cards) => setMonthlyPlan({ ...monthlyPlan, cards })}
            onApproved={(token) => { setApprovalToken(token); setStep(4); }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && activeTemplate && monthlyPlan && approvalToken && (
          <Step4BatchGenerate
            plan={monthlyPlan}
            approvalToken={approvalToken}
            onDone={() => { /* 완료 — 보관함 링크 표시됨 */ }}
            onBack={() => setStep(3)}
          />
        )}
        {step === 2 && !activeTemplate && (
          <NoActiveTemplateNotice onBack={() => setStep(1)} />
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Stepper
// ───────────────────────────────────────────────────────────
function Stepper({ current }: { current: Step }) {
  const steps: { n: Step; label: string }[] = [
    { n: 1, label: "레퍼런스" },
    { n: 2, label: "월간 계획" },
    { n: 3, label: "피드 미리보기" },
    { n: 4, label: "일괄 생성" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 14px", background: "#0a0e27", border: "1px solid #1f2a6b" }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
          <div style={{
            width: 28, height: 28,
            background: current === s.n ? "#ff4ec9" : current > s.n ? "#66ff9d" : "#1f2a6b",
            color: current >= s.n ? "#0a0e27" : "#7e94c8",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: FONT_PIX, fontSize: 11, fontWeight: 800,
          }}>
            {s.n}
          </div>
          <span style={{
            fontFamily: FONT_KR, fontSize: 13, fontWeight: current === s.n ? 800 : 600,
            color: current >= s.n ? "#cfe9ff" : "#7e94c8", flex: 1,
          }}>
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: current > s.n ? "#66ff9d" : "#1f2a6b" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Step 1: 레퍼런스 추출
// ───────────────────────────────────────────────────────────
function Step1Reference({
  activeTemplate, onTemplateActivated, onNext,
}: {
  activeTemplate: BrandTemplate | null;
  onTemplateActivated: (t: BrandTemplate) => void;
  onNext: () => void;
}) {
  const [mode, setMode] = useState<"url" | "account" | "upload" | "preset">("url");
  const [instaUrl, setInstaUrl] = useState("");
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [brandHint, setBrandHint] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 6);
    const promises = arr.map((f) => {
      return new Promise<string>((resolve, reject) => {
        if (f.size > 5 * 1024 * 1024) return reject(new Error(`${f.name}: 5MB 초과`));
        if (!["image/jpeg","image/png","image/webp"].includes(f.type)) return reject(new Error(`${f.name}: 형식 미지원 (jpeg/png/webp만)`));
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error(`${f.name}: 읽기 실패`));
        reader.readAsDataURL(f);
      });
    });
    Promise.all(promises).then(setUploadedImages).catch((e) => setError(e.message));
  }, []);

  const extract = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const body: Record<string, unknown> = { name: name || undefined, brandHint: brandHint || undefined };
      if (mode === "url") { body.source = "instagram_url"; body.instagramUrl = instaUrl; }
      else if (mode === "account") { body.source = "instagram_account"; body.instagramHandle = handle; }
      else { body.source = "image_upload"; body.images = uploadedImages; }

      const res = await fetch("/api/templates/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "추출 실패"); return; }
      onTemplateActivated(data.template);
    } catch (e) {
      setError(e instanceof Error ? e.message : "네트워크 오류");
    } finally { setLoading(false); }
  }, [mode, instaUrl, handle, name, brandHint, uploadedImages, onTemplateActivated]);

  const seedPresets = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/templates/seed-presets", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "프리셋 시드 실패"); return; }
      const r2 = await fetch("/api/templates?activeOnly=true&limit=1");
      const d2 = await r2.json();
      if (d2.ok && d2.items.length > 0) onTemplateActivated(d2.items[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "네트워크 오류");
    } finally { setLoading(false); }
  }, [onTemplateActivated]);

  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: "1px solid #ff4ec944", padding: 20 }}>
      <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: "#ff4ec9", letterSpacing: "0.08em", marginBottom: 8 }}>
        ▌ STEP 1 · REFERENCE EXTRACTION
      </p>
      <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", lineHeight: 1.7, marginBottom: 16 }}>
        마음에 드는 인스타 카드뉴스의 디자인·톤을 분석해서 내 브랜드 템플릿으로 만듭니다. 또는 8종 프리셋에서 시작.
      </p>

      {activeTemplate && (
        <div className="pixel-frame" style={{ background: "#060920", border: "1px solid #66ff9d44", padding: 14, marginBottom: 14 }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#66ff9d", marginBottom: 4 }}>
            ✓ 현재 활성 템플릿
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <p style={{ fontFamily: FONT_KR, fontSize: 16, fontWeight: 800, color: "#ffffff" }}>
              {activeTemplate.name}
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8", marginLeft: 8 }}>
                {activeTemplate.source}
              </span>
            </p>
            <button
              onClick={onNext}
              className="pixel-frame"
              style={{ background: "#66ff9d", color: "#0a0e27", border: "2px solid #66ff9d", boxShadow: "3px 3px 0 #2a8a4a", padding: "8px 18px", fontFamily: FONT_KR, fontSize: 14, fontWeight: 800, cursor: "pointer" }}
            >
              이 템플릿으로 진행 →
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        <ModeBtn active={mode === "url"} label="🔗 인스타 URL" onClick={() => setMode("url")} />
        <ModeBtn active={mode === "account"} label="@ 계정 핸들" onClick={() => setMode("account")} />
        <ModeBtn active={mode === "upload"} label="📷 이미지 업로드" onClick={() => setMode("upload")} />
        <ModeBtn active={mode === "preset"} label="🎁 프리셋 시드" onClick={() => setMode("preset")} />
      </div>

      {mode === "url" && (
        <>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>인스타 게시물 URL *</p>
          <input style={inputStyle} value={instaUrl} onChange={(e) => setInstaUrl(e.target.value)} placeholder="https://www.instagram.com/p/Cxxxxxxx/" />
        </>
      )}
      {mode === "account" && (
        <>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>인스타 계정 핸들 *</p>
          <input style={inputStyle} value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@your_inspiration" />
          <p style={{ fontFamily: FONT_KR, fontSize: 11, color: "#7e94c8", marginTop: 4 }}>
            ⓘ Graph API 없이는 프로필 대표 이미지만 분석 가능합니다.
          </p>
        </>
      )}
      {mode === "upload" && (
        <>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>이미지 업로드 (최대 6장, 각 5MB) *</p>
          <input
            type="file" accept="image/jpeg,image/png,image/webp" multiple
            onChange={(e) => handleUpload(e.target.files)}
            style={{ ...inputStyle, padding: "8px 10px", cursor: "pointer" }}
          />
          {uploadedImages.length > 0 && (
            <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#66ff9d", marginTop: 6 }}>
              ✓ {uploadedImages.length}장 업로드됨
            </p>
          )}
        </>
      )}
      {mode === "preset" && (
        <div style={{ background: "#060920", border: "1px dashed #5ce5ff55", padding: 14 }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", marginBottom: 8 }}>
            8종 프리셋(미니멀/감성파스텔/POP/뉴스풍/매거진/픽셀/네온/모노블랙)을 갤러리에 시드합니다.
          </p>
          <button
            onClick={seedPresets}
            disabled={loading}
            style={{ background: "#5ce5ff", color: "#0a0e27", border: "2px solid #5ce5ff", padding: "8px 18px", fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}
          >
            {loading ? "시드 중..." : "🎁 프리셋 8종 시드"}
          </button>
        </div>
      )}

      {(mode === "url" || mode === "account" || mode === "upload") && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            <div>
              <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>템플릿 이름 (선택)</p>
              <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="비우면 AI가 추천" />
            </div>
            <div>
              <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>브랜드 힌트 (선택)</p>
              <input style={inputStyle} value={brandHint} onChange={(e) => setBrandHint(e.target.value)} placeholder="예: 골드 색상, 한글 두꺼운 산세리프" />
            </div>
          </div>

          <button
            onClick={extract}
            disabled={loading || (mode === "url" && !instaUrl) || (mode === "account" && !handle) || (mode === "upload" && uploadedImages.length === 0)}
            className="pixel-frame"
            style={{
              marginTop: 14,
              background: "#ff4ec9", color: "#0a0e27",
              border: "2px solid #ff4ec9", boxShadow: "3px 3px 0 #8a2877",
              padding: "10px 22px",
              fontFamily: FONT_KR, fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "Claude vision 분석 중... (10~20초)" : "🎨 디자인 추출 + 템플릿 생성"}
          </button>
        </>
      )}

      {error && (
        <div style={{ marginTop: 12, padding: "10px 14px", border: "1px solid #ff6688", background: "#ff668811", color: "#ff6688", fontFamily: FONT_KR, fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Step 2: 월간 계획
// ───────────────────────────────────────────────────────────
function Step2MonthlyPlan({
  activeTemplate, existingPlan, onPlanReady, onBack, onNext,
}: {
  activeTemplate: BrandTemplate;
  existingPlan: { id: string; cards: PlannedCard[]; status: string } | null;
  onPlanReady: (p: { id: string; cards: PlannedCard[]; status: string }) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + (today.getDate() > 15 ? 1 : 0), 1);
  const defaultMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

  const [month, setMonth] = useState(defaultMonth);
  const [totalCards, setTotalCards] = useState(8);
  const [categoryMix, setCategoryMix] = useState<{ category: string; ratio: number }[]>([
    { category: "신상", ratio: 0.3 },
    { category: "스타일링", ratio: 0.4 },
    { category: "브랜드스토리", ratio: 0.2 },
    { category: "이벤트", ratio: 0.1 },
  ]);
  const [weekdays, setWeekdays] = useState<number[]>([1, 3, 5]);  // 월/수/금
  const [time, setTime] = useState("19:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ratioSum = useMemo(() => categoryMix.reduce((s, c) => s + c.ratio, 0), [categoryMix]);

  const setCatRatio = (i: number, r: number) => {
    const next = [...categoryMix];
    next[i] = { ...next[i], ratio: r };
    setCategoryMix(next);
  };

  const generate = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/monthly-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "manual",
          month,
          brandTemplateId: activeTemplate.id,
          totalCards,
          categoryMix,
          preferredWeekdays: weekdays,
          preferredTime: time,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "계획 생성 실패"); return; }
      onPlanReady({ id: data.plan.id, cards: data.plan.cards, status: data.plan.status });
      onNext();
    } catch (e) {
      setError(e instanceof Error ? e.message : "네트워크 오류");
    } finally { setLoading(false); }
  }, [month, activeTemplate.id, totalCards, categoryMix, weekdays, time, onPlanReady, onNext]);

  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: "1px solid #5ce5ff44", padding: 20 }}>
      <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: "#5ce5ff", letterSpacing: "0.08em", marginBottom: 8 }}>
        ▌ STEP 2 · MONTHLY PLAN
      </p>
      <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", lineHeight: 1.7, marginBottom: 16 }}>
        한 달치 카드뉴스 발행 계획을 만듭니다. 카테고리 비율과 발행 요일을 정하면 시드가 자동 분배됩니다.
      </p>

      {existingPlan && existingPlan.cards.length > 0 && (
        <div style={{ background: "#060920", border: "1px solid #66ff9d44", padding: 12, marginBottom: 14 }}>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#66ff9d", marginBottom: 6 }}>
            ✓ 이미 만든 계획 ({existingPlan.cards.length}건) — 기존 계획으로 진행하거나 새로 만들 수 있습니다.
          </p>
          <button
            onClick={onNext}
            style={{ background: "#66ff9d", color: "#0a0e27", border: "2px solid #66ff9d", padding: "6px 16px", fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            기존 계획으로 진행 →
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>대상 월</p>
          <input type="month" style={inputStyle} value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <div>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>총 카드뉴스 수 (1~12)</p>
          <input type="number" min={1} max={12} style={inputStyle} value={totalCards} onChange={(e) => setTotalCards(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))} />
        </div>
        <div>
          <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>발행 시간</p>
          <input type="time" style={inputStyle} value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 6 }}>발행 요일</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["일","월","화","수","목","금","토"].map((day, i) => {
            const sel = weekdays.includes(i);
            return (
              <button
                key={i}
                onClick={() => setWeekdays(sel ? weekdays.filter((d) => d !== i) : [...weekdays, i].sort())}
                style={{
                  background: sel ? "#5ce5ff" : "transparent",
                  color: sel ? "#0a0e27" : "#cfe9ff",
                  border: `1px solid ${sel ? "#5ce5ff" : "#1f2a6b"}`,
                  padding: "6px 14px", fontFamily: FONT_KR, fontSize: 13, fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, color: "#cfe9ff", marginBottom: 6 }}>
          카테고리 비율 (합계: {Math.round(ratioSum * 100)}%)
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {categoryMix.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={c.category}
                onChange={(e) => {
                  const next = [...categoryMix];
                  next[i] = { ...next[i], category: e.target.value };
                  setCategoryMix(next);
                }}
              />
              <input
                type="range" min={0} max={1} step={0.05}
                value={c.ratio}
                onChange={(e) => setCatRatio(i, parseFloat(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: "#cfe9ff", minWidth: 50, textAlign: "right" }}>
                {Math.round(c.ratio * 100)}%
              </span>
              <button
                onClick={() => setCategoryMix(categoryMix.filter((_, idx) => idx !== i))}
                style={{ background: "transparent", color: "#ff6688", border: "1px solid #ff668866", padding: "4px 8px", cursor: "pointer", fontFamily: FONT_KR, fontSize: 11 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setCategoryMix([...categoryMix, { category: "팁", ratio: 0.1 }])}
          style={{ marginTop: 6, background: "transparent", color: "#5ce5ff", border: "1px dashed #5ce5ff66", padding: "6px 12px", fontFamily: FONT_KR, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          + 카테고리 추가
        </button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onBack} style={{ background: "transparent", color: "#cfe9ff", border: "1px solid #1f2a6b", padding: "10px 18px", fontFamily: FONT_KR, fontSize: 14, cursor: "pointer" }}>
          ← 이전
        </button>
        <button
          onClick={generate}
          disabled={loading || ratioSum === 0}
          className="pixel-frame"
          style={{
            background: "#5ce5ff", color: "#0a0e27",
            border: "2px solid #5ce5ff", boxShadow: "3px 3px 0 #1a4a6b",
            padding: "10px 22px",
            fontFamily: FONT_KR, fontSize: 15, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? "생성 중..." : "📅 월간 계획 만들기 →"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: "10px 14px", border: "1px solid #ff6688", background: "#ff668811", color: "#ff6688", fontFamily: FONT_KR, fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Step 3: 피드 미리보기 + 승인
// ───────────────────────────────────────────────────────────
function Step3FeedPreview({
  template, plan, onPlanUpdate, onApproved, onBack,
}: {
  template: BrandTemplate;
  plan: { id: string; cards: PlannedCard[]; status: string };
  onPlanUpdate: (cards: PlannedCard[]) => void;
  onApproved: (token: string) => void;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PlannedCard | null>(null);

  const toggleExclude = useCallback(async (cardId: string) => {
    const next = plan.cards.map((c) => c.id === cardId ? { ...c, excluded: !c.excluded } : c);
    onPlanUpdate(next);
    // 서버에도 저장
    try {
      await fetch(`/api/monthly-plan/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: next }),
      });
    } catch {}
  }, [plan, onPlanUpdate]);

  const approve = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/monthly-plan/${plan.id}/approve`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "승인 실패"); return; }
      onApproved(data.approvalToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "네트워크 오류");
    } finally { setLoading(false); }
  }, [plan.id, onApproved]);

  const activeCount = plan.cards.filter((c) => !c.excluded).length;

  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: "1px solid #ffd84d44", padding: 20 }}>
      <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: "#ffd84d", letterSpacing: "0.08em", marginBottom: 8 }}>
        ▌ STEP 3 · FEED PREVIEW
      </p>
      <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", lineHeight: 1.7, marginBottom: 16 }}>
        활성 템플릿으로 발행할 카드뉴스가 내 인스타 피드에 어떻게 보일지 미리 확인합니다. 색감·통일감을 보고 OK하면 다음 단계.
      </p>

      <FeedGridPreview
        cards={plan.cards}
        template={template}
        onCellClick={(c) => setSelected(c)}
        onToggleExclude={toggleExclude}
      />

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#060920", border: "2px solid #ffd84d", padding: 20, maxWidth: 700, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontFamily: FONT_KR, fontSize: 16, fontWeight: 800, color: "#ffffff" }}>
                {selected.title} <span style={{ color: "#ffd84d", fontSize: 13 }}>({selected.category})</span>
              </p>
              <button onClick={() => setSelected(null)} style={{ background: "transparent", color: "#cfe9ff", border: "1px solid #1f2a6b", padding: "4px 12px", cursor: "pointer", fontFamily: FONT_KR, fontSize: 12 }}>
                닫기
              </button>
            </div>
            <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", marginBottom: 10 }}>
              📅 {selected.planDate} · {selected.planTime} | 카드 6장 자동 생성됩니다 ({selected.cardKinds.join(" / ")}). 정확한 카피는 4단계에서 Claude가 만듭니다.
            </p>
            {selected.angle && (
              <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", lineHeight: 1.7, background: "#0a0e27", padding: 10, border: "1px solid #1f2a6b" }}>
                💡 {selected.angle}
              </p>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ background: "transparent", color: "#cfe9ff", border: "1px solid #1f2a6b", padding: "10px 18px", fontFamily: FONT_KR, fontSize: 14, cursor: "pointer" }}>
          ← 계획 수정
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: "#7e94c8" }}>
            {activeCount}건 생성 예정 · 약 ${(activeCount * 0.025).toFixed(2)} (~₩{Math.round(activeCount * 35).toLocaleString()})
          </span>
          <button
            onClick={approve}
            disabled={loading || activeCount === 0}
            className="pixel-frame"
            style={{
              background: "#66ff9d", color: "#0a0e27",
              border: "2px solid #66ff9d", boxShadow: "3px 3px 0 #2a8a4a",
              padding: "10px 22px",
              fontFamily: FONT_KR, fontSize: 15, fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "승인 중..." : `✓ 좋아요 — ${activeCount}건 생성 시작`}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: "10px 14px", border: "1px solid #ff6688", background: "#ff668811", color: "#ff6688", fontFamily: FONT_KR, fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Step 4: 일괄 생성 + 진행률
// ───────────────────────────────────────────────────────────
function Step4BatchGenerate({
  plan, approvalToken, onDone, onBack,
}: {
  plan: { id: string; cards: PlannedCard[]; status: string };
  approvalToken: string;
  onDone: () => void;
  onBack: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState<{ total: number; completed: number; failed: number; results?: { cardId: string; libraryId?: string; error?: string }[]; totalCostKrw?: number }>({ total: plan.cards.filter((c) => !c.excluded).length, completed: 0, failed: 0 });
  const [error, setError] = useState<string | null>(null);

  const startExecute = useCallback(async () => {
    setRunning(true); setError(null);
    // 진행률 폴링 별도 시작
    const pollInterval = setInterval(async () => {
      try {
        const r = await fetch(`/api/monthly-plan/${plan.id}`);
        const d = await r.json();
        if (d.ok && d.plan?.progress) {
          setProgress({ ...d.plan.progress });
          if (d.plan.status === "done") clearInterval(pollInterval);
        }
      } catch {}
    }, 2500);

    try {
      const res = await fetch(`/api/monthly-plan/${plan.id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalToken }),
      });
      const data = await res.json();
      clearInterval(pollInterval);
      if (!res.ok) { setError(data.error || "생성 실패"); setRunning(false); return; }
      setProgress({
        total: progress.total,
        completed: data.completed,
        failed: data.failed,
        results: data.results,
        totalCostKrw: data.totalCostKrw,
      });
      setDone(true);
      setRunning(false);
      onDone();
    } catch (e) {
      clearInterval(pollInterval);
      setError(e instanceof Error ? e.message : "네트워크 오류");
      setRunning(false);
    }
  }, [plan.id, approvalToken, progress.total, onDone]);

  const pct = progress.total > 0 ? Math.round(((progress.completed + progress.failed) / progress.total) * 100) : 0;

  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: "1px solid #66ff9d44", padding: 20 }}>
      <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: "#66ff9d", letterSpacing: "0.08em", marginBottom: 8 }}>
        ▌ STEP 4 · BATCH GENERATE
      </p>
      <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", lineHeight: 1.7, marginBottom: 16 }}>
        승인된 {progress.total}건의 카드뉴스를 자동 생성합니다. 각 카드뉴스 = 6장 카피 + 캡션 3변형 + 해시태그.
        결과는 보관함에 누적되며 실제 인스타 발행은 별도 단계 (Phase F).
      </p>

      {!running && !done && (
        <button
          onClick={startExecute}
          className="pixel-frame"
          style={{
            background: "#66ff9d", color: "#0a0e27",
            border: "2px solid #66ff9d", boxShadow: "3px 3px 0 #2a8a4a",
            padding: "12px 28px",
            fontFamily: FONT_KR, fontSize: 16, fontWeight: 800,
            cursor: "pointer",
          }}
        >
          🚀 {progress.total}건 일괄 생성 시작
        </button>
      )}

      {(running || done) && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", fontWeight: 700 }}>
              {done ? "✓ 완료" : "⚙ 생성 중..."}
            </p>
            <p style={{ fontFamily: FONT_MONO, fontSize: 13, color: "#66ff9d", fontWeight: 700 }}>
              {progress.completed + progress.failed} / {progress.total} ({pct}%)
            </p>
          </div>
          <div style={{ width: "100%", height: 12, background: "#060920", border: "1px solid #1f2a6b" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "#66ff9d", transition: "width 0.3s" }} />
          </div>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
            <Stat label="성공" value={`${progress.completed}건`} color="#66ff9d" />
            <Stat label="실패" value={`${progress.failed}건`} color={progress.failed > 0 ? "#ff6688" : "#7e94c8"} />
            {progress.totalCostKrw !== undefined && (
              <Stat label="누적 비용" value={`₩${progress.totalCostKrw.toLocaleString()}`} color="#ffd84d" />
            )}
          </div>

          {progress.results && progress.results.length > 0 && (
            <div style={{ marginTop: 14, maxHeight: 240, overflowY: "auto" }}>
              {progress.results.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid #1f2a6b22", fontFamily: FONT_MONO, fontSize: 11 }}>
                  <span style={{ color: r.libraryId ? "#66ff9d" : "#ff6688" }}>
                    {r.libraryId ? "✓" : "✗"} {r.cardId.slice(-8)}
                  </span>
                  <span style={{ color: "#7e94c8" }}>{r.libraryId ? `lib_${r.libraryId.slice(-6)}` : (r.error || "").slice(0, 60)}</span>
                </div>
              ))}
            </div>
          )}

          {done && (
            <div style={{ marginTop: 14, padding: 12, background: "#060920", border: "1px solid #66ff9d44", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#66ff9d" }}>
                ✓ {progress.completed}건의 카드뉴스가 보관함에 저장되었습니다.
              </p>
              <Link href="/app/library" style={{ background: "#66ff9d", color: "#0a0e27", padding: "6px 14px", fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                📦 보관함에서 확인 →
              </Link>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, padding: "10px 14px", border: "1px solid #ff6688", background: "#ff668811", color: "#ff6688", fontFamily: FONT_KR, fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {!running && (
        <button onClick={onBack} style={{ marginTop: 12, background: "transparent", color: "#cfe9ff", border: "1px solid #1f2a6b", padding: "8px 18px", fontFamily: FONT_KR, fontSize: 13, cursor: "pointer" }}>
          ← 미리보기로 돌아가기
        </button>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// 보조 컴포넌트
// ───────────────────────────────────────────────────────────
function ModeBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "#ff4ec922" : "transparent",
        color: active ? "#ff4ec9" : "#cfe9ff",
        border: `1px solid ${active ? "#ff4ec9" : "#1f2a6b"}`,
        padding: "6px 14px", fontFamily: FONT_KR, fontSize: 13, fontWeight: active ? 700 : 500,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: "#060920", border: `1px solid ${color}33`, padding: 10 }}>
      <p style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#7e94c8", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color }}>{value}</p>
    </div>
  );
}

function NoActiveTemplateNotice({ onBack }: { onBack: () => void }) {
  return (
    <div className="pixel-frame" style={{ background: "#0a0e27", border: "1px dashed #ff668866", padding: 20, textAlign: "center" }}>
      <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#ff6688", marginBottom: 10 }}>
        ⚠ 활성 브랜드 템플릿이 없습니다.
      </p>
      <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", lineHeight: 1.7, marginBottom: 14 }}>
        1단계로 돌아가서 인스타 레퍼런스에서 추출하거나 프리셋 8종을 시드해주세요.
      </p>
      <button onClick={onBack} style={{ background: "#ff4ec9", color: "#0a0e27", border: "2px solid #ff4ec9", padding: "8px 18px", fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        ← 1단계로
      </button>
    </div>
  );
}
