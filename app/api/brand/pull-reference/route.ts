import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { fetchReference, PLATFORM_LABELS, type PlatformId } from "@/lib/references/fetcher";

/**
 * 사용자가 제공한 URL에서 본문을 추출하여 reference_pulls에 저장.
 *  - 플랫폼 자동 감지 (네이버 블로그/스마트스토어/인스타/스레드/티스토리/일반)
 *  - SSRF 보호 (사설망 차단)
 *  - rate limit
 */

const Schema = z.object({
  url: z.string().url("올바른 URL을 입력해 주세요.").max(2000),
  label: z.string().max(80).optional(),
  platform: z.enum(["naver_blog","smartstore","instagram","threads","tistory","url"]).optional(),
});

export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:ref-pull:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.` },
      rateLimitResponseInit(rl.retryAfterSec)
    );
  }

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 }); }
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(" / ") }, { status: 400 });

  const { url, label, platform } = parsed.data;

  let fetched;
  try {
    fetched = await fetchReference(url, platform as PlatformId | undefined);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "수집 실패";
    return NextResponse.json({ error: `레퍼런스 수집 실패: ${msg}` }, { status: 422 });
  }

  if (!fetched.content || fetched.content.length < 20) {
    return NextResponse.json({
      ok: false,
      error: `본문 추출 실패. 이 URL은 로그인이 필요하거나 본문이 너무 짧습니다. (플랫폼: ${PLATFORM_LABELS[fetched.platform]})`,
      partial: { title: fetched.title, content: fetched.content, platform: fetched.platform },
    }, { status: 422 });
  }

  const pull = db.createReferencePull({
    user_id: session.userId,
    platform: fetched.platform,
    url: fetched.url,
    title: fetched.title,
    content: fetched.content,
    author: fetched.author,
    images: fetched.images,
    hashtags: fetched.hashtags,
    label,
    raw_meta: fetched.raw_meta,
  });

  return NextResponse.json({
    ok: true,
    pull: {
      id: pull.id,
      platform: pull.platform,
      platform_label: PLATFORM_LABELS[fetched.platform],
      url: pull.url,
      title: pull.title,
      content: pull.content,
      author: pull.author,
      images: fetched.images,
      hashtags: fetched.hashtags,
      label: pull.label,
      created_at: pull.created_at,
    },
  });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pulls = db.listReferencePulls(session.userId, 100);
  return NextResponse.json({
    ok: true,
    pulls: pulls.map((p) => ({
      id: p.id,
      platform: p.platform,
      platform_label: PLATFORM_LABELS[p.platform as PlatformId] ?? p.platform,
      url: p.url,
      title: p.title,
      content: p.content,
      author: p.author,
      images: (() => { try { return JSON.parse(p.images); } catch { return []; } })(),
      hashtags: (() => { try { return JSON.parse(p.hashtags); } catch { return []; } })(),
      label: p.label,
      created_at: p.created_at,
    })),
  });
}

export async function DELETE(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 파라미터가 필요합니다." }, { status: 400 });

  db.deleteReferencePull(session.userId, id);
  return NextResponse.json({ ok: true });
}
