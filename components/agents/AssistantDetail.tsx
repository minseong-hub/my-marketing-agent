"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CockpitShell } from "@/components/layout/CockpitShell";
import { CockpitPanel } from "@/components/primitives/CockpitPanel";
import { AstronautAvatar } from "@/components/primitives/AstronautAvatar";
import { Bar } from "@/components/primitives/Bar";
import { PixelButton } from "@/components/primitives/PixelButton";
import { ApprovalModal } from "./ApprovalModal";
import { FinanceCalculators } from "./FinanceCalculators";
import { AGENTS } from "@/data/agents";
import type { AgentType } from "@/lib/agents/types";
import { AUTO_TASKS } from "@/lib/scheduler/auto-tasks";

// Crewmate AI mapping
const CREW_MAP: Record<AgentType, {
  crewId: string; accent: string; accentDark: string;
  name: string; role: string; sector: string;
  manualOps: { title: string; desc: string; promptTemplate: (input: string) => string; placeholder: string }[];
  stats: { label: string; v: number; c: string }[];
}> = {
  marketing: {
    crewId: "marky", accent: "#ff4ec9", accentDark: "#8a2877",
    name: "마키", role: "마케팅 비서", sector: "마키 스테이션 · 마케팅 본부",
    manualOps: [
      {
        title: "SNS 캡션 다듬기",
        desc: "초안 캡션을 톤·해시태그·이모지까지 정돈된 인스타그램 캡션으로 즉시 변환",
        placeholder: "예: 오늘 신상품 입고 됐습니다 색상 3가지 가을 코디 추천",
        promptTemplate: (input) => `다음 인스타그램 캡션 초안을 한국 온라인 셀러 톤(친근+감각적)으로 다듬고, 적절한 이모지와 해시태그 8~12개를 포함해 최종 게시 가능한 형태로 작성해 주세요.\n\n초안:\n"${input}"`,
      },
      {
        title: "해시태그 묶음 생성",
        desc: "상품/카테고리 키워드 → 트래픽용 + 브랜드용 해시태그 12개 즉시 생성",
        placeholder: "예: 가을 니트 여성 캐주얼",
        promptTemplate: (input) => `다음 키워드를 기반으로 인스타그램·스레드용 해시태그 12개를 추천해 주세요. 6개는 트래픽 견인용 인기 태그, 6개는 브랜드 차별화용 니치 태그로 분류해 주세요.\n\n키워드: ${input}`,
      },
    ],
    stats: [
      { label: "SNS 참여율 부스트", v: 92, c: "#ff4ec9" },
      { label: "콘텐츠 생산 속도",  v: 97, c: "#ff4ec9" },
      { label: "트렌드 감지",        v: 88, c: "#ff86dc" },
      { label: "브랜드 일관성",      v: 95, c: "#ff86dc" },
    ],
  },
  detail_page: {
    crewId: "dali", accent: "#5ce5ff", accentDark: "#2a86a8",
    name: "데일리", role: "상세페이지 비서", sector: "데일리 스테이션 · 상세페이지 스튜디오",
    manualOps: [
      {
        title: "셀링포인트 3개 추출",
        desc: "상품 정보를 입력하면 구매 결정에 직결되는 셀링포인트 3개와 카피라인 즉시 작성",
        placeholder: "예: 100% 면 소재, 봄가을용, 색상 5종, 단독 디자인",
        promptTemplate: (input) => `다음 상품 특징을 바탕으로 상세페이지 상단에 노출할 셀링포인트 3개를 추출하고, 각각에 대한 8자 이내 임팩트 카피와 30자 이내 부연 카피를 함께 작성해 주세요.\n\n상품 특징: ${input}`,
      },
      {
        title: "구매 망설임 해소 FAQ",
        desc: "상세페이지 하단에 들어갈 구매 전 FAQ 5개 자동 작성",
        placeholder: "예: 가죽 크로스백, 가격 12만원, 30대 여성",
        promptTemplate: (input) => `다음 상품에 대해 한국 소비자가 구매 전 가장 많이 망설이는 질문 5개와 그에 대한 신뢰감 있는 답변을 상세페이지용 FAQ 형식으로 작성해 주세요.\n\n상품 정보: ${input}`,
      },
    ],
    stats: [
      { label: "전환률 개선",     v: 89, c: "#5ce5ff" },
      { label: "페이지 체류시간", v: 94, c: "#5ce5ff" },
      { label: "카피 설득력",     v: 91, c: "#9af0ff" },
      { label: "섹션 구조화",     v: 96, c: "#9af0ff" },
    ],
  },
  ads: {
    crewId: "addy", accent: "#ffd84d", accentDark: "#a08820",
    name: "애디", role: "광고 전문가", sector: "애디 스테이션 · 광고 운영 센터",
    manualOps: [
      {
        title: "광고 헤드라인 5개",
        desc: "상품 + 타겟 입력 → 클릭 유도 헤드라인 5개를 메타/네이버용으로 즉시 생성",
        placeholder: "예: 가을 니트, 25~34세 직장 여성, 가성비",
        promptTemplate: (input) => `다음 상품과 타겟 정보를 바탕으로 메타(인스타그램) 광고용 헤드라인 5개와 네이버 검색광고용 헤드라인 5개를 분리해서 작성해 주세요. 각 헤드라인은 30자 이내, 클릭 유도력에 집중해 주세요.\n\n상품/타겟: ${input}`,
      },
      {
        title: "광고 예산 분배 시뮬",
        desc: "월 광고 예산을 메타/네이버/구글에 분배하는 추천 비율과 근거 즉시 산출",
        placeholder: "예: 월 광고 예산 100만원, 신규 브랜드, 카테고리 의류",
        promptTemplate: (input) => `다음 조건에서 메타(인스타·페북), 네이버 검색광고, 구글 쇼핑광고 3개 채널에 월간 광고 예산을 분배하는 추천 비율(%)과 그 근거를 표로 작성해 주세요. 채널별 예상 ROAS 범위도 함께 제시해 주세요.\n\n조건: ${input}`,
      },
    ],
    stats: [
      { label: "ROAS 최적화",      v: 93, c: "#ffd84d" },
      { label: "예산 효율",        v: 88, c: "#ffd84d" },
      { label: "채널 분석",        v: 95, c: "#fff0a8" },
      { label: "소재 A/B 테스트", v: 82, c: "#fff0a8" },
    ],
  },
  finance: {
    crewId: "penny", accent: "#66ff9d", accentDark: "#2a8a55",
    name: "페니", role: "재무 비서", sector: "페니 스테이션 · 재무 허브",
    manualOps: [
      {
        title: "마진율 계산 + 진단",
        desc: "매입가/판매가/수수료를 입력하면 마진율과 손익분기 판매량 즉시 산출",
        placeholder: "예: 매입가 18000, 판매가 39000, 플랫폼수수료 8%, 광고비 3000",
        promptTemplate: (input) => `다음 조건의 상품 마진율(%)과 단위당 순이익(원), 월 손익분기점(판매수량)을 계산하고, 마진을 개선할 수 있는 구체적 액션 3가지를 제안해 주세요.\n\n조건: ${input}`,
      },
      {
        title: "월간 매출 요약",
        desc: "이번 달 매출/지출 데이터를 입력하면 핵심 지표 요약 + 다음 달 액션",
        placeholder: "예: 매출 1200만, 광고비 150만, 매입 480만, 수수료 110만, 기타 80만",
        promptTemplate: (input) => `다음 월간 재무 데이터를 바탕으로 매출총이익률, 영업이익률, 광고비 비중을 계산하고, 다음 달 개선해야 할 우선순위 액션 3가지를 작성해 주세요.\n\n데이터: ${input}`,
      },
    ],
    stats: [
      { label: "손익 정확도",       v: 99, c: "#66ff9d" },
      { label: "현금흐름 추적",    v: 96, c: "#66ff9d" },
      { label: "비용 최적화",      v: 87, c: "#b8ffd1" },
      { label: "세금 시뮬레이션",  v: 90, c: "#b8ffd1" },
    ],
  },
};

