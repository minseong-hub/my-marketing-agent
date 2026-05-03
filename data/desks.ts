import { AGENTS } from "./agents";
import type { Agent } from "./agents";

export type DeskAgentId = "marky" | "dali" | "addy" | "penny";

export interface QuickStat {
  label: string;
  value: string;
  delta?: string;
  tone?: "good" | "warn" | "bad" | "neutral";
}

export interface NowTask {
  id: string;
  title: string;
  meta: string;
  progress: number; // 0~100
  eta: string;
  step: string;
  needsApproval?: boolean;
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  status: "done" | "running" | "queued" | "warn";
}

export interface Incident {
  id: string;
  level: "info" | "warn" | "error";
  title: string;
  detail: string;
  action: string;
  at: string;
}

export interface CalendarRow {
  key: string;
  label: string;
  /** 길이 22, 0 = -14일전, 14 = 오늘, 21 = +7일후. 셀의 작업 건수. */
  cells: number[];
}

export interface DeskData {
  id: DeskAgentId;
  agent: Agent;
  quickStats: QuickStat[];
  now: NowTask[];
  timeline: TimelineItem[];
  incidents: Incident[];
  calendar: CalendarRow[];
  /** 다른 비서로의 인계 카드 — 자동 생성 시 다른 3 비서 중 선택 */
  handoffs: { toId: DeskAgentId; subject: string; from: string }[];
  trustLevel: number; // 0~100
}

const a = (id: DeskAgentId) => AGENTS.find((x) => x.id === id)!;

// 시드: 약간 랜덤하게 보이지만 결정적인 정수 시퀀스 생성
function makeCells(seed: number, len = 22): number[] {
  const out: number[] = [];
  let s = seed * 9301 + 49297;
  for (let i = 0; i < len; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    // 14가 오늘. 과거(0~13) 평균 4건, 오늘(14) 8건, 미래(15~21) 평균 3건
    if (i < 14) out.push(Math.floor(r * 6) + 1);
    else if (i === 14) out.push(Math.floor(r * 4) + 6);
    else out.push(Math.floor(r * 4));
  }
  return out;
}

