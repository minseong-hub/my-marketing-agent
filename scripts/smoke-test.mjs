#!/usr/bin/env node
/**
 * 라우트·보안 가드 스모크 테스트.
 * dev 서버가 실행 중일 때 (`npm run dev`) `node scripts/smoke-test.mjs` 로 실행.
 *
 * - 공개 페이지 200 확인
 * - 보호 페이지 미인증 시 307 리디렉트
 * - 인증 API 미인증 시 401
 * - CSRF: Origin 없는 POST는 403
 * - Rate Limit: 동일 IP 다수 요청 시 429 진입
 * - 비밀번호 정책: 약한 비밀번호 거부
 *
 * 외부 의존성 없이 fetch만 사용. 실패 시 exit code 1.
 */

const BASE = process.env.SMOKE_BASE || "http://localhost:3000";
const log = (...a) => console.log(...a);
const ok = (t) => log("\x1b[32m✓\x1b[0m", t);
const fail = (t, x) => { console.error("\x1b[31m✗\x1b[0m", t, x ?? ""); process.exitCode = 1; };

async function expectStatus(url, expected, opts) {
  try {
    const res = await fetch(url, { redirect: "manual", ...opts });
    if (Array.isArray(expected) ? expected.includes(res.status) : res.status === expected) {
      ok(`${opts?.method || "GET"} ${url} → ${res.status}`);
    } else {
      fail(`${opts?.method || "GET"} ${url} → expected ${expected}, got ${res.status}`);
    }
    return res;
  } catch (e) {
    fail(`${opts?.method || "GET"} ${url} 요청 실패`, e.message);
    return null;
  }
}

async function main() {
  log(`\n[smoke] BASE=${BASE}\n`);

  // 1. 공개 페이지 200
  log("1) 공개 페이지");
  for (const p of ["/", "/crew", "/pricing", "/docs", "/blog", "/login", "/signup", "/terms", "/privacy"]) {
    await expectStatus(BASE + p, 200);
  }

  // 2. 보호 페이지 미인증 → 307
  log("\n2) 보호 페이지 (미인증) — 307 기대");
  for (const p of ["/app/assistants", "/app/library", "/app/brand", "/app/products", "/app/automation", "/desk/marky", "/desk/penny"]) {
    await expectStatus(BASE + p, 307);
  }

  // 3. 보호 API 미인증 → 401 (또는 403 if CSRF 먼저)
  log("\n3) 보호 API GET (미인증) — 401 기대");
  for (const p of ["/api/agents/status", "/api/automation/summary", "/api/library", "/api/products", "/api/brand"]) {
    await expectStatus(BASE + p, 401);
  }

  // 4. CSRF: Origin 없는 POST → 403
  log("\n4) CSRF — Origin 없는 POST는 403 기대");
  await expectStatus(BASE + "/api/auth/login", 403, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "x@y.com", password: "test" }),
  });
  await expectStatus(BASE + "/api/auth/signup", 403, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  // 5. CSRF 통과 + Zod 검증 — 잘못된 형식은 400
  log("\n5) Zod — 잘못된 입력은 400 기대");
  await expectStatus(BASE + "/api/auth/login", 400, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE },
    body: JSON.stringify({ email: "not-an-email", password: "" }),
  });

  // 6. 비밀번호 정책 — 너무 짧으면 400
  log("\n6) 비밀번호 정책 — 약한 비밀번호 400 기대");
  await expectStatus(BASE + "/api/auth/signup", 400, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE },
    body: JSON.stringify({
      name: "Test", email: `weak+${Date.now()}@example.com`, password: "1234",
      phone: "010-0000-0000", businessName: "T", brandDisplayName: "T",
      businessType: "개인", industry: "기타",
      termsAgreed: true, privacyAgreed: true,
    }),
  });

  // 7. 비밀번호 정책 — 식별자 포함 (이메일 prefix와 동일)
  log("\n7) 비밀번호 정책 — 이메일 ID 포함 비밀번호 400 기대");
  const ts = Date.now();
  await expectStatus(BASE + "/api/auth/signup", 400, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE },
    body: JSON.stringify({
      name: "Test", email: `john${ts}@example.com`, password: `john${ts}123!`,
      phone: "010-0000-0000", businessName: "T", brandDisplayName: "T",
      businessType: "개인", industry: "기타",
      termsAgreed: true, privacyAgreed: true,
    }),
  });

  // 8. Rate Limit — 로그인 7회 시도 (5회 이후 429)
  log("\n8) Rate Limit — 로그인 7회 (마지막 2회는 429 기대)");
  let r429 = 0;
  for (let i = 0; i < 7; i++) {
    const res = await fetch(BASE + "/api/auth/login", {
      method: "POST",
      redirect: "manual",
      headers: { "Content-Type": "application/json", "Origin": BASE },
      body: JSON.stringify({ email: `ratelimit_${ts}@example.com`, password: "Wrong-Password-1!" }),
    });
    if (res.status === 429) r429++;
  }
  if (r429 >= 1) ok(`로그인 무차별 대입 차단 — 429 ${r429}회 발생`);
  else fail("로그인 rate limit이 작동하지 않음");

  // 9. 모킹 결제 — 프로덕션 가드 (현재 dev이므로 통과)
  log("\n9) 결제 라우트 — dev 환경에선 401(미인증) 기대");
  await expectStatus(BASE + "/api/billing/subscribe", [401, 403], {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE },
    body: JSON.stringify({ plan: "starter" }),
  });

  // 10. start-trial — 410 Gone (의도적 폐기)
  log("\n10) start-trial — 410 기대");
  await expectStatus(BASE + "/api/billing/start-trial", [410, 403], {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE },
    body: JSON.stringify({ plan: "starter" }),
  });

  log("\n=== 결과 ===");
  if (process.exitCode === 1) {
    console.error("\x1b[31m일부 검사 실패\x1b[0m");
  } else {
    console.log("\x1b[32m모든 검사 통과\x1b[0m");
  }
}

main();
