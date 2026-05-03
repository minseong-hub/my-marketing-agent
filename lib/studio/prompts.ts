import type { Agent } from "@/data/agents";

/**
 * 카드뉴스 / 광고 생성 시 마키·애디에게 보내는 일회성 프롬프트.
 * 사용자 컨텍스트(브랜드/상품)는 runner가 자동 주입하므로 여기선 작업 명세만.
 */

export interface CardNewsInput {
  /** 상품명 또는 메인 주제 */
  topic: string;
  /** 추가 메모 (옵션) — 톤·각도·금기 사항 */
  notes?: string;
}

export interface AdCreativeInput {
  topic: string;
  /** 광고 목적: 매출 / 브랜드 인지 / 신상 출시 등 */
  goal?: string;
  notes?: string;
}

export function buildCardNewsPrompt(input: CardNewsInput): string {
  return `[카드뉴스 자동 생성 임무]

주제: ${input.topic}
${input.notes ? `추가 메모: ${input.notes}\n` : ""}
출력 형식: 반드시 아래 JSON 스키마와 동일한 형식의 JSON만 출력하세요. 마크다운·설명 절대 금지. 코드 블록도 금지.
JSON 외 다른 텍스트가 있으면 후속 처리에서 실패합니다.

{
  "brandColor": "#ff4ec9 또는 사용자 브랜드 컨텍스트에 맞는 hex (없으면 #ff4ec9)",
  "accentColor": "#5ce5ff (그라디언트 끝 — brandColor와 어울리는 보조)",
  "theme": "dark",
  "imagePrompt": "전체 카드 6장 분위기를 아우르는 일러스트 키워드 (영문 1줄, 30단어 이내)",
  "caption": "인스타그램 발행 캡션 (80~150자, 한국어, 친근하고 명확한 톤)",
  "hashtags": ["#태그1", "#태그2", ...최대 12개],
  "cards": [
    {
      "kind": "hook",
      "index": 1,
      "label": "01. 후킹",
      "title": "8~14자 후킹 카피",
      "body": "50~80자 본문",
      "highlight": "title 안의 강조 단어 (옵션)"
    },
    {
      "kind": "problem",
      "index": 2,
      "label": "02. 문제 제기",
      "title": "...",
      "body": "..."
    },
    {
      "kind": "solution",
      "index": 3,
      "label": "03. 해결",
      "title": "...",
      "body": "..."
    },
    {
      "kind": "proof",
      "index": 4,
      "label": "04. 사례·수치",
      "title": "...",
      "body": "...",
      "stat": { "value": "42", "unit": "초", "caption": "체류시간 평균 +" }
    },
    {
      "kind": "compare",
      "index": 5,
      "label": "05. 비교",
      "title": "...",
      "body": "...",
      "compare": { "leftLabel": "이전", "left": "...", "rightLabel": "이후", "right": "..." }
    },
    {
      "kind": "cta",
      "index": 6,
      "label": "06. 다음 행동",
      "title": "...",
      "body": "...",
      "cta": { "headline": "지금 시작", "sub": "프로필 링크 →", "brand": "브랜드명" }
    }
  ]
}

규칙:
- 모든 카드 카피는 한국어. 영문 키워드는 imagePrompt에만.
- 각 카드 title은 14자 이내, body는 80자 이내.
- 사용자 브랜드 보이스/타겟이 있으면 반드시 반영.
- proof 카드의 stat은 가능하면 구체적 숫자.
- compare 카드의 left/right는 짧고 대비되게.
- cta 카드는 즉시 행동 가능한 한 마디 + 채널.

JSON만 출력하세요.`;
}

