#!/usr/bin/env node
/**
 * 데모 사용자 + 브랜드 + 상품 + 보관함 항목 시드.
 *
 * 사용:
 *   1) 회원가입 후 사용자 ID 확인 (예: dev DB 조회)
 *   2) USER_ID=<uuid> node scripts/seed-demo-data.mjs
 *
 * 안전: 같은 user_id로 재실행해도 상품·보관함은 추가될 뿐 덮어쓰지 않음.
 *      브랜드 프로필은 upsert.
 */

import Database from "better-sqlite3";
import path from "path";
import { randomUUID } from "crypto";

const userId = process.env.USER_ID;
if (!userId) {
  console.error("USER_ID 환경변수가 필요합니다. (예: USER_ID=abc-123 node scripts/seed-demo-data.mjs)");
  process.exit(1);
}

const dbPath = path.resolve(process.cwd(), "data/users.db");
const db = new Database(dbPath);

const user = db.prepare("SELECT id, email FROM users WHERE id = ?").get(userId);
if (!user) {
  console.error(`사용자를 찾을 수 없음: ${userId}`);
  process.exit(1);
}
console.log(`사용자: ${user.email} (${user.id})\n`);

// 1) 브랜드 프로필 upsert
const exists = db.prepare("SELECT user_id FROM brand_profiles WHERE user_id = ?").get(userId);
if (!exists) {
  db.prepare(
    `INSERT INTO brand_profiles (user_id, brand_voice, target_audience, unique_value, brand_story, do_not_use, hashtag_library, competitor_urls)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    userId,
    "친근하고 자신감 있는 20대 친구 같은 말투. 감각적이지만 데이터 기반.",
    "25~34세 직장 여성, 가성비 좋은 데일리룩 선호. 평일 출근복 + 주말 캐주얼.",
    "100% 국내 봉제, 사이즈 5종, 평균 배송 1일, 무료 사이즈 교환 1회",
    "2024년 자취생 두 명이 시작. 가성비와 디자인을 동시에 잡는 게 목표.",
    "최저가, 최고, 무조건",
    JSON.stringify(["가을룩", "데일리룩", "오피스룩", "직장인패션", "가성비코디"]),
    JSON.stringify(["https://smartstore.naver.com/competitor1", "https://www.example-brand.kr"])
  );
  console.log("✓ 브랜드 프로필 생성");
} else {
  console.log("· 브랜드 프로필 이미 있음 (스킵)");
}

// 2) 상품 3개 추가
const products = [
  {
    name: "가을 베이직 라운드 니트",
    category: "여성 의류 / 니트",
    price: 39000, cost: 18000,
    features: ["100% 면 혼방", "색상 5종", "사이즈 S~XL", "봄가을용", "단독 디자인"],
    selling_points: ["1일 배송", "사이즈 교환 1회 무료", "30대 직장인 검증된 데일리룩"],
    target_keywords: ["가을니트", "여성라운드니트", "오피스룩", "데일리니트"],
  },
  {
    name: "와이드 슬랙스 4컬러",
    category: "여성 의류 / 팬츠",
    price: 49000, cost: 22000,
    features: ["폴리/레이온 혼방", "주름 방지", "색상 4종", "허리 밴딩", "기장 2종 (롱/숏)"],
    selling_points: ["프리사이즈에 가까운 핏", "출근·여행 모두 OK", "구김 적은 원단"],
    target_keywords: ["와이드슬랙스", "여성팬츠", "오피스룩", "기본팬츠"],
  },
  {
    name: "캐시미어 머플러",
    category: "잡화 / 머플러",
    price: 29000, cost: 11000,
    features: ["캐시미어 30%", "양모 혼방", "색상 6종", "박스 포장", "선물용 메시지 카드 옵션"],
    selling_points: ["부담없는 선물 가격대", "캐시미어 입문용", "겨울 시즌 베스트셀러 후보"],
    target_keywords: ["캐시미어머플러", "겨울선물", "여친선물", "엄마선물"],
  },
];

const insertProduct = db.prepare(
  `INSERT INTO products (id, user_id, name, category, price, cost, features, selling_points, target_keywords, image_urls, external_url, notes, is_active)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', NULL, NULL, 1)`
);

let added = 0;
for (const p of products) {
  // 중복 체크
  const dup = db.prepare("SELECT id FROM products WHERE user_id = ? AND name = ?").get(userId, p.name);
  if (dup) continue;
  insertProduct.run(
    `prd_demo_${randomUUID().slice(0, 8)}`,
    userId, p.name, p.category, p.price, p.cost,
    JSON.stringify(p.features), JSON.stringify(p.selling_points), JSON.stringify(p.target_keywords),
  );
  added++;
}
console.log(`✓ 상품 ${added}개 추가 (이미 있는 상품은 스킵)`);

// 3) 보관함 샘플 항목 4개
const items = [
  {
    agent_type: "marketing", kind: "content_draft",
    title: "가을 신상 인스타 캡션 (마키 데모)",
    content: `🌙 가을밤, 우리집 무드등 같은 니트 한 장.

손이 가는 결, 손이 가는 색.
직장인의 평일도, 주말의 카페도 — 다 어울려요.

🛒 오늘 14시 이전 주문은 내일 도착!

#가을니트 #데일리룩 #오피스룩 #여성니트 #베이직룩 #가을룩 #가성비코디 #직장인패션`,
  },
  {
    agent_type: "detail_page", kind: "detail_section",
    title: "라운드 니트 셀링포인트 (데일리 데모)",
    content: `▸ 셀링포인트 1 — "1일 배송"
오늘 14시 이전 주문하면 내일 도착. 출근 전날 주문해도 OK.

▸ 셀링포인트 2 — "사이즈 교환 무료"
첫 구매 한정 사이즈 교환 1회 무료. 부담없이 도전하세요.

▸ 셀링포인트 3 — "100% 국내 봉제"
중국 OEM 노노. 마무리 디테일이 다릅니다.`,
  },
  {
    agent_type: "ads", kind: "ad_campaign",
    title: "Meta 가을 신상 캠페인 (애디 데모)",
    content: `채널: Meta (인스타그램)
키워드: 가을니트, 데일리룩, 오피스룩

[헤드라인]
출근 전날, 14시까지만 누르세요

[설명문]
1일 배송 · 사이즈 교환 무료 · 100% 국내 봉제. 평일도 주말도 어울리는 베이직 니트.

[예산] 300,000원`,
  },
  {
    agent_type: "user", kind: "note",
    title: "내 메모 — 가을 시즌 운영 체크",
    content: `· 9월 1주차 신상 콘텐츠 2회 발행
· 10월 광고 예산 50만 → 80만 증액 검토
· 캐시미어 머플러 11월 1주 입고 예정 (선주문 마케팅 체크)`,
  },
];

const insertItem = db.prepare(
  `INSERT INTO library_items (id, user_id, agent_type, kind, title, content, metadata, tags, is_favorite)
   VALUES (?, ?, ?, ?, ?, ?, '{}', '[]', ?)`
);

let itemsAdded = 0;
for (const it of items) {
  const dup = db.prepare("SELECT id FROM library_items WHERE user_id = ? AND title = ?").get(userId, it.title);
  if (dup) continue;
  insertItem.run(
    `lib_demo_${randomUUID().slice(0, 8)}`,
    userId, it.agent_type, it.kind, it.title, it.content,
    it.kind === "ad_campaign" ? 1 : 0
  );
  itemsAdded++;
}
console.log(`✓ 보관함 항목 ${itemsAdded}개 추가`);

console.log("\n[완료] 데모 데이터가 시드되었습니다. 로그인 후 /app/brand, /app/products, /app/library 확인하세요.");
db.close();
