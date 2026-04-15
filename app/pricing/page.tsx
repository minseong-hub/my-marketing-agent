import Link from "next/link";
import { Check, Sparkles, Zap, Rocket } from "lucide-react";
import { getSession } from "@/lib/auth";
import {
  PLAN_DEFINITIONS,
  PLAN_ORDER,
  PLAN_TOOL_META,
  PlanSlug,
  formatKRW,
} from "@/lib/plans";

export const dynamic = "force-dynamic";

const ICONS: Record<PlanSlug, any> = {
  starter: Sparkles,
  growth: Zap,
  pro: Rocket,
};

export default async function PricingPage() {
  const session = await getSession();
  const loggedIn = !!session;

  return (
    <div className="min-h-screen bg-white">
      <header className="max-w-6xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          모든 플랜 7일 무료 체험
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          비즈니스 규모에 맞는 요금제
        </h1>
        <p className="mt-4 text-slate-500 text-base max-w-xl mx-auto">
          자동화의 강도를 선택하세요. 언제든 업그레이드/다운그레이드할 수 있습니다.
        </p>
      </header>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLAN_ORDER.map((slug) => {
            const def = PLAN_DEFINITIONS[slug];
            const Icon = ICONS[slug];
            const recommended = def.recommended;
            return (
              <div
                key={slug}
                className={
                  "relative rounded-3xl p-7 flex flex-col " +
                  (recommended
                    ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-600/25 ring-1 ring-blue-600"
                    : "bg-white text-slate-900 border border-slate-200 shadow-sm")
                }
              >
                {recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-blue-700 text-[11px] font-extrabold tracking-wider px-3 py-1 rounded-full shadow">
                    RECOMMENDED
                  </div>
                )}

                <div
                  className={
                    "w-11 h-11 rounded-xl flex items-center justify-center mb-5 " +
                    (recommended ? "bg-white/15" : "bg-blue-600")
                  }
                >
                  <Icon className={"w-5 h-5 " + (recommended ? "text-white" : "text-white")} />
                </div>

                <h3 className={"text-lg font-extrabold " + (recommended ? "text-white" : "text-slate-900")}>
                  {def.name}
                </h3>
                <p className={"text-sm mt-1 " + (recommended ? "text-blue-100" : "text-slate-500")}>
                  {def.tagline}
                </p>

                <div className="mt-6">
                  {def.first_payment_amount != null ? (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className={"text-4xl font-extrabold " + (recommended ? "text-white" : "text-slate-900")}>
                          {formatKRW(def.first_payment_amount)}
                        </span>
                        <span className={"text-sm font-semibold " + (recommended ? "text-blue-100" : "text-slate-500")}>
                          첫달
                        </span>
                      </div>
                      <div className={"text-xs mt-1 " + (recommended ? "text-blue-100" : "text-slate-500")}>
                        이후 월 {formatKRW(def.price_monthly)} ·{" "}
                        <span className="font-semibold">{def.first_payment_note}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className={"text-4xl font-extrabold " + (recommended ? "text-white" : "text-slate-900")}>
                        {formatKRW(def.price_monthly)}
                      </span>
                      <span className={"text-sm font-semibold " + (recommended ? "text-blue-100" : "text-slate-500")}>
                        /월
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className={
                    "mt-5 rounded-xl px-3 py-2 text-xs font-semibold " +
                    (recommended ? "bg-white/15 text-white" : "bg-blue-50 text-blue-700")
                  }
                >
                  ✓ {def.trial_days}일 무료 체험 · 결제 카드 등록 시 시작
                </div>

                <ul className={"mt-6 space-y-2.5 " + (recommended ? "text-white" : "text-slate-700")}>
                  {def.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm">
                      <Check
                        className={
                          "w-4 h-4 mt-0.5 flex-shrink-0 " +
                          (recommended ? "text-blue-200" : "text-blue-600")
                        }
                        strokeWidth={3}
                      />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={loggedIn ? `/app/billing?plan=${slug}` : `/signup?plan=${slug}`}
                  className={
                    "mt-7 h-11 rounded-xl text-sm font-bold flex items-center justify-center transition-colors " +
                    (recommended
                      ? "bg-white text-blue-700 hover:bg-blue-50"
                      : "bg-blue-600 text-white hover:bg-blue-500")
                  }
                >
                  {def.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Feature comparison */}
        <div className="mt-16 border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">플랜별 도구 비교</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/60">
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-6 py-3">
                    도구
                  </th>
                  {PLAN_ORDER.map((slug) => (
                    <th
                      key={slug}
                      className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3"
                    >
                      {PLAN_DEFINITIONS[slug].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.keys(PLAN_TOOL_META) as (keyof typeof PLAN_TOOL_META)[]).map((tool) => (
                  <tr key={tool} className="border-t border-slate-100">
                    <td className="px-6 py-3.5 text-slate-800 font-medium">
                      {PLAN_TOOL_META[tool].label}
                    </td>
                    {PLAN_ORDER.map((slug) => {
                      const has = PLAN_DEFINITIONS[slug].tools.includes(tool);
                      return (
                        <td key={slug} className="text-center px-4 py-3.5">
                          {has ? (
                            <Check className="w-4 h-4 text-blue-600 inline" strokeWidth={3} />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="border-t border-slate-100 bg-slate-50/40">
                  <td className="px-6 py-3.5 text-slate-800 font-medium">월 AI 생성 한도</td>
                  {PLAN_ORDER.map((slug) => {
                    const limit = PLAN_DEFINITIONS[slug].monthly_generation_limit;
                    return (
                      <td key={slug} className="text-center px-4 py-3.5 text-slate-700 font-semibold">
                        {limit === null ? "무제한" : `${limit.toLocaleString()}회`}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          체험 기간 중 해지하면 비용이 청구되지 않습니다. VAT 별도.
        </p>
      </section>
    </div>
  );
}
