"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Copy,
  Check,
  Calendar,
  Shield,
  Sparkles,
  Crown,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { mockContents } from "@/lib/mock-data";
import { ContentItem, TEMPLATE_LABELS } from "@/lib/types";
import { formatShortDate, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/contents/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const categories = [
  {
    id: "all",
    label: "전체",
    icon: MessageCircle,
    types: [] as string[],
  },
  {
    id: "new_product",
    label: "신상품 선공개",
    icon: Sparkles,
    types: ["new_product"],
  },
  {
    id: "member",
    label: "회원 혜택",
    icon: Crown,
    types: ["member_benefit", "repurchase"],
  },
  {
    id: "urgent",
    label: "특가·마감",
    icon: Shield,
    types: ["flash_offer", "season_end"],
  },
  {
    id: "review",
    label: "후기·정보",
    icon: RefreshCcw,
    types: ["review", "info", "comparison"],
  },
];

const principles = [
  { emoji: "🚫", text: "할인방이 아닌 회원 혜택 공간" },
  { emoji: "⭐", text: "가격보다 만족 중시" },
  { emoji: "🥇", text: "신상품 가장 먼저 공개" },
  { emoji: "💚", text: "회원에게 항상 먼저 안내" },
];

export default function OpenChatPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const openChatContents = mockContents.filter((c) =>
    c.platforms.includes("openchat")
  );

  const filteredContents =
    activeCategory === "all"
      ? openChatContents
      : openChatContents.filter((c) => {
          const cat = categories.find((cat) => cat.id === activeCategory);
          return cat?.types.includes(c.templateType);
        });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">오픈채팅 관리</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          산물 회원 전용 채널 콘텐츠를 관리합니다
        </p>
      </div>

      {/* 운영 원칙 */}
      <div className="mb-5 bg-gradient-to-r from-blue-50 to-violet-50 rounded-2xl border border-blue-100/60 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-semibold text-slate-700">산물 오픈채팅 운영 원칙</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {principles.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span>{item.emoji}</span>
              <p className="text-xs text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 flex-wrap mb-5">
        {categories.map((cat) => {
          const count =
            cat.id === "all"
              ? openChatContents.length
              : openChatContents.filter((c) => cat.types.includes(c.templateType)).length;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                activeCategory === cat.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
              )}
            >
              <Icon className="w-3 h-3" />
              {cat.label}
              <span className={cn(
                "text-[10px] font-bold",
                activeCategory === cat.id ? "text-blue-200" : "text-slate-400"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 콘텐츠 목록 */}
      <div className="space-y-3">
        {filteredContents.length === 0 ? (
          <div className="text-center py-14">
            <MessageCircle className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">이 카테고리의 콘텐츠가 없습니다</p>
          </div>
        ) : (
          filteredContents.map((content) => (
            <OpenChatCard
              key={content.id}
              content={content}
              isCopied={copied === content.id}
              onCopy={handleCopy}
            />
          ))
        )}
      </div>
    </div>
  );
}

function OpenChatCard({
  content,
  isCopied,
  onCopy,
}: {
  content: ContentItem;
  isCopied: boolean;
  onCopy: (id: string, text: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const draft = content.channelDrafts.openchat;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={`/contents/${content.id}`}
              className="text-sm font-semibold text-slate-800 hover:text-blue-700 transition-colors line-clamp-1 block"
            >
              {content.title}
            </Link>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-slate-400 bg-slate-50 rounded-lg px-2 py-0.5">
                {TEMPLATE_LABELS[content.templateType]}
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="w-3 h-3" />
                {formatShortDate(content.scheduledDate)}
              </div>
              <StatusBadge status={content.status} showDot />
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {draft && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onCopy(content.id, draft)}
              >
                {isCopied ? (
                  <><Check className="w-3 h-3 mr-1 text-emerald-600" />복사됨</>
                ) : (
                  <><Copy className="w-3 h-3 mr-1" />복사</>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <><ChevronUp className="w-3 h-3 mr-1" />접기</>
              ) : (
                <><ChevronDown className="w-3 h-3 mr-1" />공지 보기</>
              )}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4">
            <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4">
              {draft ? (
                <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                  {draft}
                </pre>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-400">오픈채팅 공지 초안이 없습니다.</p>
                  <Link
                    href={`/contents/${content.id}`}
                    className="text-xs text-blue-600 underline mt-1 inline-block"
                  >
                    상세 페이지에서 작성하기
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
