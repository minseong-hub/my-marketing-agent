import { db } from "@/lib/db";
import { getUserBillingState } from "@/lib/billing";
import { getPlanDef, type PlanSlug } from "@/lib/plans";
import type { AgentType } from "@/lib/agents/types";

/**
 * 사용자의 월간 AI 호출 한도를 강제합니다.
 *
 * - 한 달(30일) 윈도우 동안 누적 agent_session 수를 호출 횟수로 간주.
 * - 무료(free) 플랜은 자동 임무(스케줄러/즉시 자동 실행) 차단.
 * - 한도 초과 시 quotaError 결과를 반환하며, 호출자는 적절한 HTTP 응답으로 변환해야 함.
 */

export type QuotaResult =
  | { ok: true; planSlug: PlanSlug; usage: number; limit: number | null }
  | { ok: false; reason: string; planSlug: PlanSlug; usage: number; limit: number | null };

export interface QuotaContext {
  /** "user_manual_auto_trigger" 같은 자동 트리거인지 여부 */
  trigger?: "manual" | "auto" | "user_manual_auto_trigger" | "auto_scheduler";
}

const ALL_TYPES: AgentType[] = ["marketing", "detail_page", "ads", "finance"];

export function getMonthlyUsage(userId: string): number {
  let total = 0;
  for (const at of ALL_TYPES) {
    total += db.countAgentSessionsForUser(userId, at, 30);
  }
  return total;
}

export function checkQuotaForRun(userId: string, ctx: QuotaContext = {}): QuotaResult {
  const billing = getUserBillingState(userId);
  const planSlug = (billing.planSlug ?? "free") as PlanSlug;
  const planDef = getPlanDef(planSlug);
  const limit = planDef?.monthly_generation_limit ?? null;
  const usage = getMonthlyUsage(userId);

  // 무료 플랜은 자동 임무 차단
  const isAutoTrigger = ctx.trigger === "auto" || ctx.trigger === "auto_scheduler" || ctx.trigger === "user_manual_auto_trigger";
  if (planSlug === "free" && isAutoTrigger) {
    return {
      ok: false,
      reason: "무료 플랜은 자동 임무를 사용할 수 없습니다. 유료 플랜으로 업그레이드해 주세요.",
      planSlug,
      usage,
      limit,
    };
  }

  // 한도 검증 (null = 무제한)
  if (limit !== null && usage >= limit) {
    return {
      ok: false,
      reason: `이번 달 AI 호출 한도(${limit.toLocaleString()}회)를 초과했습니다. 플랜을 업그레이드하거나 다음 달까지 기다려 주세요.`,
      planSlug,
      usage,
      limit,
    };
  }

  return { ok: true, planSlug, usage, limit };
}
