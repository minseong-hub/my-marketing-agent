import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db, getDb } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { runAutoFlags, reviewStateFromFlags } from "@/lib/studio/auto-flags";
import type { EditableCard } from "@/lib/studio/card-types";

/**
 * POST /api/card-library/[id]/restore
 *
 * 특정 버전 스냅샷으로 카드뉴스를 복원한다.
 * 복원도 새 버전으로 기록 (이전 상태로의 되돌리기 발자국 유지).
 */

const Schema = z.object({
  versionId: z.string().min(1).max(100),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!verifySameOrigin(request).ok) return NextResponse.json({ error: "Forbidden (CSRF)" }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  // 버전 로드 — user_id 매칭 강제
  const ver = getDb().prepare(
    "SELECT * FROM card_versions WHERE id = ? AND library_id = ? AND user_id = ?"
  ).get(parsed.data.versionId, params.id, session.userId) as
    | { cards_json: string; caption_json: string; hashtags: string; version: number }
    | undefined;
  if (!ver) return NextResponse.json({ error: "Version not found" }, { status: 404 });

  let cardsArr: EditableCard[];
  try { cardsArr = JSON.parse(ver.cards_json); } catch { return NextResponse.json({ error: "Version cards parse error" }, { status: 500 }); }

  const flags = runAutoFlags(cardsArr);
  const review = reviewStateFromFlags(flags);

  const ok = db.updateCardLibrary(session.userId, params.id, {
    cards_json: ver.cards_json,
    caption_json: ver.caption_json,
    hashtags: JSON.parse(ver.hashtags || "[]"),
    auto_flags: flags,
    review_state: review,
    change_note: `버전 v${ver.version} 복원`,
  });
  if (!ok) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  return NextResponse.json({ ok: true, autoFlags: flags, reviewState: review });
}
