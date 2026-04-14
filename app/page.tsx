"use client";

import Link from "next/link";
import {
  Clock,
  CalendarDays,
  MessageCircle,
  FileText,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { mockContents } from "@/lib/mock-data";
import {
  getTodayUploads,
  getThisWeekScheduled,
  getOpenChatPriority,
  getSmartGroups,
} from "@/lib/smart-filters";
import {
  getTodayContents,
  getThisWeekContents,
  getOpenChatContents,
  sortByUpdatedAt,
} from "@/lib/utils";
import {
  ContentStatus,
  Platform,
  STATUS_LABELS,
  PLATFORM_LABELS,
} from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ContentPreviewRow } from "@/components/dashboard/content-preview-row";
import { SmartSummaryGrid } from "@/components/dashboard/smart-summary";
import { ClickableMetricRow } from "@/components/dashboard/clickable-metric-row";
import { StatusBadge } from "@/components/contents/status-badge";

const statusList: ContentStatus[] = [
  "idea",
  "drafting",
  "review",
  "scheduled",
  "published",
];

const platformList: Platform[] = [
  "blog",
  "instagram",
  "threads",
  "tiktok",
  "openchat",
];

const platformBarColors: Record<Platform, string> = {
  blog: "bg-orange-400",
  instagram: "bg-fuchsia-500",
  threads: "bg-slate-400",
  tiktok: "bg-rose-500",
  openchat: "bg-amber-500",
};

export default function DashboardPage() {
  const todayContents = getTodayContents(mockContents);
  const weekContents = getThisWeekContents(mockContents);
  const openChatContents = getOpenChatContents(mockContents);
  const recentContents = sortByUpdatedAt(mockContents).slice(0, 6);
  const thisWeekScheduled = getThisWeekScheduled(mockContents).slice(0, 5);
  const smartGroups = getSmartGroups(mockContents);

  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dayLabel = dayNames[today.getDay()];

  return (
    <div className="p-6 max-w-[1200px] mx-auto animate-fade-in">

      {/* ── Welcome 헤더 ─────────────────────────────── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">
            {dateLabel} ({dayLabel}) · 산물 콘텐츠 스튜디오
          </p>
          <h1 className="text-2xl font-bold text-slate-800 leading-snug">
            오늘도 좋은 콘텐츠를<br />차분하게 준비해볼까요.
          </h1>
        </div>
        <Link href="/create">
          <Button size="lg" className="shadow-sm gap-2">
            <PlusCircle className="w-4 h-4" />
            새 콘텐츠 등록
          </Button>
        </Link>
      </div>

      {/* ── KPI 카드 4개 ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="오늘 업로드 예정"
          value={todayContents.length}
          href="/contents?quick=today"
          description="scheduled · review 기준"
          icon={<Clock className="w-4 h-4" />}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <StatCard
          label="이번 주 전체"
          value={weekContents.length}
          href="/contents?quick=this-week"
          description="이번 주 예정 콘텐츠"
          icon={<CalendarDays className="w-4 h-4" />}
          colorClass="text-violet-600"
          bgClass="bg-violet-50"
        />
        <StatCard
          label="오픈채팅 공지 예정"
          value={openChatContents.filter((c) => c.status !== "published").length}
          href="/contents?platform=openchat&status=scheduled"
          description="openchat 포함 · 미발행"
          icon={<MessageCircle className="w-4 h-4" />}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
        <StatCard
          label="전체 콘텐츠"
          value={mockContents.length}
          href="/contents"
          description="등록된 모든 콘텐츠"
          icon={<FileText className="w-4 h-4" />}
          colorClass="text-slate-500"
          bgClass="bg-slate-100"
        />
      </div>

      {/* ── 스마트 요약 섹션 ────────────────────────── */}
      <div className="mb-6">
        <SectionHeader
          title="스마트 콘텐츠 요약"
          description="자동으로 분류된 중요 콘텐츠 그룹"
        />
        <SmartSummaryGrid groups={smartGroups} />
      </div>

      {/* ── 이번 주 예정 + 지표 ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* 이번 주 예정 콘텐츠 */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <SectionHeader
                title="이번 주 예정 콘텐츠"
                description="drafting · review · scheduled 기준"
                href="/contents?quick=this-week"
              />
              {thisWeekScheduled.length > 0 ? (
                <div className="-mx-1 space-y-0.5">
                  {thisWeekScheduled.map((content) => (
                    <ContentPreviewRow key={content.id} content={content} />
                  ))}
                </div>
              ) : (
                <EmptyState message="이번 주 예정된 콘텐츠가 없어요" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* 상태별 + 플랫폼별 */}
        <div className="space-y-4">

          {/* 상태별 현황 */}
          <Card>
            <CardContent className="p-5">
              <SectionHeader title="상태별 현황" />
              <div className="-mx-1">
                {statusList.map((status) => {
                  const count = mockContents.filter((c) => c.status === status).length;
                  return (
                    <Link
                      key={status}
                      href={`/contents?status=${status}`}
                      className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <StatusBadge status={status} showDot />
                      <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-700 transition-colors tabular-nums">
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 플랫폼별 예정 */}
          <Card>
            <CardContent className="p-5">
              <SectionHeader title="플랫폼별 현황" />
              <div className="-mx-1">
                {platformList.map((platform) => {
                  const count = mockContents.filter((c) =>
                    c.platforms.includes(platform)
                  ).length;
                  return (
                    <ClickableMetricRow
                      key={platform}
                      label={PLATFORM_LABELS[platform]}
                      count={count}
                      total={mockContents.length}
                      href={`/contents?platform=${platform}`}
                      barColorClass={platformBarColors[platform]}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── 최근 수정 콘텐츠 ────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <SectionHeader
            title="최근 수정된 콘텐츠"
            description="가장 최근에 업데이트된 순서"
            href="/contents"
          />
          <div className="-mx-1 space-y-0.5">
            {recentContents.map((content) => (
              <ContentPreviewRow key={content.id} content={content} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
        <TrendingUp className="w-5 h-5 text-slate-300" />
      </div>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