export function buildAdCreativePrompt(input: AdCreativeInput): string {
  return `[메타 광고 소재 자동 생성 임무]

주제: ${input.topic}
${input.goal ? `광고 목적: ${input.goal}\n` : ""}${input.notes ? `추가 메모: ${input.notes}\n` : ""}
출력 형식: 반드시 아래 JSON 스키마와 동일한 형식의 JSON만 출력하세요. 마크다운·설명·코드 블록 금지.

{
  "brandName": "사용자 브랜드명 또는 임의",
  "brandColor": "hex",
  "accentColor": "hex",
  "theme": "dark",
  "imagePrompt": "광고 이미지 키워드 (영문 1줄)",
  "variants": [
    {
      "ratio": "1:1",
      "hook": "이미지 위 큰 후킹 (12자 이내)",
      "headline": "광고 헤드라인 (30자 이내)",
      "body": "광고 본문 (100자 이내)",
      "cta": "지금 구매",
      "badge": "오늘만 30%"
    },
    {
      "ratio": "4:5",
      "hook": "...",
      "headline": "...",
      "body": "...",
      "cta": "...",
      "badge": "..."
    },
    {
      "ratio": "9:16",
      "hook": "...",
      "headline": "...",
      "body": "...",
      "cta": "...",
      "badge": "..."
    }
  ]
}

규칙:
- 메타 광고 정책 준수: 과장된 "최고/최저" 표현 금지, 의학적 효능 단정 금지.
- 헤드라인 30자, 본문 100자 절대 초과 금지 (메타 미리보기 잘림).
- 3 변형은 비율마다 다른 후킹·본문 (같은 카피 복붙 금지).
- 1:1 = 발견 단계 (호기심), 4:5 = 디테일 강조, 9:16 = 스토리·릴스용 (감정).
- 사용자 컨텍스트 브랜드 보이스/타겟 반영.

JSON만 출력하세요.`;
}

// ===== 기획 코어 (Strategy Core) =====

import type { PlanScope } from "./templates";

export interface PlanInput {
  /** 사용자 목표 — "신상 5종 출시 한 달 안에 매출 ㄴㅇ까지" */
  goal: string;
  /** 작업 범위 — marketing/detail_page/ads/finance/general */
  scope: PlanScope;
  /** 기간 (옵션) — "1주", "한 달", "분기" */
  horizon?: string;
  /** 가용 예산 (옵션) — "월 ₩50만", "예산 없음" */
  budget?: string;
  /** 추가 제약 (옵션) — "광고 채널은 메타만", "재고 200개 한정" */
  constraints?: string;
}

const SCOPE_GUIDANCE: Record<PlanScope, string> = {
  marketing:    "SNS 콘텐츠·블로그·오디언스 확보·인플루언서 협업 중심. 마키가 주 담당, 다른 비서는 보조.",
  detail_page:  "상세페이지·전환률·SEO·A/B 테스트 중심. 데일리가 주 담당, 다른 비서는 보조.",
  ads:          "메타·구글·네이버 유료 광고·키워드·ROAS 중심. 애디가 주 담당, 다른 비서는 보조.",
  finance:      "예산·정산·세금·손익·캐시플로우 중심. 페니가 주 담당, 다른 비서는 보조.",
  general:      "4 비서가 협업하는 통합 운영 전략. 단계마다 적절한 비서를 ownerAgent로 지정.",
};

