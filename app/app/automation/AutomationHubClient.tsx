"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CockpitPanel } from "@/components/primitives/CockpitPanel";
import { Bar } from "@/components/primitives/Bar";
import { HudStrip } from "@/components/primitives/HudStrip";
import { AUTO_TASKS } from "@/lib/scheduler/auto-tasks";

const CREW_MAP = {
  marketing:   { deskId: "marky",  name: "마키",   role: "마케팅 비서",   accent: "#ff4ec9", accentDark: "#8a2877", autoCapable: true  },
  detail_page: { deskId: "dali",   name: "데일리", role: "상세페이지 비서", accent: "#5ce5ff", accentDark: "#2a86a8", autoCapable: true  },
  ads:         { deskId: "addy",   name: "애디",   role: "광고 전문가",     accent: "#ffd84d", accentDark: "#a08820", autoCapable: true  },
  finance:     { deskId: "penny",  name: "페니",   role: "재무 비서",       accent: "#66ff9d", accentDark: "#2a8a55", autoCapable: false },
} as const;

type AgentType = keyof typeof CREW_MAP;
const AGENT_TYPES: AgentType[] = ["marketing", "detail_page", "ads", "finance"];

interface SummaryResponse {
  plan: { slug: string; name: string; stageLabel: string; monthly_generation_limit: number | null } | null;
  monthlyTotal: number;
  stats: Record<string, {
    totalRuns: number;
    monthlyRuns: number;
    lastRunAt: string | null;
    pendingApprovals: number;
    status: string;
  }>;
  pendingTotal: number;
}

interface RecentLog {
  id: string;
  agent_type: string;
  level: string;
  message: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  idle: "대기 중", running: "운영 중", waiting_approval: "승인 대기",
  completed: "완료", error: "오류", paused: "일시 정지",
};
const STATUS_COLOR: Record<string, string> = {
  idle: "#7e94c8", running: "#5ce5ff", waiting_approval: "#ffd84d",
  completed: "#66ff9d", error: "#ff4ec9", paused: "#7e94c8",
};

function formatRelative(iso: string | null): string {
  if (!iso) return "기록 없음";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "방금 전";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
  return `${Math.floor(diff / 86400000)}일 전`;
}

