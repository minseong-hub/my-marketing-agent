import { db } from "@/lib/db";
import { PageHeader, Card, Stat, Badge, Table, Th, Td } from "@/components/admin/ui";
import { PLAN_DEFINITIONS, PlanSlug, formatKRW } from "@/lib/plans";

export default async function AdminBillingPage() {
  const summary = db.getBillingSummary();
  const events = db.listBillingEvents(undefined, 100);
  const subs = db.listSubscriptions();

  const dist: Record<PlanSlug, number> = { starter: 0, growth: 0, pro: 0 };
  for (const row of summary.planDist) {
    if (row.slug in dist) dist[row.slug as PlanSlug] = row.c;
  }

  return (
    <>
      <PageHeader
        title="결제 관리"
        description="실시간 MRR · 체험 · 해지 및 모의 결제 이벤트 로그"
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Stat label="활성 MRR" value={formatKRW(summary.mrr)} tone="blue" sub="현재 결제중" />
        <Stat label="최근 30일 매출" value={formatKRW(summary.revenue30d)} tone="emerald" sub="결제 성공 합계" />
        <Stat label="체험중 사용자" value={summary.trialCount} tone="amber" sub="trialing" />
        <Stat label="해지 누적" value={summary.canceledCount} tone="rose" sub="canceled" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {(Object.keys(dist) as PlanSlug[]).map((slug) => {
          const def = PLAN_DEFINITIONS[slug];
          return (
            <Card key={slug} className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-slate-900">{def.name}</div>
                <Badge tone="blue">{formatKRW(def.price_monthly)}</Badge>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{dist[slug]}</div>
              <div className="text-xs text-slate-500 mt-1">활성 + 체험 사용자 수</div>
              <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{
                    width: `${Math.min(
                      100,
                      (dist[slug] / Math.max(1, summary.activeCount + summary.trialCount)) * 100
                    )}%`,
                  }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">활성 구독</h2>
          <span className="text-xs text-slate-400">{subs.length}건</span>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>사용자</Th>
              <Th>플랜</Th>
              <Th>상태</Th>
              <Th>금액</Th>
              <Th>시작</Th>
              <Th>다음 결제</Th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && (
              <tr>
                <Td colSpan={6} className="text-center text-slate-400">구독 내역 없음</Td>
              </tr>
            )}
            {subs.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900">{(s as any).user_email ?? s.user_id}</Td>
                <Td>{(s as any).plan_name ?? "-"}</Td>
                <Td>
                  {s.status === "active" && <Badge tone="emerald">active</Badge>}
                  {s.status === "past_due" && <Badge tone="amber">past_due</Badge>}
                  {s.status === "canceled" && <Badge tone="rose">canceled</Badge>}
                  {s.status === "trialing" && <Badge tone="blue">trialing</Badge>}
                </Td>
                <Td>{formatKRW(s.amount)}</Td>
                <Td className="text-xs text-slate-500">{s.started_at?.slice(0, 10)}</Td>
                <Td className="text-xs text-slate-500">{s.next_billing_at?.slice(0, 10) ?? "-"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">결제 이벤트 로그</h2>
          <span className="text-xs text-slate-400">최근 100건 · mock</span>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>시각</Th>
              <Th>사용자</Th>
              <Th>유형</Th>
              <Th>플랜</Th>
              <Th className="text-right">금액</Th>
              <Th>메모</Th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr>
                <Td colSpan={6} className="text-center text-slate-400">이벤트 없음</Td>
              </tr>
            )}
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <Td className="text-xs text-slate-500">{e.created_at.slice(0, 16)}</Td>
                <Td className="font-medium text-slate-900">{e.user_email ?? e.user_id}</Td>
                <Td>
                  <EventBadge kind={e.kind} />
                </Td>
                <Td>{e.plan_slug ? PLAN_DEFINITIONS[e.plan_slug as PlanSlug]?.name ?? e.plan_slug : "-"}</Td>
                <Td className="text-right font-semibold">{e.amount > 0 ? formatKRW(e.amount) : "-"}</Td>
                <Td className="text-xs text-slate-500">{e.note ?? ""}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}

function EventBadge({ kind }: { kind: string }) {
  if (kind === "payment_success") return <Badge tone="emerald">결제 완료</Badge>;
  if (kind === "trial_started") return <Badge tone="blue">체험 시작</Badge>;
  if (kind === "canceled") return <Badge tone="rose">해지</Badge>;
  if (kind === "plan_changed") return <Badge tone="violet">플랜 변경</Badge>;
  return <Badge>{kind}</Badge>;
}
