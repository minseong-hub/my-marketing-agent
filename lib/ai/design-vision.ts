/**
 * Claude Sonnet 4.6 vision으로 카드뉴스 이미지 → BrandTemplate.tokens + ToneProfile 추출.
 *
 * 입력 이미지는 URL 또는 base64. 한 번에 1~6장.
 * 출력은 검증 후 안전 기본값으로 보정 (AI 응답 신뢰 X).
 */

import { getClaudeClient } from "@/lib/claude/client";
import { WORKER_MODEL } from "@/lib/ai/models";
import { calculateCost, type CostResult } from "@/lib/ai/cost";
import { extractJson } from "@/lib/studio/prompts";
import type { BrandTemplateTokens, ToneProfile } from "@/lib/studio/templates";
import type Anthropic from "@anthropic-ai/sdk";

export interface AnalyzeInput {
  /** 분석할 이미지 (URL or data URL or base64). 1~6장. */
  images: string[];
  /** 사용자 브랜드 컨텍스트 (있으면 보정 — "이 디자인 스타일을 내 브랜드 색으로 변환") */
  brandHint?: string;
}

export interface AnalyzeResult {
  tokens: BrandTemplateTokens;
  toneProfile: ToneProfile;
  /** AI가 추출한 디자인 특징 메모 (사람이 읽는 용) */
  notes: string;
  /** 추천 템플릿 이름 */
  suggestedName: string;
  cost: CostResult;
}

const SAFE_DEFAULT_TOKENS: BrandTemplateTokens = {
  palette: { bg: "#fafafa", surface: "#ffffff", text: "#1a1a1a", accent: "#000000", muted: "#9ca3af" },
  typography: { titleFamily: "sans", titleWeight: 800, titleSizeRatio: 0.085, bodyFamily: "sans", bodyLineHeight: 1.6 },
  layout: { padding: 80, contentAlign: "center", textAlign: "left" },
  decorations: { cornerStyle: "sharp", borderWidth: 0, borderStyle: "none", patternOverlay: "none", shadowDepth: 0, showBranding: true, showPageIndicator: true },
  imagery: { preferredImageStyle: "photo_realistic", stylePrompt: "minimal clean photography", overlayDarkness: 0.3 },
};

const SAFE_DEFAULT_TONE: ToneProfile = {
  voice: "차분하고 명료",
  sentenceLength: "medium",
  emojiUsage: "minimal",
  formality: "neutral",
  endingStyle: "~합니다",
  signaturePhrases: [],
};

