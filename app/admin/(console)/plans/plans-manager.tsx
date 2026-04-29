"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Archive } from "lucide-react";

type PlanView = {
  id: string;
  name: string;
  price_monthly: number;
  features: string[];
  archived: number;
  slug: string | null;
  trial_days: number;
  first_payment_amount: number | null;
  tools: string[];
};

export function PlansManager({
  initial,
  toolOptions,
}: {
  initial: PlanView[];
  toolOptions: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [plans, setPlans] = useState(initial);

  async function save(plan: PlanView) {
    await fetch(`/api/admin/plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: plan.name,
        price_monthly: plan.price_monthly,
        features: plan.features,
        archived: plan.archived,
        trial_days: plan.trial_days,
        first_payment_amount: plan.first_payment_amount,
        tools: plan.tools,
      }),
    });
    router.refresh();
  }

  async function toggleArchive(plan: PlanView) {
    const next = plan.archived ? 0 : 1;
    await fetch(`/api/admin/plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: next }),
    });
    router.refresh();
  }

  const cls =
    "h-9 px-3 rounded-lg border border-slate-200 text-base bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

  return (
    <div className="space-y-4">
      {plans.map((p, idx) => (
        <div
          key={p.id}
          className={
            "border rounded-xl p-5 " +
            (p.archived ? "border-slate-200 bg-slate-50/50 opacity-70" : "border-slate-200 bg-white")
          }
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <input
                  className={cls + " font-bold text-lg"}
                  value={p.name}
                  onChange={(e) => {
                    const next = [...plans];
                    next[idx] = { ...p, name: e.target.value };
                    setPlans(next);
                  }}
                />
                {p.slug && (
                  <span className="text-[14px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-1">
                    {p.slug}
                  </span>
                )}
              </div>
              <div className="text-[15px] text-slate-400">ID {p.id}</div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => save(p)}
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
              >
                <Save className="w-3.5 h-3.5" /> 저장
              </button>
              <button
                onClick={() => toggleArchive(p)}
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Archive className="w-3.5 h-3.5" />
                {p.archived ? "복원" : "아카이브"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-[15px] font-semibold text-slate-500 mb-1 block">월 요금 (KRW)</label>
              <input
                type="number"
                className={cls + " w-full"}
                value={p.price_monthly}
                onChange={(e) => {
                  const next = [...plans];
                  next[idx] = { ...p, price_monthly: Number(e.target.value) };
                  setPlans(next);
                }}
              />
            </div>
            <div>
              <label className="text-[15px] font-semibold text-slate-500 mb-1 block">첫 결제 금액 (비워두면 할인 없음)</label>
              <input
                type="number"
                className={cls + " w-full"}
                value={p.first_payment_amount ?? ""}
                onChange={(e) => {
                  const next = [...plans];
                  const v = e.target.value === "" ? null : Number(e.target.value);
                  next[idx] = { ...p, first_payment_amount: v };
                  setPlans(next);
                }}
              />
            </div>
            <div>
              <label className="text-[15px] font-semibold text-slate-500 mb-1 block">무료 체험 (일)</label>
              <input
                type="number"
                className={cls + " w-full"}
                value={p.trial_days}
                onChange={(e) => {
                  const next = [...plans];
                  next[idx] = { ...p, trial_days: Number(e.target.value) };
                  setPlans(next);
                }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[15px] font-semibold text-slate-500 mb-1.5 block">제공 도구</label>
            <div className="flex flex-wrap gap-2">
              {toolOptions.map((t) => {
                const checked = p.tools.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className={
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors " +
                      (checked
                        ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                        : "border-slate-200 text-slate-600 hover:border-slate-300")
                    }
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={checked}
                      onChange={(e) => {
                        const next = [...plans];
                        const tools = e.target.checked
                          ? [...p.tools, t.id]
                          : p.tools.filter((x) => x !== t.id);
                        next[idx] = { ...p, tools };
                        setPlans(next);
                      }}
                    />
                    {t.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[15px] font-semibold text-slate-500 mb-1 block">표시 기능 (줄바꿈)</label>
            <textarea
              className="w-full min-h-[80px] p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
              value={p.features.join("\n")}
              onChange={(e) => {
                const next = [...plans];
                next[idx] = {
                  ...p,
                  features: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean),
                };
                setPlans(next);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
