"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface ClickableMetricRowProps {
  label: string;
  count: number;
  total: number;
  href: string;
  colorClass?: string;
  barColorClass?: string;
}

export function ClickableMetricRow({
  label,
  count,
  total,
  href,
  colorClass = "text-slate-700",
  barColorClass = "bg-blue-500",
}: ClickableMetricRowProps) {
  const pct = total > 0 ? Math.min((count / total) * 100, 100) : 0;

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
    >
      <span className={cn("text-xs font-medium w-16 flex-shrink-0 group-hover:text-blue-700 transition-colors", colorClass)}>
        {label}
      </span>

      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", barColorClass)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-slate-600 w-4 text-right tabular-nums group-hover:text-blue-700 transition-colors">
          {count}
        </span>
      </div>
    </Link>
  );
}
