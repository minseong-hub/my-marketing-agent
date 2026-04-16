"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  LogOut,
  LayoutGrid,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CreditCard,
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

/** Which group label contains the currently active path */
function activeGroupLabel(groups: Group[], pathname: string): string | null {
  for (const g of groups) {
    const has = g.items.some((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href)
    );
    if (has) return g.label;
  }
  return null;
}

// ── Single nav link
function NavLink({
  href,
  icon: Icon,
  label,
  isActive,
  collapsed,
  indent = false,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-xl text-sm transition-all duration-150 select-none",
        collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-[7px]",
        indent && !collapsed && "pl-[26px]",
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
          collapsed ? "w-[18px] h-[18px]" : "w-[14px] h-[14px]",
          isActive ? "text-blue-500" : "text-slate-400 group-hover:text-slate-600"
        )}
      />

      {!collapsed && <span className="truncate flex-1">{label}</span>}

      {/* Active indicator dot */}
      {!collapsed && isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400/80 flex-shrink-0" />
      )}
    </Link>
  );
}

// ── Accordion group (expandable section)
function AccordionGroup({
  label,
  items,
  isOpen,
  onToggle,
  pathname,
  collapsed,
}: {
  label: string;
  items: NavItem[];
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  collapsed: boolean;
}) {
  const hasActiveChild = items.some((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  );

  // Collapsed sidebar: just show icons, no headers
  if (collapsed) {
    return (
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
              collapsed
            />
          );
        })}
      </div>
    );
  }

  // Single-item group with no label: render directly (no accordion chrome)
  if (!label) {
    return (
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
              collapsed={false}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div>
      {/* Group header button */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-150 select-none",
          "text-[10px] font-bold uppercase tracking-wider",
          hasActiveChild && !isOpen
            ? "text-blue-600 hover:bg-blue-50/60"
            : isOpen
            ? "text-slate-600 hover:bg-slate-100/60"
            : "text-slate-400/80 hover:bg-slate-100/50 hover:text-slate-600"
        )}
      >
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform duration-200 flex-shrink-0",
            isOpen ? "rotate-180" : "rotate-0",
            hasActiveChild && !isOpen ? "text-blue-400" : "text-slate-300"
          )}
        />
      </button>

      {/* Animated children */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="space-y-0.5 pt-0.5 pb-1.5">
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
                    collapsed={false}
                    indent
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  const allGroups = groupNavItems(activeTool?.navItems ?? []);
  // "개요" items (홈) are surfaced at the top level — not inside accordion
  const topItems  = allGroups.find((g) => g.label === "개요")?.items ?? [];
  const groups    = allGroups.filter((g) => g.label !== "개요");
  const showFull  = isMobile || !collapsed;

  // Initialize with the active group open; update when pathname changes
  const [openGroup, setOpenGroup] = useState<string | null>(() =>
    activeGroupLabel(groups, pathname)
  );

  useEffect(() => {
    const active = activeGroupLabel(groups, pathname);
    if (active) setOpenGroup(active);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggleGroup(label: string) {
    setOpenGroup((prev) => (prev === label ? null : label));
  }

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
                UpFlow
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
        {/* Tool home (개요 group — surfaced at top level) */}
        {topItems.map((item) => {
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

        {/* Tool-specific grouped nav (excludes 개요) */}
        {groups.length > 0 && (
          <div className={cn("mt-3", showFull ? "space-y-1" : "space-y-3")}>
            {showFull
              ? groups.map(({ label, items }) => (
                  <AccordionGroup
                    key={label}
                    label={label}
                    items={items}
                    isOpen={openGroup === label}
                    onToggle={() => toggleGroup(label)}
                    pathname={pathname}
                    collapsed={false}
                  />
                ))
              : /* Collapsed: dividers between groups, all icons visible */
                groups.map(({ label, items }, i) => (
                  <div key={label}>
                    {i > 0 && <div className="mx-2 my-1.5 h-px bg-slate-200/50" />}
                    <AccordionGroup
                      label={label}
                      items={items}
                      isOpen={false}
                      onToggle={() => {}}
                      pathname={pathname}
                      collapsed
                    />
                  </div>
                ))}
          </div>
        )}
      </nav>

      {/* ── Divider */}
      <div className="mx-3 h-px bg-slate-200/70 flex-shrink-0" />

      {/* ── Bottom section */}
      <div className="px-2 py-3 space-y-0.5 flex-shrink-0">
        {/* Tool selector — cobalt-blue highlighted */}
        {showFull ? (
          <Link
            href="/app/select-tool"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 select-none mb-1",
              pathname === "/app/select-tool"
                ? "bg-[#0047CC] text-white shadow-md shadow-blue-500/25"
                : "bg-[#0047CC]/[0.07] text-[#0047CC] hover:bg-[#0047CC]/[0.13]"
            )}
          >
            <LayoutGrid
              className={cn(
                "w-[15px] h-[15px] flex-shrink-0",
                pathname === "/app/select-tool" ? "text-white" : "text-[#0047CC]"
              )}
            />
            <span className="flex-1 truncate">도구 선택</span>
            {pathname !== "/app/select-tool" && (
              <ChevronRight className="w-3 h-3 text-[#0047CC]/50 flex-shrink-0" />
            )}
          </Link>
        ) : (
          <Link
            href="/app/select-tool"
            title="도구 선택"
            className={cn(
              "flex items-center justify-center mx-1 py-2.5 rounded-xl transition-all duration-150 mb-1",
              pathname === "/app/select-tool"
                ? "bg-[#0047CC] text-white shadow-md shadow-blue-500/25"
                : "bg-[#0047CC]/[0.07] text-[#0047CC] hover:bg-[#0047CC]/[0.13]"
            )}
          >
            <LayoutGrid className="w-[18px] h-[18px]" />
          </Link>
        )}

        <NavLink
          href="/app/billing"
          icon={CreditCard}
          label="결제 & 구독"
          isActive={pathname.startsWith("/app/billing")}
          collapsed={!showFull}
        />
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
