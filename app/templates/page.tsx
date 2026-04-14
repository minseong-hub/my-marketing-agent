"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BarChart2, BookOpen } from "lucide-react";
import { mockTemplates } from "@/lib/mock-data";
import { Template } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const platformTabs = [
  { key: "blogTemplate", label: "블로그", emoji: "📝" },
  { key: "instagramTemplate", label: "인스타", emoji: "📸" },
  { key: "threadsTemplate", label: "스레드", emoji: "🧵" },
  { key: "tiktokTemplate", label: "틱톡", emoji: "🎵" },
  { key: "openchatTemplate", label: "오픈채팅", emoji: "💬" },
] as const;

type TemplateKey = typeof platformTabs[number]["key"];

const usageColors = (count: number, max: number) => {
  const pct = max > 0 ? count / max : 0;
  if (pct > 0.7) return "bg-blue-500";
  if (pct > 0.4) return "bg-blue-400";
  return "bg-slate-300";
};

export default function TemplatesPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const maxUsage = Math.max(...mockTemplates.map((t) => t.usageCount));

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">템플릿 관리</h1>
        <p className="text-sm text-slate-400 mt-0.5">콘텐츠 유형별 기본 구조와 플레이스홀더를 확인하세요</p>
      </div>

      {/* 사용 현황 */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-semibold text-slate-700">템플릿 사용 현황</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...mockTemplates]
              .sort((a, b) => b.usageCount - a.usageCount)
              .slice(0, 4)
              .map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-50 rounded-xl p-3.5 border border-slate-100"
                >
                  <p className="text-xs text-slate-500 mb-1 truncate">{t.name}</p>
                  <div className="flex items-end gap-1 mb-2">
                    <p className="text-xl font-bold text-slate-800 leading-none tabular-nums">
                      {t.usageCount}
                    </p>
                    <p className="text-xs text-slate-400 mb-0.5">회</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1">
                    <div
                      className={cn("h-1 rounded-full transition-all", usageColors(t.usageCount, maxUsage))}
                      style={{ width: `${(t.usageCount / maxUsage) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* 템플릿 목록 */}
      <div className="space-y-2.5">
        {mockTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isExpanded={expanded === template.id}
            onToggle={() => setExpanded(expanded === template.id ? null : template.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  isExpanded,
  onToggle,
}: {
  template: Template;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={cn(
      "bg-white rounded-2xl border transition-all",
      isExpanded
        ? "border-blue-200 shadow-card-hover"
        : "border-slate-200/80 shadow-card hover:border-slate-300"
    )}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
            isExpanded ? "bg-blue-100" : "bg-slate-100"
          )}>
            <BookOpen className={cn("w-4 h-4", isExpanded ? "text-blue-600" : "text-slate-400")} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{template.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{template.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400">사용 횟수</p>
            <p className="text-sm font-bold text-blue-600">{template.usageCount}회</p>
          </div>
          <div className={cn("transition-colors", isExpanded ? "text-blue-500" : "text-slate-300")}>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100/50">
              <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide mb-1">사용 목적</p>
              <p className="text-xs text-slate-700">{template.purpose}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">플레이스홀더</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {"{{productName}} {{hook}} {{coreMessage}} {{cta}} 등"}
              </p>
            </div>
          </div>

          <Tabs defaultValue="blogTemplate">
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
              {platformTabs.map(({ key, label, emoji }) => (
                <TabsTrigger key={key} value={key} className="text-xs gap-1">
                  {emoji} {label}
                </TabsTrigger>
              ))}
            </TabsList>
            {platformTabs.map(({ key }) => (
              <TabsContent key={key} value={key}>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mt-1">
                  <pre className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed font-mono">
                    {template[key]}
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}