const STATUS_LABEL: Record<string, string> = {
  idle: "대기 중", running: "임무 수행 중", waiting_approval: "승인 대기",
  completed: "완료", error: "통신 장애", paused: "일시정지",
};
const STATUS_COLOR: Record<string, string> = {
  idle: "#4a5a8a", running: "#5ce5ff", waiting_approval: "#ffd84d",
  completed: "#66ff9d", error: "#ff4ec9", paused: "#7e94c8",
};
const LOG_COLOR: Record<string, string> = {
  info: "#5ce5ff", success: "#66ff9d", warning: "#ffd84d",
  error: "#ff4ec9", action: "#ff4ec9",
};
const LOG_LEVEL_KR: Record<string, string> = {
  info: "정보", success: "완료", warning: "주의",
  error: "오류", action: "실행",
};

interface LogItem { id: string; agent_type: string; level: string; message: string; created_at: string; }
interface ApprovalItem {
  id: string; agent_type: string; title: string; description: string;
  urgency_level: string; expires_at: string; preview_data: Record<string, unknown>; action_type: string;
}

export interface AssistantDetailProps {
  agentType: AgentType;
  quickTasks?: { label: string; task: string }[];
}

type Mode = "auto" | "manual";

function ModeTabs({ mode, onChange, accent }: { mode: Mode; onChange: (m: Mode) => void; accent: string }) {
  const tabs: { id: Mode; label: string; sub: string }[] = [
    { id: "auto",   label: "자동 운영",  sub: "비서가 알아서 돌리는 임무" },
    { id: "manual", label: "직접 작업", sub: "내가 시키고 받아보는 결과" },
  ];
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 16, border: `1px solid ${accent}33`, background: "#0a0e27" }}>
      {tabs.map((t) => {
        const active = mode === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              flex: 1,
              padding: "12px 16px",
              background: active ? `${accent}22` : "transparent",
              borderRight: t.id === "auto" ? `1px solid ${accent}33` : "none",
              borderBottom: active ? `2px solid ${accent}` : "2px solid transparent",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s",
            }}
          >
            <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 17, fontWeight: 700, color: active ? accent : "#cfe9ff", marginBottom: 4 }}>
              {t.label}
            </p>
            <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: active ? accent : "#7e94c8" }}>
              ▸ {t.sub}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function AutoBoard({ agentType, accent, accentDark, logs, sseConnected }: {
  agentType: AgentType;
  accent: string;
  accentDark: string;
  logs: LogItem[];
  sseConnected: boolean;
}) {
  const tasks = (AUTO_TASKS as Record<string, string[]>)[agentType] ?? [];
  const autoLogs = logs.filter((l) => l.message.includes("[AUTO]") || l.message.includes("자동 임무"));

  return (
    <>
      {/* 자동 운영 상태 */}
      <div className="pixel-frame" style={{ border: `1px solid ${accent}66`, background: `${accentDark}22`, padding: "14px 16px", marginBottom: 16 }}>
        <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: accent, marginBottom: 6 }}>
          ▸ 자동 운영 모드
        </p>
        <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 16, color: "#cfe9ff", lineHeight: 1.7 }}>
          이 비서는 아래 임무 목록을 스케줄러가 일정 간격으로 자동 실행합니다. 결과는 활동 로그와 자동화 허브에서 확인하실 수 있어요.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <div style={{ width: 8, height: 8, background: sseConnected ? "#66ff9d" : "#7e94c8", animation: sseConnected ? "led-pulse 1.5s infinite" : "none" }} />
          <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: sseConnected ? "#66ff9d" : "#7e94c8" }}>
            {sseConnected ? "스케줄러 정상 연결" : "스케줄러 연결 대기 중"}
          </span>
        </div>
      </div>

      {/* 자동 임무 카탈로그 */}
      {tasks.length > 0 ? (
        <div className="pixel-frame" style={{ border: `1px solid ${accent}33`, background: "#0a0e27", marginBottom: 16 }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${accent}22`, background: "#060920" }}>
            <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#cfe9ff" }}>
              자동 임무 목록 ({tasks.length}개)
            </span>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.map((task, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${accent}66`, paddingLeft: 12, paddingTop: 4, paddingBottom: 4 }}>
                <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, fontWeight: 600, color: accent, marginBottom: 4 }}>
                  자동 임무 {String(i + 1).padStart(2, "0")}
                </p>
                <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 15, color: "#cfe9ff", lineHeight: 1.7 }}>
                  {task.length > 140 ? task.slice(0, 140) + "…" : task}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="pixel-frame" style={{ border: `1px solid ${accent}33`, background: "#0a0e27", padding: 14, marginBottom: 16 }}>
          <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 16, color: "#cfe9ff" }}>
            이 비서는 자동 임무가 등록되어 있지 않습니다. <b>직접 작업</b> 탭에서 임무를 지시하실 수 있어요.
          </p>
        </div>
      )}

      {/* 자동 실행 로그 */}
      <div className="pixel-frame" style={{ border: `1px solid ${accent}33`, background: "#060e20" }}>
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${accent}22`, background: "#0a0e27" }}>
          <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#cfe9ff" }}>
            자동 실행 기록 ({autoLogs.length}건)
          </span>
        </div>
        <div style={{ padding: "10px 14px", maxHeight: 220, overflowY: "auto" }}>
          {autoLogs.length === 0 ? (
            <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#7e94c8", textAlign: "center", padding: "16px 0" }}>
              아직 자동 실행 기록이 없습니다.
            </p>
          ) : (
            autoLogs.map((log) => (
              <div key={log.id} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: "#7e94c8", flexShrink: 0, paddingTop: 2 }}>
                  {new Date(log.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#cfe9ff", lineHeight: 1.6 }}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function ManualOpsPanel({ accent, accentDark, ops, onSubmit, disabled }: {
  accent: string;
  accentDark: string;
  ops: { title: string; desc: string; promptTemplate: (input: string) => string; placeholder: string }[];
  onSubmit: (prompt: string) => void;
  disabled: boolean;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [inputs, setInputs] = useState<Record<number, string>>({});

  return (
    <div className="pixel-frame" style={{ border: `1px solid ${accent}55`, background: "#0a0e27", marginBottom: 16 }}>
      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${accent}33`, background: "#060920" }}>
        <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 15, fontWeight: 700, color: accent }}>
          한 줄 작업 — 입력하고 바로 실행
        </span>
        <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#7e94c8", marginTop: 4 }}>
          아래 항목 중 원하는 작업을 펼쳐 한 줄로 정보만 입력하면 비서가 즉시 결과를 만들어 드려요.
        </p>
      </div>
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {ops.map((op, i) => {
          const isOpen = openIdx === i;
          const value = inputs[i] ?? "";
          return (
            <div key={i} style={{ border: `1px solid ${accent}33`, background: "#060920" }}>
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                style={{
                  width: "100%", padding: "12px 14px",
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  textAlign: "left",
                }}
              >
                <span>
                  <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 16, fontWeight: 700, color: "#cfe9ff", marginBottom: 4 }}>
                    {op.title}
                  </p>
                  <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#7e94c8", lineHeight: 1.6 }}>
                    {op.desc}
                  </p>
                </span>
                <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 18, fontWeight: 700, color: accent, flexShrink: 0, marginLeft: 12 }}>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div style={{ padding: "0 14px 14px", display: "flex", gap: 8 }}>
                  <input
                    value={value}
                    placeholder={op.placeholder}
                    onChange={(e) => setInputs((s) => ({ ...s, [i]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && value.trim() && !disabled) {
                        onSubmit(op.promptTemplate(value.trim()));
                        setInputs((s) => ({ ...s, [i]: "" }));
                      }
                    }}
                    style={{
                      flex: 1, background: "#060920", border: `1px solid ${accentDark}`,
                      padding: "10px 12px", color: "#cfe9ff",
                      fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 15, outline: "none",
                    }}
                  />
                  <button
                    disabled={disabled || !value.trim()}
                    onClick={() => {
                      if (!value.trim()) return;
                      onSubmit(op.promptTemplate(value.trim()));
                      setInputs((s) => ({ ...s, [i]: "" }));
                    }}
                    className="pixel-frame"
                    style={{
                      fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 700,
                      padding: "8px 18px", cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
                      background: accent, color: "#060920",
                      border: `2px solid ${accent}`, boxShadow: `3px 3px 0 ${accentDark}`,
                      opacity: disabled || !value.trim() ? 0.5 : 1,
                    }}
                  >
                    ▶ 실행
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeftConsole({ agentType, status, sseConnected, quickTasks, approvals, isActive, isRunning, onRun, onApprove, onReject, mode }: {
  agentType: AgentType;
  status: string;
  sseConnected: boolean;
  quickTasks: { label: string; task: string }[];
  approvals: ApprovalItem[];
  isActive: boolean;
  isRunning: boolean;
  onRun: (task: string) => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
  mode: Mode;
}) {
  const crew = CREW_MAP[agentType];
  const crewAgent = AGENTS.find(a => a.id === crew.crewId)!;

  return (
    <>
      {/* 크루 프로필 */}
      <CockpitPanel title={`${crew.name} · 비서 정보`} accent={crew.accent} status={STATUS_LABEL[status] ?? status} statusColor={STATUS_COLOR[status] ?? "#7e94c8"} className="flex-1">
        <div className="flex flex-col items-center gap-3">
          <div style={{ filter: `drop-shadow(0 0 20px ${crew.accent}88)` }}>
            <AstronautAvatar agent={crewAgent} scale={7} idle={true} />
          </div>
          <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 12, color: crew.accent, textAlign: "center" }}>
            {crew.name.toUpperCase()}
          </p>
          <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#cfe9ff", textAlign: "center", fontWeight: 500 }}>
            {crew.role}
          </p>

          {/* SSE 연결 상태 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 6, height: 6,
              background: sseConnected ? "#66ff9d" : "#7e94c8",
              boxShadow: sseConnected ? "0 0 6px #66ff9d" : "none",
            }} />
            <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 12, color: sseConnected ? "#66ff9d" : "#7e94c8" }}>
              {sseConnected ? "실시간 연결됨" : "연결 중..."}
            </span>
          </div>

          {/* 퍼포먼스 게이지 */}
          <div className="w-full space-y-2 mt-1">
            {crew.stats.map(s => (
              <Bar key={s.label} v={s.v} c={s.c} label={s.label} segments={12} />
            ))}
          </div>
        </div>
      </CockpitPanel>

      {/* 빠른 임무 — MANUAL 모드에서만 노출 */}
      {mode === "manual" && quickTasks.length > 0 && (
        <CockpitPanel title="추천 임무 바로가기" accent={crew.accent} status="대기 중" statusColor="#66ff9d">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {quickTasks.map((qt) => (
              <button
                key={qt.label}
                onClick={() => onRun(qt.task)}
                disabled={isActive || isRunning}
                style={{
                  fontFamily: '"IBM Plex Sans KR", sans-serif',
                  fontSize: 14,
                  fontWeight: 500,
                  color: (isActive || isRunning) ? "#7e94c8" : "#cfe9ff",
                  background: "none",
                  border: `1px solid ${(isActive || isRunning) ? "#7e94c833" : crew.accentDark}`,
                  padding: "8px 10px",
                  cursor: (isActive || isRunning) ? "not-allowed" : "pointer",
                  textAlign: "left",
                  lineHeight: 1.5,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!isActive && !isRunning) (e.currentTarget as HTMLElement).style.background = `${crew.accentDark}22`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}
              >
                {qt.label}
              </button>
            ))}
          </div>
        </CockpitPanel>
      )}

      {/* 승인 대기 */}
      {approvals.length > 0 && (
        <CockpitPanel title={`승인 대기 · ${approvals.length}건`} accent="#ffd84d" status="응답 필요" statusColor="#ffd84d">
          <ApprovalModal approvals={approvals} onApprove={onApprove} onReject={onReject} />
        </CockpitPanel>
      )}
    </>
  );
}

