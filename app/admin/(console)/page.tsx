import { db } from "@/lib/db";
import { PageHeader, Stat, Card, Badge } from "@/components/admin/ui";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default async function AdminDashboard() {
  const users = db.listUsers();
  const activeUsers = users.filter((u) => u.status === "active").length;
  const suspended = users.filter((u) => u.status === "suspended").length;
  const subs = db.listSubscriptions();
  const activeSubs = subs.filter((s) => s.status === "active");
  const mrr = activeSubs.reduce((sum, s) => sum + (s.amount || 0), 0);
  const tickets = db.listTickets();
  const openTickets = tickets.filter((t) => t.status !== "closed").length;
  const logs = db.listAdminLogs(8);

  return (
    <>
      <PageHeader
        title="대시보드"
        description="플랫폼 전체 현황 및 최근 활동 요약"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="전체 사용자" value={users.length} sub={`활성 ${activeUsers} · 정지 ${suspended}`} tone="blue" />
        <Stat label="활성 구독" value={activeSubs.length} sub={`전체 ${subs.length}`} tone="emerald" />
        <Stat label="월 예상 매출 (MRR)" value={`₩${mrr.toLocaleString()}`} sub="활성 구독 합계" tone="violet" />
        <Stat label="미처리 문의" value={openTickets} sub={`전체 ${tickets.length}`} tone="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">최근 관리자 활동</h2>
            <Link
              href="/admin/settings"
              className="text-xs font-semibold text-blue-600 hover:text-blue-500 inline-flex items-center gap-1"
            >
              전체 보기 <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {logs.length === 0 && (
              <li className="py-8 text-center text-sm text-slate-400">기록된 활동이 없습니다.</li>
            )}
            {logs.map((l) => (
              <li key={l.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{l.action}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {l.admin_email}
                    {l.target_type && ` · ${l.target_type}:${l.target_id ?? ""}`}
                  </div>
                </div>
                <div className="text-xs text-slate-400 shrink-0">{l.created_at}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">빠른 이동</h2>
          <div className="space-y-2">
            {[
              { href: "/admin/users", label: "사용자 관리" },
              { href: "/admin/subscriptions", label: "결제/구독 관리" },
              { href: "/admin/plans", label: "요금제 편집" },
              { href: "/admin/support", label: "문의 처리" },
              { href: "/admin/notices", label: "공지/배너" },
            ].map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-slate-100"
              >
                <span className="font-medium">{q.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">시스템 상태</span>
            <Badge tone="emerald">정상</Badge>
          </div>
        </Card>
      </div>
    </>
  );
}
