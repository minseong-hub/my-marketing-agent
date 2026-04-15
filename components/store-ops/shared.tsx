"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function PageShell({
  icon: Icon,
  title,
  subtitle,
  eyebrow = "Store Operations",
  action,
  children,
  maxWidth = "1200px",
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="p-6 mx-auto" style={{ maxWidth }}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="relative w-11 h-11 rounded-xl bg-[#0047CC] flex items-center justify-center shadow-md shadow-[#0047CC]/30 ring-1 ring-inset ring-white/10">
            <span className="absolute inset-x-2 top-1 h-px bg-white/20" />
            <Icon className="w-5 h-5 text-white relative" strokeWidth={2.4} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-[#0047CC] uppercase tracking-[0.22em] mb-0.5">
              {eyebrow}
            </p>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </motion.div>
      {children}
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200/80 shadow-sm rounded-2xl",
        hover && "hover:border-blue-300 hover:shadow-md hover:shadow-blue-600/5 transition-all",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-600/20 transition-colors"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-600 text-xs font-semibold transition-colors"
    >
      {children}
    </button>
  );
}

export const TONE = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" },
  slate: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
} as const;

export type ToneKey = keyof typeof TONE;

export function Pill({
  tone = "slate",
  children,
}: {
  tone?: ToneKey;
  children: ReactNode;
}) {
  const t = TONE[tone];
  return (
    <span className={cn("inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border", t.bg, t.text, t.border)}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, tone = "blue" }: { value: number; tone?: ToneKey }) {
  const t = TONE[tone];
  return (
    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all", t.dot)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function RelatedTools({
  items,
}: {
  items: { label: string; href: string; hint?: string }[];
}) {
  return (
    <div className="mt-8 border-t border-slate-200/80 pt-5">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-3">
        연계 도구
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {items.map((i) => (
          <a
            key={i.href}
            href={i.href}
            className="block p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-colors group"
          >
            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
              {i.label} →
            </p>
            {i.hint && <p className="text-[10px] text-slate-500 mt-1">{i.hint}</p>}
          </a>
        ))}
      </div>
    </div>
  );
}
