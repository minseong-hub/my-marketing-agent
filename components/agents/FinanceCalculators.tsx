"use client";

import { useState, useMemo } from "react";

const LABEL_FONT = '"IBM Plex Sans KR", sans-serif';
const FG = "#cfe9ff";
const ACC = "#66ff9d";
const ACC_DARK = "#2a8a55";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#060920",
  border: `1px solid ${ACC_DARK}`,
  padding: "8px 10px",
  fontFamily: LABEL_FONT,
  fontSize: 15,
  color: FG,
  outline: "none",
  borderRadius: 0,
  boxSizing: "border-box",
};

function fmtKRW(n: number): string {
  if (!isFinite(n)) return "—";
  return Math.round(n).toLocaleString("ko-KR") + "원";
}
function fmtPct(n: number): string {
  if (!isFinite(n)) return "—";
  return n.toFixed(1) + "%";
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontFamily: LABEL_FONT, fontSize: 14, fontWeight: 700, color: FG, marginBottom: 4 }}>{title}</p>
      {hint && <p style={{ fontFamily: LABEL_FONT, fontSize: 12, color: "#7e94c8", marginBottom: 8 }}>{hint}</p>}
      {children}
    </div>
  );
}

function NumberField({ label, value, onChange, suffix = "원", placeholder }: { label: string; value: number | ""; onChange: (v: number | "") => void; suffix?: string; placeholder?: string }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontFamily: LABEL_FONT, fontSize: 13, color: "#7e94c8", display: "block", marginBottom: 4 }}>
        {label} <span style={{ color: "#4a5a8a", fontSize: 12 }}>{suffix && `(${suffix})`}</span>
      </span>
      <input
        type="number"
        inputMode="numeric"
        style={inputStyle}
        value={value === "" ? "" : value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? "" : Number(v));
        }}
        placeholder={placeholder}
      />
    </label>
  );
}

