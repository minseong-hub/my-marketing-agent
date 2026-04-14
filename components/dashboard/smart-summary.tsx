"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SmartGroup } from "@/lib/smart-filters";
import { cn } from "@/lib/utils";

const colorMap: Record<string, { card: string; badge: string; num: string; arrow: string }> = {
  blue: {
    card: "bg-blue-50 border-blue-100 hover:border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    num: "text-blue-700",
    arrow: "text-blue-400 group-hover:text-blue-600",
  },
  violet: {
    card: "bg-violet-50 border-violet-100 hover:border-violet-200",
    badge: "bg-violet-100 text-violet-700",
    num: "text-violet-700",
    arrow: "text-violet-400 group-hover:text-violet-600",
  },
  amber: {
    card: "bg-amber-50 border-amber-100 hover:border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    num: "text-amber-700",
    arrow: "text-amber-400 group-hover:text-amber-600",
  },
  rose: {
    card: "bg-rose-50 border-rose-100 hover:border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    num: "text-rose-700",
    arrow: "text-rose-400 group-hover:text-rose-600",
  },
};

interface SmartSummaryGridProps {
  groups: SmartGroup[];
}

export function SmartSummaryGrid({ groups }: SmartSummaryGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {groups.map((group) => {
        const colors = colorMap[group.color] ?? colorMap.blue;
        return (
          <Link
            key={group.id}
            href={group.href}
            className={cn(
              "group block rounded-2xl border p-4 transition-all duration-200 cursor-pointer",
              "hover:shadow-card-hover hover:-translate-y-0.5",
              colors.card
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                  colors.badge
                )}
              >
                {group.iconLabel}
              </span>
              <ArrowRight
                className={cn("w-4 h-4 transition-all group-hover:translate-x-0.5", colors.arrow)}
              />
            </div>
            <p className={cn("text-2xl font-bold leading-none mb-1.5 tabular-nums", colors.num)}>
              {group.items.length}
              <span className="text-sm font-medium ml-0.5">건</span>
            </p>
            <p className="text-xs font-semibold text-slate-700 leading-snug">
              {group.label}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              {group.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