export function buildPlanPrompt(input: PlanInput): string {
  return `[기획 코어 임무 — Strategy Core]

당신은 온라인 스토어 운영자의 전략 파트너입니다. 단순한 작업 나열이 아니라, **이긴다는 확신이 드는 전략**을 짜야 합니다.
사용자의 브랜드/상품/오디언스 컨텍스트는 시스템 프롬프트에 포함되어 있습니다 — 반드시 반영하세요.

# 사용자 목표
${input.goal}

# 작업 범위
${input.scope} — ${SCOPE_GUIDANCE[input.scope]}

${input.horizon ? `# 기간\n${input.horizon}\n` : ""}${input.budget ? `# 예산\n${input.budget}\n` : ""}${input.constraints ? `# 제약\n${input.constraints}\n` : ""}

# 사고 절차 (extended thinking 영역에서 깊게 추론할 것)
1. 목표를 1줄로 측정 가능하게 정의
2. 타겟이 진짜 누구인가 — 표면적 인구통계가 아니라 **현재 어떤 상태에 있고, 무엇을 원하고, 무엇이 막고 있는가**
3. 이 시장에서 우리가 이기는 핵심 인사이트 1가지 (남이 안 보는 각도)
4. 인사이트를 단계로 분해 — 각 단계는 측정 가능한 산출물을 가진다
5. 즉시 실행 가능한 다음 작업 3~6건 — 사용자가 데스크에서 바로 비서에게 시킬 수 있는 형태

# 출력 형식
반드시 아래 JSON 스키마와 동일한 형식의 JSON만 출력하세요. 마크다운·설명·코드 블록 절대 금지.

{
  "objective": "한 줄 목표 (측정 가능한 동사 + 수치 + 기한)",
  "targetAudience": "타겟 한 문단 — 현재 상태 / 욕구 / 장애물",
  "insight": "핵심 인사이트 한 문단 — 왜 이 전략이 이기는가",
  "phases": [
    {
      "name": "1단계: 단계명",
      "description": "이 단계에서 무엇을 왜 하는지 2~3문장",
      "deliverables": ["산출물1", "산출물2"],
      "estimatedDuration": "예: 5일",
      "ownerAgent": "marky | dali | addy | penny | user"
    }
  ],
  "deliverables": ["전체 기간 후 갖게 될 최종 산출물 3~6개"],
  "successMetrics": ["KPI 3~5개 — 각각 측정 가능한 형태"],
  "risks": ["주요 리스크 + 대응 한 줄, 3~5개"],
  "nextActions": [
    {
      "title": "다음 작업 한 줄",
      "agentHint": "marky | dali | addy | penny",
      "promptHint": "그 비서에게 그대로 전달할 주제·메모 (1~2문장)"
    }
  ],
  "estimatedBudget": "예산 가이드 한 줄 (옵션)"
}

규칙:
- 모든 텍스트 한국어. 영문은 브랜드명/플랫폼명만.
- phases는 3~5개. 너무 잘게 쪼개지 말 것.
- nextActions의 promptHint는 사용자가 복붙해서 비서에게 넘길 수 있을 만큼 구체적으로.
- 일반론·교과서적 조언 금지. 사용자 컨텍스트(브랜드/상품/타겟)에 맞춘 구체적 전략.

JSON만 출력하세요.`;
}

// ===== 기획 코어 v2 — 비서 자동화 엔진의 두뇌 =====

import type {
  PlanInputV2,
  MarketingPlanInput,
  DetailPagePlanInput,
  AdsPlanInput,
  FinancePlanInput,
} from "./templates";

/** 4 비서 공통 — JSON 스키마 (PlanSpecV2 형식) */
const PLAN_V2_SCHEMA = `{
  "version": 2,
  "scope": "marketing | detail_page | ads | finance",
  "summary": {
    "headline": "한 줄 헤드라인 (40자 이내)",
    "hookInsight": "한 줄 핵심 인사이트 (60자 이내)",
    "cadenceSummary": "발행 운영 한 줄 (30자 이내)",
    "nextSevenDaysCount": 7
  },
  "brandRules": {
    "voice": "톤 정의 한 문단",
    "forbidden": ["금지어1", "금지어2"],
    "requiredElements": ["매 콘텐츠 필수 요소1"]
  },
  "publishingPlan": [
    {
      "channel": "instagram | blog | threads | smartstore | naver_blog",
      "frequency": "weekly_5 | weekly_3 | weekly_1 | daily_1 | manual",
      "bestSlots": ["mon_19", "wed_19", "fri_19"],
      "contentMix": [{ "category": "신상", "ratio": 0.30 }, { "category": "스타일링", "ratio": 0.40 }]
    }
  ],
  "contentSeeds": [
    {
      "week": 1,
      "date": "2026-05-06",
      "channel": "instagram",
      "category": "신상",
      "title": "가제 (15자 이내)",
      "angle": "후킹 각도 1~2문장",
      "hashtags": ["#태그1", "#태그2"],
      "autoExecutable": true
    }
  ],
  "phases": [
    {
      "name": "1주차: 단계명",
      "description": "단계 설명 2~3문장",
      "deliverables": ["산출물1"],
      "estimatedDuration": "5일",
      "ownerAgent": "marky | dali | addy | penny | user"
    }
  ],
  "successMetrics": ["KPI 3~5개"],
  "risks": ["리스크 + 대응 3~5개"],
  "automationHooks": [
    {
      "triggerEvent": "schedule.daily_19h | review.detected | cart_abandoned",
      "action": "generate_card_news | draft_caption | send_reply",
      "params": { "category": "신상", "channel": "instagram" },
      "requiresApproval": true
    }
  ],
  "estimatedBudget": "예산 가이드 한 줄 (옵션)"
}`;

const COMMON_RULES = `규칙:
- 모든 텍스트 한국어. 영문은 브랜드명/플랫폼명만.
- 사용자 컨텍스트(브랜드/타겟/상품)에 맞춘 구체적 전략. 일반론·교과서적 조언 금지.
- contentSeeds는 4주치 (28일) 발행 일정에 맞게 12~28건 사이로 생성. 각 항목은 channelsAndCadence와 contentMix 비율을 따른다.
- contentSeeds.date는 오늘 이후 28일 이내. 사용자 운영 제약 (주말 X 등) 반드시 반영.
- contentSeeds.autoExecutable: 정형화된 안전한 콘텐츠는 true (예: 신상 소개, 스타일링 팁). 정치/논란/민감 주제는 false.
- automationHooks.requiresApproval: 발행/송신/결제 관련은 반드시 true. 단순 초안 생성만 false 가능.
- brandRules.forbidden: 사용자가 입력한 forbidden + 일반적 마케팅 금기어 (과대광고/허위/차별)를 합쳐 정리.
- summary.nextSevenDaysCount: contentSeeds 중 오늘 이후 7일 이내 발행 예정 개수와 일치해야 함.

JSON만 출력하세요. 마크다운·설명·코드 블록 금지.`;

const COMMON_FOUNDATION_BLOCK = (input: PlanInputV2) => `# 브랜드 정체성
${input.brandIdentity}

# 타겟 페르소나
${input.targetPersona}

# 콘텐츠 톤
${input.voiceTone}

# 사용자 지정 금지어/금지주제
${input.forbidden.length > 0 ? input.forbidden.join(" / ") : "(없음)"}`;

const TODAY_HINT = () => {
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10);
  const day = ["일","월","화","수","목","금","토"][now.getDay()];
  return `오늘은 ${ymd} (${day})입니다. contentSeeds.date는 이후 날짜로 생성하세요.`;
};

export function buildMarketingPlanPrompt(input: MarketingPlanInput): string {
  return `[기획 코어 v2 — 마키 (마케팅 자동화 룰북)]

당신은 마키의 기획 코어입니다. 이 산출물은 보고서가 아니라 **마키가 4주 동안 자동으로 콘텐츠를 만들고 발행하는 운영 룰북**입니다.
brandRules는 매 콘텐츠 생성 호출의 system 프롬프트에 자동 주입되고,
publishingPlan은 발행 캘린더로 등록되며,
contentSeeds는 카드뉴스/캡션/블로그 자동 생성 큐에 입력됩니다.

${COMMON_FOUNDATION_BLOCK(input)}

# 주력 채널 + 발행 빈도
${input.channelsAndCadence}

# 콘텐츠 카테고리 비율
${input.contentMixHint}

# 이번 분기 핵심 메시지 3개
${input.quarterlyAnchors}

${input.operationalConstraints ? `# 운영 제약\n${input.operationalConstraints}\n` : ""}
${TODAY_HINT()}

# 사고 절차 (extended thinking 영역)
1. 채널/빈도 → publishingPlan으로 정규화 (bestSlots는 인스타 평일 19시처럼 운영 제약 반영)
2. 카테고리 비율 → contentMix 정확한 ratio (합계 1.0)
3. 4주치 contentSeeds — quarterlyAnchors 3개 메시지를 균형있게 분포, 각 시드의 angle은 구체적이고 실행 가능
4. brandRules — voice/forbidden/requiredElements를 매 콘텐츠 생성 시 강제할 수 있는 형태로
5. automationHooks — 안전한 자동화부터 (캡션 초안 / 카드뉴스 초안). 발행 액션은 requiresApproval: true 강제

# 출력 스키마
${PLAN_V2_SCHEMA}

scope는 "marketing"으로 고정.

${COMMON_RULES}`;
}

export function buildDetailPagePlanPrompt(input: DetailPagePlanInput): string {
  return `[기획 코어 v2 — 데일리 (상세페이지 자동화 룰북)]

당신은 데일리의 기획 코어입니다. 이 산출물은 데일리가 4주 동안 자동으로 상세페이지를 만들고 개선하는 운영 룰북입니다.

${COMMON_FOUNDATION_BLOCK(input)}

# 5섹션 구조 선호
${input.sectionStructurePreference}

# 신뢰 요소
${input.trustElements}

# SEO 타겟 키워드 풀
${input.seoKeywordPool}

${input.abTestPriority ? `# A/B 테스트 우선순위\n${input.abTestPriority}\n` : ""}
${TODAY_HINT()}

# 사고 절차
1. publishingPlan — channel은 "smartstore"/"cafe24" 등 실제 스토어. frequency는 신상 페이스에 맞춤
2. contentSeeds — 각 시드는 상세페이지 1개 (또는 1개 섹션 개선). title은 상품명, angle은 후킹 카피 방향
3. brandRules — voice는 신뢰 어필, requiredElements에 trustElements 포함
4. publishingPlan.contentMix — "신규 상세 / 기존 개선 / SEO 메타 갱신 / A/B 테스트" 비율
5. automationHooks — 신상 등록 트리거 시 5섹션 자동 초안 생성 등

# 출력 스키마
${PLAN_V2_SCHEMA}

scope는 "detail_page"로 고정.

${COMMON_RULES}`;
}

export function buildAdsPlanPrompt(input: AdsPlanInput): string {
  return `[기획 코어 v2 — 애디 (광고 자동화 룰북)]

당신은 애디의 기획 코어입니다. 이 산출물은 애디가 4주 동안 자동으로 광고 소재를 만들고 캠페인을 운영하는 룰북입니다.

${COMMON_FOUNDATION_BLOCK(input)}

# 채널 우선순위
${input.channelPriority}

# 일평균 예산
${input.dailyBudget}

# 입찰/타겟팅 전략
${input.biddingStrategy}

${input.forbiddenAdPatterns ? `# 금지 카피 패턴\n${input.forbiddenAdPatterns}\n` : ""}
${input.retargetingWindows ? `# 리타겟 윈도우\n${input.retargetingWindows}\n` : ""}
${TODAY_HINT()}

# 사고 절차
1. publishingPlan — channel은 "meta"/"naver_sa"/"google_sa". bestSlots는 광고 ON/OFF 시간대
2. contentSeeds — 각 시드는 광고 소재 1세트 (1:1/4:5/9:16 변형 묶음). angle은 헤드라인 방향
3. brandRules.forbidden — forbiddenAdPatterns + 메타 정책 금기 (최저가/즉효/단정)
4. automationHooks — 비효율 캠페인 자동 일시정지 (requiresApproval: true), 신소재 일일 생성 등

# 출력 스키마
${PLAN_V2_SCHEMA}

scope는 "ads"로 고정.

${COMMON_RULES}`;
}

export function buildFinancePlanPrompt(input: FinancePlanInput): string {
  return `[기획 코어 v2 — 페니 (재무 자동화 룰북)]

당신은 페니의 기획 코어입니다. 이 산출물은 페니가 자동으로 정산 매칭/세금 추정/리포트를 운영하는 룰북입니다.

${COMMON_FOUNDATION_BLOCK(input)}

# 정산 주기 채널별
${input.settlementCycle}

# 카테고리 분류 룰
${input.categoryRules}

# 손익 임계값
${input.profitThresholds}

${input.adBudgetLimit ? `# 광고비 한도\n${input.adBudgetLimit}\n` : ""}
${input.alertRules ? `# 알림 룰\n${input.alertRules}\n` : ""}
${TODAY_HINT()}

# 사고 절차
1. publishingPlan — channel은 "report" / "alert". 일/주/월 리포트 발송 슬롯
2. contentSeeds — 각 시드는 리포트 1개 (월간 손익 / 주간 정산 등)
3. brandRules.requiredElements — 모든 리포트에 들어갈 요소 (정산 매칭률, 광고비 비중 등)
4. automationHooks — 임계값 초과 알림 (requiresApproval: false, 단순 알림), 자금 이체는 requiresApproval: true 강제

# 출력 스키마
${PLAN_V2_SCHEMA}

scope는 "finance"로 고정.

${COMMON_RULES}`;
}

export function buildPlanV2Prompt(input: PlanInputV2): string {
  switch (input.scope) {
    case "marketing":   return buildMarketingPlanPrompt(input);
    case "detail_page": return buildDetailPagePlanPrompt(input);
    case "ads":         return buildAdsPlanPrompt(input);
    case "finance":     return buildFinancePlanPrompt(input);
  }
}

/**
 * AI 응답에서 JSON만 추출 (모델이 가끔 마크다운으로 감싸는 경우 대비).
 */
export function extractJson<T>(text: string): T | null {
  const trimmed = text.trim();
  // 코드블록 제거
  const stripped = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  // 첫 { 부터 마지막 } 까지 추출
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start < 0 || end < 0 || end < start) return null;
  const slice = stripped.slice(start, end + 1);
  try {
    return JSON.parse(slice) as T;
  } catch {
    return null;
  }
}