/** AI 응답을 안전 범위로 클램프 */
function sanitizeTokens(raw: unknown): BrandTemplateTokens {
  const r = (raw && typeof raw === "object") ? raw as Record<string, unknown> : {};
  const palette = (r.palette && typeof r.palette === "object") ? r.palette as Record<string, unknown> : {};
  const typography = (r.typography && typeof r.typography === "object") ? r.typography as Record<string, unknown> : {};
  const layout = (r.layout && typeof r.layout === "object") ? r.layout as Record<string, unknown> : {};
  const decorations = (r.decorations && typeof r.decorations === "object") ? r.decorations as Record<string, unknown> : {};
  const imagery = (r.imagery && typeof r.imagery === "object") ? r.imagery as Record<string, unknown> : {};

  const hex = (v: unknown, fallback: string): string => {
    if (typeof v !== "string") return fallback;
    const t = v.trim();
    if (/^#[0-9a-fA-F]{3}$/.test(t)) return t;
    if (/^#[0-9a-fA-F]{6}$/.test(t)) return t;
    if (/^#[0-9a-fA-F]{8}$/.test(t)) return t;
    return fallback;
  };
  const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T => {
    return (typeof v === "string" && (allowed as readonly string[]).includes(v)) ? v as T : fallback;
  };
  const num = (v: unknown, min: number, max: number, fallback: number): number => {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  };
  const bool = (v: unknown, fallback: boolean): boolean => typeof v === "boolean" ? v : fallback;

  return {
    palette: {
      bg: hex(palette.bg, SAFE_DEFAULT_TOKENS.palette.bg),
      surface: hex(palette.surface, SAFE_DEFAULT_TOKENS.palette.surface),
      text: hex(palette.text, SAFE_DEFAULT_TOKENS.palette.text),
      accent: hex(palette.accent, SAFE_DEFAULT_TOKENS.palette.accent),
      muted: hex(palette.muted, SAFE_DEFAULT_TOKENS.palette.muted),
    },
    typography: {
      titleFamily: oneOf(typography.titleFamily, ["sans","serif","mono","display"] as const, SAFE_DEFAULT_TOKENS.typography.titleFamily),
      titleWeight: num(typography.titleWeight, 100, 900, SAFE_DEFAULT_TOKENS.typography.titleWeight),
      titleSizeRatio: num(typography.titleSizeRatio, 0.04, 0.16, SAFE_DEFAULT_TOKENS.typography.titleSizeRatio),
      bodyFamily: oneOf(typography.bodyFamily, ["sans","serif","mono"] as const, SAFE_DEFAULT_TOKENS.typography.bodyFamily),
      bodyLineHeight: num(typography.bodyLineHeight, 1.2, 2.2, SAFE_DEFAULT_TOKENS.typography.bodyLineHeight),
    },
    layout: {
      padding: num(layout.padding, 32, 160, SAFE_DEFAULT_TOKENS.layout.padding),
      contentAlign: oneOf(layout.contentAlign, ["top","center","bottom"] as const, SAFE_DEFAULT_TOKENS.layout.contentAlign),
      textAlign: oneOf(layout.textAlign, ["left","center"] as const, SAFE_DEFAULT_TOKENS.layout.textAlign),
    },
    decorations: {
      cornerStyle: oneOf(decorations.cornerStyle, ["sharp","soft","hard"] as const, SAFE_DEFAULT_TOKENS.decorations.cornerStyle),
      borderWidth: num(decorations.borderWidth, 0, 6, SAFE_DEFAULT_TOKENS.decorations.borderWidth),
      borderStyle: oneOf(decorations.borderStyle, ["none","solid","dashed","double"] as const, SAFE_DEFAULT_TOKENS.decorations.borderStyle),
      patternOverlay: oneOf(decorations.patternOverlay, ["none","dots","grid","noise","gradient_mesh"] as const, SAFE_DEFAULT_TOKENS.decorations.patternOverlay),
      shadowDepth: num(decorations.shadowDepth, 0, 3, SAFE_DEFAULT_TOKENS.decorations.shadowDepth),
      showBranding: bool(decorations.showBranding, SAFE_DEFAULT_TOKENS.decorations.showBranding),
      showPageIndicator: bool(decorations.showPageIndicator, SAFE_DEFAULT_TOKENS.decorations.showPageIndicator),
    },
    imagery: {
      preferredImageStyle: oneOf(imagery.preferredImageStyle, ["photo_realistic","illustration","abstract","minimal_icon"] as const, SAFE_DEFAULT_TOKENS.imagery.preferredImageStyle),
      stylePrompt: typeof imagery.stylePrompt === "string" ? imagery.stylePrompt.slice(0, 300) : SAFE_DEFAULT_TOKENS.imagery.stylePrompt,
      overlayDarkness: num(imagery.overlayDarkness, 0, 1, SAFE_DEFAULT_TOKENS.imagery.overlayDarkness),
    },
  };
}

function sanitizeTone(raw: unknown): ToneProfile {
  const r = (raw && typeof raw === "object") ? raw as Record<string, unknown> : {};
  const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T => {
    return (typeof v === "string" && (allowed as readonly string[]).includes(v)) ? v as T : fallback;
  };
  const str = (v: unknown, max: number, fallback: string): string => {
    return (typeof v === "string" && v.trim()) ? v.trim().slice(0, max) : fallback;
  };
  const arr = (v: unknown): string[] => {
    if (!Array.isArray(v)) return [];
    return v.filter((x) => typeof x === "string").map((x) => String(x).slice(0, 40)).slice(0, 8);
  };
  return {
    voice: str(r.voice, 100, SAFE_DEFAULT_TONE.voice),
    sentenceLength: oneOf(r.sentenceLength, ["short","medium","long"] as const, SAFE_DEFAULT_TONE.sentenceLength),
    emojiUsage: oneOf(r.emojiUsage, ["none","minimal","frequent"] as const, SAFE_DEFAULT_TONE.emojiUsage),
    formality: oneOf(r.formality, ["casual","neutral","formal"] as const, SAFE_DEFAULT_TONE.formality),
    endingStyle: str(r.endingStyle, 30, SAFE_DEFAULT_TONE.endingStyle),
    signaturePhrases: arr(r.signaturePhrases),
  };
}

const SCHEMA = `{
  "tokens": {
    "palette":     { "bg": "#hex", "surface": "#hex", "text": "#hex", "accent": "#hex", "muted": "#hex" },
    "typography":  { "titleFamily": "sans|serif|mono|display", "titleWeight": 100~900, "titleSizeRatio": 0.04~0.16, "bodyFamily": "sans|serif|mono", "bodyLineHeight": 1.2~2.2 },
    "layout":      { "padding": 32~160, "contentAlign": "top|center|bottom", "textAlign": "left|center" },
    "decorations": { "cornerStyle": "sharp|soft|hard", "borderWidth": 0~6, "borderStyle": "none|solid|dashed|double", "patternOverlay": "none|dots|grid|noise|gradient_mesh", "shadowDepth": 0~3, "showBranding": true, "showPageIndicator": true },
    "imagery":     { "preferredImageStyle": "photo_realistic|illustration|abstract|minimal_icon", "stylePrompt": "영문 키워드 1줄 (이미지 생성 API에 들어감)", "overlayDarkness": 0~1 }
  },
  "toneProfile": {
    "voice": "한 줄 묘사",
    "sentenceLength": "short|medium|long",
    "emojiUsage": "none|minimal|frequent",
    "formality": "casual|neutral|formal",
    "endingStyle": "~예요/~합니다 등",
    "signaturePhrases": ["자주 쓰는 표현"]
  },
  "notes": "이 디자인의 특징 한국어 2~3문장",
  "suggestedName": "한국어 템플릿 이름 (10자 내외)"
}`;

export async function analyzeDesignFromImages(input: AnalyzeInput): Promise<AnalyzeResult> {
  if (!input.images || input.images.length === 0) {
    throw new Error("이미지가 비어 있습니다.");
  }
  const images = input.images.slice(0, 6);

  const claude = getClaudeClient();

  // Anthropic SDK image content block 구성
  // 외부 URL은 Anthropic 서버가 fetch 못 하는 경우(인스타 CDN 등)가 많아서 서버에서 미리 다운받아 base64 변환.
  const imageBlocks: Anthropic.ImageBlockParam[] = await Promise.all(images.map(async (img) => {
    if (img.startsWith("data:")) {
      const m = img.match(/^data:(image\/(jpeg|png|webp|gif));base64,(.+)$/);
      if (!m) throw new Error("지원하지 않는 이미지 형식 (jpeg/png/webp만)");
      return {
        type: "image" as const,
        source: { type: "base64" as const, media_type: m[1] as "image/jpeg" | "image/png" | "image/webp" | "image/gif", data: m[3] },
      };
    }
    // 외부 URL → fetch 후 base64 (15초 timeout, 인스타 봇 차단 우회용 UA)
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    let res: Response;
    try {
      res = await fetch(img, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          "Accept": "image/jpeg,image/png,image/webp,image/*;q=0.8",
          "Referer": "https://www.instagram.com/",
        },
        signal: controller.signal,
      });
    } finally { clearTimeout(timer); }
    if (!res.ok) throw new Error(`이미지 다운로드 실패 HTTP ${res.status}: ${img.slice(0, 80)}`);
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    let mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    if (ct.includes("jpeg") || ct.includes("jpg")) mediaType = "image/jpeg";
    else if (ct.includes("png")) mediaType = "image/png";
    else if (ct.includes("webp")) mediaType = "image/webp";
    else if (ct.includes("gif")) mediaType = "image/gif";
    else mediaType = "image/jpeg"; // 인스타 CDN이 content-type 안 줄 때 기본
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 5 * 1024 * 1024) throw new Error(`이미지가 너무 큽니다 (${Math.round(buf.byteLength / 1024 / 1024)}MB > 5MB)`);
    const base64 = Buffer.from(buf).toString("base64");
    return {
      type: "image" as const,
      source: { type: "base64" as const, media_type: mediaType, data: base64 },
    };
  }));

  const userContent: Anthropic.ContentBlockParam[] = [
    ...imageBlocks,
    {
      type: "text",
      text: `위 이미지(들)는 사용자가 좋아하는 인스타그램 카드뉴스 디자인입니다.
이 디자인을 모방하여 사용자 본인 브랜드 카드뉴스에 적용할 수 있는 BrandTemplate JSON을 추출하세요.

${input.brandHint ? `사용자 브랜드 힌트: ${input.brandHint}\n(이 힌트와 어울리도록 색을 미세 조정 가능)` : ""}

추출 지침:
- palette: 이미지에서 가장 자주 등장하는 색 5개를 역할(bg/surface/text/accent/muted)에 매핑
- typography: 제목 폰트 패밀리(serif/sans/mono/display 중) + 굵기 + 크기 비율
- layout: padding(여백 px), 내용 정렬, 텍스트 정렬
- decorations: 코너 스타일/보더/패턴/그림자/페이지 인디케이터 유무
- imagery: 사진 스타일 분류 + 영문 stylePrompt (Recraft/Flux에 들어갈 키워드)
- toneProfile: 카피 톤은 이미지에서 보이는 텍스트가 있다면 분석 (없으면 디자인 분위기 기반 추정)
- notes: 이 디자인의 핵심 특징 한국어 2~3문장
- suggestedName: 한국어 템플릿 이름

출력 형식 (JSON만, 다른 텍스트 금지):
${SCHEMA}`,
    },
  ];

  let response: Anthropic.Message;
  try {
    response = await claude.messages.create({
      model: WORKER_MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: userContent }],
    });
  } catch (e) {
    throw new Error(`Claude vision 호출 실패: ${e instanceof Error ? e.message : String(e)}`);
  }

  const text = response.content.filter((b) => b.type === "text").map((b) => (b as Anthropic.TextBlock).text).join("\n");
  const parsed = extractJson<{ tokens: unknown; toneProfile: unknown; notes?: string; suggestedName?: string }>(text);
  if (!parsed) {
    throw new Error("AI가 올바른 JSON을 반환하지 않았습니다.");
  }

  const cost = calculateCost({
    inputTokens: response.usage.input_tokens || 0,
    outputTokens: response.usage.output_tokens || 0,
    cacheReadTokens: (response.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens || 0,
    cacheCreationTokens: (response.usage as { cache_creation_input_tokens?: number }).cache_creation_input_tokens || 0,
    model: WORKER_MODEL,
  });

  return {
    tokens: sanitizeTokens(parsed.tokens),
    toneProfile: sanitizeTone(parsed.toneProfile),
    notes: typeof parsed.notes === "string" ? parsed.notes.slice(0, 400) : "",
    suggestedName: typeof parsed.suggestedName === "string" ? parsed.suggestedName.slice(0, 30) : "추출된 디자인",
    cost,
  };
}
