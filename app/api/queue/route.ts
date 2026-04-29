import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { getAdapter, listChannels } from "@/lib/publish/channels";

/**
 * 자동 발행 큐 — 사용자가 컨텐츠 발행을 예약/취소/조회.
 *
 * GET     /api/queue                 → { items, channels }
 * POST    /api/queue                 → 새 큐 아이템 생성
 * DELETE  /api/queue?id=xxx          → 큐 아이템 취소
 */

const CreateSchema = z.object({
  agent_type: z.enum(["marketing", "detail_page", "ads", "finance"]),
  channel: z.string().max(40),
  kind: z.string().min(1).max(40),
  title: z.string().max(200).optional(),
  payload: z.record(z.string(), z.unknown()).default({}),
  scheduled_at: z.string().min(8).max(40), // ISO datetime
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = db.listQueueItems(session.userId, { limit: 100 });
  return NextResponse.json({
    ok: true,
    items: items.map((i) => ({
      id: i.id,
      agent_type: i.agent_type,
      channel: i.channel,
      kind: i.kind,
      title: i.title,
      payload: (() => { try { return JSON.parse(i.payload); } catch { return {}; } })(),
      status: i.status,
      scheduled_at: i.scheduled_at,
      published_at: i.published_at,
      external_ref: i.external_ref,
      retry_count: i.retry_count,
      last_error: i.last_error,
      created_at: i.created_at,
    })),
    channels: listChannels(),
  });
}

export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:queue:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) {
    return NextResponse.json({ error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` }, rateLimitResponseInit(rl.retryAfterSec));
  }

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 }); }
  const parsed = CreateSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });

  const { agent_type, channel, kind, title, payload, scheduled_at } = parsed.data;

  const adapter = getAdapter(channel);
  if (!adapter) return NextResponse.json({ error: `지원하지 않는 채널: ${channel}` }, { status: 400 });

  const dt = new Date(scheduled_at);
  if (isNaN(dt.getTime())) return NextResponse.json({ error: "scheduled_at이 올바른 ISO 시각이 아닙니다." }, { status: 400 });

  // 너무 미래(1년 초과) 차단
  if (dt.getTime() - Date.now() > 365 * 24 * 60 * 60 * 1000) {
    return NextResponse.json({ error: "최대 1년 이내로 예약 가능합니다." }, { status: 400 });
  }

  const item = db.createQueueItem({
    user_id: session.userId,
    agent_type,
    channel,
    kind,
    title: title ?? "(제목 없음)",
    payload,
    scheduled_at: dt.toISOString(),
  });

  return NextResponse.json({
    ok: true,
    item: {
      id: item.id,
      agent_type: item.agent_type,
      channel: item.channel,
      kind: item.kind,
      title: item.title,
      status: item.status,
      scheduled_at: item.scheduled_at,
      created_at: item.created_at,
    },
    channel_info: {
      ready: adapter.ready,
      label: adapter.label,
      needsOAuth: adapter.needsOAuth,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });

  const item = db.getQueueItem(id);
  if (!item || item.user_id !== session.userId) return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });

  if (item.status === "publishing") {
    return NextResponse.json({ error: "발행 중인 항목은 취소할 수 없습니다." }, { status: 409 });
  }

  if (item.status === "published") {
    return NextResponse.json({ error: "이미 발행된 항목은 삭제만 가능합니다." }, { status: 409 });
  }

  db.updateQueueItem(id, { status: "canceled" });
  return NextResponse.json({ ok: true });
}