export default function AutomationHubClient() {
  const router = useRouter();
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [logs, setLogs] = useState<RecentLog[]>([]);
  const [running, setRunning] = useState<AgentType | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const load = useCallback(async () => {
    const [sumRes, logsRes] = await Promise.all([
      fetch("/api/automation/summary", { cache: "no-store" }),
      fetch("/api/agents/logs?limit=80", { cache: "no-store" }),
    ]);
    if (sumRes.ok) setSummary(await sumRes.json());
    if (logsRes.ok) {
      const d = await logsRes.json();
      setLogs(d.logs || []);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // SSE auto-refresh
  useEffect(() => {
    const connect = () => {
      const es = new EventSource("/api/sse");
      esRef.current = es;
      es.addEventListener("heartbeat", () => setSseConnected(true));
      es.addEventListener("agent_log", (e) => {
        const log = JSON.parse(e.data);
        setLogs((prev) => [{ id: `${Date.now()}-${Math.random()}`, ...log }, ...prev].slice(0, 100));
      });
      es.addEventListener("agent_status_change", () => { void load(); });
      es.addEventListener("approval_requested", () => { void load(); });
      es.addEventListener("approval_resolved", () => { void load(); });
      es.onerror = () => { setSseConnected(false); es.close(); setTimeout(connect, 5000); };
    };
    connect();
    return () => { esRef.current?.close(); };
  }, [load]);

  async function handleRunNow(at: AgentType) {
    if (!CREW_MAP[at].autoCapable) {
      setMessage("페니(재무)는 자동 임무 카탈로그가 없습니다. 직접 작업 탭에서 실행하세요.");
      return;
    }
    setRunning(at);
    setMessage(null);
    try {
      const res = await fetch("/api/automation/run-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: at }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`✗ ${data.error || "실행 실패"}`);
      } else {
        setMessage(`▸ ${CREW_MAP[at].name} 자동 임무 시작됨 — 교신 로그를 확인하세요`);
        load();
      }
    } catch {
      setMessage("✗ 통신 오류");
    } finally {
      setRunning(null);
    }
  }

  const planLimit = summary?.plan?.monthly_generation_limit ?? null;
  const usagePct = planLimit && planLimit > 0
    ? Math.min(100, Math.round((summary!.monthlyTotal / planLimit) * 100))
    : 0;

  return (
    <div style={{ background: "#060920", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top nav */}
      <nav style={{ padding: "10px 20px", borderBottom: "1px solid #1f2a6b", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#060920", flexShrink: 0 }}>
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 14, color: "#5ce5ff", textShadow: "2px 2px 0 #2a86a8" }}>
          자동화 허브
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, background: sseConnected ? "#66ff9d" : "#7e94c8", animation: sseConnected ? "led-pulse 1.5s infinite" : "none" }} />
            <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: sseConnected ? "#66ff9d" : "#7e94c8" }}>
              {sseConnected ? "실시간 연결됨" : "연결 중..."}
            </span>
          </div>
          <button
            onClick={load}
            style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#5ce5ff", background: "none", border: "1px solid #1f2a6b", padding: "5px 12px", cursor: "pointer", fontWeight: 500 }}
          >
            ↻ 새로고침
          </button>
          <Link
            href="/app/library"
            style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#5ce5ff", textDecoration: "none", fontWeight: 500 }}
          >
            보관함
          </Link>
          <Link
            href="/app/assistants"
            style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#cfe9ff", textDecoration: "none", fontWeight: 500 }}
          >
            ← 비서 현황판
          </Link>
        </div>
      </nav>

      <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#5ce5ff", letterSpacing: "0.04em", marginBottom: 6 }}>
            자동화 운영 · 사용량 / 임무 / 승인
          </p>
          <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: "clamp(18px, 1.8vw, 22px)", color: "#cfe9ff", textShadow: "3px 3px 0 #2a86a8", marginBottom: 10 }}>
            자동화 허브
          </h1>
          <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 16, color: "#cfe9ff", lineHeight: 1.7 }}>
            비서들이 자동으로 수행 중인 임무, 이번 달 호출 한도, 승인 대기 작업, 등록된 자동 임무 목록을 한 곳에서 확인하실 수 있습니다.
          </p>
        </div>

        {/* 사용량 + 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* 호출 한도 */}
          <div className="pixel-frame" style={{ border: "1px solid #5ce5ff44", background: "#0a0e27", padding: 18 }}>
            <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#5ce5ff", marginBottom: 8 }}>
              이번 달 AI 호출
            </p>
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 22, color: "#cfe9ff" }}>
              {summary?.monthlyTotal ?? "-"}
              <span style={{ fontSize: 13, color: "#cfe9ff", marginLeft: 8, fontFamily: '"IBM Plex Sans KR", sans-serif', fontWeight: 500 }}>
                / {planLimit === null ? "무제한" : (planLimit ?? "-")}
              </span>
            </p>
            <div style={{ marginTop: 12 }}>
              <Bar v={planLimit === null ? 0 : usagePct} c={usagePct > 80 ? "#ff4ec9" : "#5ce5ff"} segments={20} />
            </div>
            {summary?.plan && (
              <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#cfe9ff", marginTop: 10 }}>
                현재 플랜: <b>{summary.plan.stageLabel}</b> · {summary.plan.name}
              </p>
            )}
            <Link
              href="/app/billing"
              style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#5ce5ff", textDecoration: "none", display: "inline-block", marginTop: 10, fontWeight: 600 }}
            >
              플랜 업그레이드 →
            </Link>
          </div>

          {/* 승인 대기 */}
          <div className="pixel-frame" style={{ border: "1px solid #ffd84d44", background: "#0a0e27", padding: 18 }}>
            <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#ffd84d", marginBottom: 8 }}>
              승인이 필요한 작업
            </p>
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 22, color: summary?.pendingTotal ? "#ffd84d" : "#cfe9ff" }}>
              {summary?.pendingTotal ?? 0}
              <span style={{ fontSize: 13, color: "#cfe9ff", marginLeft: 8, fontFamily: '"IBM Plex Sans KR", sans-serif', fontWeight: 500 }}>건</span>
            </p>
            <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#cfe9ff", marginTop: 10, lineHeight: 1.6 }}>
              비서가 자동으로 처리하다가 사용자 확인이 필요해진 작업이 모입니다.
            </p>
            <Link
              href="/app/assistants"
              style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#ffd84d", textDecoration: "none", display: "inline-block", marginTop: 10, fontWeight: 600 }}
            >
              승인 처리하러 가기 →
            </Link>
          </div>

          {/* 누적 실행 */}
          <div className="pixel-frame" style={{ border: "1px solid #66ff9d44", background: "#0a0e27", padding: 18 }}>
            <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#66ff9d", marginBottom: 8 }}>
              비서별 최근 30일 실행
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {AGENT_TYPES.map((at) => {
                const c = CREW_MAP[at];
                const s = summary?.stats[at];
                return (
                  <div key={at} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14 }}>
                    <span style={{ color: c.accent, fontWeight: 600 }}>{c.name}</span>
                    <span style={{ color: "#cfe9ff" }}>
                      {s?.monthlyRuns ?? 0}회
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {message && (
          <div
            className="pixel-frame"
            style={{
              border: `1px solid ${message.startsWith("✗") ? "#ff4ec9" : "#66ff9d"}`,
              background: message.startsWith("✗") ? "#ff4ec911" : "#66ff9d11",
              padding: "12px 16px",
              marginBottom: 16,
              fontFamily: '"IBM Plex Sans KR", sans-serif',
              fontSize: 15,
              fontWeight: 500,
              color: message.startsWith("✗") ? "#ff4ec9" : "#66ff9d",
            }}
          >
            {message}
          </div>
        )}

        {/* 크루별 자동 임무 보드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {AGENT_TYPES.map((at) => {
            const c = CREW_MAP[at];
            const s = summary?.stats[at];
            const tasks = (AUTO_TASKS as Record<string, string[]>)[at] ?? [];
            return (
              <div key={at} className="pixel-frame" style={{ border: `1px solid ${c.accent}44`, background: "#0a0e27" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${c.accent}33`, background: "#060920", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 16, fontWeight: 700, color: c.accent }}>
                    ● {c.name} · {c.role}
                  </span>
                  <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, fontWeight: 500, color: STATUS_COLOR[s?.status ?? "idle"] }}>
                    {STATUS_LABEL[s?.status ?? "idle"]}
                  </span>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 18, marginBottom: 14, flexWrap: "wrap" }}>
                    <div>
                      <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#7e94c8" }}>30일 실행</p>
                      <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 17, fontWeight: 700, color: "#cfe9ff", marginTop: 2 }}>{s?.monthlyRuns ?? 0}회</p>
                    </div>
                    <div>
                      <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#7e94c8" }}>자동 임무</p>
                      <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 17, fontWeight: 700, color: "#cfe9ff", marginTop: 2 }}>
                        {c.autoCapable ? `${tasks.length}개 등록` : "직접 작업 전용"}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#7e94c8" }}>최근 실행</p>
                      <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 15, color: "#cfe9ff", marginTop: 2 }}>{formatRelative(s?.lastRunAt ?? null)}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleRunNow(at)}
                      disabled={!c.autoCapable || running === at}
                      className="pixel-frame"
                      style={{
                        fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 700,
                        padding: "9px 16px",
                        cursor: c.autoCapable ? "pointer" : "not-allowed",
                        background: c.autoCapable ? c.accent : "#1f2a6b",
                        color: c.autoCapable ? "#060920" : "#7e94c8",
                        border: `2px solid ${c.autoCapable ? c.accent : "#1f2a6b"}`,
                        boxShadow: c.autoCapable ? `3px 3px 0 ${c.accentDark}` : "none",
                        opacity: running === at ? 0.6 : 1,
                      }}
                    >
                      {running === at ? "실행 중..." : c.autoCapable ? "▶ 자동 임무 1회 실행" : "수동 전용"}
                    </button>
                    <button
                      onClick={() => router.push(`/desk/${CREW_MAP[at].deskId}`)}
                      style={{
                        fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 500,
                        padding: "9px 16px",
                        background: "none",
                        color: c.accent,
                        border: `1px solid ${c.accent}55`,
                        cursor: "pointer",
                      }}
                    >
                      비서 화면으로 →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 최근 실행 로그 */}
        <CockpitPanel title="최근 실행 기록" status={`${logs.length}건`} statusColor="#5ce5ff" accent="#5ce5ff">
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {logs.length === 0 ? (
              <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#7e94c8", textAlign: "center", padding: "20px 0" }}>
                아직 실행 기록이 없습니다.
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{ display: "flex", gap: 12, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: "#7e94c8", flexShrink: 0, paddingTop: 2 }}>
                    {new Date(log.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, fontWeight: 700, color: CREW_MAP[log.agent_type as AgentType]?.accent ?? "#cfe9ff", flexShrink: 0, paddingTop: 2, width: 56 }}>
                    {CREW_MAP[log.agent_type as AgentType]?.name ?? log.agent_type}
                  </span>
                  <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 15, color: "#cfe9ff", lineHeight: 1.6 }}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </CockpitPanel>

        <HudStrip />
      </div>
    </div>
  );
}
