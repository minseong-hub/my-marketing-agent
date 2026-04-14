"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { mockTemplates } from "@/lib/mock-data";
import {
  ContentItem,
  Platform,
  TemplateType,
  ContentStatus,
  PLATFORM_LABELS,
  TEMPLATE_LABELS,
} from "@/lib/types";
import { generateChannelDrafts } from "@/lib/template-engine";
import { generateId, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const platformList: Platform[] = ["blog", "instagram", "threads", "tiktok", "openchat"];
const templateTypes = Object.keys(TEMPLATE_LABELS) as TemplateType[];

interface FormData {
  title: string;
  templateType: TemplateType | "";
  productName: string;
  category: string;
  coreMessage: string;
  supportPoints: [string, string, string];
  audience: string;
  hook: string;
  cta: string;
  link: string;
  scheduledDate: string;
  platforms: Platform[];
}

const initialForm: FormData = {
  title: "",
  templateType: "",
  productName: "",
  category: "",
  coreMessage: "",
  supportPoints: ["", "", ""],
  audience: "",
  hook: "",
  cta: "지금 주문하기",
  link: "",
  scheduledDate: "",
  platforms: [],
};

const platformEmoji: Record<Platform, string> = {
  blog: "📝",
  instagram: "📸",
  threads: "🧵",
  tiktok: "🎵",
  openchat: "💬",
};

export default function CreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const selectedTemplate = mockTemplates.find((t) => t.type === form.templateType);

  const togglePlatform = (platform: Platform) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleSupportPointChange = (index: number, value: string) => {
    setForm((prev) => {
      const newPoints = [...prev.supportPoints] as [string, string, string];
      newPoints[index] = value;
      return { ...prev, supportPoints: newPoints };
    });
  };

  const validate = () => {
    const errs: string[] = [];
    if (!form.title) errs.push("콘텐츠 제목");
    if (!form.templateType) errs.push("템플릿 유형");
    if (!form.productName) errs.push("상품명");
    if (!form.scheduledDate) errs.push("업로드 예정일");
    if (form.platforms.length === 0) errs.push("플랫폼 (최소 1개)");
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setIsSubmitting(true);

    const template = mockTemplates.find((t) => t.type === form.templateType);
    const newContent: ContentItem = {
      id: generateId(),
      title: form.title,
      templateType: form.templateType as TemplateType,
      productName: form.productName,
      category: form.category,
      coreMessage: form.coreMessage,
      supportPoints: form.supportPoints.filter(Boolean),
      audience: form.audience,
      hook: form.hook,
      cta: form.cta,
      link: form.link,
      scheduledDate: form.scheduledDate,
      status: "idea" as ContentStatus,
      platforms: form.platforms,
      channelDrafts: template
        ? generateChannelDrafts(
            {
              id: "",
              title: form.title,
              templateType: form.templateType as TemplateType,
              productName: form.productName,
              category: form.category,
              coreMessage: form.coreMessage,
              supportPoints: form.supportPoints.filter(Boolean),
              audience: form.audience,
              hook: form.hook,
              cta: form.cta,
              link: form.link,
              scheduledDate: form.scheduledDate,
              status: "idea",
              platforms: form.platforms,
              channelDrafts: {},
              createdAt: "",
              updatedAt: "",
            },
            template
          )
        : {},
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    console.log("새 콘텐츠:", newContent);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/app/contents");
    }, 500);
  };

  const completionScore = [
    form.title,
    form.templateType,
    form.productName,
    form.coreMessage,
    form.hook,
    form.scheduledDate,
    form.platforms.length > 0 ? "ok" : "",
  ].filter(Boolean).length;
  const totalFields = 7;

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/contents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">새 콘텐츠 등록</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            기본 정보를 입력하면 플랫폼별 초안이 자동 생성됩니다
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">완성도</p>
          <p className="text-sm font-bold text-blue-600">
            {Math.round((completionScore / totalFields) * 100)}%
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700">
          <p className="font-semibold mb-1">필수 항목을 입력해주세요:</p>
          <p>{errors.join(", ")}</p>
        </div>
      )}

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-0 pt-5 px-5">
            <CardTitle className="text-sm">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <FormField label="콘텐츠 제목 *" hint="한눈에 알 수 있는 제목">
              <Input
                placeholder="예: 성주참외 신상품 오픈 — 올해 첫 출하"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="템플릿 유형 *">
                <Select
                  value={form.templateType}
                  onValueChange={(v) => setForm((p) => ({ ...p, templateType: v as TemplateType }))}
                >
                  <SelectTrigger><SelectValue placeholder="유형 선택" /></SelectTrigger>
                  <SelectContent>
                    {templateTypes.map((t) => (
                      <SelectItem key={t} value={t}>{TEMPLATE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <p className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                    <Info className="w-3 h-3" />{selectedTemplate.description}
                  </p>
                )}
              </FormField>
              <FormField label="업로드 예정일 *">
                <Input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm((p) => ({ ...p, scheduledDate: e.target.value }))}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="상품명 *">
                <Input
                  placeholder="예: 성주참외 1.5kg"
                  value={form.productName}
                  onChange={(e) => setForm((p) => ({ ...p, productName: e.target.value }))}
                />
              </FormField>
              <FormField label="카테고리">
                <Input
                  placeholder="예: 참외, 딸기"
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0 pt-5 px-5">
            <CardTitle className="text-sm">콘텐츠 내용</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <FormField label="핵심 메시지" hint="가장 전달하고 싶은 한 문장">
              <Textarea
                placeholder="예: 당도 높고 아삭한 식감, 올해 첫 출하 성주참외를 회원에게 먼저 소개합니다"
                value={form.coreMessage}
                onChange={(e) => setForm((p) => ({ ...p, coreMessage: e.target.value }))}
                className="h-20"
              />
            </FormField>
            <FormField label="후킹 문장" hint="독자의 시선을 잡는 첫 줄">
              <Input
                placeholder="예: 올해 첫 성주참외, 회원에게 가장 먼저 소개합니다"
                value={form.hook}
                onChange={(e) => setForm((p) => ({ ...p, hook: e.target.value }))}
              />
            </FormField>
            <div>
              <Label className="text-xs font-medium text-slate-600 mb-2 block">
                보조 포인트 (최대 3개)
              </Label>
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <Input
                    key={i}
                    placeholder={`포인트 ${i + 1} — 예: 당도 13브릭스 이상 선별`}
                    value={form.supportPoints[i]}
                    onChange={(e) => handleSupportPointChange(i, e.target.value)}
                  />
                ))}
              </div>
            </div>
            <FormField label="추천 대상">
              <Input
                placeholder="예: 달콤하고 아삭한 제철 과일을 즐기는 30~50대 주부"
                value={form.audience}
                onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0 pt-5 px-5">
            <CardTitle className="text-sm">CTA & 링크</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="CTA 문구">
                <Input
                  placeholder="예: 지금 주문하기"
                  value={form.cta}
                  onChange={(e) => setForm((p) => ({ ...p, cta: e.target.value }))}
                />
              </FormField>
              <FormField label="링크">
                <Input
                  placeholder="https://..."
                  value={form.link}
                  onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0 pt-5 px-5">
            <CardTitle className="text-sm">업로드할 플랫폼 *</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-3 gap-2">
              {platformList.map((platform) => {
                const selected = form.platforms.includes(platform);
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all",
                      selected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                    )}
                  >
                    <span>{platformEmoji[platform]}</span>
                    <span className="text-xs">{PLATFORM_LABELS[platform]}</span>
                    {selected && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-blue-500" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pb-6">
          <Link href="/app/contents" className="flex-1">
            <Button variant="outline" className="w-full">취소</Button>
          </Link>
          <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
            <Sparkles className="w-4 h-4" />
            {isSubmitting ? "생성 중..." : "플랫폼별 초안 자동 생성"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs font-medium text-slate-600 mb-1.5 block">
        {label}
        {hint && <span className="ml-1 text-slate-400 font-normal">— {hint}</span>}
      </Label>
      {children}
    </div>
  );
}
