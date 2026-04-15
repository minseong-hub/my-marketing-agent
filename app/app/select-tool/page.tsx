"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { TOOLS, ToolDefinition } from "@/lib/tools-config";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<ToolDefinition["status"], { label: string; style: string }> = {
  available: { label: "사용 가능", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  beta: { label: "베타", style: "bg-blue-50 text-blue-700 border-blue-200" },
  "coming-soon": { label: "준비 중", style: "bg-slate-100 text-slate-500 border-slate-200" },
};

function Chip({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
      {label}
    </span>
  );
}

function GroupLabel({ label, index }: { label: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="flex items-center gap-3 mt-8 mb-3 first:mt-0"
    >
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.14em] whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </motion.div>
  );
}

function ToolCard({ tool, index, globalIndex }: { tool: ToolDefinition; index: number; globalIndex: number }) {
  const Icon = tool.icon;
  const badge = STATUS_BADGE[tool.status];

  const cardInner = (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: globalIndex * 0.06 }}
      whileHover={{ y: -1, transition: { duration: 0.15 } }}
      className="group relative flex items-start gap-4 px-5 py-4 rounded-2xl border transition-all duration-200 bg-white border-slate-200/80 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-[0_6px_28px_rgba(37,99,235,0.12)]"
    >
      <span className="absolute top-4 right-5 text-[11px] font-bold text-slate-300 tabular-nums select-none">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br shadow-lg", tool.gradient)}>
        <Icon className="w-[18px] h-[18px] text-white" />
      </div>
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-[14px] font-bold leading-snug text-slate-900">{tool.name}</p>
          {tool.status !== "available" && (
            <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", badge.style)}>{badge.label}</span>
          )}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">{tool.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {tool.chips.map((chip) => <Chip key={chip} label={chip} />)}
        </div>
      </div>
      <div className="flex-shrink-0 mt-1 self-center">
        <ArrowRight className="w-4 h-4 transition-all duration-200 text-blue-500 group-hover:text-blue-700 group-hover:translate-x-0.5" />
      </div>
    </motion.div>
  );

  return <Link href={tool.href}>{cardInner}</Link>;
}

export default function SelectToolPage() {
  const groups: { label: string; tools: (ToolDefinition & { globalIndex: number })[] }[] = [];
  let counter = 0;
  for (const tool of TOOLS) {
    let g = groups.find((g) => g.label === tool.group);
    if (!g) { g = { label: tool.group, tools: [] }; groups.push(g); }
    g.tools.push({ ...tool, globalIndex: counter++ });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-50 px-6 py-10">
      <div className="max-w-[680px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.14em]">Simple Lab · 도구 선택</p>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">어떤 도구로 시작할까요?</h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-sm">브랜드 운영에 필요한 도구를 선택하세요.</p>
        </motion.div>
        {groups.map(({ label, tools }) => (
          <div key={label}>
            <GroupLabel label={label} index={tools[0].globalIndex} />
            <div className="space-y-2">
              {tools.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} globalIndex={tool.globalIndex} />)}
            </div>
          </div>
        ))}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-[10px] text-slate-400 mt-10">
          각 도구는 독립적으로 작동하며, 브랜드 프로필을 공유합니다.
        </motion.p>
      </div>
    </div>
  );
}