export function AssistantDetail({ agentType, quickTasks = [] }: AssistantDetailProps) {
  const router = useRouter();
  const crew = CREW_MAP[agentType];

  const [mode, setMode] = useState<Mode>("manual");
  const [status, setStatus] = useState("idle");
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    const [logsRes, approvalsRes, statusRes] = await Promise.all([
      fetch(`/api/agents/logs?agentType=${agentType}&limit=80`),
      fetch("/api/approvals"),
      fetch("/api/agents/status"),
    ]);
    if (logsRes.ok) {
      const d = await logsRes.json();
      setLogs(d.logs || []);
      if (d.sessionId) setSessionId(d.sessionId);
      if (d.status) setStatus(d.status);
    }
    if (approvalsRes.ok) {
      const d = await approvalsRes.json();
      setApprovals((d.approvals || []).filter((a: ApprovalItem) => a.agent_type === agentType));
    }
    if (statusRes.ok) {
      const d = await statusRes.json();
      const s = d.agents?.[agentType];
      if (s) { setStatus(s.status); setCurrentTask(s.currentTask); }
    }
  }, [agentType]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // SSE
  useEffect(() => {
    const connect = () => {
      const es = new EventSource("/api/sse");
      esRef.current = es;
      es.addEventListener("heartbeat", () => setSseConnected(true));
      es.addEventListener("agent_log", (e) => {
        const log = JSON.parse(e.data);
        if (log.agentType !== agentType) return;
        setLogs((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, ...log }].slice(-100));
      });
      es.addEventListener("agent_status_change", (e) => {
        const data = JSON.parse(e.data);
        if (data.agentType !== agentType) return;
        setStatus(data.newStatus);
        if (data.currentTask) setCurrentTask(data.currentTask);
        if (data.newStatus === "running") setIsRunning(false);
      });
      es.addEventListener("approval_requested", (e) => {
        const data = JSON.parse(e.data);
        if (data.agentType !== agentType) return;
        setApprovals((prev) => {
          if (prev.some((a) => a.id === data.approvalId)) return prev;
          return [...prev, {
            id: data.approvalId, agent_type: data.agentType, title: data.title,
            description: data.description, urgency_level: data.urgencyLevel,
            expires_at: data.expiresAt, preview_data: data.previewData || {}, action_type: "other",
          }];
        });
        setStatus("waiting_approval");
      });
      es.addEventListener("approval_resolved", (e) => {
        const data = JSON.parse(e.data);
        setApprovals((prev) => prev.filter((a) => a.id !== data.approvalId));
      });
      es.onerror = () => { setSseConnected(false); es.close(); setTimeout(connect, 5000); };
    };
    connect();
    return () => { esRef.current?.close(); };
  }, [agentType]);

  async function handleRun(task?: string) {
    const t = task || taskInput.trim();
    if (!t) return;
    setIsRunning(true);
    setTaskInput("");
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType, task: t }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`오류: ${data.error}`);
        setIsRunning(false);
      } else {
        setSessionId(data.sessionId);
        setStatus("running");
        setCurrentTask(t);
      }
    } catch { setIsRunning(false); }
  }

  async function handleApprove(id: string) {
    await fetch(`/api/approvals/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "approve" }) });
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleReject(id: string, reason?: string) {
    await fetch(`/api/approvals/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reject", reason }) });
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }

  const isActive = status === "running" || status === "waiting_approval";

  return (
    <CockpitShell
      sector={crew.sector}
      accent={crew.accent}
      bootMessage={`${crew.name} 스테이션 가동 · ${mode === "auto" ? "자동 운영" : "직접 작업"} 모드 · ${STATUS_LABEL[status] ?? status}`}
      leftConsole={
        <LeftConsole
          agentType={agentType}
          status={status}
          sseConnected={sseConnected}
          quickTasks={quickTasks}
          approvals={approvals}
          isActive={isActive}
          isRunning={isRunning}
          onRun={handleRun}
          onApprove={handleApprove}
          onReject={handleReject}
          mode={mode}
        />
      }
    >
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
        {/* 브레드크럼 + 빠른 이동 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <button
            onClick={() => router.push("/app/assistants")}
            style={{
              fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#cfe9ff",
              background: "none", border: "none", cursor: "pointer", fontWeight: 500,
            }}
          >
            ← 비서 현황판
          </button>
          <span style={{ color: "#1f2a6b" }}>›</span>
          <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: crew.accent, fontWeight: 600 }}>
            {crew.name} · {crew.role}
          </span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              onClick={() => router.push("/app/brand")}
              style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#5ce5ff", background: "none", border: "1px solid #5ce5ff44", padding: "4px 10px", cursor: "pointer", fontWeight: 500 }}
            >
              브랜드
            </button>
            <button
              onClick={() => router.push("/app/products")}
              style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#5ce5ff", background: "none", border: "1px solid #5ce5ff44", padding: "4px 10px", cursor: "pointer", fontWeight: 500 }}
            >
              상품
            </button>
            <button
              onClick={() => router.push("/app/library")}
              style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#5ce5ff", background: "none", border: "1px solid #5ce5ff44", padding: "4px 10px", cursor: "pointer", fontWeight: 500 }}
            >
              보관함
            </button>
            <button
              onClick={() => router.push("/app/automation")}
              style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#ffd84d", background: "none", border: "1px solid #ffd84d44", padding: "4px 10px", cursor: "pointer", fontWeight: 500 }}
            >
              자동화 허브
            </button>
          </span>
        </div>

        {/* AUTO/MANUAL 토글 */}
        <ModeTabs mode={mode} onChange={setMode} accent={crew.accent} />

        {/* 현재 임무 표시 */}
        {isActive && currentTask && (
          <div
            className="pixel-frame"
            style={{
              border: `1px solid ${crew.accent}66`,
              background: `${crew.accentDark}22`,
              padding: "12px 14px",
              marginBottom: 16,
            }}
          >
            <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, fontWeight: 700, color: crew.accent, marginBottom: 4 }}>
              ▸ 진행 중인 임무
            </p>
            <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 16, color: "#cfe9ff", lineHeight: 1.6 }}>
              {currentTask}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <div
                style={{
                  width: 6, height: 6, background: crew.accent,
                  animation: "blink 0.8s step-end infinite",
                }}
              />
              <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: crew.accent }}>
                {STATUS_LABEL[status] ?? status}
              </span>
              {sessionId && (
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: "#7e94c8" }}>
                  · 세션 {sessionId.slice(0, 8).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        )}

        {mode === "auto" ? (
          <AutoBoard agentType={agentType} accent={crew.accent} accentDark={crew.accentDark} logs={logs} sseConnected={sseConnected} />
        ) : (
          <>
            {/* 페니 전용 즉시 계산기 (AI 호출 없이) */}
            {agentType === "finance" && (
              <div style={{ marginBottom: 16 }}>
                <FinanceCalculators />
              </div>
            )}

            {/* 직접 작업 패널 */}
            {crew.manualOps.length > 0 && (
              <ManualOpsPanel
                accent={crew.accent}
                accentDark={crew.accentDark}
                ops={crew.manualOps}
                onSubmit={(prompt) => handleRun(prompt)}
                disabled={isActive || isRunning}
              />
            )}

            {/* 교신 로그 */}
            <div
              className="pixel-frame flex-1"
              style={{
                border: `1px solid ${crew.accent}33`,
                background: "#060e20",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                minHeight: 280,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: `1px solid ${crew.accent}22`,
                  background: "#0a0e27",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#cfe9ff" }}>
                  활동 로그 ({logs.length}건)
                </span>
                <button
                  onClick={load}
                  style={{
                    fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 13, color: "#5ce5ff",
                    background: "none", border: "none", cursor: "pointer", fontWeight: 500,
                  }}
                >
                  ↻ 새로고침
                </button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
                {logs.length === 0 ? (
                  <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, color: "#7e94c8", textAlign: "center", marginTop: 40 }}>
                    아직 기록이 없습니다. 임무를 지시해 보세요.
                  </p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                      <span style={{
                        fontFamily: '"JetBrains Mono", monospace', fontSize: 12,
                        color: "#7e94c8", flexShrink: 0, paddingTop: 2,
                      }}>
                        {new Date(log.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                      <span style={{
                        fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 12, fontWeight: 700,
                        color: LOG_COLOR[log.level] ?? "#5ce5ff",
                        flexShrink: 0, paddingTop: 2,
                        width: 52,
                      }}>
                        {LOG_LEVEL_KR[log.level] ?? `[${log.level}]`}
                      </span>
                      <span style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 16, color: "#cfe9ff", lineHeight: 1.6 }}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>

            {/* 명령 입력 */}
            <div
              className="pixel-frame"
              style={{ border: `1px solid ${crew.accent}44`, background: "#0f1640", padding: "16px 18px" }}
            >
              <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#cfe9ff", marginBottom: 10 }}>
                자유 임무 지시 <span style={{ color: "#7e94c8", fontWeight: 400, marginLeft: 6 }}>(Ctrl + Enter로 바로 실행)</span>
              </p>
              <textarea
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleRun();
                  }
                }}
                placeholder={`${crew.name}에게 무엇을 시킬까요?\n예: 이번 주 인스타그램 콘텐츠 3개 기획해 줘`}
                disabled={isActive || isRunning}
                rows={3}
                style={{
                  width: "100%",
                  background: "#060920",
                  border: `1px solid ${isActive ? "#7e94c844" : crew.accentDark}`,
                  color: (isActive || isRunning) ? "#7e94c8" : "#cfe9ff",
                  fontFamily: '"IBM Plex Sans KR", sans-serif',
                  fontSize: 17,
                  lineHeight: 1.6,
                  padding: "10px 12px",
                  resize: "vertical",
                  outline: "none",
                  borderRadius: 0,
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <PixelButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleRun()}
                  disabled={!taskInput.trim() || isActive || isRunning}
                >
                  {isRunning ? "전송 중..." : "▶ 실행"}
                </PixelButton>
                <PixelButton
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/app/assistants")}
                >
                  ← 비서 현황판
                </PixelButton>
              </div>
            </div>
          </>
        )}
      </div>
    </CockpitShell>
  );
}
