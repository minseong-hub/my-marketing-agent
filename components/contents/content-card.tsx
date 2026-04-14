"use client";

import Link from "next/link";
import { Calendar, Copy } from "lucide-react";
import { ContentItem } from "@/lib/types";
import { formatShortDate, TEMPLATE_LABELS } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { PlatformBadgeList } from "./platform-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ContentCardProps {
  content: ContentItem;
  onDuplicate?: (content: ContentItem) => void;
}

export function ContentCard({ content, onDuplicate }: ContentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <Link href={`/contents/${content.id}`} className="block">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-stone-800 line-clamp-2 group-hover:text-[#4a7c59] transition-colors">
              {content.title}
            </h3>
            <StatusBadge status={content.status} />
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs text-stone-400 bg-stone-50 rounded px-1.5 py-0.5">
              {TEMPLATE_LABELS[content.templateType]}
            </span>
            <span className="text-xs text-stone-400">·</span>
            <span className="text-xs text-stone-500 font-medium">
              {content.productName}
            </span>
          </div>

          <p className="text-xs text-stone-500 line-clamp-1 mb-3">
            {content.coreMessage}
          </p>

          <div className="flex items-center justify-between">
            <PlatformBadgeList platforms={content.platforms} maxShow={3} />
            <div className="flex items-center gap-1 text-xs text-stone-400">
              <Calendar className="w-3 h-3" />
              {formatShortDate(content.scheduledDate)}
            </div>
          </div>
        </Link>

        {onDuplicate && (
          <div className="mt-3 pt-3 border-t border-stone-100">
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-xs h-7"
              onClick={(e) => {
                e.preventDefault();
                onDuplicate(content);
              }}
            >
              <Copy className="w-3 h-3 mr-1" />
              복제하기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
