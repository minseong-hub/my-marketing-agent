import { db } from "@/lib/db";
import { PageHeader, Card, Table, Th, Td, Badge } from "@/components/admin/ui";
import { SubRow } from "./sub-row";

export default async function SubscriptionsPage() {
  const subs = db.listSubscriptions();
  const plans = db.listPlans();

  const mrr = subs.filter((s) => s.status === "active").reduce((s, x) => s + x.amount, 0);
  const pastDue = subs.filter((s) => s.status === "past_due").length;
  const canceled = subs.filter((s) => s.status === "canceled").length;

  return (
    <>
      <PageHeader title="결제 / 구독" description="구독 상태 조회 및 수동 갱신/해지" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="text-xs font-semibold text-slate-500 mb-1">활성 MRR</div>
          <div className="text-2xl font-extrabold text-slate-900">₩{mrr.toLocaleString()}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold text-slate-500 mb-1">연체</div>
          <div className="text-2xl font-extrabold text-slate-900">{pastDue}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold text-slate-500 mb-1">해지</div>
          <div className="text-2xl font-extrabold text-slate-900">{canceled}</div>
        </Card>
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>사용자</Th>
              <Th>요금제</Th>
              <Th>금액</Th>
              <Th>상태</Th>
              <Th>시작</Th>
              <Th>다음 결제</Th>
              <Th className="text-right">관리</Th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && (
              <tr>
                <Td className="text-center text-slate-400" >구독 내역이 없습니다.</Td>
                <Td></Td><Td></Td><Td></Td><Td></Td><Td></Td><Td></Td>
              </tr>
            )}
            {subs.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900">{(s as any).user_email ?? s.user_id}</Td>
                <Td>{(s as any).plan_name ?? "-"}</Td>
                <Td>₩{s.amount.toLocaleString()}</Td>
                <Td>
                  {s.status === "active" && <Badge tone="emerald">active</Badge>}
                  {s.status === "past_due" && <Badge tone="amber">past_due</Badge>}
                  {s.status === "canceled" && <Badge tone="rose">canceled</Badge>}
                  {s.status === "paused" && <Badge>paused</Badge>}
                </Td>
                <Td className="text-xs text-slate-500">{s.started_at?.slice(0, 10)}</Td>
                <Td className="text-xs text-slate-500">{s.next_billing_at?.slice(0, 10) ?? "-"}</Td>
                <Td className="text-right">
                  <SubRow id={s.id} status={s.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <p className="text-xs text-slate-400 mt-4">
        ※ 요금제 수동 변경은 [사용자 상세]에서 할 수 있습니다. 총 {plans.length}개 요금제 등록됨.
      </p>
    </>
  );
}
