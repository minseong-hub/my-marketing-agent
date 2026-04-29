"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DESKS, type DeskAgentId } from "@/data/desks";
import { CalendarTimeline } from "../widgets/CalendarTimeline";
import { QuickStats } from "../widgets/QuickStats";
import { NowWorkingCard } from "../widgets/NowWorkingCard";
import { Timeline } from "../widgets/Timeline";
import { IncidentLog } from "../widgets/IncidentLog";
import { TeamHandoff } from "../widgets/TeamHandoff";
import { MarkyAudience } from "../widgets/specialty/MarkyAudience";
import { DaliPageHealth } from "../widgets/specialty/DaliPageHealth";
import { AddyROAS } from "../widgets/specialty/AddyROAS";
import { PennyLedger } from "../widgets/specialty/PennyLedger";
import { CardNewsStudio } from "@/components/studio/CardNewsStudio";
import { AdCreativeStudio } from "@/components/studio/AdCreativeStudio";
import { showToast } from "../ToastHost";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

function SectionHeader({ title, sub, accent }: { title: string; sub?: string; accent: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: accent, letterSpacing: "0.08em", marginBottom: 6 }}>
        ▌ {title.toUpperCase()}
      </p>
      {sub && (
        <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#7e94c8", lineHeight: 1.6 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// 1) 콘텐츠 캘린더 (마키 SPECIAL)
export function MarkyContentCalendarTab({ agentId }: { agentId: DeskAgentId }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        title="콘텐츠 캘린더"
        sub="마키가 자동 발행 중인 SNS 콘텐츠를 22일 단위로 한눈에. 셀 클릭 → 자동 보고서."
        accent={DESKS[agentId].agent.accent}
      />
      <CalendarTimeline agentId={agentId} />
      <NowWorkingCard agentId={agentId} />
    </div>
  );
}

// 2) 오디언스 (마키 SPECIAL)
export function MarkyAudienceTab({ agentId }: { agentId: DeskAgentId }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        title="오디언스 분석"
        sub="팔로워 성장 + 시간대별 참여율 + 핵심 관심사 — 콘텐츠 발행 자동 우선순위에 반영됩니다."
        accent={DESKS[agentId].agent.accent}
      />
      <MarkyAudience />
      <QuickStats agentId={agentId} />
    </div>
  );
}

// 2-A) 카드뉴스 자동화 (마키 SPECIAL)
export function MarkyCardNewsTab({ agentId }: { agentId: DeskAgentId }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        title="🎨 카드뉴스 자동화"
        sub="주제 한 줄 → 마키가 6장 카드 카피 + 디자인 + 해시태그까지 자동 작성. PNG로 즉시 다운로드, 결과는 보관함에 저장됩니다."
        accent={DESKS[agentId].agent.accent}
      />
      <CardNewsStudio />
    </div>
  );
}

