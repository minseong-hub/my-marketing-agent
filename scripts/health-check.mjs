#!/usr/bin/env node
/**
 * 운영 헬스체크 — 배포 후 모니터링/CI에 적합.
 *
 * - DB 연결 확인 (테이블 존재)
 * - 필수 환경변수 점검
 * - 시드 플랜 4개 등록 확인
 * - 라우트 ping (BASE 제공 시)
 *
 * exit code: 0 정상 / 1 이상
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const fail = (m) => { console.error("\x1b[31m✗\x1b[0m", m); process.exitCode = 1; };
const ok = (m) => console.log("\x1b[32m✓\x1b[0m", m);
const warn = (m) => console.log("\x1b[33m⚠\x1b[0m", m);

console.log("[health] 시작\n");

// 1. ENV
const ENV_REQUIRED = ["JWT_SECRET", "ENCRYPTION_KEY", "DATABASE_URL"];
const ENV_OPTIONAL = ["ANTHROPIC_API_KEY", "SCHEDULER_SECRET", "GOOGLE_CLIENT_ID", "KAKAO_CLIENT_ID"];

// .env 로드 (간이)
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const text = fs.readFileSync(envPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(?:"([^"]*)"|(.*))$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2] ?? m[3];
    }
  }
} catch {}

console.log("1) 환경변수");
for (const k of ENV_REQUIRED) {
  if (!process.env[k] || process.env[k].length < 10) fail(`${k} 누락 또는 너무 짧음`);
  else if (process.env[k].includes("change-in-production")) fail(`${k}이 기본 예시 값임`);
  else ok(`${k} OK (${process.env[k].length}자)`);
}
for (const k of ENV_OPTIONAL) {
  if (process.env[k]) ok(`${k} 설정됨`);
  else warn(`${k} 미설정 (선택)`);
}

// 2. DB
console.log("\n2) DB 점검");
const dbPath = path.resolve(process.cwd(), "data/users.db");
if (!fs.existsSync(dbPath)) {
  fail(`DB 파일 없음: ${dbPath}`);
} else {
  const db = new Database(dbPath, { readonly: true });
  const tables = ["users", "plans", "agent_sessions", "agent_logs", "approval_requests", "brand_profiles", "products", "library_items", "auth_events", "token_usage"];
  for (const t of tables) {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(t);
    if (row) ok(`테이블 ${t} 존재`);
    else fail(`테이블 ${t} 없음 (마이그레이션 필요)`);
  }

  // 플랜 시드
  const plans = db.prepare("SELECT slug FROM plans WHERE archived = 0").all().map(r => r.slug);
  for (const expected of ["free", "starter", "growth", "pro"]) {
    if (plans.includes(expected)) ok(`플랜 ${expected} 시드됨`);
    else fail(`플랜 ${expected} 미시드`);
  }

  // 사용자 수
  const userCount = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
  console.log(`   사용자 수: ${userCount}`);
  db.close();
}

// 3. 라우트 ping (BASE 제공 시)
const BASE = process.env.HEALTH_BASE;
if (BASE) {
  console.log(`\n3) 라우트 ping (BASE=${BASE})`);
  const routes = [
    { p: "/", expect: 200 },
    { p: "/login", expect: 200 },
    { p: "/api/auth/check", expect: 200 },
  ];
  for (const r of routes) {
    try {
      const res = await fetch(BASE + r.p);
      if (res.status === r.expect) ok(`${r.p} → ${res.status}`);
      else fail(`${r.p} → ${res.status} (기대 ${r.expect})`);
    } catch (e) {
      fail(`${r.p} 요청 실패: ${e.message}`);
    }
  }
} else {
  warn("HEALTH_BASE 미설정 — 라우트 ping 스킵 (예: HEALTH_BASE=http://localhost:3000)");
}

console.log("\n=== 결과 ===");
if (process.exitCode === 1) console.error("\x1b[31m문제 발견\x1b[0m");
else console.log("\x1b[32m모든 점검 통과\x1b[0m");