export const DESKS: Record<DeskAgentId, DeskData> = {
  marky: {
    id: "marky",
    agent: a("marky"),
    trustLevel: 87,
    quickStats: [
      { label: "팔로워 증가 (7일)", value: "+1,420", delta: "+18.2%", tone: "good" },
      { label: "콘텐츠 발행 (월)", value: "62건", delta: "+9 vs 지난달", tone: "good" },
      { label: "참여율 평균", value: "5.8%", delta: "업계 평균 3.1%", tone: "good" },
      { label: "DM 응답 대기", value: "3건", delta: "1시간 이내", tone: "warn" },
    ],
    now: [
      {
        id: "MK-2418",
        title: "오늘 인스타 피드 캡션 3개 작성 중",
        meta: "in:인스타그램 · 카테고리:가을 신상",
        progress: 64,
        eta: "약 4분",
        step: "초안 2/3 작성 · 해시태그 매칭 중",
      },
      {
        id: "MK-2419",
        title: "주간 콘텐츠 캘린더 자동 발행 예약",
        meta: "in:블로그 · 7건 예약",
        progress: 28,
        eta: "약 12분",
        step: "주제 분배 · 톤앤매너 검수",
        needsApproval: true,
      },
    ],
    timeline: [
      { id: "t1", time: "08:42", title: "스레드 트렌드 키워드 32개 수집", status: "done" },
      { id: "t2", time: "10:15", title: "신상 5종 SNS 콘텐츠 5건 발행", status: "done" },
      { id: "t3", time: "12:30", title: "라이브 댓글 응대 — 진행 중", status: "running" },
      { id: "t4", time: "14:00", title: "오디언스 분석 리포트 작성", status: "queued" },
      { id: "t5", time: "16:00", title: "협업 인플루언서 DM 5건", status: "queued" },
    ],
    incidents: [
      { id: "i1", level: "warn", title: "인스타 API 응답 지연", detail: "리포스트 1건 1시간 지연. 자동 재시도 성공.", action: "재시도 자동 처리됨", at: "11:42" },
      { id: "i2", level: "info", title: "신규 해시태그 트렌드 감지", detail: "#가을룩 검색량 +42% 급증. 콘텐츠 큐에 추가.", action: "콘텐츠 큐 반영", at: "09:18" },
    ],
    calendar: [
      { key: "ig", label: "인스타 게시", cells: makeCells(11) },
      { key: "blog", label: "블로그", cells: makeCells(13) },
      { key: "store", label: "스토어 포스트", cells: makeCells(17) },
      { key: "dm", label: "댓글·DM", cells: makeCells(19) },
    ],
    handoffs: [
      { toId: "dali", subject: "신상 5종 상세페이지 톤 맞춤 요청", from: "콘텐츠 톤 정리 후 전달" },
      { toId: "addy", subject: "고참여 캡션 → 광고 소재 전환", from: "참여율 8% 이상 캡션 3개" },
      { toId: "penny", subject: "콘텐츠 제작 외주비 정산", from: "이번 주 외주 인보이스 2건" },
    ],
  },

  dali: {
    id: "dali",
    agent: a("dali"),
    trustLevel: 91,
    quickStats: [
      { label: "전환률 평균", value: "3.4%", delta: "+0.8%p MoM", tone: "good" },
      { label: "체류시간 평균", value: "2분 38초", delta: "+42초 MoM", tone: "good" },
      { label: "상세페이지 (월)", value: "18건", delta: "신규 7 / 개선 11", tone: "good" },
      { label: "A/B 테스트 진행", value: "3건", delta: "결과 임박", tone: "warn" },
    ],
    now: [
      {
        id: "DL-1108",
        title: "가을 트렌치 코트 상세페이지 5섹션 생성",
        meta: "in:상세페이지 · 상품:트렌치 V3",
        progress: 72,
        eta: "약 3분",
        step: "셀링포인트 추출 · CTA 카피 작성",
      },
      {
        id: "DL-1109",
        title: "베스트셀러 5종 SEO 메타 갱신",
        meta: "in:SEO · 5상품",
        progress: 40,
        eta: "약 8분",
        step: "키워드 재배치 2/5",
      },
    ],
    timeline: [
      { id: "t1", time: "09:10", title: "경쟁 상세페이지 8건 분석", status: "done" },
      { id: "t2", time: "10:40", title: "신상 3종 후킹 카피 초안", status: "done" },
      { id: "t3", time: "13:20", title: "트렌치 V3 5섹션 작성 중", status: "running" },
      { id: "t4", time: "15:00", title: "구매 망설임 FAQ 10건", status: "queued" },
      { id: "t5", time: "17:00", title: "이미지 ALT 태그 자동 생성", status: "queued" },
    ],
    incidents: [
      { id: "i1", level: "info", title: "A/B 테스트 결과 통계 유의", detail: "B안(후킹 카피) 전환률 +1.2%p — 적용 권장.", action: "함장 승인 대기", at: "11:00" },
      { id: "i2", level: "warn", title: "이미지 LCP 3.2초 초과", detail: "트렌치 V3 메인 이미지 1.4MB. 자동 압축 처리.", action: "압축 자동 처리됨", at: "10:22" },
    ],
    calendar: [
      { key: "detail", label: "상세 페이지", cells: makeCells(23) },
      { key: "ab", label: "A/B 테스트", cells: makeCells(29) },
      { key: "seo", label: "SEO 갱신", cells: makeCells(31) },
      { key: "img", label: "이미지 최적화", cells: makeCells(37) },
    ],
    handoffs: [
      { toId: "marky", subject: "신상 상세 출시 → 콘텐츠 동시 발행 요청", from: "상품 5종 키 메시지" },
      { toId: "addy", subject: "고전환 페이지 → 리타겟 광고 소재화", from: "전환 4%+ 페이지 3개" },
      { toId: "penny", subject: "이미지 외주 비용 정산", from: "이번 주 디자이너 인보이스" },
    ],
  },

  addy: {
    id: "addy",
    agent: a("addy"),
    trustLevel: 84,
    quickStats: [
      { label: "ROAS 평균 (7일)", value: "3.1x", delta: "+0.4x WoW", tone: "good" },
      { label: "월 광고비 사용", value: "₩4.2M", delta: "예산의 67%", tone: "neutral" },
      { label: "활성 캠페인", value: "12개", delta: "Meta 7 · Google 3 · Naver 2", tone: "neutral" },
      { label: "비효율 후보", value: "2건", delta: "ROAS 1.5x 미만", tone: "warn" },
    ],
    now: [
      {
        id: "AD-9221",
        title: "Meta 신상 캠페인 소재 5종 자동 생성",
        meta: "in:Meta · 예산 ₩300,000",
        progress: 48,
        eta: "약 6분",
        step: "헤드라인 3/5 · 이미지 매칭 중",
      },
      {
        id: "AD-9222",
        title: "Naver SA 키워드 47개 입찰 재조정",
        meta: "in:Naver · CPC 최적화",
        progress: 22,
        eta: "약 10분",
        step: "경쟁도 분석 중",
        needsApproval: true,
      },
    ],
    timeline: [
      { id: "t1", time: "08:30", title: "어제 광고 성과 리포트 자동 송부", status: "done" },
      { id: "t2", time: "10:00", title: "Google 비효율 키워드 8개 일시정지", status: "done" },
      { id: "t3", time: "12:45", title: "Meta 신소재 5종 작성 중", status: "running" },
      { id: "t4", time: "15:30", title: "리타겟 캠페인 셋업", status: "queued" },
      { id: "t5", time: "17:00", title: "주간 ROAS 리포트", status: "queued" },
    ],
    incidents: [
      { id: "i1", level: "warn", title: "Meta 캠페인 #7 ROAS 1.2x", detail: "비효율 임계 도달. 일시정지 후보 분류.", action: "함장 승인 대기", at: "11:55" },
      { id: "i2", level: "info", title: "Naver CPC 평균 -8%", detail: "경쟁 완화로 단가 하락. 노출 +12%.", action: "예산 자동 재분배", at: "09:40" },
    ],
    calendar: [
      { key: "meta", label: "Meta 광고", cells: makeCells(41) },
      { key: "google", label: "Google 광고", cells: makeCells(43) },
      { key: "budget", label: "예산 재분배", cells: makeCells(47) },
      { key: "report", label: "성과 리포트", cells: makeCells(53) },
    ],
    handoffs: [
      { toId: "marky", subject: "고성과 광고 카피 → 오가닉 콘텐츠로 재활용", from: "CTR 5%+ 카피 4개" },
      { toId: "dali", subject: "광고 LP 전환률 개선 요청", from: "전환 1.8% 미만 LP 2개" },
      { toId: "penny", subject: "월 광고비 한도 도달 임박", from: "현 67% · 25일치 잔여" },
    ],
  },

  penny: {
    id: "penny",
    agent: a("penny"),
    trustLevel: 95,
    quickStats: [
      { label: "이번 달 매출", value: "₩42,180,000", delta: "+22% MoM", tone: "good" },
      { label: "순이익률", value: "18.4%", delta: "목표 15% 달성", tone: "good" },
      { label: "비용 비중 (광고)", value: "9.9%", delta: "건전", tone: "neutral" },
      { label: "정산 미매칭", value: "2건", delta: "확인 필요", tone: "warn" },
    ],
    now: [
      {
        id: "PN-7710",
        title: "스마트스토어 정산 자동 매칭 진행",
        meta: "in:정산 · 4월 1주차",
        progress: 81,
        eta: "약 2분",
        step: "240건 중 2건 미매칭",
      },
      {
        id: "PN-7711",
        title: "이번 달 손익 리포트 작성",
        meta: "in:리포트 · 월간",
        progress: 35,
        eta: "약 7분",
        step: "매출 집계 완료 · 비용 분류 중",
      },
    ],
    timeline: [
      { id: "t1", time: "08:00", title: "전날 입금 자동 분류 247건", status: "done" },
      { id: "t2", time: "10:30", title: "광고비 집행 내역 정리", status: "done" },
      { id: "t3", time: "13:00", title: "정산 매칭 81% 진행 중", status: "running" },
      { id: "t4", time: "15:00", title: "월간 손익 리포트", status: "queued" },
      { id: "t5", time: "17:30", title: "부가세 추정치 갱신", status: "queued" },
    ],
    incidents: [
      { id: "i1", level: "warn", title: "정산 미매칭 2건", detail: "스마트스토어 4/12 정산 중 12,800원·43,200원 매칭 실패.", action: "수동 확인 권장", at: "12:08" },
      { id: "i2", level: "info", title: "광고비 비중 9.9%", detail: "지난달 11.4% → 9.9%. 효율 개선 확인.", action: "정상 추세", at: "10:51" },
    ],
    calendar: [
      { key: "settle", label: "정산 매칭", cells: makeCells(59) },
      { key: "tax", label: "송장·세금", cells: makeCells(61) },
      { key: "fraud", label: "이상거래 점검", cells: makeCells(67) },
      { key: "pl", label: "손익 리포트", cells: makeCells(71) },
    ],
    handoffs: [
      { toId: "marky", subject: "이번 주 외주 인보이스 정산 완료", from: "2건 송금 처리" },
      { toId: "dali", subject: "이미지 외주 정산 완료", from: "1건 송금 처리" },
      { toId: "addy", subject: "광고비 한도 87% 도달 알림", from: "예산 재배분 제안" },
    ],
  },
};
