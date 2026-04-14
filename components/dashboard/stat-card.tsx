"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
  description?: string;
  href: string;
  colorClass?: string;
  bgClass?: string;
  icon: React.ReactNode;
}

export function StatCard({
  label,
  value,
  unit = "건",
  description,
  href,
  colorClass = "text-blue-600",
  bgClass = "bg-blue-50",
  icon,
}: StatCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group block bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card",
        "hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", bgClass)}>
          <span className={cn("w-4 h-4", colorClass)}>{icon}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
      </div>

      <div className="flex items-end gap-1.5 mb-1">
        <span className="text-3xl font-bold text-slate-800 leading-none tabular-nums">
          {value}
        </span>
        <span className="text-sm text-slate-400 mb-0.5">{unit}</span>
      </div>

      <p className="text-sm font-medium text-slate-600">{label}</p>
      {description && (
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      )}
    </Link>
  );
}
