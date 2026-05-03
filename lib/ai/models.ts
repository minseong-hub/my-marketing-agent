/**
 * AI 모델 라우팅.
 *
 * 4 비서의 일반 작업은 WORKER (Sonnet) 사용,
 * 기획·전략 단계는 PLANNER (Opus 4.7 + adaptive thinking) 사용.
 *
 * 이미지 모델은 lib/ai/image-models.ts 참조.
 */

/** 일반 작업용 — 빠르고 비용 효율적 */
export const WORKER_MODEL = "claude-sonnet-4-6";

/** 기획·전략·복잡한 추론용 — 가장 강한 지능 */
export const PLANNER_MODEL = "claude-opus-4-7";

/**
 * 기획 코어 thinking effort.
 * Opus 4.7은 adaptive thinking을 사용 — 모델이 effort에 맞춰 추론 깊이를 자동 조절.
 *  - low / medium / high / xhigh / max
 */
export const PLANNER_THINKING_EFFORT = "high" as const;

/** 기획 응답 max_tokens — thinking 토큰 + 실제 응답 토큰 합산 */
export const PLANNER_MAX_TOKENS = 16000;
