import { db } from "@/lib/db";
import Link from "next/link";
import { PageHeader, Card, Table, Th, Td, Badge } from "@/components/admin/ui";
import { PLAN_DEFINITIONS, PlanSlug, formatKRW } from "@/lib/plans";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string; status?: string; plan?: string };
}) {
  const sp = searchParams;
  const users = db.listUsers(sp.q, sp.role, sp.status);
  const planFiltered = sp.plan
    ? users.filter((u) => (u.plan_slug ?? "") === sp.plan)
    : users;

  return (
    <>
      <PageHeader title="사용자" description="계정 · 요금제 · 체험 · 결제 상태" />

      <Card className="mb-4">
        <form className="p-4 flex flex-wrap items-center gap-2">
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="이메일 / 이름 / 사업자명"
            className="flex-1 min-w-[220px] h-9 px-3 rounded-lg border border-slate-200 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
          <select name="role" defaultValue={sp.role ?? ""} className="h-9 px-3 rounded-lg border border-slate-200 text-base bg-white">
            <option value="">역할 전체</option>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <select name="status" defaultValue={sp.status ?? ""} className="h-9 px-3 rounded-lg border border-slate-200 text-base bg-white">
            <option value="">계정 상태 전체</option>
            <option value="active">active</option>
            <option value="suspended">suspended</option>
          </select>
          <select name="plan" defaultValue={sp.plan ?? ""} className="h-9 px-3 rounded-lg border border-slate-200 text-base bg-white">
            <option value="">플랜 전체</option>
            <option value="starter">Starter</option>
            <option value="growth">Growth</option>
            <option value="pro">Pro</option>
          </select>
          <button type="submit" className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold">
            검색
          </button>
        </form>
      </Card>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>이메일</Th>
              <Th>이름 / 브랜드</Th>
              <Th>가입 경로</Th>
              <Th>역할</Th>
              <Th>플랜</Th>
              <Th>결제 상태</Th>
              <Th>약관 동의</Th>
              <Th>가입일</Th>
              <Th className="text-right">관리</Th>
            </tr>
          </thead>
          <tbody>
            {planFiltered.length === 0 && (
              <tr>
                <Td colSpan={9} className="text-center text-slate-400">조건에 맞는 사용자가 없습니다.</Td>
              </tr>
            )}
            {planFiltered.map((u) => {
              const def = u.plan_slug ? PLAN_DEFINITIONS[u.plan_slug as PlanSlug] : null;
              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <Td className="font-medium text-slate-900">{u.email}</Td>
                  <Td>
                    <div className="text-slate-900">{u.name}</div>
                    <div className="text-sm text-slate-500">{u.brand_display_name}</div>
                  </Td>
                  <Td><AuthProviderBadge provider={u.auth_provider} /></Td>
                  <Td>
                    {u.role === "admin" ? <Badge tone="violet">admin</Badge> : <Badge>user</Badge>}
                  </Td>
                  <Td>
                    {def ? (
                      <div>
                        <div className="text-base font-semibold text-slate-900">{def.name}</div>
                        <div className="text-[15px] text-slate-500">{formatKRW(def.price_monthly)}/월</div>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">미가입</span>
                    )}
                  </Td>
                  <Td><PlanStatusBadge status={u.plan_status} /></Td>
                  <Td className="text-sm">
                    <div className="space-y-0.5">
                      {u.terms_agreed_at ? (
                        <div className="text-emerald-600">이용약관 {u.terms_agreed_at.slice(0, 10)}</div>
                      ) : (
                        <div className="text-slate-400">이용약관 미동의</div>
                      )}
                      {u.privacy_agreed_at ? (
                        <div className="text-emerald-600">개인정보 {u.privacy_agreed_at.slice(0, 10)}</div>
                      ) : (
                        <div className="text-slate-400">개인정보 미동의</div>
                      )}
                      {u.marketing_consent ? (
                        <div className="text-blue-500">마케팅 수신</div>
                      ) : null}
                    </div>
                  </Td>
                  <Td className="text-sm text-slate-500">{u.created_at?.slice(0, 10)}</Td>
                  <Td className="text-right">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-500"
                    >
                      상세
                    </Link>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </>
  );
}

function AuthProviderBadge({ provider }: { provider: string }) {
  if (provider === "google") return <Badge tone="rose">Google</Badge>;
  if (provider === "kakao") return <Badge tone="amber">카카오</Badge>;
  return <Badge>이메일</Badge>;
}

function PlanStatusBadge({ status }: { status: string }) {
  if (status === "trialing") return <Badge tone="blue">trialing</Badge>;
  if (status === "active") return <Badge tone="emerald">active</Badge>;
  if (status === "past_due") return <Badge tone="amber">past_due</Badge>;
  if (status === "canceled") return <Badge tone="rose">canceled</Badge>;
  return <Badge>none</Badge>;
}
