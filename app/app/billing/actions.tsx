"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLAN_DEFINITIONS, PLAN_ORDER, PlanSlug, formatKRW } from "@/lib/plans";
import { Check, Loader2 } from "lucide-react";

type Status = "none" | "trialing" | "active" | "past_due" | "canceled";

export function BillingActions({
  currentSlug,
  currentStatus,
  selected: initialSelected,
}: {
  currentSlug: PlanSlug | null;
  currentStatus: Status;
  selected: PlanSlug;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<PlanSlug>(initialSelected);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function post(path: string, body: any) {
    setLoading(path);
    setMessage(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "요청 실패" });
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setMessage({ type: "err", text: "네트워크 오류" });
      return false;
    } finally {
      setLoading(null);
    }
  }

  async function subscribe() {
    const ok = await post("/api/billing/subscribe", { plan: selected });
    if (ok) setMessage({ type: "ok", text: "정기 결제가 활성화되었습니다." });
  }

  async function cancel() {
    if (!confirm("정말 해지하시겠습니까? 다음 결제부터 청구가 중단됩니다.")) return;
    const ok = await post("/api/billing/cancel", {});
    if (ok) setMessage({ type: "ok", text: "구독이 해지되었습니다." });
  }

  const isCurrent = (slug: PlanSlug) => slug === currentSlug;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PLAN_ORDER.map((slug) => {
          const def = PLAN_DEFINITIONS[slug];
          const current = isCurrent(slug);
          const chosen = selected === slug;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => setSelected(slug)}
              className={
                "text-left rounded-2xl p-5 border-2 transition-all " +
                (chosen
                  ? "border-blue-600 bg-blue-50/40 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300")
              }
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-base font-extrabold text-slate-900">{def.name}</div>
                {current && (
                  <span className="text-[14px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    현재
                  </span>
                )}
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {formatKRW(def.price_monthly)}
                <span className="text-sm font-semibold text-slate-500 ml-1">/월</span>
              </div>
              {def.first_payment_amount != null && (
                <div className="text-[15px] font-semibold text-blue-700 mt-1">
                  첫 결제 {formatKRW(def.first_payment_amount)}
                </div>
              )}
              <div className="text-sm text-slate-500 mt-3">
                {def.tools.length}개 도구 ·{" "}
                {def.monthly_generation_limit === null
                  ? "무제한 생성"
                  : `월 ${def.monthly_generation_limit.toLocaleString()}회`}
              </div>
              {chosen && (
                <div className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-700">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  선택됨
                </div>
              )}
            </button>
          );
        })}
      </div>

      {message && (
        <div
          className={
            "mt-5 rounded-lg px-4 py-3 text-base border " +
            (message.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-700")
          }
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-6">
        <button
          onClick={subscribe}
          disabled={loading != null || selected === "free"}
          className={
            "h-11 px-6 rounded-xl font-bold text-base disabled:opacity-60 inline-flex items-center gap-2 " +
            ((currentStatus === "active" && isCurrent(selected)) || selected === "free"
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white")
          }
        >
          {loading === "/api/billing/subscribe" && <Loader2 className="w-4 h-4 animate-spin" />}
          {selected === "free"
            ? "무료 플랜 (가입과 동시 활성)"
            : currentStatus === "active" && isCurrent(selected)
            ? "현재 결제중"
            : currentStatus === "active"
            ? "플랜 변경 / 결제"
            : "정기 결제 시작"}
        </button>

        {currentStatus === "active" && (
          <button
            onClick={cancel}
            disabled={loading != null}
            className="h-11 px-6 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-base disabled:opacity-60"
          >
            구독 해지
          </button>
        )}
      </div>
    </div>
  );
}
