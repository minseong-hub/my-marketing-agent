"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  PlusCircle,
  LayoutTemplate,
  MessageCircle,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/calendar", label: "콘텐츠 캘린더", icon: CalendarDays },
  { href: "/contents", label: "콘텐츠 목록", icon: FileText },
  { href: "/create", label: "새 콘텐츠 등록", icon: PlusCircle },
  { href: "/templates", label: "템플릿 관리", icon: LayoutTemplate },
  { href: "/openchat", label: "오픈채팅 관리", icon: MessageCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] min-h-screen bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0">
      {/* 브랜드 로고 */}
      <div className="px-5 pt-6 pb-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-none">업플로</p>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5 font-medium tracking-wide">UpFlow</p>
          </div>
        </Link>
      </div>

      {/* 구분선 */}
      <div className="mx-4 h-px bg-slate-100 mb-2" />

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all",
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isActive ? "text-blue-600" : "text-slate-400"
                )}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 하단 브랜드 태그라인 */}
      <div className="px-4 pb-5 pt-3">
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Brand Philosophy
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            가격보다 만족.<br />
            회원에게 먼저.<br />
            맛있는 과일 큐레이션.
          </p>
        </div>
      </div>
    </aside>
  );
}