/** 1) 마진 계산기 */
function MarginCalc() {
  const [price, setPrice] = useState<number | "">(39000);
  const [cost, setCost] = useState<number | "">(18000);
  const [feePct, setFeePct] = useState<number | "">(8);
  const [shipping, setShipping] = useState<number | "">(2500);
  const [adPerUnit, setAdPerUnit] = useState<number | "">(3000);
  const [packaging, setPackaging] = useState<number | "">(500);

  const r = useMemo(() => {
    const p = Number(price) || 0;
    const c = Number(cost) || 0;
    const fee = (p * (Number(feePct) || 0)) / 100;
    const ship = Number(shipping) || 0;
    const ad = Number(adPerUnit) || 0;
    const pack = Number(packaging) || 0;
    const totalCost = c + fee + ship + ad + pack;
    const profit = p - totalCost;
    const marginPct = p > 0 ? (profit / p) * 100 : 0;
    const cogsPct = p > 0 ? (c / p) * 100 : 0;
    return { fee, totalCost, profit, marginPct, cogsPct };
  }, [price, cost, feePct, shipping, adPerUnit, packaging]);

  return (
    <div className="pixel-frame" style={{ border: `1px solid ${ACC}44`, background: "#0a0e27", padding: 16 }}>
      <Section
        title="마진 계산기"
        hint="판매가/매입가/수수료/광고비를 넣으면 단위당 순이익과 마진율을 즉시 계산합니다. (AI 호출 없음)"
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <NumberField label="판매가" value={price} onChange={setPrice} placeholder="39000" />
          <NumberField label="매입가/원가" value={cost} onChange={setCost} placeholder="18000" />
          <NumberField label="플랫폼 수수료율" value={feePct} onChange={setFeePct} suffix="%" placeholder="8" />
          <NumberField label="배송비 (셀러 부담분)" value={shipping} onChange={setShipping} placeholder="2500" />
          <NumberField label="단위당 광고비" value={adPerUnit} onChange={setAdPerUnit} placeholder="3000" />
          <NumberField label="포장/부자재" value={packaging} onChange={setPackaging} placeholder="500" />
        </div>
      </Section>

      <div style={{ borderTop: `1px solid ${ACC}33`, paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <ResultRow label="플랫폼 수수료" value={fmtKRW(r.fee)} />
        <ResultRow label="총 비용 합계" value={fmtKRW(r.totalCost)} />
        <ResultRow label="단위당 순이익" value={fmtKRW(r.profit)} highlight={r.profit >= 0 ? ACC : "#ff4ec9"} />
        <ResultRow label="마진율" value={fmtPct(r.marginPct)} highlight={r.marginPct >= 20 ? ACC : r.marginPct >= 10 ? "#ffd84d" : "#ff4ec9"} />
        <ResultRow label="원가율(COGS)" value={fmtPct(r.cogsPct)} />
        <ResultRow label="100개 판매시 순이익" value={fmtKRW(r.profit * 100)} />
      </div>
      <p style={{ fontFamily: LABEL_FONT, fontSize: 12, color: "#7e94c8", marginTop: 12, lineHeight: 1.6 }}>
        ※ 마진율 20% 이상이면 안정권, 10% 미만은 광고비/수수료 재검토 권장. 부가세는 별도 계산기를 사용하세요.
      </p>
    </div>
  );
}

/** 2) 손익분기 계산기 */
function BreakEvenCalc() {
  const [fixedCost, setFixedCost] = useState<number | "">(1500000);
  const [profitPerUnit, setProfitPerUnit] = useState<number | "">(8000);

  const beUnits = useMemo(() => {
    const f = Number(fixedCost) || 0;
    const p = Number(profitPerUnit) || 0;
    if (p <= 0) return Infinity;
    return Math.ceil(f / p);
  }, [fixedCost, profitPerUnit]);

  return (
    <div className="pixel-frame" style={{ border: `1px solid ${ACC}44`, background: "#0a0e27", padding: 16 }}>
      <Section title="손익분기 계산기" hint="고정비를 회수하려면 한 달에 몇 개 팔아야 하는지">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <NumberField label="월 고정비 (임대료/구독료/인건비 등)" value={fixedCost} onChange={setFixedCost} placeholder="1500000" />
          <NumberField label="단위당 순이익 (위 마진 계산기 결과)" value={profitPerUnit} onChange={setProfitPerUnit} placeholder="8000" />
        </div>
      </Section>
      <ResultRow label="손익분기 판매수량 / 월" value={isFinite(beUnits) ? `${beUnits.toLocaleString()}개` : "단위당 순이익이 0이거나 음수"} highlight={ACC} big />
    </div>
  );
}

/** 3) 부가세(간이 추정) 계산기 */
function VatCalc() {
  const [revenue, setRevenue] = useState<number | "">(10000000);
  const [purchase, setPurchase] = useState<number | "">(4000000);
  const [bizType, setBizType] = useState<"general" | "simple">("general");

  const r = useMemo(() => {
    const sales = Number(revenue) || 0;
    const buy = Number(purchase) || 0;
    if (bizType === "general") {
      const salesVat = (sales * 10) / 110;
      const buyVat = (buy * 10) / 110;
      return { salesVat, buyVat, payable: salesVat - buyVat };
    } else {
      // 간이과세 (의류 도소매 기준 1.5% 부가율 적용 — 실제는 업종별 상이, 안내문구 추가)
      const payable = sales * 0.015;
      return { salesVat: payable, buyVat: 0, payable };
    }
  }, [revenue, purchase, bizType]);

  return (
    <div className="pixel-frame" style={{ border: `1px solid ${ACC}44`, background: "#0a0e27", padding: 16 }}>
      <Section title="부가세 추정 계산기" hint="신고 의무 금액을 빠르게 가늠 — 정확한 신고는 세무사 확인 권장">
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button
            onClick={() => setBizType("general")}
            style={{ flex: 1, padding: "8px", background: bizType === "general" ? `${ACC}22` : "#060920", border: `1px solid ${bizType === "general" ? ACC : "#1f2a6b"}`, color: bizType === "general" ? ACC : FG, fontFamily: LABEL_FONT, fontSize: 13, cursor: "pointer", fontWeight: bizType === "general" ? 700 : 400 }}
          >
            일반과세자
          </button>
          <button
            onClick={() => setBizType("simple")}
            style={{ flex: 1, padding: "8px", background: bizType === "simple" ? `${ACC}22` : "#060920", border: `1px solid ${bizType === "simple" ? ACC : "#1f2a6b"}`, color: bizType === "simple" ? ACC : FG, fontFamily: LABEL_FONT, fontSize: 13, cursor: "pointer", fontWeight: bizType === "simple" ? 700 : 400 }}
          >
            간이과세자 (1.5%)
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <NumberField label="과세 매출 (부가세 포함)" value={revenue} onChange={setRevenue} placeholder="10000000" />
          {bizType === "general" && (
            <NumberField label="매입 (부가세 포함)" value={purchase} onChange={setPurchase} placeholder="4000000" />
          )}
        </div>
      </Section>
      <div style={{ borderTop: `1px solid ${ACC}33`, paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <ResultRow label={bizType === "general" ? "매출 부가세" : "납부세액 (1.5%)"} value={fmtKRW(r.salesVat)} />
        {bizType === "general" && <ResultRow label="매입 부가세 (공제)" value={fmtKRW(r.buyVat)} />}
        <ResultRow label="추정 납부세액" value={fmtKRW(r.payable)} highlight={ACC} big />
      </div>
      <p style={{ fontFamily: LABEL_FONT, fontSize: 12, color: "#7e94c8", marginTop: 12, lineHeight: 1.6 }}>
        ※ 간이과세자의 부가율은 업종마다 다릅니다 (의류 도소매 기준 1.5%). 정확한 신고는 세무사·국세청 홈택스 확인 필수.
      </p>
    </div>
  );
}

function ResultRow({ label, value, highlight, big }: { label: string; value: string; highlight?: string; big?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "#060920", border: "1px solid #1f2a6b" }}>
      <span style={{ fontFamily: LABEL_FONT, fontSize: 13, color: "#7e94c8" }}>{label}</span>
      <span style={{ fontFamily: LABEL_FONT, fontSize: big ? 18 : 15, fontWeight: 700, color: highlight || FG }}>{value}</span>
    </div>
  );
}

export function FinanceCalculators() {
  const [tab, setTab] = useState<"margin" | "be" | "vat">("margin");
  return (
    <div>
      <div style={{ display: "flex", gap: 0, marginBottom: 12, border: `1px solid ${ACC}33` }}>
        {([
          { id: "margin", label: "마진율" },
          { id: "be", label: "손익분기" },
          { id: "vat", label: "부가세" },
        ] as const).map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: "10px",
                background: active ? `${ACC}22` : "transparent",
                color: active ? ACC : FG,
                border: "none",
                borderRight: t.id !== "vat" ? `1px solid ${ACC}33` : "none",
                fontFamily: LABEL_FONT,
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tab === "margin" && <MarginCalc />}
      {tab === "be" && <BreakEvenCalc />}
      {tab === "vat" && <VatCalc />}
    </div>
  );
}
