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
