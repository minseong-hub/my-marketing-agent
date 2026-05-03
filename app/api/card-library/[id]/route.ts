import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { runAutoFlags, reviewStateFromFlags } from "@/lib/studio/auto-flags";
import type { EditableCard } from "@/lib/studio/card-types";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const r = db.getCardLibrary(session.userId, params.id);
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ok: true,
    item: {
      id: r.id,
      brandId: r.brand_id,
      monthlyPlanId: r.monthly_plan_id,
      title: r.title,
      category: r.category,
      cards: JSON.parse(r.cards_json),
      caption: JSON.parse(r.caption_json || "{}"),
      hashtags: JSON.parse(r.hashtags || "[]"),
      templateId: r.template_id,
      templateSnapshot: JSON.parse(r.template_snapshot || "{}"),
      reviewState: r.review_state,
      autoFlags: JSON.parse(r.auto_flags || "[]"),
      thumb: r.thumb,
      isFavorite: r.is_favorite === 1,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    },
  });
}

const PatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  cards: z.array(z.unknown()).min(1).max(20).optional(),
  caption: z.object({ variants: z.array(z.string()).min(1).max(5) }).optional(),
  hashtags: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  reviewState: z.enum(["draft", "needs_review", "approved"]).optional(),
  isFavorite: z.boolean().optional(),
  thumb: z.string().max(2_500_000).nullable().optional(),
  changeNote: z.string().max(200).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!verifySameOrigin(request).ok) return NextResponse.json({ error: "Forbidden (CSRF)" }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });

  const patch: Parameters<typeof db.updateCardLibrary>[2] = {};
  if (parsed.data.title !== undefined) patch.title = parsed.data.title;
  if (parsed.data.cards !== undefined) {
    const flags = runAutoFlags(parsed.data.cards as EditableCard[]);
    patch.cards_json = JSON.stringify(parsed.data.cards);
    patch.auto_flags = flags;
    patch.review_state = reviewStateFromFlags(flags);
  }
  if (parsed.data.caption !== undefined) patch.caption_json = JSON.stringify(parsed.data.caption);
  if (parsed.data.hashtags !== undefined) patch.hashtags = parsed.data.hashtags;
  if (parsed.data.reviewState !== undefined) patch.review_state = parsed.data.reviewState;
  if (parsed.data.isFavorite !== undefined) patch.is_favorite = parsed.data.isFavorite;
  if (parsed.data.thumb !== undefined) patch.thumb = parsed.data.thumb;
  if (parsed.data.changeNote !== undefined) patch.change_note = parsed.data.changeNote;

  const ok = db.updateCardLibrary(session.userId, params.id, patch);
  if (!ok) return NextResponse.json({ error: "Not found or no changes" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!verifySameOrigin(request).ok) return NextResponse.json({ error: "Forbidden (CSRF)" }, { status: 403 });
  const ok = db.softDeleteCardLibrary(session.userId, params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
