import type { DeskAgentId } from "./desks";

/**
 * 데스크 좌측 사이드바 메뉴 — 큰 메뉴 / 작은 메뉴 2단 구조.
 *
 * - leaf: 단일 항목 (그룹 없음, 클릭 즉시 활성화)
 * - group: 큰 메뉴 1개 + 작은 메뉴 N개. 큰 메뉴 클릭 시 펼침.
 *
 * 모든 leaf의 id는 AgentDesk의 TabContent 라우터에서 매칭하는 키.
 */
export type MenuLeaf = { kind: "leaf"; id: string; label: string };
export type MenuGroup = { kind: "group"; id: string; label: string; children: MenuLeaf[] };
export type MenuItem = MenuLeaf | MenuGroup;

export const DESK_MENU: Record<DeskAgentId, MenuItem[]> = {
  marky: [
    { kind: "leaf", id: "오버뷰", label: "오버뷰" },
    {
      kind: "group", id: "g_plan", label: "🧠 기획",
      children: [
        { kind: "leaf", id: "🧠 기획 코어", label: "기획 코어" },
      ],
    },
    {
      kind: "group", id: "g_monthly", label: "📅 월간 계획",
      children: [
        { kind: "leaf", id: "📅 이번 달 계획", label: "이번 달 계획" },
        { kind: "leaf", id: "📅 다음 달 자동 초안", label: "다음 달 자동 초안" },
        { kind: "leaf", id: "📅 계획 히스토리", label: "계획 히스토리" },
      ],
    },
    {
      kind: "group", id: "g_cardnews", label: "🎨 카드뉴스",
      children: [
        { kind: "leaf", id: "🎨 지시 인박스", label: "지시 인박스" },
        { kind: "leaf", id: "🎨 자동 실행 로그", label: "자동 실행 로그" },
      ],
    },
    {
      kind: "group", id: "g_design", label: "🖼️ 디자인",
      children: [
        { kind: "leaf", id: "🖼️ 활성 템플릿", label: "활성 템플릿" },
        { kind: "leaf", id: "🖼️ 디자인 갤러리", label: "전체 갤러리" },
        { kind: "leaf", id: "🖼️ 프리셋 시드", label: "프리셋 시드" },
      ],
    },
    {
      kind: "group", id: "g_refs", label: "🔖 레퍼런스",
      children: [
        { kind: "leaf", id: "🔖 내 보드", label: "내 보드" },
        { kind: "leaf", id: "🔖 자동 스카우트", label: "자동 스카우트" },
        { kind: "leaf", id: "🔖 브랜드 DNA", label: "브랜드 DNA" },
      ],
    },
    {
      kind: "group", id: "g_library", label: "📦 결과물",
      children: [
        { kind: "leaf", id: "📦 카드뉴스 보관함", label: "카드뉴스 보관함" },
        { kind: "leaf", id: "📦 발행 큐", label: "발행 큐" },
      ],
    },
    {
      kind: "group", id: "g_general", label: "✍️ 일반 작업",
      children: [
        { kind: "leaf", id: "콘텐츠 캘린더", label: "콘텐츠 캘린더" },
        { kind: "leaf", id: "오디언스", label: "오디언스" },
        { kind: "leaf", id: "✍️ 인스타 캡션", label: "인스타 캡션" },
        { kind: "leaf", id: "📝 블로그 발행", label: "블로그 발행" },
        { kind: "leaf", id: "🧵 스레드 시리즈", label: "스레드 시리즈" },
        { kind: "leaf", id: "💬 오픈채팅 공지", label: "오픈채팅 공지" },
        { kind: "leaf", id: "🤝 인플루언서 DM", label: "인플루언서 DM" },
      ],
    },
    {
      kind: "group", id: "g_system", label: "⚙ 시스템",
      children: [
        { kind: "leaf", id: "히스토리", label: "히스토리" },
        { kind: "leaf", id: "성과 분석", label: "성과 분석" },
        { kind: "leaf", id: "지식 베이스", label: "지식 베이스" },
        { kind: "leaf", id: "팀 협업", label: "팀 협업" },
        { kind: "leaf", id: "리포트", label: "리포트" },
        { kind: "leaf", id: "설정", label: "설정" },
      ],
    },
  ],

  dali: [
    { kind: "leaf", id: "오버뷰", label: "오버뷰" },
    {
      kind: "group", id: "g_plan", label: "🧠 기획",
      children: [{ kind: "leaf", id: "🧠 기획 코어", label: "기획 코어" }],
    },
    {
      kind: "group", id: "g_detail", label: "📄 상세페이지",
      children: [
        { kind: "leaf", id: "📄 5섹션 자동", label: "5섹션 자동" },
        { kind: "leaf", id: "✨ 셀링포인트", label: "셀링포인트" },
        { kind: "leaf", id: "🏷️ 옵션 카피", label: "옵션 카피" },
        { kind: "leaf", id: "💌 리뷰 답글", label: "리뷰 답글" },
      ],
    },
    {
      kind: "group", id: "g_design", label: "🎨 디자인",
      children: [{ kind: "leaf", id: "템플릿 갤러리", label: "템플릿 갤러리" }],
    },
    {
      kind: "group", id: "g_seo", label: "🔍 SEO · 실험",
      children: [
        { kind: "leaf", id: "🔍 SEO 메타", label: "SEO 메타" },
        { kind: "leaf", id: "A/B 테스트", label: "A/B 테스트" },
      ],
    },
    {
      kind: "group", id: "g_system", label: "⚙ 시스템",
      children: [
        { kind: "leaf", id: "히스토리", label: "히스토리" },
        { kind: "leaf", id: "성과 분석", label: "성과 분석" },
        { kind: "leaf", id: "지식 베이스", label: "지식 베이스" },
        { kind: "leaf", id: "팀 협업", label: "팀 협업" },
        { kind: "leaf", id: "리포트", label: "리포트" },
        { kind: "leaf", id: "설정", label: "설정" },
      ],
    },
  ],

  addy: [
    { kind: "leaf", id: "오버뷰", label: "오버뷰" },
    {
      kind: "group", id: "g_plan", label: "🧠 기획",
      children: [{ kind: "leaf", id: "🧠 기획 코어", label: "기획 코어" }],
    },
    {
      kind: "group", id: "g_camp", label: "🎯 캠페인",
      children: [
        { kind: "leaf", id: "캠페인", label: "캠페인 현황" },
        { kind: "leaf", id: "지출 모니터", label: "지출 모니터" },
        { kind: "leaf", id: "🎯 광고 소재 제작", label: "광고 소재 제작" },
        { kind: "leaf", id: "🎨 카피 5종 변형", label: "카피 5종 변형" },
      ],
    },
    {
      kind: "group", id: "g_kw", label: "🔑 키워드",
      children: [
        { kind: "leaf", id: "🔑 키워드 발굴", label: "키워드 발굴" },
        { kind: "leaf", id: "🚫 부정 키워드", label: "부정 키워드" },
      ],
    },
    {
      kind: "group", id: "g_budget", label: "💰 예산",
      children: [{ kind: "leaf", id: "💰 예산 분배", label: "예산 분배" }],
    },
    {
      kind: "group", id: "g_system", label: "⚙ 시스템",
      children: [
        { kind: "leaf", id: "히스토리", label: "히스토리" },
        { kind: "leaf", id: "성과 분석", label: "성과 분석" },
        { kind: "leaf", id: "지식 베이스", label: "지식 베이스" },
        { kind: "leaf", id: "팀 협업", label: "팀 협업" },
        { kind: "leaf", id: "리포트", label: "리포트" },
        { kind: "leaf", id: "설정", label: "설정" },
      ],
    },
  ],

  penny: [
    { kind: "leaf", id: "오버뷰", label: "오버뷰" },
    {
      kind: "group", id: "g_plan", label: "🧠 기획",
      children: [{ kind: "leaf", id: "🧠 기획 코어", label: "기획 코어" }],
    },
    {
      kind: "group", id: "g_ledger", label: "📒 장부 · 정산",
      children: [
        { kind: "leaf", id: "장부", label: "장부" },
        { kind: "leaf", id: "세금·정산", label: "세금·정산" },
        { kind: "leaf", id: "📋 부가세 도우미", label: "부가세 도우미" },
      ],
    },
    {
      kind: "group", id: "g_report", label: "📊 리포트",
      children: [
        { kind: "leaf", id: "📊 월간 리포트", label: "월간 리포트" },
        { kind: "leaf", id: "🚦 손익 진단", label: "손익 진단" },
      ],
    },
    {
      kind: "group", id: "g_ops", label: "🛠 운영",
      children: [
        { kind: "leaf", id: "✂️ 비용 절감", label: "비용 절감" },
        { kind: "leaf", id: "📜 환불 정책", label: "환불 정책" },
      ],
    },
    {
      kind: "group", id: "g_system", label: "⚙ 시스템",
      children: [
        { kind: "leaf", id: "히스토리", label: "히스토리" },
        { kind: "leaf", id: "성과 분석", label: "성과 분석" },
        { kind: "leaf", id: "지식 베이스", label: "지식 베이스" },
        { kind: "leaf", id: "팀 협업", label: "팀 협업" },
        { kind: "leaf", id: "리포트", label: "리포트" },
        { kind: "leaf", id: "설정", label: "설정" },
      ],
    },
  ],
};

/** 큰 메뉴 클릭 시 펼침의 기본 — 활성 leaf가 속한 그룹만 펼침 */
export function findGroupOf(agentId: DeskAgentId, leafId: string): string | null {
  for (const item of DESK_MENU[agentId]) {
    if (item.kind === "group" && item.children.some((c) => c.id === leafId)) return item.id;
  }
  return null;
}

/** 모든 leaf id 집합 (라우터 검증용) */
export function allLeafIds(agentId: DeskAgentId): string[] {
  const out: string[] = [];
  for (const item of DESK_MENU[agentId]) {
    if (item.kind === "leaf") out.push(item.id);
    else for (const c of item.children) out.push(c.id);
  }
  return out;
}
