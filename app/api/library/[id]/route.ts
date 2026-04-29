import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(20000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string().max(60)).max(20).optional(),
  is_favorite: z.boolean().optional(),
  product_id: z.string().max(60).nullable().optional(),
  kind: z.string().min(1).max(40).optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 }); }
  const parsed = UpdateSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });
  const d = parsed.data;
  const patch: Record<string, unknown> = {};
  if (d.title !== undefined) patch.title = d.title;
  if (d.content !== undefined) patch.content = d.content;
  if (d.metadata !== undefined) patch.metadata = JSON.stringify(d.metadata);
  if (d.tags !== undefined) patch.tags = JSON.stringify(d.tags);
  if (d.is_favorite !== undefined) patch.is_favorite = d.is_favorite ? 1 : 0;
  if (d.product_id !== undefined) patch.product_id = d.product_id;
  if (d.kind !== undefined) patch.kind = d.kind;
  db.updateLibraryItem(session.userId, params.id, patch);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  db.deleteLibraryItem(session.userId, params.id);
  return NextResponse.json({ ok: true });
}
