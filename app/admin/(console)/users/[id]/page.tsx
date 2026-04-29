import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader, Card, Badge } from "@/components/admin/ui";
import { UserEditForm } from "./user-edit-form";

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const user = db.getUserById(id);
  if (!user) notFound();
  const plans = db.listPlans();

  return (
    <>
      <div className="mb-2">
        <Link href="/admin/users" className="text-sm text-slate-500 hover:text-blue-600">
          ← 사용자 목록
        </Link>
      </div>
      <PageHeader title={user.email} description={`ID ${user.id}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900 mb-4">계정 편집</h2>
          <UserEditForm user={user} plans={plans} />
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">요약</h2>
          <dl className="space-y-3 text-base">
            <div className="flex justify-between">
              <dt className="text-slate-500">이름</dt>
              <dd className="font-medium text-slate-900">{user.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">사업자명</dt>
              <dd className="font-medium text-slate-900">{user.business_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">브랜드</dt>
              <dd className="font-medium text-slate-900">{user.brand_display_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">역할</dt>
              <dd>{user.role === "admin" ? <Badge tone="violet">admin</Badge> : <Badge>user</Badge>}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">상태</dt>
              <dd>
                {user.status === "active" ? (
                  <Badge tone="emerald">active</Badge>
                ) : (
                  <Badge tone="rose">{user.status}</Badge>
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">가입일</dt>
              <dd className="text-slate-700">{user.created_at}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </>
  );
}
