import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const versions = db.listCardVersions(session.userId, params.id);
  return NextResponse.json({
    ok: true,
    versions: versions.map((v) => ({
      id: v.id,
      version: v.version,
      changeNote: v.change_note,
      createdAt: v.created_at,
      cards: JSON.parse(v.cards_json),
      caption: JSON.parse(v.caption_json || "{}"),
      hashtags: JSON.parse(v.hashtags || "[]"),
    })),
  });
}