// 3) 템플릿 갤러리 (데일리 SPECIAL)
export function DaliTemplatesTab({ agentId }: { agentId: DeskAgentId }) {
  const router = useRouter();
  const a = DESKS[agentId].agent;
  const TEMPLATES = [
    { name: "5섹션 표준 상세", desc: "후킹/문제/솔루션/사회적증거/CTA", category: "전 카테고리" },
    { name: "의류 라운드 니트", desc: "사이즈·색상 옵션 + 코디 제안", category: "여성 의류" },
    { name: "와이드 슬랙스", desc: "기장 2종 + 체형별 가이드", category: "여성 의류" },
    { name: "캐시미어 머플러", desc: "선물용 카드 + 보관법", category: "잡화" },
    { name: "가전·디지털", desc: "스펙 표 + 비교 + AS 안내", category: "디지털" },
    { name: "식품 신선도", desc: "원산지 + 보관 + 레시피", category: "식품" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        title="템플릿 갤러리"
        sub="데일리가 사용하는 상세페이지 5섹션 템플릿. 클릭해서 미리보기."
        accent={a.accent}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {TEMPLATES.map((t) => (
          <button
            key={t.name}
            onClick={() => showToast(`「${t.name}」 템플릿 미리보기 — 곧 상세 화면 공개 예정`, { color: a.accent, icon: "▤" })}
            className="pixel-frame"
            style={{
              background: "#0a0e27", border: `1px solid ${a.accent}33`,
              padding: 14, textAlign: "left", cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = a.accent; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${a.accent}33`; }}
          >
            <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: a.accent, letterSpacing: "0.1em", marginBottom: 6 }}>
              {t.category.toUpperCase()}
            </p>
            <p style={{ fontFamily: FONT_KR, fontSize: 16, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>
              {t.name}
            </p>
            <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", lineHeight: 1.5 }}>
              {t.desc}
            </p>
          </button>
        ))}
      </div>
      <div className="pixel-frame" style={{ border: `1px dashed ${a.accent}55`, background: "#060920", padding: 16, textAlign: "center" }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", marginBottom: 8 }}>
          내 상품에 맞춘 상세페이지를 데일리에게 시켜보세요
        </p>
        <button
          onClick={() => router.push("/app/products")}
          style={{ background: a.accent, color: "#060920", border: `2px solid ${a.accent}`, padding: "8px 18px", fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        >
          ▶ 상품 카탈로그 →
        </button>
      </div>
    </div>
  );
}

// 4) A/B 테스트 (데일리 SPECIAL)
export function DaliABTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  const TESTS = [
    { name: "트렌치 V3 — 후킹 카피", a: "원안 (정보형)", b: "B안 (감성형)", winner: "B", uplift: "+1.2%p", status: "유의" },
    { name: "라운드 니트 — 메인 이미지", a: "착장 컷", b: "디테일 컷 + 착장", winner: "B", uplift: "+0.4%p", status: "주시" },
    { name: "와이드 슬랙스 — CTA", a: "지금 구매", b: "내 사이즈 확인", winner: "—", uplift: "데이터 부족", status: "진행" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="A/B 테스트" sub="진행 중·종료된 상세페이지 카피·이미지 실험 결과" accent={a.accent} />
      <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}22` }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#060920", borderBottom: `1px solid ${a.accent}22` }}>
              {["테스트", "A", "B", "승자", "효과", "상태"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.1em", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TESTS.map((t) => (
              <tr key={t.name} style={{ borderBottom: "1px solid #1f2a6b" }}>
                <td style={{ padding: "10px 12px", fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", fontWeight: 600 }}>{t.name}</td>
                <td style={{ padding: "10px 12px", fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8" }}>{t.a}</td>
                <td style={{ padding: "10px 12px", fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8" }}>{t.b}</td>
                <td style={{ padding: "10px 12px", fontFamily: FONT_KR, fontSize: 13, color: t.winner === "—" ? "#7e94c8" : a.accent, fontWeight: 700 }}>{t.winner}</td>
                <td style={{ padding: "10px 12px", fontFamily: FONT_MONO, fontSize: 12, color: "#cfe9ff" }}>{t.uplift}</td>
                <td style={{ padding: "10px 12px", fontFamily: FONT_KR, fontSize: 12, color: t.status === "유의" ? "#66ff9d" : t.status === "주시" ? "#ffd84d" : "#7e94c8", fontWeight: 600 }}>● {t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 5) 캠페인 (애디 SPECIAL)
export function AddyCampaignsTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="활성 캠페인 + ROAS" sub="채널별 성과 + 예산 슬라이더로 즉시 재분배" accent={a.accent} />
      <AddyROAS />
    </div>
  );
}

// 5-A) 광고 소재 제작 (애디 SPECIAL)
export function AddyAdCreativeTab({ agentId }: { agentId: DeskAgentId }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        title="🎯 광고 소재 제작"
        sub="주제 + 광고 목적 → 애디가 1:1 / 4:5 / 9:16 세 비율 변형을 동시에 작성. 각 변형은 메타 글자수 정책 자동 준수, PNG 즉시 다운로드."
        accent={DESKS[agentId].agent.accent}
      />
      <AdCreativeStudio />
    </div>
  );
}

// 6) 지출 모니터 (애디 SPECIAL)
export function AddySpendTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  const DAYS = [
    { d: "04/29", spend: 142000, roas: 3.2 },
    { d: "04/28", spend: 158000, roas: 2.9 },
    { d: "04/27", spend: 168000, roas: 3.5 },
    { d: "04/26", spend: 132000, roas: 2.8 },
    { d: "04/25", spend: 124000, roas: 3.0 },
    { d: "04/24", spend: 152000, roas: 2.6 },
    { d: "04/23", spend: 138000, roas: 3.1 },
  ];
  const max = Math.max(...DAYS.map((x) => x.spend));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="일별 지출 모니터" sub="최근 7일 광고비 + ROAS 추이" accent={a.accent} />
      <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}22`, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200, marginBottom: 12 }}>
          {DAYS.map((d) => {
            const h = (d.spend / max) * 160;
            return (
              <div key={d.d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#cfe9ff", marginBottom: 4 }}>₩{(d.spend / 1000).toFixed(0)}k</span>
                <div style={{ width: "100%", height: h, background: a.accent, boxShadow: `0 0 8px ${a.accent}66` }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", marginTop: 4 }}>{d.d}</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: d.roas >= 3 ? "#66ff9d" : "#ffd84d", fontWeight: 700 }}>{d.roas.toFixed(1)}x</span>
              </div>
            );
          })}
        </div>
        <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", textAlign: "center", marginTop: 8 }}>
          평균 ROAS {(DAYS.reduce((s, d) => s + d.roas, 0) / DAYS.length).toFixed(1)}x · 7일 지출 ₩{DAYS.reduce((s, d) => s + d.spend, 0).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// 7) 장부 (페니 SPECIAL)
export function PennyLedgerTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="실시간 장부" sub="자동 정산 매칭 + 입출금 거래 + 손익 추적" accent={a.accent} />
      <PennyLedger />
    </div>
  );
}

// 8) 세금·정산 (페니 SPECIAL)
export function PennyTaxTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  const QUARTERS = [
    { q: "2026 1Q", revenue: 38_400_000, vatPay: 1_240_000, status: "신고 완료" },
    { q: "2025 4Q", revenue: 42_180_000, vatPay: 1_510_000, status: "신고 완료" },
    { q: "2025 3Q", revenue: 31_200_000, vatPay: 980_000, status: "신고 완료" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="세금·정산" sub="분기별 부가세 · 종합소득세 · 정산 매칭" accent={a.accent} />
      <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}22` }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#060920", borderBottom: `1px solid ${a.accent}22` }}>
              {["분기", "매출", "납부세액", "상태"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontFamily: FONT_MONO, fontSize: 10, color: "#7e94c8", letterSpacing: "0.1em", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {QUARTERS.map((q) => (
              <tr key={q.q} style={{ borderBottom: "1px solid #1f2a6b" }}>
                <td style={{ padding: "10px 14px", fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", fontWeight: 600 }}>{q.q}</td>
                <td style={{ padding: "10px 14px", fontFamily: FONT_MONO, fontSize: 13, color: "#cfe9ff" }}>₩{q.revenue.toLocaleString()}</td>
                <td style={{ padding: "10px 14px", fontFamily: FONT_MONO, fontSize: 13, color: "#ffd84d", fontWeight: 700 }}>₩{q.vatPay.toLocaleString()}</td>
                <td style={{ padding: "10px 14px", fontFamily: FONT_KR, fontSize: 12, color: "#66ff9d", fontWeight: 600 }}>● {q.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ background: "#0a0e27", border: `1px dashed ${a.accent}55`, padding: 14, fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", lineHeight: 1.7 }}>
        ※ 부가세 추정치는 페니의 자동 계산 결과입니다. 정확한 신고는 세무사·국세청 홈택스 확인이 필요합니다.
      </div>
    </div>
  );
}

// 공통 BASE 탭들
// 9) 히스토리
export function HistoryTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="히스토리" sub="오늘의 작업 진행 + 자동 처리된 이슈 로그" accent={a.accent} />
      <Timeline agentId={agentId} />
      <IncidentLog agentId={agentId} />
    </div>
  );
}

// 10) 성과 분석
export function PerformanceTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  const Spec = agentId === "marky" ? MarkyAudience : agentId === "dali" ? DaliPageHealth : agentId === "addy" ? AddyROAS : PennyLedger;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="성과 분석" sub="핵심 지표 + 비서 특화 영역 상세 데이터" accent={a.accent} />
      <QuickStats agentId={agentId} />
      <Spec />
    </div>
  );
}

// 11) 지식 베이스
export function KnowledgeTab({ agentId }: { agentId: DeskAgentId }) {
  const router = useRouter();
  const a = DESKS[agentId].agent;
  const KB = {
    marky: [
      { title: "한국 SNS 시간대별 참여율 패턴", body: "주중 18~20시·주말 21~23시가 황금 시간대. 인스타 피드는 평일 12시·19시·22시 3회 발행이 효과적입니다." },
      { title: "해시태그 12개 룰", body: "트래픽 견인 6개(50K+) + 브랜드 차별화 6개(5K~50K) — 무거운 태그만 쓰면 묻힙니다." },
      { title: "릴스 첫 1초", body: "스크롤 멈추는 후킹은 시각적 변화 + 질문 카피 조합. 자막은 무음 시청 90% 대비 필수." },
    ],
    dali: [
      { title: "5섹션 표준 구조", body: "후킹 → 문제 제기 → 솔루션(셀링포인트 3) → 사회적 증거 → CTA. 각 섹션 700~900px 권장." },
      { title: "전환률 1%p 끌어올리는 3가지", body: "1) 첫 화면 0.8초 LCP 2) 사이즈 가이드 표 3) FAQ 5건 — 평균 +1.2%p 검증." },
      { title: "이미지 최적화", body: "메인 이미지 800KB 이하 + WebP, ALT 태그 한국어 핵심 키워드 1~2개 포함." },
    ],
    addy: [
      { title: "한국 ROAS 벤치마크", body: "의류·뷰티 2.0~3.5x · 식품 3.0~5.0x · 디지털 1.5~2.5x. 1.5x 미만은 일시정지 후보." },
      { title: "Meta vs 네이버 SA", body: "Meta는 발견 단계, 네이버는 구매 직전. 신상은 Meta 60% / 정착 상품은 네이버 50% 권장." },
      { title: "광고 헤드라인 30자 룰", body: "메타 3줄 헤드라인은 첫 문장 30자에 핵심. 모바일 미리보기에서 잘리는 지점." },
    ],
    penny: [
      { title: "스마트스토어 정산 주기", body: "구매확정 +1영업일 정산. 평균 9~12일 후 입금. 주말·공휴일 제외." },
      { title: "광고비 비중 가이드", body: "신생 브랜드 15~25% / 정착 8~12% / 성숙 5~8%. 9.9%는 건강한 수준." },
      { title: "부가세 일반 vs 간이", body: "연 매출 8천만원 미만은 간이과세 가능 (부가율 1.5~3%). 매입 공제 못 받음." },
    ],
  };
  const items = KB[agentId];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="지식 베이스" sub={`${a.name}이 임무 수행 시 참고하는 핵심 가이드`} accent={a.accent} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
        {items.map((it) => (
          <div key={it.title} className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}22`, padding: 14 }}>
            <p style={{ fontFamily: FONT_KR, fontSize: 15, fontWeight: 700, color: a.accent, marginBottom: 6 }}>
              {it.title}
            </p>
            <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#cfe9ff", lineHeight: 1.7 }}>
              {it.body}
            </p>
          </div>
        ))}
      </div>
      <div className="pixel-frame" style={{ border: `1px dashed ${a.accent}55`, background: "#060920", padding: 14, textAlign: "center" }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", marginBottom: 8 }}>
          더 자세한 운영 노하우는 도움말 문서에서 확인하세요
        </p>
        <button
          onClick={() => router.push("/docs")}
          style={{ background: "transparent", color: a.accent, border: `1px solid ${a.accent}`, padding: "8px 18px", fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          도움말 문서로 →
        </button>
      </div>
    </div>
  );
}

// 12) 팀 협업
export function TeamTab({ agentId }: { agentId: DeskAgentId }) {
  const router = useRouter();
  const a = DESKS[agentId].agent;
  const others = (["marky", "dali", "addy", "penny"] as DeskAgentId[]).filter((id) => id !== agentId);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="팀 협업" sub="다른 비서로 작업 인계 + 빠른 데스크 이동" accent={a.accent} />
      <TeamHandoff agentId={agentId} />
      <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}22`, padding: 14 }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, color: "#cfe9ff", marginBottom: 12 }}>
          다른 비서 데스크로 빠른 이동
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {others.map((id) => {
            const o = DESKS[id].agent;
            return (
              <button
                key={id}
                onClick={() => router.push(`/desk/${id}`)}
                className="pixel-frame"
                style={{
                  background: "#060920", border: `1px solid ${o.accent}55`,
                  padding: "12px", cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${o.accentDark}22`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#060920"; }}
              >
                <p style={{ fontFamily: FONT_PIX, fontSize: 10, color: o.accent, letterSpacing: "0.08em", marginBottom: 6 }}>
                  → {o.englishName.toUpperCase()}
                </p>
                <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 700, color: "#cfe9ff" }}>{o.name}</p>
                <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginTop: 2 }}>{o.role}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 13) 리포트
export function ReportsTab({ agentId }: { agentId: DeskAgentId }) {
  const a = DESKS[agentId].agent;
  const REPORTS = [
    { title: "일간 리포트", desc: "오늘 처리한 작업 요약", freq: "매일 자동" },
    { title: "주간 리포트", desc: "지난 7일 성과 + 다음 주 계획", freq: "월요일 09:00" },
    { title: "월간 리포트", desc: "월간 KPI + 인사이트", freq: "매월 1일" },
    { title: "이슈 리포트", desc: "주의 필요 항목 모음", freq: "발생 시 즉시" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="리포트" sub={`${a.name}이 자동 생성하는 보고서 종류`} accent={a.accent} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {REPORTS.map((r) => (
          <div key={r.title} className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}22`, padding: 14 }}>
            <p style={{ fontFamily: FONT_KR, fontSize: 15, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>{r.title}</p>
            <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", marginBottom: 10, lineHeight: 1.6 }}>{r.desc}</p>
            <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: a.accent, letterSpacing: "0.08em" }}>{r.freq}</p>
            <button
              onClick={() => showToast(`${r.title} 다운로드 — PDF 생성 중`, { color: a.accent, icon: "▤" })}
              style={{ marginTop: 10, background: a.accent, color: "#060920", border: `2px solid ${a.accent}`, padding: "6px 14px", fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%" }}
            >
              ▤ 다운로드
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 14) 설정
export function SettingsTab({ agentId }: { agentId: DeskAgentId }) {
  const router = useRouter();
  const a = DESKS[agentId].agent;
  const [auto, setAuto] = useState({ enabled: true, freq: "hourly", approvalRequired: true });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="설정" sub={`${a.name}의 동작 방식 조정`} accent={a.accent} />
      <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px solid ${a.accent}22`, padding: 16 }}>
        {/* 자동 운영 토글 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1f2a6b" }}>
          <div>
            <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, color: "#cfe9ff" }}>자동 운영</p>
            <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginTop: 2 }}>
              비활성화하면 모든 자동 임무가 일시 정지됩니다
            </p>
          </div>
          <button
            onClick={() => {
              setAuto((s) => ({ ...s, enabled: !s.enabled }));
              showToast(`자동 운영 ${!auto.enabled ? "재개" : "일시 정지"}`, { color: a.accent, icon: !auto.enabled ? "▶" : "⏸" });
            }}
            style={{
              background: auto.enabled ? a.accent : "#1f2a6b",
              color: auto.enabled ? "#060920" : "#7e94c8",
              border: `2px solid ${auto.enabled ? a.accent : "#1f2a6b"}`,
              padding: "6px 16px", fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            {auto.enabled ? "● 활성" : "○ 비활성"}
          </button>
        </div>

        {/* 자동 빈도 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1f2a6b" }}>
          <div>
            <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, color: "#cfe9ff" }}>자동 임무 빈도</p>
            <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginTop: 2 }}>
              스케줄러가 임무를 시작하는 주기
            </p>
          </div>
          <select
            value={auto.freq}
            onChange={(e) => { setAuto((s) => ({ ...s, freq: e.target.value })); showToast(`자동 빈도 변경: ${e.target.options[e.target.selectedIndex].text}`, { color: a.accent, icon: "▤" }); }}
            style={{ background: "#060920", border: `1px solid ${a.accent}66`, color: "#cfe9ff", padding: "6px 12px", fontFamily: FONT_KR, fontSize: 13, cursor: "pointer" }}
          >
            <option value="hourly">매시간</option>
            <option value="every_3h">3시간마다</option>
            <option value="daily">하루 1회</option>
            <option value="weekly">주 1회</option>
          </select>
        </div>

        {/* 승인 필수 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
          <div>
            <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, color: "#cfe9ff" }}>외부 액션 승인 필수</p>
            <p style={{ fontFamily: FONT_KR, fontSize: 12, color: "#7e94c8", marginTop: 2 }}>
              SNS 발행·광고 집행 등은 함장 승인 후 실행
            </p>
          </div>
          <button
            onClick={() => {
              setAuto((s) => ({ ...s, approvalRequired: !s.approvalRequired }));
              showToast(`외부 액션 승인 ${!auto.approvalRequired ? "필수" : "건너뜀"}`, { color: a.accent, icon: "▤" });
            }}
            style={{
              background: auto.approvalRequired ? a.accent : "#1f2a6b",
              color: auto.approvalRequired ? "#060920" : "#7e94c8",
              border: `2px solid ${auto.approvalRequired ? a.accent : "#1f2a6b"}`,
              padding: "6px 16px", fontFamily: FONT_KR, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            {auto.approvalRequired ? "● 필수" : "○ 자동"}
          </button>
        </div>
      </div>

      <div className="pixel-frame" style={{ background: "#0a0e27", border: `1px dashed ${a.accent}55`, padding: 14 }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", marginBottom: 8 }}>
          전체 계정 설정은 별도 페이지에서
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => router.push("/app/settings")} style={{ background: "transparent", color: a.accent, border: `1px solid ${a.accent}66`, padding: "7px 14px", fontFamily: FONT_KR, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            계정 설정 →
          </button>
          <button onClick={() => router.push("/app/billing")} style={{ background: "transparent", color: "#cfe9ff", border: "1px solid #1f2a6b", padding: "7px 14px", fontFamily: FONT_KR, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            결제 / 플랜 →
          </button>
        </div>
      </div>
    </div>
  );
}
