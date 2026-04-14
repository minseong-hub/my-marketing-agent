"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ContentItem } from "@/lib/types";
import { formatShortDate, TEMPLATE_LABELS } from "@/lib/utils";
import { StatusBadge } from "@/components/contents/status-badge";
import { PlatformBadgeList } from "@/components/contents/platform-badge";

interface ContentPreviewRowProps {
  content: ContentItem;
  basePath?: string;
}

export function ContentPreviewRow({ content, basePath = "/app" }: ContentPreviewRowProps) {
  return (
    <Link
      href={`${basePath}/contents/${content.id}`}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
    >
      {/* 날짜 뱃지 */}
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
        <span className="text-[10px] font-semibold text-slate-400 leading-none group-hover:text-blue-400">
          {formatShortDate(content.scheduledDate).split("/")[0]}월
        </span>
        <span className="text-sm font-bold text-slate-600 leading-none group-hover:text-blue-600">
          {formatShortDate(content.scheduledDate).split("/")[1]}
        </span>
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-700 transition-colors leading-snug">
          {content.title}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs text-slate-400 truncate">
            {content.productName}
          </span>
          <span className="text-slate-200 text-xs">·</span>
          <span className="text-xs text-slate-400">
            {TEMPLATE_LABELS[content.templateType]}
          </span>
        </div>
      </div>

      {/* 오른쪽 정보 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="hidden sm:flex">
          <PlatformBadgeList platforms={content.platforms} maxShow={2} />
        </div>
        <StatusBadge status={content.status} />
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}
