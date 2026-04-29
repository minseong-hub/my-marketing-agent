import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * 운영 상태 헬스 체크 — API 키 유효성 + 최근 호출 통계.
 * 결제로 키 유효해진 직후 새로고침만으로 상태가 ON으로 바뀝니다.
 *
 * Anthropic 키 유효성은 messages 호출 1회로 확인하면 토큰을 소모하므로,
 * 여기서는 ENV 존재 여부만 + 마지막 호출 결과로 추론.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const anthropic = !!process.env.ANTHROPIC_API_KEY;
  const fal = !!process.env.FAL_KEY;
  const replicate = !!process.env.REPLICATE_API_TOKEN;
  const scheduler = !!process.env.SCHEDULER_SECRET;
  const dbUrl = process.env.DATABASE_URL || "file:./dev.db";

  // 최근 30일 토큰 사용량 (사용자별)
  let usage: { input_tokens: number; output_tokens: number; cache_read_tokens: number; cache_creation_tokens: number; calls: number };
  try {
    usage = db.getMonthlyTokenUsage(session.userId, 30);
  } catch {
    usage = { input_tokens: 0, output_tokens: 0, cache_read_tokens: 0, cache_creation_tokens: 0, calls: 0 };
  }

  // 비용 추정 (claude-sonnet-4-6 가격 — input $3/MTok, output $15/MTok, cache_read $0.3/MTok)
  const inputCostUsd = ((usage.input_tokens - usage.cache_read_tokens) * 3) / 1_000_000;
  const cacheReadCostUsd = (usage.cache_read_tokens * 0.3) / 1_000_000;
  const outputCostUsd = (usage.output_tokens * 15) / 1_000_000;
  const totalUsd = Math.max(inputCostUsd + cacheReadCostUsd + outputCostUsd, 0);

  // 큐 상태
  const pendingDue = db.fetchDueQueueItems(1000).length;

  return NextResponse.json({
    ok: true,
    services: {
      anthropic: { configured: anthropic, label: "Anthropic Claude (생성형 AI)" },
      fal: { configured: fal, label: "fal.ai (이미지 생성, 빠름)" },
      replicate: { configured: replicate, label: "Replicate (이미지 생성, 대안)" },
      scheduler: { configured: scheduler, label: "스케줄러 (자동 발행 워커)" },
      database: { configured: true, label: dbUrl.startsWith("file:") ? "SQLite (로컬)" : "외부 DB" },
    },
    user_usage_30d: {
      ...usage,
      cache_savings_pct: usage.input_tokens > 0
        ? Math.round((usage.cache_read_tokens / usage.input_tokens) * 100)
        : 0,
      cost_estimate_usd: Number(totalUsd.toFixed(4)),
    },
    queue: {
      pending_due_now: pendingDue,
    },
    note: "ANTHROPIC_API_KEY 미설정 시 generate-* / run-task / chat 모두 503 반환. 결제 후 .env 추가 → 서버 재시작 → 즉시 ON.",
    last_checked: new Date().toISOString(),
  });
}
