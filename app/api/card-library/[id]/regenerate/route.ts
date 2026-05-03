import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db, getDb } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { decideStructure, seedDesignTokens, buildCopyPrompt } from "@/lib/studio/card-composer";
import { runAutoFlags, reviewStateFromFlags } from "@/lib/studio/auto-flags";
import { getClaudeClient } from "@/lib/claude/client";
import { WORKER_MODEL } from "@/lib/ai/models";
import type { EditableCard } from "@/lib/studio/card-types";
import type { BrandTemplate } from "@/lib/studio/templates";

/**
 * POST /api/card-library/[id]/regenerate
 *
 * 보관함의 단일 카드(또는 전체)를 다시 생성한다.
 *
 * mode:
 *  - "text"    — 텍스트만 다시 (디자인 유지)
 *  - "design"  — 디자인 토큰만 다시 (텍스트 유지)
 *  - "palette" — 색상만 무작위 변주 (다른 토큰 + 텍스트 유지)
 *  - "all"     — 전체 다시
 *
 * cardIndex 미지정 시 전체 카드 대상.
 */

const Schema = z.object({
  cardIndex: z.number().int().min(0).max(9).optional(),
  mode: z.enum(["text", "design", "palette", "all"]).default("text"),
});

/** 색상 약간 변주 — HSL 회전 */
function jitterPalette(p: EditableCard["design"]["palette"]): EditableCard["design"]["palette"] {
  const rotateHue = (hex: string, deg: number): string => {
    const c = hex.replace("#", "");
    if (c.length !== 6) return hex;
    const r = parseInt(c.slice(0, 2), 16) / 255;
    const g = parseInt(c.slice(2, 4), 16) / 255;
    const b = parseInt(c.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0; const l = (max + min) / 2; const d = max - min;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    if (d !== 0) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    h = (h + deg + 360) % 360;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const v = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return Math.round(v * 255).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };
  const shift = (Math.random() * 60 - 30); // -30~+30
  return { ...p, accent: rotateHue(p.accent, shift), muted: rotateHue(p.muted, shift / 2) };
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!verifySameOrigin(request).ok) return NextResponse.json({ error: "Forbidden (CSRF)" }, { status: 403 });

  const rl = consume(`api:regen:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const lib = db.getCardLibrary(session.userId, params.id);
  if (!lib) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let cards: EditableCard[];
  try { cards = JSON.parse(lib.cards_json); } catch { return NextResponse.json({ error: "Cards parse error" }, { status: 500 }); }

  // 활성 템플릿 (옵션)
  let template: BrandTemplate | null = null;
  if (lib.template_id) {
    const t = db.getBrandTemplate(session.userId, lib.template_id);
    if (t) {
      try {
        template = {
          id: t.id, userId: t.user_id, name: t.name, source: t.source as any,
          tokens: JSON.parse(t.tokens_json), toneProfile: JSON.parse(t.tone_profile || "{}"),
          referenceMeta: JSON.parse(t.reference_meta || "{}"),
          previewImage: t.preview_image, isActive: t.is_active === 1, isFavorite: t.is_favorite === 1,
          usageCount: t.usage_count, createdAt: t.created_at, updatedAt: t.updated_at,
        };
      } catch {}
    }
  }

  // 대상 인덱스 결정
  const targets = parsed.data.cardIndex !== undefined ? [parsed.data.cardIndex] : cards.map((_, i) => i);

  // 모드별 처리
  for (const idx of targets) {
    const orig = cards[idx];
    if (!orig) continue;

    if (parsed.data.mode === "palette") {
      cards[idx] = { ...orig, design: { ...orig.design, palette: jitterPalette(orig.design.palette) } };
      continue;
    }

    if (parsed.data.mode === "design" || parsed.data.mode === "all") {
      // 디자인 토큰 재시드 (텍스트는 mode에 따라 보존/리셋)
      const reseeded = seedDesignTokens(1, [orig.kind], { template })[0];
      cards[idx] = {
        ...orig,
        design: reseeded.design,
        effects: reseeded.effects,
        background: reseeded.background,
        ...(parsed.data.mode === "all" ? { text: reseeded.text } : {}),
      };
    }
  }

  // 텍스트 다시 생성 (Claude 호출) — text/all 모드
  if ((parsed.data.mode === "text" || parsed.data.mode === "all") && process.env.ANTHROPIC_API_KEY) {
    const userRow = db.getUserById(session.userId);
    const profileRow = getDb().prepare("SELECT brand_voice FROM brand_profiles WHERE user_id = ?").get(session.userId) as { brand_voice?: string } | undefined;
    const brandName = userRow?.brand_display_name || userRow?.business_name || "내 브랜드";

    // 대상 카드만 prompt에 포함
    const targetCards = targets.map((i) => cards[i]);
    try {
      const { system, user } = buildCopyPrompt({
        brandName,
        category: lib.category || "일반",
        angle: lib.title || "",
        cards: targetCards,
        toneProfile: template?.toneProfile,
        brandVoice: profileRow?.brand_voice,
      });
      const client = getClaudeClient();
      const resp = await client.messages.create({
        model: WORKER_MODEL,
        max_tokens: 2500,
        system: system + "\n\n[재생성 모드] 기존 결과와 다른 새로운 카피를 작성하세요.",
        messages: [{ role: "user", content: user }],
      });
      const txt = resp.content.filter((b) => b.type === "text").map((b: any) => b.text).join("");
      const m = txt.match(/\[[\s\S]*\]/);
      if (m) {
        const arr = JSON.parse(m[0]) as Array<EditableCard["text"]>;
        for (let j = 0; j < targets.length && j < arr.length; j++) {
          const i = targets[j];
          cards[i] = { ...cards[i], text: { ...cards[i].text, ...arr[j] } };
        }
      }
    } catch {
      // 실패해도 기존 텍스트 유지
    }
  }

  // 자기검수 + 저장
  const flags = runAutoFlags(cards);
  const review = reviewStateFromFlags(flags);
  const note = parsed.data.cardIndex !== undefined
    ? `카드 ${parsed.data.cardIndex + 1} 재생성 (${parsed.data.mode})`
    : `전체 재생성 (${parsed.data.mode})`;

  db.updateCardLibrary(session.userId, params.id, {
    cards_json: JSON.stringify(cards),
    auto_flags: flags,
    review_state: review,
    change_note: note,
  });

  return NextResponse.json({ ok: true, autoFlags: flags, reviewState: review, regeneratedIndices: targets });
}
