import { db } from "./db";
import { PLAN_DEFINITIONS, PlanSlug, getPlanDef } from "./plans";

export type PlanStatus = "none" | "trialing" | "active" | "past_due" | "canceled";

export interface UserBillingState {
  planSlug: PlanSlug | null;
  planStatus: PlanStatus;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  trialDaysLeft: number | null;
  nextBillingAt: string | null;
  lastPaymentAmount: number | null;
  currentPeriodAmount: number | null;
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function getUserBillingState(userId: string): UserBillingState {
  const user = db.getUserById(userId);
  if (!user) {
    return {
      planSlug: null,
      planStatus: "none",
      trialStartedAt: null,
      trialEndsAt: null,
      trialDaysLeft: null,
      nextBillingAt: null,
      lastPaymentAmount: null,
      currentPeriodAmount: null,
    };
  }

  const slug = (user.plan_slug as PlanSlug | null) ?? null;
  const def = getPlanDef(slug);
  const status = (user.plan_status as PlanStatus) || "none";

  let trialDaysLeft: number | null = null;
  if (status === "trialing" && user.trial_ends_at) {
    const left = daysBetween(new Date(), new Date(user.trial_ends_at));
    trialDaysLeft = Math.max(0, left);
  }

  const sub = db.getActiveSubscriptionByUser(userId);

  return {
    planSlug: slug,
    planStatus: status,
    trialStartedAt: user.trial_started_at ?? null,
    trialEndsAt: user.trial_ends_at ?? null,
    trialDaysLeft,
    nextBillingAt: sub?.next_billing_at ?? null,
    lastPaymentAmount: sub?.amount ?? null,
    currentPeriodAmount: def ? def.price_monthly : null,
  };
}

export function startTrial(userId: string, slug: PlanSlug) {
  const def = PLAN_DEFINITIONS[slug];
  if (!def) throw new Error("invalid plan");

  const now = new Date();
  const ends = new Date(now);
  ends.setDate(ends.getDate() + def.trial_days);

  db.setUserPlan(userId, {
    plan_slug: slug,
    plan_status: "trialing",
    trial_started_at: now.toISOString(),
    trial_ends_at: ends.toISOString(),
  });

  db.recordBillingEvent({
    user_id: userId,
    kind: "trial_started",
    plan_slug: slug,
    amount: 0,
    note: `${def.trial_days}일 무료 체험 시작`,
  });
}

export function activateSubscription(userId: string, slug: PlanSlug) {
  const def = PLAN_DEFINITIONS[slug];
  if (!def) throw new Error("invalid plan");

  const user = db.getUserById(userId);
  if (!user) throw new Error("user not found");

  const firstPayment =
    def.first_payment_amount != null && !user.first_payment_done
      ? def.first_payment_amount
      : def.price_monthly;

  const next = new Date();
  next.setDate(next.getDate() + 30);

  db.setUserPlan(userId, {
    plan_slug: slug,
    plan_status: "active",
    first_payment_done: 1,
  });

  db.upsertSubscriptionForUser(userId, slug, firstPayment, next.toISOString());

  db.recordBillingEvent({
    user_id: userId,
    kind: "payment_success",
    plan_slug: slug,
    amount: firstPayment,
    note:
      def.first_payment_amount != null && !user.first_payment_done
        ? "첫 결제 할인 적용"
        : "월 정기 결제",
  });
}

export function cancelSubscription(userId: string) {
  db.setUserPlan(userId, { plan_status: "canceled" });
  db.cancelSubscriptionForUser(userId);
  db.recordBillingEvent({
    user_id: userId,
    kind: "canceled",
    plan_slug: null,
    amount: 0,
    note: "사용자 해지",
  });
}

export function calcPaymentSummary() {
  return db.getBillingSummary();
}
