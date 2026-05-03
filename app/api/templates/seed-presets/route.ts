import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySameOrigin } from "@/lib/security/csrf";
import { consume, RATE_LIMITS, rateLimitResponseInit } from "@/lib/security/rate-limit";
import { BRAND_TEMPLATE_PRESETS } from "@/lib/studio/templates";

/**
 * POST /api/templates/seed-presets
 *  - 사용자가 처음 진입했을 때 8종 프리셋을 갤러리에 시드.
 *  - 이미 5개 이상 보유 중이면 시드하지 않음 (중복 방지).
 *  - 활성 템플릿이 없으면 첫 번째(미니멀 화이트)를 활성으로 지정.
 */

export async function POST(request: NextRequest) {
  const csrf = verifySameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "허용되지 않은 출처입니다." }, { status: 403 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = consume(`api:tpl-seed:${session.userId}`, RATE_LIMITS.API_AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, rateLimitResponseInit(rl.retryAfterSec));

  const cnt = db.countActiveBrandTemplates(session.userId);
  if (cnt >= 5) {
    return NextResponse.json({ ok: true, seeded: 0, reason: "already_has_templates", existingCount: cnt });
  }

  const created: string[] = [];
  for (const p of BRAND_TEMPLATE_PRESETS) {
    try {
      const row = db.createBrandTemplate(session.userId, {
        name: p.name,
        source: p.source,
        tokens_json: JSON.stringify(p.tokens),
        tone_profile: JSON.stringify(p.toneProfile),
        reference_meta: JSON.stringify(p.referenceMeta),
      });
      created.push(row.id);
    } catch {
      // 한도 초과 시 중단
      break;
    }
  }

  // 활성 템플릿 없으면 첫 시드를 활성화
  const active = db.getActiveBrandTemplate(session.userId);
  if (!active && created.length > 0) {
    db.activateBrandTemplate(session.userId, created[0]);
  }

  return NextResponse.json({ ok: true, seeded: created.length, ids: created });
}
