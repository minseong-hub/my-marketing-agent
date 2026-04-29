"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Status {
  ok: boolean;
  services: Record<string, { configured: boolean; label: string }>;
  user_usage_30d: {
    input_tokens: number;
    output_tokens: number;
    cache_read_tokens: number;
    cache_creation_tokens: number;
    calls: number;
    cache_savings_pct: number;
    cost_estimate_usd: number;
  };
  queue: { pending_due_now: number };
  note: string;
  last_checked: string;
}

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

export default function ApiStatusClient() {
  const [data, setData] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/platform-status", { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div style={{ background: "#060920", color: "#cfe9ff", minHeight: "100vh", padding: 40, fontFamily: FONT_KR }}>
        불러오는 중...
      </div>
    );
  }
  if (!data) return null;

  const allConfigured = Object.values(data.services).every((s) => s.configured);

  return (
    <div style={{ background: "#060920", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "10px 20px", borderBottom: "1px solid #1f2a6b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: FONT_PIX, fontSize: 14, color: "#5ce5ff" }}>CREWMATE AI · 시스템 상태</span>
        <Link href="/desk/marky" style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", textDecoration: "none", fontWeight: 500 }}>
          ← 데스크로
        </Link>
      </nav>

      <div style={{ flex: 1, padding: "32px 24px", maxWidth: 880, width: "100%", margin: "0 auto" }}>
        <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, color: "#5ce5ff", marginBottom: 6 }}>
          API & 운영 상태
        </p>
        <h1 style={{ fontFamily: FONT_PIX, fontSize: "clamp(18px, 2vw, 22px)", color: "#cfe9ff", textShadow: "3px 3px 0 #1f2a6b", marginBottom: 12 }}>
          시스템 헬스
        </h1>
        <p style={{ fontFamily: FONT_KR, fontSize: 15, color: "#cfe9ff", lineHeight: 1.7, marginBottom: 24 }}>
          API 키 결제/충전 후 이 페이지를 새로고침하면 상태가 즉시 ON으로 바뀝니다. 별도 코드 수정·배포 불필요.
        </p>

        {/* 종합 상태 */}
        <div className="pixel-frame" style={{
          border: `2px solid ${allConfigured ? "#66ff9d" : "#ffd84d"}`,
          background: "#0a0e27",
          padding: "16px 20px",
          marginBottom: 24,
        }}>
          <p style={{ fontFamily: FONT_PIX, fontSize: 13, color: allConfigured ? "#66ff9d" : "#ffd84d", marginBottom: 8 }}>
            {allConfigured ? "▶ 모든 서비스 정상" : "⚠ 일부 서비스 미설정"}
          </p>
          <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", lineHeight: 1.6 }}>
            {allConfigured
              ? "AI 컨텐츠 생성, 이미지 생성, 자동 발행 모두 가능합니다."
              : "일부 기능이 비활성 상태입니다. 결제 후 .env에 키를 추가하고 서버를 재시작하세요."}
          </p>
        </div>

        {/* 서비스 카드 */}
        <p style={{ fontFamily: FONT_PIX, fontSize: 12, color: "#5ce5ff", marginBottom: 12 }}>▶ 외부 서비스 연결</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 28 }}>
          {Object.entries(data.services).map(([id, s]) => (
            <ServiceCard key={id} id={id} label={s.label} configured={s.configured} />
          ))}
        </div>

        {/* 사용량 */}
        <p style={{ fontFamily: FONT_PIX, fontSize: 12, color: "#ff4ec9", marginBottom: 12 }}>▶ 지난 30일 사용량 (내 계정)</p>
        <div className="pixel-frame" style={{ border: "1px solid #ff4ec944", background: "#0a0e27", padding: "16px 20px", marginBottom: 28 }}>
          <Row label="총 호출 수" value={`${data.user_usage_30d.calls.toLocaleString()}회`} />
          <Row label="입력 토큰" value={data.user_usage_30d.input_tokens.toLocaleString()} />
          <Row label="출력 토큰" value={data.user_usage_30d.output_tokens.toLocaleString()} />
          <Row label="캐시 적중 토큰" value={data.user_usage_30d.cache_read_tokens.toLocaleString()} />
          <Row label="캐시 절감률" value={`${data.user_usage_30d.cache_savings_pct}%`} accent="#66ff9d" />
          <Row label="추정 비용" value={`$${data.user_usage_30d.cost_estimate_usd.toFixed(4)}`} accent="#ffd84d" />
        </div>

        {/* 큐 */}
        <p style={{ fontFamily: FONT_PIX, fontSize: 12, color: "#ffd84d", marginBottom: 12 }}>▶ 발행 큐</p>
        <div className="pixel-frame" style={{ border: "1px solid #ffd84d44", background: "#0a0e27", padding: "16px 20px", marginBottom: 28 }}>
          <Row label="대기 중 (지금 발행 가능)" value={`${data.queue.pending_due_now}건`} accent={data.queue.pending_due_now > 0 ? "#ffd84d" : "#7e94c8"} />
          <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", lineHeight: 1.6, marginTop: 8 }}>
            워커는 별도 cron으로 트리거됩니다. <code style={{ background: "#1f2a6b", padding: "1px 6px", color: "#5ce5ff" }}>POST /api/scheduler/drain-queue</code> with <code style={{ background: "#1f2a6b", padding: "1px 6px", color: "#5ce5ff" }}>Bearer SCHEDULER_SECRET</code>.
          </p>
        </div>

        {/* 안내 */}
        <p style={{ fontFamily: FONT_KR, fontSize: 13, color: "#7e94c8", lineHeight: 1.7, marginBottom: 16 }}>
          {data.note}
        </p>
        <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8" }}>
          마지막 확인: {new Date(data.last_checked).toLocaleString("ko-KR")}
        </p>

        <button
          onClick={load}
          disabled={refreshing}
          style={{
            marginTop: 16,
            background: "#5ce5ff", color: "#060920",
            border: "2px solid #5ce5ff", boxShadow: "3px 3px 0 #1f7d8a",
            padding: "8px 18px",
            fontFamily: FONT_KR, fontSize: 14, fontWeight: 700,
            cursor: refreshing ? "not-allowed" : "pointer",
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          {refreshing ? "확인 중..." : "▶ 다시 확인"}
        </button>
      </div>
    </div>
  );
}

function ServiceCard({ id, label, configured }: { id: string; label: string; configured: boolean }) {
  return (
    <div className="pixel-frame" style={{
      border: `1px solid ${configured ? "#66ff9d44" : "#ffd84d44"}`,
      background: "#0a0e27",
      padding: "12px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{
          width: 10, height: 10, borderRadius: 0,
          background: configured ? "#66ff9d" : "#ffd84d",
          boxShadow: configured ? "0 0 8px #66ff9d" : "none",
        }} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: configured ? "#66ff9d" : "#ffd84d", fontWeight: 700 }}>
          {configured ? "ACTIVE" : "PENDING"}
        </span>
      </div>
      <p style={{ fontFamily: FONT_KR, fontSize: 14, color: "#cfe9ff", fontWeight: 600, marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#7e94c8" }}>{id}</p>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 0", borderBottom: "1px solid #1f2a6b" }}>
      <span style={{ fontFamily: FONT_KR, fontSize: 14, color: "#7e94c8" }}>{label}</span>
      <span style={{ fontFamily: FONT_MONO, fontSize: 14, color: accent ?? "#cfe9ff", fontWeight: 700 }}>{value}</span>
    </div>
  );
}
