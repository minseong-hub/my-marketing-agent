"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  PlusCircle,
  Copy,
  Calendar,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { mockContents as initialContents } from "@/lib/mock-data";
import {
  ContentItem,
  Platform,
  ContentStatus,
  TemplateType,
  PLATFORM_LABELS,
  STATUS_LABELS,
  TEMPLATE_LABELS,
} from "@/lib/types";
import {
  applyFilters,
  getThisMonthContents,
  getTodayUploads,
  getThisWeekScheduled,
} from "@/lib/smart-filters";
import {
  sortByScheduledDate,
  sortByUpdatedAt,
  formatShortDate,
  duplicateContent,
  cn,
} from "@/lib/utils";
import { StatusBadge } from "@/components/contents/status-badge";
import { PlatformBadgeList } from "@/components/contents/platform-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortKey = "scheduledDate" | "updatedAt";

const statusOptions: (ContentStatus | "all")[] = [
  "all", "idea", "drafting", "review", "scheduled", "published",
];
const platformOptions: (Platform | "all")[] = [
  "all", "blog", "instagram", "threads", "tiktok", "openchat",
];
const templateOptions: (TemplateType | "all")[] = [
  "all", "new_product", "review", "info", "comparison",
  "member_benefit", "season_end", "flash_offer", "repurchase",
];

const quickFilters = [
  { key: "today", label: "오늘" },
  { key: "this-week", label: "이번 주" },
  { key: "this-month", label: "이번 달" },
];

function getFilterLabel(searchParams: URLSearchParams): string {
  const quick = searchParams.get("quick");
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const templateType = searchParams.get("templateType");
  const parts: string[] = [];
  if (quick === "today") parts.push("오늘");
  else if (quick === "this-week") parts.push("이번 주");
  else if (quick === "this-month") parts.push("이번 달");
  if (status && status !== "all") parts.push(STATUS_LABELS[status as ContentStatus]);
  if (platform && platform !== "all") parts.push(PLATFORM_LABELS[platform as Platform]);
  if (templateType && templateType !== "all") parts.push(TEMPLATE_LABELS[templateType as TemplateType]);
  return parts.length > 0 ? parts.join(" · ") : "";
}

