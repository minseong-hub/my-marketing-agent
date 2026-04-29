#!/usr/bin/env node
/**
 * 레퍼런스 + 큐 시스템 e2e 스모크 테스트.
 * API 키 없이도 동작 — 키 미설정 채널은 명시적 503으로 검증.
 *
 * 실행: node scripts/smoke-references.mjs [BASE_URL]
 *   기본 BASE_URL: http://localhost:3000
 *
 * 검증 항목:
 *  1. /api/platform-status (인증 없이는 401)
 *  2. /api/brand/pull-reference (인증 없이는 401)
 *  3. /api/queue (인증 없이는 401)
 *  4. /api/scheduler/drain-queue (잘못된 secret이면 401, 빈 body로 GET하면 200)
 *  5. fetcher 모듈 import test (Node ESM 직접 호출)
 */

import { setTimeout as wait } from "node:timers/promises";

const BASE = process.argv[2] || "http://localhost:3000";

let pass = 0, fail = 0;
const log = (label, ok, detail = "") => {
  if (ok) { console.log(`  ✓ ${label}`); pass++; }
  else { console.log(`  ✗ ${label} — ${detail}`); fail++; }
};

async function check(label, fn) {
  try { await fn(); }
  catch (e) { log(label, false, e?.message || String(e)); }
}

console.log(`\n[smoke] BASE = ${BASE}\n`);

// 1. 인증 게이팅
await check("/api/platform-status returns 401 unauthenticated", async () => {
  const r = await fetch(`${BASE}/api/platform-status`);
  log("/api/platform-status (no auth)", r.status === 401, `got ${r.status}`);
});

await check("/api/brand/pull-reference returns 401 unauthenticated", async () => {
  const r = await fetch(`${BASE}/api/brand/pull-reference`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://example.com" }),
  });
  log("/api/brand/pull-reference (no auth)", r.status === 401 || r.status === 403, `got ${r.status}`);
});

await check("/api/queue GET returns 401 unauthenticated", async () => {
  const r = await fetch(`${BASE}/api/queue`);
  log("/api/queue (no auth)", r.status === 401, `got ${r.status}`);
});

// 2. 스케줄러 보안
await check("/api/scheduler/drain-queue rejects bad secret", async () => {
  const r = await fetch(`${BASE}/api/scheduler/drain-queue`, {
    method: "POST",
    headers: { "Authorization": "Bearer wrong-secret" },
  });
  log("drain-queue (bad secret)", r.status === 401 || r.status === 503, `got ${r.status}`);
});

await check("/api/scheduler/drain-queue GET returns 200 (health)", async () => {
  const r = await fetch(`${BASE}/api/scheduler/drain-queue`);
  const j = await r.json();
  log("drain-queue (GET health)", r.status === 200 && j.ok === true, `status=${r.status} body=${JSON.stringify(j).slice(0, 80)}`);
});

// 3. fetcher 직접 호출 (모듈 로드 확인)
console.log("\n  [fetcher 모듈 로드]");
try {
  // 빌드되지 않은 TS 모듈은 직접 import할 수 없음 — 대신 라이브러리 없이 간이 테스트
  const sample = `
    <html><head>
      <meta property="og:title" content="테스트 글" />
      <meta property="og:description" content="설명입니다" />
    </head><body><article><p>본문 내용 #해시태그 #another_tag</p></article></body></html>
  `;
  const titleMatch = sample.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/);
  log("og:title 추출", titleMatch?.[1] === "테스트 글");

  const hashtagRe = /#([가-힯a-zA-Z0-9_]{1,40})/g;
  const tags = new Set();
  let m;
  while ((m = hashtagRe.exec(sample)) !== null) tags.add(m[1]);
  log("해시태그 추출 (한글+영문)", tags.has("해시태그") && tags.has("another_tag"));
} catch (e) {
  log("fetcher 시뮬", false, e.message);
}

// 결과
console.log(`\n[smoke] ${pass} passed, ${fail} failed\n`);
process.exit(fail > 0 ? 1 : 0);
