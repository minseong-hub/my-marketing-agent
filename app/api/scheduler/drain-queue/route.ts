import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdapter } from "@/lib/publish/channels";

/**
 * POST /api/scheduler/drain-queue
 *
 * 자동 발행 큐를 워커로 비우는 엔드포인트.
 *  - 인증: Authorization: Bearer <SCHEDULER_SECRET>
 *  - 외부 cron (Vercel Cron / GitHub Actions / 직접 curl) 또는 대시보드에서 트리거
 *  - 지금 시각 이전에 scheduled_at된 status=pending 항목을 처리
 *  - 채널 어댑터 호출 → 성공 시 status=published, 실패 시 retry_count++ (3회까지)
 *
 * Body: { limit?: number }  기본 20
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SCHEDULER_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SCHEDULER_SECRET 미설정" }, { status: 503 });
  }
  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  let body: { limit?: number } = {};
  try { body = await request.json(); } catch { /* empty body OK */ }
  const limit = Math.min(Math.max(body.limit ?? 20, 1), 100);

  const due = db.fetchDueQueueItems(limit);
  const results: Array<{ id: string; status: string; channel: string; ok: boolean; error?: string; externalRef?: string }> = [];

  for (const item of due) {
    db.updateQueueItem(item.id, { status: "publishing" });

    const adapter = getAdapter(item.channel);
    if (!adapter) {
      db.updateQueueItem(item.id, {
        status: "failed",
        last_error: `지원하지 않는 채널: ${item.channel}`,
        retry_count: item.retry_count + 1,
      });
      results.push({ id: item.id, status: "failed", channel: item.channel, ok: false, error: `지원하지 않는 채널` });
      continue;
    }

    let payload: Record<string, unknown> = {};
    try { payload = JSON.parse(item.payload); } catch {}

    let pubResult;
    try {
      pubResult = await adapter.publish({
        userId: item.user_id,
        agentType: item.agent_type,
        kind: item.kind,
        title: item.title,
        payload,
      });
    } catch (e) {
      pubResult = { ok: false, error: e instanceof Error ? e.message : "발행 어댑터 예외" };
    }

    if (pubResult.ok) {
      db.updateQueueItem(item.id, {
        status: "published",
        published_at: new Date().toISOString(),
        external_ref: pubResult.externalRef ?? null,
        last_error: null,
      });
      results.push({ id: item.id, status: "published", channel: item.channel, ok: true, externalRef: pubResult.externalRef });
    } else {
      const retries = item.retry_count + 1;
      const failed = retries >= 3;
      db.updateQueueItem(item.id, {
        status: failed ? "failed" : "pending",
        retry_count: retries,
        last_error: pubResult.error ?? "알 수 없는 발행 오류",
        // 실패 시 5분 뒤 재시도
        scheduled_at: failed ? item.scheduled_at : new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });
      results.push({ id: item.id, status: failed ? "failed" : "retry", channel: item.channel, ok: false, error: pubResult.error });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: due.length,
    results,
    timestamp: new Date().toISOString(),
  });
}

// 헬스 체크 — GET은 status만 반환
export async function GET() {
  const pendingCount = db.fetchDueQueueItems(1000).length;
  return NextResponse.json({
    ok: true,
    pending_due: pendingCount,
    note: "POST with Authorization: Bearer SCHEDULER_SECRET to drain queue",
  });
}
