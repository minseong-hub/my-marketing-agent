import type { DeskAgentId, CalendarRow } from "./desks";

export interface DayReport {
  status: "past" | "today" | "future";
  headline: string;
  summary: string;
  byCategory: { label: string; count: number; note: string }[];
  done: string[];
  inProgress: string[];
  metrics: { key: string; value: string }[];
  next: string[];
}

const PAST_TONE: Record<DeskAgentId, string> = {
  marky: "어제 자동 발행한 콘텐츠가 평균 참여율 6.2%로 마감됐습니다. 무난한 하루.",
  dali: "전일 신규 상세 3건 발행 후 평균 체류시간 +18초. 큰 이슈 없이 안정적.",
  addy: "전일 광고 효율 ROAS 2.9x. 비효율 1건 자동 일시정지로 손실 방지.",
  penny: "전일 입금 247건 자동 분류 완료, 매칭 100%. 정산 청정.",
};

const FUTURE_TONE: Record<DeskAgentId, string> = {
  marky: "예약 콘텐츠 + 트렌드 모니터링 큐가 준비되어 있어요.",
  dali: "예약된 신상 상세 작업 + A/B 후속 큐가 대기 중입니다.",
  addy: "예약 캠페인 셋업 + 일별 ROAS 점검이 잡혀 있어요.",
  penny: "예약 정산 매칭 + 손익 리포트 생성이 대기 중입니다.",
};

function totalOf(rows: CalendarRow[], offsetIdx: number): number {
  return rows.reduce((s, r) => s + (r.cells[offsetIdx] || 0), 0);
}

function fmtDate(date: Date): string {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} (${"일월화수목금토"[date.getDay()]})`;
}

export function buildDayReport(
  agentId: DeskAgentId,
  offset: number,
  rows: CalendarRow[]
): DayReport {
  const idx = offset + 14; // -14~+7 → 0~21
  const safeIdx = Math.max(0, Math.min(rows[0]?.cells.length - 1 || 0, idx));
  const total = totalOf(rows, safeIdx);
  const date = new Date();
  date.setDate(date.getDate() + offset);

  const status: DayReport["status"] = offset < 0 ? "past" : offset === 0 ? "today" : "future";

  const byCategory = rows.map((r) => {
    const c = r.cells[safeIdx] || 0;
    const note = c === 0
      ? "작업 없음"
      : status === "future" ? `예약 ${c}건` : status === "today" ? `진행 ${c}건` : `완료 ${c}건`;
    return { label: r.label, count: c, note };
  });

  const HEAD: Record<DeskAgentId, { past: string; today: string; future: string }> = {
    marky: {
      past: `${fmtDate(date)} · 마키 작업 결과 — ${total}건 자동 처리`,
      today: `오늘 마키가 진행 중인 작업 — ${total}건`,
      future: `${fmtDate(date)} · 마키 예약 작업 — ${total}건 큐 대기`,
    },
    dali: {
      past: `${fmtDate(date)} · 데일리 작업 결과 — ${total}건 자동 처리`,
      today: `오늘 데일리가 진행 중인 작업 — ${total}건`,
      future: `${fmtDate(date)} · 데일리 예약 작업 — ${total}건 큐 대기`,
    },
    addy: {
      past: `${fmtDate(date)} · 애디 작업 결과 — ${total}건 자동 처리`,
      today: `오늘 애디가 진행 중인 작업 — ${total}건`,
      future: `${fmtDate(date)} · 애디 예약 작업 — ${total}건 큐 대기`,
    },
    penny: {
      past: `${fmtDate(date)} · 페니 작업 결과 — ${total}건 자동 처리`,
      today: `오늘 페니가 진행 중인 작업 — ${total}건`,
      future: `${fmtDate(date)} · 페니 예약 작업 — ${total}건 큐 대기`,
    },
  };

  const done: string[] = [];
  const inProgress: string[] = [];
  byCategory.forEach((c) => {
    if (c.count === 0) return;
    if (status === "past") done.push(`${c.label} ${c.count}건 자동 완료`);
    else if (status === "today") inProgress.push(`${c.label} ${c.count}건 처리 중`);
    else done.push(`${c.label} ${c.count}건 큐 등록됨`);
  });

  const summary =
    status === "past" ? PAST_TONE[agentId]
    : status === "today" ? "지금 이 시각, 비서가 데스크에서 자동으로 처리 중인 작업입니다."
    : FUTURE_TONE[agentId];

  const metrics: { key: string; value: string }[] =
    status === "past" ? [
      { key: "처리 건수", value: `${total}건` },
      { key: "성공률", value: `${Math.max(92, 100 - total)}%` },
      { key: "예외 처리", value: total > 8 ? "1건 자동 재시도" : "없음" },
    ] : status === "today" ? [
      { key: "처리 중", value: `${total}건` },
      { key: "다음 ETA", value: total > 5 ? "약 4분" : "약 1분" },
      { key: "사용자 승인 대기", value: total > 6 ? "1건" : "0건" },
    ] : [
      { key: "예약 건수", value: `${total}건` },
      { key: "예상 시작", value: "00:00 KST" },
      { key: "필요 컨텍스트", value: "브랜드 프로필 적용" },
    ];

  const next =
    status === "past" ? [
      "지표를 다음 주간 리포트에 반영합니다.",
      "오늘 큐로 후속 작업 자동 이관 완료.",
    ] : status === "today" ? [
      "진행 중 작업이 끝나면 결과를 보관함에 자동 저장합니다.",
      "승인이 필요한 작업이 있으면 알림으로 전달됩니다.",
    ] : [
      "예약된 큐는 자정 이후 순차 시작됩니다.",
      "취소가 필요하면 위젯에서 직접 큐를 비활성화할 수 있어요.",
    ];

  return {
    status,
    headline: HEAD[agentId][status],
    summary,
    byCategory,
    done,
    inProgress,
    metrics,
    next,
  };
}

/** 호출용 진입 함수 */
export function getReport(agentId: DeskAgentId, offset: number, rows: CalendarRow[]): DayReport {
  return buildDayReport(agentId, offset, rows);
}
