"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, LogOut, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOOLS } from "@/lib/tools-config";

interface AppSidebarProps {
  brandDisplayName: string;
  userName: string;
}

function SSymbol({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="s-sidebar-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#s-sidebar-grad)" />
      <path
        d="M30 16H20a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h8a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H18"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getActiveTool(pathname: string) {
  return TOOLS.find((tool) =>
    tool.navItems.some((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href)
    )
  );
}

export function AppSidebar({ brandDisplayName, userName }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const activeTool = getActiveTool(pathname);
  const navItems = activeTool?.navItems ?? [];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="w-[220px] min-h-screen bg-white/80 backdrop-blur-sm border-r border-slate-200/50 flex flex-col flex-shrink-0 shadow-sm">
      {/* 브랜드 로고 */}
      <div className="px-5 pt-6 pb-5">
        <Link href="/app" className="flex items-center gap-2.5 group">
          <SSymbol size={32} />
          <div>
            <p className="text-sm font-bold text-slate-800 leading-none">
              {brandDisplayName}
            </p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5 font-medium tracking-wide">
              SIMPLE LAB
            </p>
          </div>
        </Link>
      </div>

      {/* 구분선 */}
      <div className="mx-4 h-px bg-slate-200/60 mb-2" />

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {/* 도구 선택 */}
        <Link
          href="/app/select-tool"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all",
            pathname === "/app/select-tool"
              ? "bg-blue-600/10 text-blue-700 font-semibold"
              : "text-slate-500 hover:bg-blue-50 hover:text-slate-800 font-medium"
          )}
        >
          <LayoutGrid className={cn("w-4 h-4 flex-shrink-0", pathname === "/app/select-tool" ? "text-blue-600" : "text-slate-400")} />
          <span className="truncate">도구 선택</span>
          {pathname === "/app/select-tool" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
        </Link>

        {/* 현재 툴의 per-tool 네비게이션 */}
        {navItems.length > 0 && (
          <>
            <div className="mx-1 h-px bg-slate-200/60 my-1.5" />
            {activeTool && (
              <p className="px-3 pt-1 pb-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                {activeTool.nameEn}
              </p>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all",
                    isActive
                      ? "bg-blue-600/10 text-blue-700 font-semibold"
                      : "text-slate-500 hover:bg-blue-50 hover:text-slate-800 font-medium"
                  )}
                >
                  <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
                  <span className="truncate">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* 하단 */}
      <div className="px-3 pb-5 space-y-1">
        <div className="mx-1 h-px bg-slate-200/60 mb-2" />

        {/* 설정 */}
        <Link
          href="/app/settings"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all font-medium",
            pathname === "/app/settings"
              ? "bg-blue-600/10 text-blue-700 font-semibold"
              : "text-slate-500 hover:bg-blue-50 hover:text-slate-800"
          )}
        >
          <Settings className={cn("w-4 h-4", pathname === "/app/settings" ? "text-blue-600" : "text-slate-400")} />
          <span>설정</span>
          {pathname === "/app/settings" && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
        </Link>

        {/* 사용자 + 로그아웃 */}
        <div className="px-3 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200/50 mt-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            로그인 계정
          </p>
          <p className="text-xs text-slate-600 font-medium truncate mb-2">
            {userName}
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
          >
            <LogOut className="w-3 h-3" />
            로그아웃
          </button>
        </div>
      </div>
    </aside>
  );
}
