"use client";
import { CockpitShell } from "@/components/layout/CockpitShell";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { CockpitPanel } from "@/components/primitives/CockpitPanel";
import { Bar } from "@/components/primitives/Bar";
import { useState } from "react";

function CalculatorPanel() {
  const [revenue, setRevenue] = useState(30);
  const savedHours = Math.round(revenue * 0.4);
  const savedCost = (revenue * 0.12).toFixed(0);

  return (
    <CockpitPanel title="CALCULATOR" status="READY" accent="#ffd84d" statusColor="#ffd84d" className="flex-1">
      <div className="space-y-4">
        <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#7e94c8" }}>
          월 매출 추정 (백만원)
        </p>
        <input
          type="range"
          min={5}
          max={200}
          value={revenue}
          onChange={e => setRevenue(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#ffd84d" }}
        />
        <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "#ffd84d" }}>
          ₩{revenue}M
        </p>
        <div style={{ borderTop: "1px solid #1f2a6b", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <Bar v={Math.min(99, Math.round((savedHours / 160) * 100))} c="#66ff9d" label={`절약 시간 ~${savedHours}h/월`} segments={14} />
          <Bar v={Math.min(99, Math.round(Number(savedCost) * 0.5))} c="#5ce5ff" label={`비용 절감 ~${savedCost}만원`} segments={14} />
        </div>
        <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#4a5a8a" }}>
          * 업계 평균 기준 추정치
        </p>
      </div>
    </CockpitPanel>
  );
}

export default function PricingPage() {
  return (
    <CockpitShell
      sector="SECTOR-7G · SUPPLY DEPOT"
      leftConsole={<CalculatorPanel />}
      bootMessage="DEPOT ONLINE · 3 PACKAGES AVAILABLE · DISCOUNT: 14D FREE TRIAL"
    >
      <div>
        <Pricing />
        <Faq />
      </div>
    </CockpitShell>
  );
}
