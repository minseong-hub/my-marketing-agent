/**
 * Anthropic API 비용 계산.
 *
 * 가격은 모델별로 다르며, 캐시 read는 90% 할인, 캐시 creation은 25% 추가 비용.
 * 가격은 정기적으로 갱신되는 외부 정보 — 큰 변동 시 이 파일만 업데이트.
 *
 * 단위: USD per 1,000,000 tokens.
 * 출처: anthropic.com/pricing (2026-Q2 기준)
 */

export interface ModelPrice {
  /** USD per 1M input tokens (no cache) */
  input: number;
  /** USD per 1M output tokens (thinking 포함) */
  output: number;
  /** USD per 1M cache write tokens */
  cacheWrite: number;
  /** USD per 1M cache read tokens (입력의 ~10%) */
  cacheRead: number;
}

export const MODEL_PRICES: Record<string, ModelPrice> = {
  // Opus 4.7 — 최상위 모델
  "claude-opus-4-7": {
    input: 15,
    output: 75,
    cacheWrite: 18.75,
    cacheRead: 1.5,
  },
  // Sonnet 4.6 — 일반 작업
  "claude-sonnet-4-6": {
    input: 3,
    output: 15,
    cacheWrite: 3.75,
    cacheRead: 0.3,
  },
  // Haiku 4.5
  "claude-haiku-4-5-20251001": {
    input: 1,
    output: 5,
    cacheWrite: 1.25,
    cacheRead: 0.1,
  },
};

/** USD → KRW 환율 (정기 갱신 대상) */
export const USD_TO_KRW = 1_380;

export interface UsageInput {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  model: string;
}

export interface CostResult {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  costUsd: number;
  costKrw: number;
  /** 캐시 절감률 0~1 — cache hit이 만든 절감 비율 */
  cacheSavingRatio: number;
  model: string;
}

export function calculateCost(usage: UsageInput): CostResult {
  const price = MODEL_PRICES[usage.model] ?? MODEL_PRICES["claude-sonnet-4-6"];
  const M = 1_000_000;
  const inputCost = (usage.inputTokens / M) * price.input;
  const outputCost = (usage.outputTokens / M) * price.output;
  const cacheReadCost = (usage.cacheReadTokens / M) * price.cacheRead;
  const cacheCreateCost = (usage.cacheCreationTokens / M) * price.cacheWrite;
  const costUsd = inputCost + outputCost + cacheReadCost + cacheCreateCost;
  // 캐시가 없었다면 read 토큰을 input 가격으로 냈을 것 — 그 차이가 절감
  const wouldBeCost = costUsd + (usage.cacheReadTokens / M) * (price.input - price.cacheRead);
  const cacheSavingRatio = wouldBeCost > 0 ? Math.max(0, (wouldBeCost - costUsd) / wouldBeCost) : 0;
  return {
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    cacheReadTokens: usage.cacheReadTokens,
    cacheCreationTokens: usage.cacheCreationTokens,
    costUsd: Math.round(costUsd * 100000) / 100000,  // 5자리
    costKrw: Math.round(costUsd * USD_TO_KRW),
    cacheSavingRatio: Math.round(cacheSavingRatio * 1000) / 1000,
    model: usage.model,
  };
}
