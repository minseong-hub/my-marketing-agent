import { db } from "@/lib/db";
import { PageHeader, Card, Badge } from "@/components/admin/ui";
import { PlansManager } from "./plans-manager";
import { PLAN_TOOL_META } from "@/lib/plans";

export default async function PlansPage() {
  const plans = db.listPlans();
  const toolOptions = Object.entries(PLAN_TOOL_META).map(([id, meta]) => ({
    id,
    label: meta.label,
  }));

  return (
    <>
      <PageHeader
        title="요금제"
        description={
          <span>
            Starter / Growth / Pro — 트라이얼 · 첫결제 할인 · 도구 접근 설정
            <Badge tone="blue">소유자 전용</Badge>
          </span>
        }
      />
      <Card className="p-6">
        <PlansManager
          toolOptions={toolOptions}
          initial={plans.map((p) => ({
            ...p,
            features: safeParse<string[]>(p.features, []),
            tools: safeParse<string[]>(p.tools, []),
          }))}
        />
      </Card>
    </>
  );
}

function safeParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
