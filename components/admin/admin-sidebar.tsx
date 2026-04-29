"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Boxes,
  LifeBuoy,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "사용자", icon: Users },
  { href: "/admin/billing", label: "결제 관리", icon: Wallet },
  { href: "/admin/subscriptions", label: "구독 내역", icon: CreditCard },
  { href: "/admin/plans", label: "요금제", icon: Boxes },
  { href: "/admin/support", label: "고객지원", icon: LifeBuoy },
  { href: "/admin/notices", label: "공지/배너", icon: Megaphone },
  { href: "/admin/analytics", label: "사용 분석", icon: BarChart3 },
  { href: "/admin/settings", label: "시스템 설정", icon: Settings },
];

export function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 leading-none">Admin Console</div>
            <div className="text-[14px] text-slate-400 mt-1">Simple Lab</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-base transition-colors " +
                (active
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
              }
            >
              <Icon className={"w-4 h-4 " + (active ? "text-blue-600" : "text-slate-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-100">
        <div className="text-[15px] text-slate-400 mb-2">로그인 계정</div>
        <div className="text-sm font-medium text-slate-700 mb-3 truncate">{adminEmail}</div>
        <button
          onClick={logout}
          className="w-full inline-flex items-center justify-center gap-1.5 h-8 rounded-lg text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