export default function ContentsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [contents, setContents] = useState<ContentItem[]>(initialContents);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("scheduledDate");
  const [showFilters, setShowFilters] = useState(false);

  // URL params → filter state
  const quickParam = searchParams.get("quick") || "all";
  const statusParam = (searchParams.get("status") || "all") as ContentStatus | "all";
  const platformParam = (searchParams.get("platform") || "all") as Platform | "all";
  const templateParam = (searchParams.get("templateType") || "all") as TemplateType | "all";

  const activeFilterLabel = getFilterLabel(searchParams);
  const hasActiveFilter = quickParam !== "all" || statusParam !== "all" || platformParam !== "all" || templateParam !== "all";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") params.delete(key);
    else params.set(key, value);
    router.push(`/contents?${params.toString()}`);
  }

  function clearAllFilters() {
    router.push("/contents");
  }

  const handleDuplicate = (content: ContentItem) => {
    const newContent = duplicateContent(content);
    setContents((prev) => [newContent, ...prev]);
  };

  const handleStatusChange = (id: string, status: ContentStatus) => {
    setContents((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status, updatedAt: new Date().toISOString().split("T")[0] }
          : c
      )
    );
  };

  const filtered = useMemo(() => {
    let result = applyFilters(contents, {
      quick: quickParam !== "all" ? quickParam : undefined,
      status: statusParam !== "all" ? statusParam : undefined,
      platform: platformParam !== "all" ? platformParam : undefined,
      templateType: templateParam !== "all" ? templateParam : undefined,
    });

    if (search) {
      result = result.filter(
        (c) =>
          c.title.includes(search) ||
          c.productName.includes(search) ||
          c.coreMessage.includes(search)
      );
    }

    return sortKey === "scheduledDate"
      ? sortByScheduledDate(result)
      : sortByUpdatedAt(result);
  }, [contents, quickParam, statusParam, platformParam, templateParam, search, sortKey]);

  return (
    <div className="p-6 max-w-[1200px] mx-auto animate-fade-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">콘텐츠 목록</h1>
          {activeFilterLabel ? (
            <p className="text-sm text-blue-600 font-medium mt-0.5">
              {activeFilterLabel} · {filtered.length}건
            </p>
          ) : (
            <p className="text-sm text-slate-400 mt-0.5">
              전체 {contents.length}건
            </p>
          )}
        </div>
        <Link href="/create">
          <Button>
            <PlusCircle className="w-4 h-4" />
            새 콘텐츠
          </Button>
        </Link>
      </div>

      {/* 검색 + 필터 바 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-5 shadow-card">
        <div className="flex gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="콘텐츠 제목, 상품명으로 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={sortKey}
            onValueChange={(v) => setSortKey(v as SortKey)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduledDate">예정일순</SelectItem>
              <SelectItem value="updatedAt">최근수정순</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            필터
            {hasActiveFilter && (
              <span className="ml-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </div>

        {/* 빠른 필터 칩 */}
        <div className="flex flex-wrap gap-2">
          {quickFilters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => updateParam("quick", quickParam === key ? "all" : key)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                quickParam === key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600"
              )}
            >
              {label}
            </button>
          ))}

          {hasActiveFilter && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-colors"
            >
              <X className="w-3 h-3" />
              필터 초기화
            </button>
          )}
        </div>

        {/* 상세 필터 (토글) */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
            <Select
              value={statusParam}
              onValueChange={(v) => updateParam("status", v)}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="상태 전체" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {s === "all" ? "상태 전체" : STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={platformParam}
              onValueChange={(v) => updateParam("platform", v)}
            >
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="플랫폼 전체" />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map((p) => (
                  <SelectItem key={p} value={p} className="text-xs">
                    {p === "all" ? "플랫폼 전체" : PLATFORM_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={templateParam}
              onValueChange={(v) => updateParam("templateType", v)}
            >
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="유형 전체" />
              </SelectTrigger>
              <SelectContent>
                {templateOptions.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    {t === "all" ? "유형 전체" : TEMPLATE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* 콘텐츠 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">검색 결과가 없어요</p>
            <p className="text-xs text-slate-400 mt-1">
              다른 검색어나 필터를 시도해보세요
            </p>
            {hasActiveFilter && (
              <button
                onClick={clearAllFilters}
                className="mt-3 text-xs text-blue-600 underline"
              >
                필터 초기화
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 tracking-wide">
                  콘텐츠
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 hidden md:table-cell">
                  유형
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400">
                  플랫폼
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400">
                  예정일
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400">
                  상태
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400">
                  액션
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((content, idx) => (
                <tr
                  key={content.id}
                  className={cn(
                    "group hover:bg-slate-50/70 transition-colors",
                    idx < filtered.length - 1 && "border-b border-slate-50"
                  )}
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/contents/${content.id}`}
                      className="block"
                    >
                      <p className="text-sm font-medium text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-1">
                        {content.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {content.productName}
                      </p>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-xs text-slate-500 bg-slate-100 rounded-lg px-2 py-1">
                      {TEMPLATE_LABELS[content.templateType]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <PlatformBadgeList
                      platforms={content.platforms}
                      maxShow={2}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatShortDate(content.scheduledDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Select
                      value={content.status}
                      onValueChange={(v) =>
                        handleStatusChange(content.id, v as ContentStatus)
                      }
                    >
                      <SelectTrigger className="w-auto h-7 border-none shadow-none p-0 focus:ring-0 bg-transparent">
                        <StatusBadge status={content.status} showDot />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions
                          .filter((s) => s !== "all")
                          .map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {STATUS_LABELS[s as ContentStatus]}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDuplicate(content)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      복제
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
