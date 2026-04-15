"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Settings,
  LogOut,
  LayoutGrid,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TOOLS, NavItem } from "@/lib/tools-config";

// ── S Symbol
function SSymbol({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id="s-sb-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#s-sb-g)" />
      <path
        d="M30 16H20a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h8a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H18"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Group nav items by `group` key, preserving order
type Group = { label: string; items: NavItem[] };
function groupNavItems(items: NavItem[]): Group[] {
  const map = new Map<string, NavItem[]>();
  for (const item of items) {
    const g = item.group ?? "";
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(item);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

// ── Single nav link
function NavLink({
  href,
  icon: Icon,
  label,
  isActive,
  collapsed,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-xl text-sm transition-all duration-150 select-none",
        collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2",
        isActive
          ? "bg-blue-500/[0.09] text-blue-700 font-semibold"
          : "text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 font-medium"
      )}
    >
      {/* Active left accent bar */}
      {!collapsed && isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-500" />
      )}

      <Icon
        className={cn(
          "flex-shrink-0 transition-colors",
          collapsed ? "w-[18px] h-[18px]" : "w-[15px] h-[15px]",
          isActive
            ? "text-blue-500"
            : "text-slate-400 group-hover:text-slate-600"
        )}
      />

      {!collapsed && (
        <span className="truncate flex-1">{label}</span>
      )}

      {/* Active indicator dot */}
      {!collapsed && isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400/80 flex-shrink-0" />
      )}
    </Link>
  );
}

// ── Sidebar inner content (shared between desktop + mobile drawer)
function SidebarContent({
  brandDisplayName,
  userName,
  pathname,
  collapsed,
  isMobile,
  onCollapse,
  onClose,
  onLogout,
}: {
  brandDisplayName: string;
  userName: string;
  pathname: string;
  collapsed: boolean;
  isMobile: boolean;
  onCollapse: () => void;
  onClose: () => void;
  onLogout: () => void;
}) {
  const activeTool = TOOLS.find((tool) =>
    tool.navItems.some((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href)
    )
  );
  const groups = groupNavItems(activeTool?.navItems ?? []);
  const showFull = isMobile || !collapsed;

  return (
    <div className="flex flex-col h-full">
      {/* ── Header */}
      <div
        className={cn(
          "flex items-center h-[60px] flex-shrink-0 gap-2",
          showFull ? "px-4" : "justify-center px-2"
        )}
      >
        <Link
          href="/app/select-tool"
          className={cn(
            "flex items-center gap-2.5 min-w-0 flex-1",
            !showFull && "flex-initial"
          )}
        >
          <SSymbol size={28} />
          {showFull && (
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-slate-800 leading-none truncate">
                {brandDisplayName}
              </p>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5 font-semibold tracking-widest">
                SIMPLE LAB
              </p>
            </div>
          )}
        </Link>

        {/* Desktop: collapse toggle */}
        {!isMobile && (
          <button
            onClick={onCollapse}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Mobile: close button */}
        {isMobile && (
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Divider */}
      <div className="mx-3 h-px bg-slate-200/70 flex-shrink-0" />

      {/* ── Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {/* Tool selector */}
        <NavLink
          href="/app/select-tool"
          icon={LayoutGrid}
          label="도구 선택"
          isActive={pathname === "/app/select-tool"}
          collapsed={!showFull}
        />

        {/* Tool-specific grouped nav */}
        {groups.length > 0 && (
          <div className="mt-3 space-y-3">
            {groups.map(({ label, items }) => (
              <div key={label}>
                {/* Group label (expanded only) */}
                {label && showFull ? (
                  <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold text-slate-400/80 uppercase tracking-wider">
                    {label}
                  </p>
                ) : label && !showFull ? (
                  <div className="mx-2 my-1.5 h-px bg-slate-200/50" />
                ) : null}

                <div className="space-y-0.5">
                  {items.map((item) => {
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                    return (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        isActive={isActive}
                        collapsed={!showFull}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* ── Divider */}
      <div className="mx-3 h-px bg-slate-200/70 flex-shrink-0" />

      {/* ── Bottom section */}
      <div className="px-2 py-3 space-y-0.5 flex-shrink-0">
        <NavLink
          href="/app/settings"
          icon={Settings}
          label="설정"
          isActive={pathname === "/app/settings"}
          collapsed={!showFull}
        />

        {/* User block */}
        {showFull ? (
          <div className="mt-2 mx-1 p-3 rounded-xl bg-slate-50/80 border border-slate-100/80">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-[10px] font-bold text-white">
                  {userName.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-700 truncate leading-none mb-0.5">
                  {userName}
                </p>
                <p className="text-[10px] text-slate-400 leading-none">로그인됨</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-red-500 transition-colors font-medium"
            >
              <LogOut className="w-3 h-3" />
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <button
              onClick={onLogout}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-[15px] h-[15px]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Props
interface AppSidebarProps {
  brandDisplayName: string;
  userName: string;
}

export function AppSidebar({ brandDisplayName, userName }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-collapse on small screens (< lg)
  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 1024) setCollapsed(true);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }, [router]);

  const sharedProps = {
    brandDisplayName,
    userName,
    pathname,
    onLogout: handleLogout,
    onCollapse: () => setCollapsed((v) => !v),
    onClose: () => setMobileOpen(false),
  };

  return (
    <>
      {/* ── Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col flex-shrink-0 sticky top-0 h-screen",
          "bg-white/75 backdrop-blur-xl",
          "border-r border-slate-200/60",
          "shadow-[1px_0_12px_rgba(15,23,42,0.04)]",
          "transition-[width] duration-250 ease-in-out will-change-[width]",
          collapsed ? "w-[64px]" : "w-[240px]"
        )}
      >
        <SidebarContent {...sharedProps} collapsed={collapsed} isMobile={false} />
      </aside>

      {/* ── Mobile: sticky top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center px-4 gap-3 bg-white/85 backdrop-blur-xl border-b border-slate-200/60">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu className="w-4 h-4" />
        </button>
        <SSymbol size={22} />
        <span className="text-sm font-bold text-slate-800">{brandDisplayName}</span>
      </div>

      {/* ── Mobile: backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[2px]"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Mobile: drawer */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 h-full w-[240px]",
          "bg-white/95 backdrop-blur-xl",
          "border-r border-slate-200/60 shadow-xl",
          "transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent {...sharedProps} collapsed={false} isMobile={true} />
      </aside>
    </>
  );
}
