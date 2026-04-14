"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  ExternalLink,
  Edit3,
  Save,
} from "lucide-react";
import { mockContents } from "@/lib/mock-data";
import { ContentStatus, Platform, STATUS_LABELS, PLATFORM_LABELS } from "@/lib/types";
import { formatDate, TEMPLATE_LABELS, cn } from "@/lib/utils";
import { PLATFORM_CHAR_GUIDES, getCharCount } from "@/lib/template-engine";
import { StatusBadge } from "@/components/contents/status-badge";
import { PlatformBadge } from "@/components/contents/platform-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const platformTabConfig: { platform: Platform; label: string; emoji: string }[] = [
  { platform: "blog", label: "블로그", emoji: "📝" },
  { platform: "instagram", label: "인스타", emoji: "📸" },
  { platform: "threads", label: "스레드", emoji: "🧵" },
  { platform: "tiktok", label: "틱톡", emoji: "🎵" },
  { platform: "openchat", label: "오픈채팅", emoji: "💬" },
];

export default function ContentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const originalContent = mockContents.find((c) => c.id === id);
  const [content, setContent] = useState(originalContent);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);

  if (!content) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <p className="text-slate-600 font-medium mb-1">콘텐츠를 찾을 수 없습니다</p>
        <p className="text-slate-400 text-sm mb-4">삭제되었거나 잘못된 주소입니다</p>
        <Link href="/contents">
          <Button variant="outline">목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  const handleCopy = (platform: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    });
  };

  const handleDraftChange = (platform: Platform, value: string) => {
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        channelDrafts: { ...prev.channelDrafts, [platform]: value },
      };
    });
  };

  const handleStatusChange = (status: ContentStatus) => {
    setContent((prev) => {
      if (!prev) return prev;
      return { ...prev, status };
    });
  };

  const availablePlatforms = platformTabConfig.filter((p) =>
    content.platforms.includes(p.platform)
  );

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      {/* 헤더 */}
      <div className="flex items-start gap-3 mb-6">
        <Link href="/contents">
          <Button variant="ghost" size="icon" className="mt-0.5 flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-800 leading-snug">
            {content.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            마지막 수정 · {formatDate(content.updatedAt)}
          </p>
        </div>
        <Select
          value={content.status}
          onValueChange={(v) => handleStatusChange(v as ContentStatus)}
        >
          <SelectTrigger className="w-32 flex-shrink-0">
            <StatusBadge status={content.status} showDot />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(STATUS_LABELS) as ContentStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 기본 정보 카드 */}
      <Card className="mb-5">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-4">
              <InfoRow label="템플릿 유형" value={TEMPLATE_LABELS[content.templateType]} />
              <InfoRow label="상품명" value={content.productName} />
              <InfoRow label="카테고리" value={content.category} />
              <InfoRow label="추천 대상" value={content.audience} />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1">예정일</p>
                <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(content.scheduledDate)}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1.5">플랫폼</p>
                <div className="flex flex-wrap gap-1">
                  {content.platforms.map((p) => (
                    <PlatformBadge key={p} platform={p} />
                  ))}
                </div>
              </div>
              <InfoRow label="CTA" value={content.cta} />
              {content.link && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">링크</p>
                  <a
                    href={content.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <span className="truncate max-w-[200px]">{content.link}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1.5">핵심 메시지</p>
              <p className="text-sm text-slate-700 bg-blue-50/60 rounded-xl px-4 py-3 leading-relaxed border border-blue-100/50">
                {content.coreMessage}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1.5">후킹 문장</p>
              <p className="text-sm text-slate-800 font-semibold bg-amber-50 rounded-xl px-4 py-3 leading-relaxed border border-amber-100/50">
                "{content.hook}"
              </p>
            </div>
            {content.supportPoints.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1.5">보조 포인트</p>
                <ul className="space-y-1.5">
                  {content.supportPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                        {i + 1}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 플랫폼별 초안 탭 */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">플랫폼별 콘텐츠 초안</h2>
        <Tabs defaultValue={availablePlatforms[0]?.platform || "blog"}>
          <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
            {availablePlatforms.map(({ platform, label, emoji }) => (
              <TabsTrigger key={platform} value={platform} className="text-xs gap-1.5">
                <span>{emoji}</span>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {availablePlatforms.map(({ platform }) => {
            const draft = content.channelDrafts[platform] || "";
            const isEditing = editingPlatform === platform;
            const charCount = getCharCount(draft);
            const guide = PLATFORM_CHAR_GUIDES[platform];

            return (
              <TabsContent key={platform} value={platform}>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <PlatformBadge platform={platform} />
                        <span className="text-xs text-slate-400">{guide}</span>
                        <span className={cn(
                          "text-xs",
                          charCount === 0 ? "text-slate-300" : "text-slate-500 font-medium"
                        )}>
                          {charCount > 0 && `${charCount.toLocaleString()}자`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => setEditingPlatform(isEditing ? null : platform)}
                        >
                          {isEditing ? (
                            <><Save className="w-3 h-3 mr-1" />완료</>
                          ) : (
                            <><Edit3 className="w-3 h-3 mr-1" />수정</>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleCopy(platform, draft)}
                          disabled={!draft}
                        >
                          {copiedPlatform === platform ? (
                            <><Check className="w-3 h-3 mr-1 text-emerald-600" />복사됨</>
                          ) : (
                            <><Copy className="w-3 h-3 mr-1" />복사</>
                          )}
                        </Button>
                      </div>
                    </div>

                    {draft ? (
                      isEditing ? (
                        <Textarea
                          value={draft}
                          onChange={(e) => handleDraftChange(platform, e.target.value)}
                          className="min-h-[280px] text-sm font-mono leading-relaxed resize-y bg-slate-50"
                        />
                      ) : (
                        <div className="bg-slate-50 rounded-xl p-5 min-h-[280px] border border-slate-100">
                          <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                            {draft}
                          </pre>
                        </div>
                      )
                    ) : (
                      <div className="bg-slate-50 rounded-xl p-5 min-h-[200px] flex flex-col items-center justify-center border border-dashed border-slate-200">
                        <p className="text-slate-400 text-sm font-medium mb-1">
                          초안이 아직 없습니다
                        </p>
                        <p className="text-slate-300 text-xs text-center">
                          수정 버튼으로 직접 작성하거나<br />
                          생성 시 템플릿을 선택해보세요
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-slate-700 font-medium">{value}</p>
    </div>
  );
}
