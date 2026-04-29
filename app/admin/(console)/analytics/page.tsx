import { db } from "@/lib/db";
import { PageHeader, Card, Stat, Badge } from "@/components/admin/ui";
import { PLAN_DEFINITIONS, PlanSlug, formatKRW } from "@/lib/plans";

function buildDummySeries(days = 14) {
  const out: { date: string; value: number }[] = [];
  const base = 30;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const noise = Math.round((Math.sin(i * 1.3) * 0.5 + 0.6) * 25);
    out.push({
      date: d.toISOString().slice(5, 10),
      value: Math.max(3, base + noise + (days - i) * 2),
    });
  }
  return out;
}

export default async function AnalyticsPage() {
  const users = db.countUsers();
  const summary = db.getBillingSummary();
  const dau = buildDummySeries(14);
  const max = Math.max(...dau.map((d) => d.value));
  const totalUse = dau.reduce((s, d) => s + d.value, 0);

  const planDist: Record<PlanSlug, number> = { free: 0, starter: 0, growth: 0, pro: 0 };
  for (const row of summary.planDist) {
    if (row.slug in planDist) planDist[row.slug as PlanSlug] = row.c;
  }
  const planTotal = Math.max(1, Object.values(planDist).reduce((a, b) => a + b, 0));

  const toolUsage = [
    { name: "SNS 마케팅", value: 38 },
    { name: "상세페이지", value: 24 },
    { name: "광고", value: 19 },
    { name: "온라인스토어", value: 9 },
    { name: "마진/수익", value: 6 },
    { name: "CRM", value: 4 },
  ];
  const toolMax = Math.max(...toolUsage.map((t) => t.value));

  return (
    <>
      <PageHeader
        title="사용 분석"
        description="실시간 결제 지표 + 모의 사용 지표(DAU/툴 사용량)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Stat label="총 가입자" value={users} tone="blue" sub="전체 누적" />
        <Stat label="활성 MRR" value={formatKRW(summary.mrr)} tone="emerald" sub="결제중 합계" />
        <Stat label="체험중" value={summary.trialCount} tone="amber" sub="trialing" />
        <Stat label="최근 30일 매출" value={formatKRW(summary.revenue30d)} tone="violet" sub="결제 성공" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {(Object.keys(planDist) as PlanSlug[]).map((slug) => {
          const def = PLAN_DEFINITIONS[slug];
          const count = planDist[slug];
          const pct = (count / planTotal) * 100;
          return (
            <Card key={slug} className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-base font-bold text-slate-900">{def.name}</div>
                <span className="text-sm font-semibold text-slate-500">{pct.toFixed(0)}%</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{count}명</div>
              <div className="text-sm text-slate-500 mt-1">
                {formatKRW(def.price_monthly)}/월 · 추정 MRR {formatKRW(def.price_monthly * count)}
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">DAU (지난 14일)</h2>
          <Badge tone="blue">dummy</Badge>
        </div>
        <div className="flex items-end gap-1.5 h-40">
          {dau.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400"
                style={{ height: `${(d.value / max) * 100}%` }}
              />
              <div className="text-[14px] text-slate-400">{d.date}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-sm text-slate-500">합계 {totalUse.toLocaleString()} 세션</div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">툴별 사용 비중 (%)</h2>
          <div className="space-y-3">
            {toolUsage.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">{t.name}</span>
                  <span className="text-slate-500">{t.value}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${(t.value / toolMax) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">결제 요약</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-base">
            <dt className="text-slate-500">활성 구독</dt>
            <dd className="font-bold text-slate-900 text-right">{summary.activeCount}</dd>
            <dt className="text-slate-500">체험중</dt>
            <dd className="font-bold text-slate-900 text-right">{summary.trialCount}</dd>
            <dt className="text-slate-500">해지 누적</dt>
            <dd className="font-bold text-slate-900 text-right">{summary.canceledCount}</dd>
            <dt className="text-slate-500">MRR</dt>
            <dd className="font-bold text-slate-900 text-right">{formatKRW(summary.mrr)}</dd>
            <dt className="text-slate-500">30일 결제 수익</dt>
            <dd className="font-bold text-slate-900 text-right">{formatKRW(summary.revenue30d)}</dd>
          </dl>
        </Card>
      </div>
    </>
  );
}
