import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getUserBillingState } from "@/lib/billing";
import { db } from "@/lib/db";
import {
  PLAN_DEFINITIONS,
  PLAN_ORDER,
  PLAN_TOOL_META,
  PlanSlug,
  formatKRW,
  getPlanDef,
} from "@/lib/plans";
import { Check, CreditCard, Calendar, ShieldCheck } from "lucide-react";
import { BillingActions } from "./actions";

export const dynamic = "force-dynamic";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/app/billing");

  const state = getUserBillingState(session.userId);
  const events = db.listBillingEvents(session.userId, 30);
  const currentDef = getPlanDef(state.planSlug);
  const selectedSlug = (searchParams.plan as PlanSlug) || state.planSlug || "growth";

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">결제 & 구독</h1>
          <p className="text-sm text-slate-500 mt-1">현재 플랜, 결제 내역, 업그레이드/해지를 관리합니다.</p>
        </div>

        {/* Current plan summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">현재 플랜</div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {currentDef ? currentDef.name : "선택된 플랜 없음"}
                </div>
                {currentDef && (
                  <p className="text-sm text-slate-500 mt-1">{currentDef.tagline}</p>
                )}
              </div>
              <StatusBadge status={state.planStatus} trialDaysLeft={state.trialDaysLeft} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
              <Info
                icon={<CreditCard className="w-4 h-4 text-blue-600" />}
                label="월 요금"
                value={currentDef ? formatKRW(currentDef.price_monthly) : "-"}
              />
              <Info
                icon={<Calendar className="w-4 h-4 text-blue-600" />}
                label={state.planStatus === "trialing" ? "체험 종료" : "다음 결제일"}
                value={
                  state.planStatus === "trialing"
                    ? state.trialEndsAt?.slice(0, 10) ?? "-"
                    : state.nextBillingAt?.slice(0, 10) ?? "-"
                }
              />
              <Info
                icon={<ShieldCheck className="w-4 h-4 text-blue-600" />}
                label="최근 결제"
                value={
                  state.lastPaymentAmount != null && state.planStatus === "active"
                    ? formatKRW(state.lastPaymentAmount)
                    : "-"
                }
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 mb-3">이용 가능한 도구</div>
            <ul className="space-y-2">
              {currentDef
                ? currentDef.tools.map((t) => (
                    <li key={t} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-blue-600" strokeWidth={3} />
                      {PLAN_TOOL_META[t].label}
                    </li>
                  ))
                : (
                    <li className="text-sm text-slate-400">
                      아래에서 플랜을 선택하면 도구가 활성화됩니다.
                    </li>
                  )}
            </ul>
          </div>
        </div>

        {/* Plan picker */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">플랜 선택</h2>
              <p className="text-xs text-slate-500 mt-1">
                7일 무료 체험 후 결제됩니다. 체험 중 해지하면 비용이 청구되지 않습니다.
              </p>
            </div>
            <Link href="/pricing" className="text-xs font-semibold text-blue-600 hover:text-blue-500">
              상세 비교 →
            </Link>
          </div>

          <BillingActions
            currentSlug={state.planSlug}
            currentStatus={state.planStatus}
            trialUsed={!!state.trialStartedAt}
            selected={selectedSlug as PlanSlug}
          />
        </div>

        {/* Billing history */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">결제 내역</h2>
            <span className="text-xs text-slate-400">최근 30건</span>
          </div>
          {events.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-400">
              아직 결제 내역이 없습니다.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50/60">
                <tr>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-6 py-3">
                    날짜
                  </th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-6 py-3">
                    유형
                  </th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-6 py-3">
                    플랜
                  </th>
                  <th className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 px-6 py-3">
                    금액
                  </th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-6 py-3">
                    메모
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100">
                    <td className="px-6 py-3 text-xs text-slate-500">{e.created_at.slice(0, 16)}</td>
                    <td className="px-6 py-3">
                      <EventBadge kind={e.kind} />
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {e.plan_slug ? PLAN_DEFINITIONS[e.plan_slug as PlanSlug]?.name ?? e.plan_slug : "-"}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-900">
                      {e.amount > 0 ? formatKRW(e.amount) : "-"}
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">{e.note ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-[11px] text-slate-400 mt-6 text-center">
          ※ 현재 모의 결제 모드입니다. 실제 PG 연동 전까지 버튼은 내부 상태만 변경합니다.
        </p>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-sm font-bold text-slate-900">{value}</div>
    </div>
  );
}

function StatusBadge({
  status,
  trialDaysLeft,
}: {
  status: string;
  trialDaysLeft: number | null;
}) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    none: { bg: "bg-slate-100", text: "text-slate-600", label: "미가입" },
    trialing: { bg: "bg-blue-50", text: "text-blue-700", label: `체험중 · ${trialDaysLeft ?? 0}일 남음` },
    active: { bg: "bg-emerald-50", text: "text-emerald-700", label: "정기 결제중" },
    past_due: { bg: "bg-amber-50", text: "text-amber-700", label: "결제 실패" },
    canceled: { bg: "bg-rose-50", text: "text-rose-700", label: "해지됨" },
  };
  const s = map[status] ?? map.none;
  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function EventBadge({ kind }: { kind: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    trial_started: { bg: "bg-blue-50", text: "text-blue-700", label: "체험 시작" },
    payment_success: { bg: "bg-emerald-50", text: "text-emerald-700", label: "결제 완료" },
    canceled: { bg: "bg-rose-50", text: "text-rose-700", label: "해지" },
    plan_changed: { bg: "bg-violet-50", text: "text-violet-700", label: "플랜 변경" },
  };
  const s = map[kind] ?? { bg: "bg-slate-100", text: "text-slate-700", label: kind };
  return (
    <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-md ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}
