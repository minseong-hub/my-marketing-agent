import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { PLAN_DEFINITIONS, PLAN_ORDER } from "./plans";

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  const dbPath = path.resolve(process.cwd(), "data/users.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  _db = new Database(dbPath);
  _db.pragma("journal_mode = WAL");

  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      business_name TEXT NOT NULL,
      brand_display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'active',
      plan_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price_monthly INTEGER NOT NULL DEFAULT 0,
      features TEXT NOT NULL DEFAULT '[]',
      archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      next_billing_at TEXT,
      amount INTEGER NOT NULL DEFAULT 0,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'normal',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'notice',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      admin_email TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS billing_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      plan_slug TEXT,
      amount INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agent_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      agent_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'idle',
      current_task TEXT,
      last_reported_at TEXT,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT,
      error_message TEXT,
      metadata TEXT NOT NULL DEFAULT '{}',
      conversation_history TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS agent_logs (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      agent_type TEXT NOT NULL,
      user_id TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'info',
      message TEXT NOT NULL,
      technical_detail TEXT,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS approval_requests (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      agent_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      action_type TEXT NOT NULL,
      payload TEXT NOT NULL DEFAULT '{}',
      preview_data TEXT NOT NULL DEFAULT '{}',
      urgency_level TEXT NOT NULL DEFAULT 'normal',
      expires_at TEXT NOT NULL,
      resolved_at TEXT,
      resolved_by TEXT,
      reject_reason TEXT,
      resume_data TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agent_collaborations (
      id TEXT PRIMARY KEY,
      from_session_id TEXT NOT NULL,
      to_agent_type TEXT NOT NULL,
      to_session_id TEXT,
      user_id TEXT NOT NULL,
      message_type TEXT NOT NULL DEFAULT 'request',
      subject TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      processed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS financial_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      channel TEXT,
      product_name TEXT,
      date TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      generated_by TEXT NOT NULL DEFAULT 'user',
      source_session_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ad_campaigns (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      campaign_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      keywords TEXT NOT NULL DEFAULT '[]',
      ad_copy TEXT NOT NULL DEFAULT '{}',
      budget INTEGER NOT NULL DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      metrics TEXT NOT NULL DEFAULT '{}',
      generated_by TEXT NOT NULL DEFAULT 'user',
      source_session_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS detail_page_projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'analyzing',
      analysis_result TEXT NOT NULL DEFAULT '{}',
      plan_outline TEXT NOT NULL DEFAULT '{}',
      sections TEXT NOT NULL DEFAULT '[]',
      target_keywords TEXT NOT NULL DEFAULT '[]',
      design_notes TEXT,
      generated_by TEXT NOT NULL DEFAULT 'user',
      source_session_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 사용자별 브랜드 프로필 (모든 비서가 공유하는 정체성)
    CREATE TABLE IF NOT EXISTS brand_profiles (
      user_id TEXT PRIMARY KEY,
      brand_voice TEXT NOT NULL DEFAULT '',
      target_audience TEXT NOT NULL DEFAULT '',
      unique_value TEXT NOT NULL DEFAULT '',
      brand_story TEXT NOT NULL DEFAULT '',
      do_not_use TEXT NOT NULL DEFAULT '',
      hashtag_library TEXT NOT NULL DEFAULT '[]',
      competitor_urls TEXT NOT NULL DEFAULT '[]',
      reference_samples TEXT NOT NULL DEFAULT '[]',
      style_guide TEXT NOT NULL DEFAULT '{}',
      structure_templates TEXT NOT NULL DEFAULT '[]',
      visual_refs TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 자동 발행 큐 (스케줄링된 컨텐츠 발행 작업)
    CREATE TABLE IF NOT EXISTS content_queue (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      agent_type TEXT NOT NULL,
      channel TEXT NOT NULL,
      kind TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      payload TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'pending',
      scheduled_at TEXT NOT NULL,
      published_at TEXT,
      external_ref TEXT,
      retry_count INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_queue_user ON content_queue(user_id, status, scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_queue_status ON content_queue(status, scheduled_at);

    -- 레퍼런스 수집 기록 (플랫폼별 URL → 본문 추출 결과)
    CREATE TABLE IF NOT EXISTS reference_pulls (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      author TEXT,
      images TEXT NOT NULL DEFAULT '[]',
      hashtags TEXT NOT NULL DEFAULT '[]',
      label TEXT,
      raw_meta TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_refpulls_user ON reference_pulls(user_id, created_at);

    -- 상품 카탈로그
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      price INTEGER,
      cost INTEGER,
      features TEXT NOT NULL DEFAULT '[]',
      selling_points TEXT NOT NULL DEFAULT '[]',
      target_keywords TEXT NOT NULL DEFAULT '[]',
      image_urls TEXT NOT NULL DEFAULT '[]',
      external_url TEXT,
      notes TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id, is_active, updated_at);

    -- 결과물 보관함 (AI 결과 + 사용자 직접 작성)
    CREATE TABLE IF NOT EXISTS library_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      agent_type TEXT NOT NULL DEFAULT 'user',
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      metadata TEXT NOT NULL DEFAULT '{}',
      product_id TEXT,
      source_session_id TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      is_favorite INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_library_user ON library_items(user_id, kind, updated_at);
    CREATE INDEX IF NOT EXISTS idx_library_favorite ON library_items(user_id, is_favorite, updated_at);

    -- AI 토큰 사용량 (비용 추정 및 한도 강제용)
    CREATE TABLE IF NOT EXISTS token_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      session_id TEXT,
      agent_type TEXT NOT NULL,
      model TEXT NOT NULL,
      input_tokens INTEGER NOT NULL DEFAULT 0,
      output_tokens INTEGER NOT NULL DEFAULT 0,
      cache_read_tokens INTEGER NOT NULL DEFAULT 0,
      cache_creation_tokens INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_token_usage_user ON token_usage(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_token_usage_session ON token_usage(session_id);

    -- 기획 코어 v2 — 비서 자동화 룰북 (Strategy Core v2)
    -- 입력/출력/사고/토큰/비용/실행로그/학습메모를 한 row에 보관.
    -- 멀티테넌트 격리는 모든 쿼리에서 user_id 필터로 강제.
    CREATE TABLE IF NOT EXISTS plan_runs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      scope TEXT NOT NULL,                     -- marketing | detail_page | ads | finance
      input_json TEXT NOT NULL,                -- PlanInputV2 (브랜드/채널/제약 등)
      spec_json TEXT NOT NULL DEFAULT '{}',    -- PlanSpecV2 (룰북 전체)
      thinking_json TEXT NOT NULL DEFAULT '[]',-- Opus thinking blocks (텍스트 배열)
      cost_json TEXT NOT NULL DEFAULT '{}',    -- PlanCostBreakdown
      execution_log TEXT NOT NULL DEFAULT '[]',-- PlanExecutionEntry[] (후속 작업 추적)
      self_learning TEXT NOT NULL DEFAULT '{}',-- 자가 학습 메모 (다음 호출 시 컨텍스트로 주입)
      status TEXT NOT NULL DEFAULT 'active',   -- active | archived | deleted
      is_favorite INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_plan_runs_user ON plan_runs(user_id, status, updated_at);
    CREATE INDEX IF NOT EXISTS idx_plan_runs_scope ON plan_runs(user_id, scope, updated_at);
    CREATE INDEX IF NOT EXISTS idx_plan_runs_favorite ON plan_runs(user_id, is_favorite, updated_at);

    -- 브랜드 카드뉴스 디자인 템플릿 (사용자별)
    -- 레퍼런스 이미지·계정에서 추출하거나 AI 생성 또는 수동으로 만든 디자인 토큰 묶음.
    CREATE TABLE IF NOT EXISTS brand_templates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      source TEXT NOT NULL,              -- reference_url | reference_image | reference_account | ai_generated | preset | manual
      tokens_json TEXT NOT NULL,         -- BrandTemplate.tokens (palette/typography/layout/decorations/imagery)
      tone_profile TEXT NOT NULL DEFAULT '{}',
      reference_meta TEXT NOT NULL DEFAULT '{}',  -- 출처 메타 (URL은 저장 안함, 도메인/extracted_at만)
      preview_image TEXT,
      is_active INTEGER NOT NULL DEFAULT 0,        -- 사용자별 1개만 active (애플리케이션 레이어에서 강제)
      is_favorite INTEGER NOT NULL DEFAULT 0,
      usage_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_brand_templates_user ON brand_templates(user_id, status, updated_at);
    CREATE INDEX IF NOT EXISTS idx_brand_templates_active ON brand_templates(user_id, is_active);

    -- 월간 카드뉴스 발행 계획 (위저드 2단계 산출물)
    CREATE TABLE IF NOT EXISTS monthly_card_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      month TEXT NOT NULL,                   -- "2026-05"
      plan_run_id TEXT,                      -- plan_runs.id (옵션)
      brand_template_id TEXT NOT NULL,       -- brand_templates.id
      cards_json TEXT NOT NULL,              -- 카드뉴스 시드 배열 (PlannedCard[])
      status TEXT NOT NULL DEFAULT 'planning',  -- planning | approved | generating | done
      approval_token TEXT,                   -- 4단계 OK 시 발급, 일괄 생성 종료 후 폐기
      progress_json TEXT NOT NULL DEFAULT '{}',  -- 일괄 생성 진행률 + 결과
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_monthly_plans_user ON monthly_card_plans(user_id, status, updated_at);
    CREATE INDEX IF NOT EXISTS idx_monthly_plans_month ON monthly_card_plans(user_id, month);

    -- 보안 감사: 인증 관련 사건 로그 (로그인 시도/성공/실패 등)
    CREATE TABLE IF NOT EXISTS auth_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      user_id TEXT,
      email TEXT,
      ip TEXT,
      user_agent TEXT,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_auth_events_user ON auth_events(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_auth_events_email ON auth_events(email, created_at);
    CREATE INDEX IF NOT EXISTS idx_auth_events_kind ON auth_events(kind, created_at);

    -- 레퍼런스 보드 (마키 자동 스카우트 + 사용자 수동 추가)
    -- 외부 URL은 저장하지 않고 도메인/메타만 저장. 이미지는 추출된 base64 또는 외부 미러로 저장.
    CREATE TABLE IF NOT EXISTS reference_board (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      brand_id TEXT,                              -- 브랜드 슬롯 (NULL = 기본/미지정)
      source TEXT NOT NULL,                       -- 'auto_scout' | 'user_url' | 'user_upload'
      domain TEXT,                                -- 출처 도메인 (instagram.com 등)
      title TEXT NOT NULL DEFAULT '',
      memo TEXT NOT NULL DEFAULT '',              -- 사용자 메모
      tags TEXT NOT NULL DEFAULT '[]',            -- string[]
      preview_image TEXT,                         -- 썸네일 (base64 또는 데이터 URL)
      design_tokens TEXT NOT NULL DEFAULT '{}',   -- vision 분석 토큰 (palette/typography/layout)
      fit_score INTEGER NOT NULL DEFAULT 0,       -- 0~100 적합도 (자동 스카우트)
      query TEXT,                                 -- 자동 스카우트 시 사용된 쿼리
      is_starred INTEGER NOT NULL DEFAULT 0,      -- 별표 → 템플릿화 후보
      promoted_template_id TEXT,                  -- 템플릿으로 승격됐을 때 brand_templates.id
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_refboard_user ON reference_board(user_id, status, updated_at);
    CREATE INDEX IF NOT EXISTS idx_refboard_brand ON reference_board(user_id, brand_id, updated_at);
    CREATE INDEX IF NOT EXISTS idx_refboard_starred ON reference_board(user_id, is_starred, updated_at);

    -- 카드뉴스 결과물 보관함 (편집 가능, 버전 히스토리 별도)
    CREATE TABLE IF NOT EXISTS card_library (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      brand_id TEXT,
      monthly_plan_id TEXT,                       -- monthly_card_plans.id (FK 옵션)
      card_id TEXT,                               -- PlannedCard.id (옵션)
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      cards_json TEXT NOT NULL,                   -- 카드 배열 (각 카드: { kind, headline, sub, body, design, effects, bg })
      caption_json TEXT NOT NULL DEFAULT '{}',    -- { variants: string[] }
      hashtags TEXT NOT NULL DEFAULT '[]',
      template_id TEXT,                           -- brand_templates.id (옵션)
      template_snapshot TEXT NOT NULL DEFAULT '{}', -- 생성 당시 토큰 스냅샷 (템플릿 삭제돼도 복구 가능)
      review_state TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'needs_review' | 'approved'
      auto_flags TEXT NOT NULL DEFAULT '[]',      -- 자기검수 플래그: [{ kind, message, cardIndex? }]
      thumb TEXT,                                 -- 첫 카드 미리보기 (base64)
      cost_krw INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      is_favorite INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_card_lib_user ON card_library(user_id, status, updated_at);
    CREATE INDEX IF NOT EXISTS idx_card_lib_brand ON card_library(user_id, brand_id, updated_at);
    CREATE INDEX IF NOT EXISTS idx_card_lib_review ON card_library(user_id, review_state, updated_at);

    -- 카드뉴스 버전 히스토리 (수정/재생성 시마다 스냅샷)
    CREATE TABLE IF NOT EXISTS card_versions (
      id TEXT PRIMARY KEY,
      library_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      version INTEGER NOT NULL,
      cards_json TEXT NOT NULL,
      caption_json TEXT NOT NULL DEFAULT '{}',
      hashtags TEXT NOT NULL DEFAULT '[]',
      change_note TEXT NOT NULL DEFAULT '',         -- 'AI 초안' | '카드 3 텍스트 수정' 등
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_card_versions ON card_versions(library_id, version);

    -- 발행 큐 (카드뉴스 → 인스타 등 외부 발행, Phase F 준비)
    CREATE TABLE IF NOT EXISTS publish_queue (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      brand_id TEXT,
      library_id TEXT NOT NULL,
      channel TEXT NOT NULL DEFAULT 'instagram',
      scheduled_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',        -- 'queued' | 'sent' | 'failed' | 'canceled'
      sent_at TEXT,
      external_ref TEXT,
      last_error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_pubq_user ON publish_queue(user_id, status, scheduled_at);
  `);

  // brand_templates / monthly_card_plans 컬럼 마이그레이션 — brand_id 추가
  try {
    const cols = _db.prepare("PRAGMA table_info(brand_templates)").all() as { name: string }[];
    const names = cols.map((c) => c.name);
    if (!names.includes("brand_id")) _db.exec("ALTER TABLE brand_templates ADD COLUMN brand_id TEXT");
  } catch {}
  try {
    const cols = _db.prepare("PRAGMA table_info(monthly_card_plans)").all() as { name: string }[];
    const names = cols.map((c) => c.name);
    if (!names.includes("brand_id")) _db.exec("ALTER TABLE monthly_card_plans ADD COLUMN brand_id TEXT");
    if (!names.includes("source")) _db.exec("ALTER TABLE monthly_card_plans ADD COLUMN source TEXT NOT NULL DEFAULT 'manual'");
    if (!names.includes("auto_meta")) _db.exec("ALTER TABLE monthly_card_plans ADD COLUMN auto_meta TEXT NOT NULL DEFAULT '{}'");
  } catch {}

  // Column migrations for existing DBs
  try {
    const cols = _db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
    const names = cols.map((c) => c.name);
    if (!names.includes("role")) _db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
    if (!names.includes("status")) _db.exec("ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'");
    if (!names.includes("plan_id")) _db.exec("ALTER TABLE users ADD COLUMN plan_id TEXT");
    if (!names.includes("plan_slug")) _db.exec("ALTER TABLE users ADD COLUMN plan_slug TEXT");
    if (!names.includes("plan_status")) _db.exec("ALTER TABLE users ADD COLUMN plan_status TEXT NOT NULL DEFAULT 'none'");
    if (!names.includes("trial_started_at")) _db.exec("ALTER TABLE users ADD COLUMN trial_started_at TEXT");
    if (!names.includes("trial_ends_at")) _db.exec("ALTER TABLE users ADD COLUMN trial_ends_at TEXT");
    if (!names.includes("first_payment_done")) _db.exec("ALTER TABLE users ADD COLUMN first_payment_done INTEGER NOT NULL DEFAULT 0");
    if (!names.includes("industry")) _db.exec("ALTER TABLE users ADD COLUMN industry TEXT NOT NULL DEFAULT ''");
    if (!names.includes("terms_agreed_at")) _db.exec("ALTER TABLE users ADD COLUMN terms_agreed_at TEXT");
    if (!names.includes("privacy_agreed_at")) _db.exec("ALTER TABLE users ADD COLUMN privacy_agreed_at TEXT");
    if (!names.includes("marketing_consent")) _db.exec("ALTER TABLE users ADD COLUMN marketing_consent INTEGER NOT NULL DEFAULT 0");
    if (!names.includes("phone")) _db.exec("ALTER TABLE users ADD COLUMN phone TEXT NOT NULL DEFAULT ''");
    if (!names.includes("business_type")) _db.exec("ALTER TABLE users ADD COLUMN business_type TEXT NOT NULL DEFAULT ''");
    if (!names.includes("sales_channels")) _db.exec("ALTER TABLE users ADD COLUMN sales_channels TEXT NOT NULL DEFAULT '[]'");
    if (!names.includes("product_categories")) _db.exec("ALTER TABLE users ADD COLUMN product_categories TEXT NOT NULL DEFAULT '[]'");
    if (!names.includes("auth_provider")) _db.exec("ALTER TABLE users ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'email'");
    if (!names.includes("provider_id")) _db.exec("ALTER TABLE users ADD COLUMN provider_id TEXT");
    if (!names.includes("linked_providers")) _db.exec("ALTER TABLE users ADD COLUMN linked_providers TEXT NOT NULL DEFAULT '[]'");
  } catch {}

  try {
    const cols = _db.prepare("PRAGMA table_info(plans)").all() as { name: string }[];
    const names = cols.map((c) => c.name);
    if (!names.includes("slug")) _db.exec("ALTER TABLE plans ADD COLUMN slug TEXT");
    if (!names.includes("trial_days")) _db.exec("ALTER TABLE plans ADD COLUMN trial_days INTEGER NOT NULL DEFAULT 7");
    if (!names.includes("first_payment_amount")) _db.exec("ALTER TABLE plans ADD COLUMN first_payment_amount INTEGER");
    if (!names.includes("tools")) _db.exec("ALTER TABLE plans ADD COLUMN tools TEXT NOT NULL DEFAULT '[]'");
  } catch {}

  // brand_profiles 컬럼 마이그레이션 (기존 사용자 보존)
  try {
    const cols = _db.prepare("PRAGMA table_info(brand_profiles)").all() as { name: string }[];
    const names = cols.map((c) => c.name);
    if (!names.includes("reference_samples")) _db.exec("ALTER TABLE brand_profiles ADD COLUMN reference_samples TEXT NOT NULL DEFAULT '[]'");
    if (!names.includes("style_guide")) _db.exec("ALTER TABLE brand_profiles ADD COLUMN style_guide TEXT NOT NULL DEFAULT '{}'");
    if (!names.includes("structure_templates")) _db.exec("ALTER TABLE brand_profiles ADD COLUMN structure_templates TEXT NOT NULL DEFAULT '[]'");
    if (!names.includes("visual_refs")) _db.exec("ALTER TABLE brand_profiles ADD COLUMN visual_refs TEXT NOT NULL DEFAULT '[]'");
  } catch {}

  seedDefaults(_db);

  return _db;
}

function seedDefaults(d: Database.Database) {
  // Seed canonical Free/Starter/Growth/Pro plans (archive legacy ones without slug)
  const slugCount = (d.prepare("SELECT COUNT(*) as c FROM plans WHERE slug IN ('free','starter','growth','pro')").get() as { c: number }).c;
  if (slugCount < 4) {
    d.prepare("UPDATE plans SET archived = 1 WHERE slug IS NULL OR slug = ''").run();
    const insert = d.prepare(
      `INSERT OR REPLACE INTO plans (id, name, price_monthly, features, archived, slug, trial_days, first_payment_amount, tools)
       VALUES (@id, @name, @price, @features, 0, @slug, @trial, @first, @tools)`
    );
    for (const slug of PLAN_ORDER) {
      const def = PLAN_DEFINITIONS[slug];
      insert.run({
        id: `plan_${slug}`,
        name: def.name,
        price: def.price_monthly,
        features: JSON.stringify(def.highlights),
        slug: def.slug,
        trial: def.trial_days,
        first: def.first_payment_amount,
        tools: JSON.stringify(def.tools),
      });
    }
  }

  const settingCount = (d.prepare("SELECT COUNT(*) as c FROM settings").get() as { c: number }).c;
  if (settingCount === 0) {
    const s = d.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    s.run("brand_name", "업플로");
    s.run("support_email", "help@upflow.kr");
    s.run("maintenance_mode", "false");
    s.run("signup_enabled", "true");
    s.run("two_factor_required", "false");
    s.run("admin_ip_allowlist", "");
    s.run("owner_email", "");
  } else {
    const has = d.prepare("SELECT 1 FROM settings WHERE key = ?").get("owner_email");
    if (!has) d.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("owner_email", "");
  }
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  business_name: string;
  brand_display_name: string;
  industry: string;
  phone: string;
  business_type: string;
  sales_channels: string;   // JSON array string
  product_categories: string; // JSON array string
  auth_provider: string;    // 'email' | 'google' | 'kakao'
  provider_id: string | null;
  linked_providers: string; // JSON array: {provider, providerId}[]
  role: string;
  status: string;
  plan_id: string | null;
  plan_slug: string | null;
  plan_status: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  first_payment_done: number;
  terms_agreed_at: string | null;
  privacy_agreed_at: string | null;
  marketing_consent: number;
  created_at: string;
}

export interface PlanRow {
  id: string;
  name: string;
  price_monthly: number;
  features: string;
  archived: number;
  slug: string | null;
  trial_days: number;
  first_payment_amount: number | null;
  tools: string;
  created_at: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  next_billing_at: string | null;
  amount: number;
  note: string | null;
}

export interface TicketRow {
  id: string;
  user_email: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface NoticeRow {
  id: string;
  title: string;
  body: string;
  kind: string;
  active: number;
  created_at: string;
}

export interface AdminLogRow {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  detail: string | null;
  created_at: string;
}

export interface BillingEventRow {
  id: string;
  user_id: string;
  kind: string;
  plan_slug: string | null;
  amount: number;
  note: string | null;
  created_at: string;
}

export interface AgentSessionRow {
  id: string;
  user_id: string;
  agent_type: string;
  status: string;
  current_task: string | null;
  last_reported_at: string | null;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  metadata: string;
  conversation_history: string;
}

export interface BrandProfileRow {
  user_id: string;
  brand_voice: string;
  target_audience: string;
  unique_value: string;
  brand_story: string;
  do_not_use: string;
  hashtag_library: string;
  competitor_urls: string;
  reference_samples: string;     // JSON: ReferenceSample[]
  style_guide: string;           // JSON: StyleGuide
  structure_templates: string;   // JSON: StructureTemplate[]
  visual_refs: string;           // JSON: VisualRef[]
  updated_at: string;
}

export interface ReferenceSample {
  id: string;
  label?: string;             // "내가 좋아하는 카피 / 베스트 게시물 등"
  source?: string;            // "manual" | "naver_blog" | "instagram" | "threads" | "tistory" | "url"
  source_url?: string;
  text: string;
  hashtags?: string[];
  added_at: string;
}

export interface StyleGuide {
  sentence_length?: "short" | "medium" | "long" | "mixed";
  emoji_policy?: "none" | "minimal" | "moderate" | "rich";
  tone_keywords?: string[];   // ["친근", "전문가", "위트"]
  formality?: "casual" | "polite" | "formal";
  paragraph_pattern?: string; // "후킹 → 문제 → 해결 → CTA"
  signature_phrases?: string[]; // 자주 쓰는 마무리 멘트
}

export interface StructureTemplate {
  id: string;
  name: string;          // "인스타 캡션 7줄 템플릿"
  agent_type?: string;   // marketing | detail_page | ads | finance
  body: string;          // 템플릿 본문 (변수 {{product}} 등 가능)
  added_at: string;
}

export interface VisualRef {
  id: string;
  url?: string;          // 이미지 URL
  description: string;   // "미니멀 + 따뜻한 베이지 톤"
  keywords?: string[];
  added_at: string;
}

export interface ContentQueueRow {
  id: string;
  user_id: string;
  agent_type: string;
  channel: string;          // "library" | "naver_blog" | "instagram" | "threads" | "kakao_open" | "cafe24" | ...
  kind: string;             // "caption" | "blog_post" | "card_news" | "ad_creative" | ...
  title: string;
  payload: string;          // JSON
  status: string;           // pending | publishing | published | failed | canceled
  scheduled_at: string;
  published_at: string | null;
  external_ref: string | null;  // 발행 후 외부 ID/URL
  retry_count: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferencePullRow {
  id: string;
  user_id: string;
  platform: string;         // naver_blog | smartstore | instagram | threads | tistory | url
  url: string;
  title: string;
  content: string;
  author: string | null;
  images: string;           // JSON array
  hashtags: string;         // JSON array
  label: string | null;
  raw_meta: string;         // JSON
  created_at: string;
}

export interface ProductRow {
  id: string;
  user_id: string;
  name: string;
  category: string;
  price: number | null;
  cost: number | null;
  features: string;
  selling_points: string;
  target_keywords: string;
  image_urls: string;
  external_url: string | null;
  notes: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface LibraryItemRow {
  id: string;
  user_id: string;
  agent_type: string;
  kind: string;
  title: string;
  content: string;
  metadata: string;
  product_id: string | null;
  source_session_id: string | null;
  tags: string;
  is_favorite: number;
  created_at: string;
  updated_at: string;
}

export interface AgentLogRow {
  id: string;
  session_id: string;
  agent_type: string;
  user_id: string;
  level: string;
  message: string;
  technical_detail: string | null;
  metadata: string;
  created_at: string;
}

export interface ApprovalRequestRow {
  id: string;
  session_id: string;
  user_id: string;
  agent_type: string;
  status: string;
  title: string;
  description: string;
  action_type: string;
  payload: string;
  preview_data: string;
  urgency_level: string;
  expires_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  reject_reason: string | null;
  resume_data: string;
  created_at: string;
}

export interface FinancialRecordRow {
  id: string;
  user_id: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  channel: string | null;
  product_name: string | null;
  date: string;
  tags: string;
  generated_by: string;
  source_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanRunRow {
  id: string;
  user_id: string;
  scope: string;             // marketing | detail_page | ads | finance
  input_json: string;
  spec_json: string;
  thinking_json: string;
  cost_json: string;
  execution_log: string;
  self_learning: string;
  status: string;            // active | archived | deleted
  is_favorite: number;
  created_at: string;
  updated_at: string;
}

export interface BrandTemplateRow {
  id: string;
  user_id: string;
  name: string;
  source: string;
  tokens_json: string;
  tone_profile: string;
  reference_meta: string;
  preview_image: string | null;
  is_active: number;
  is_favorite: number;
  usage_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyCardPlanRow {
  id: string;
  user_id: string;
  month: string;
  plan_run_id: string | null;
  brand_template_id: string;
  brand_id: string | null;
  source: string;        // 'manual' | 'auto'
  auto_meta: string;     // JSON: { rationale, confidence, basedOnPlanRunId, ... }
  cards_json: string;
  status: string;
  approval_token: string | null;
  progress_json: string;
  created_at: string;
  updated_at: string;
}

export interface ReferenceBoardRow {
  id: string;
  user_id: string;
  brand_id: string | null;
  source: string;
  domain: string | null;
  title: string;
  memo: string;
  tags: string;             // JSON string[]
  preview_image: string | null;
  design_tokens: string;    // JSON
  fit_score: number;
  query: string | null;
  is_starred: number;
  promoted_template_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CardLibraryRow {
  id: string;
  user_id: string;
  brand_id: string | null;
  monthly_plan_id: string | null;
  card_id: string | null;
  title: string;
  category: string;
  cards_json: string;       // JSON: card array
  caption_json: string;     // JSON: { variants: string[] }
  hashtags: string;         // JSON string[]
  template_id: string | null;
  template_snapshot: string;
  review_state: string;     // 'draft' | 'needs_review' | 'approved'
  auto_flags: string;       // JSON
  thumb: string | null;
  cost_krw: number;
  status: string;
  is_favorite: number;
  created_at: string;
  updated_at: string;
}

export interface CardVersionRow {
  id: string;
  library_id: string;
  user_id: string;
  version: number;
  cards_json: string;
  caption_json: string;
  hashtags: string;
  change_note: string;
  created_at: string;
}

export interface PublishQueueRow {
  id: string;
  user_id: string;
  brand_id: string | null;
  library_id: string;
  channel: string;
  scheduled_at: string;
  status: string;
  sent_at: string | null;
  external_ref: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const db = {
  // ===== users =====
  getUserByEmail(email: string): UserRow | undefined {
    return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
  },
  getUserById(id: string): UserRow | undefined {
    return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  },
  listUsers(q?: string, role?: string, status?: string): UserRow[] {
    const where: string[] = [];
    const params: any[] = [];
    if (q) {
      where.push("(email LIKE ? OR name LIKE ? OR business_name LIKE ?)");
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (role) {
      where.push("role = ?");
      params.push(role);
    }
    if (status) {
      where.push("status = ?");
      params.push(status);
    }
    const sql = `SELECT * FROM users ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC LIMIT 500`;
    return getDb().prepare(sql).all(...params) as UserRow[];
  },
  countUsers(): number {
    return (getDb().prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c;
  },
  createUser(
    user: Omit<UserRow,
      | "created_at" | "role" | "status" | "plan_id" | "plan_slug" | "plan_status"
      | "trial_started_at" | "trial_ends_at" | "first_payment_done"
      | "terms_agreed_at" | "privacy_agreed_at" | "marketing_consent"
      | "phone" | "business_type" | "sales_channels" | "product_categories"
      | "auth_provider" | "provider_id" | "linked_providers"
    > & Partial<Pick<UserRow,
      | "role" | "status" | "plan_id"
      | "terms_agreed_at" | "privacy_agreed_at" | "marketing_consent"
      | "phone" | "business_type" | "sales_channels" | "product_categories"
      | "auth_provider" | "provider_id" | "linked_providers"
    >>
  ): UserRow {
    const stmt = getDb().prepare(`
      INSERT INTO users (
        id, name, email, password_hash, business_name, brand_display_name, industry,
        phone, business_type, sales_channels, product_categories,
        auth_provider, provider_id, linked_providers,
        role, status, plan_id, terms_agreed_at, privacy_agreed_at, marketing_consent
      ) VALUES (
        @id, @name, @email, @password_hash, @business_name, @brand_display_name, @industry,
        @phone, @business_type, @sales_channels, @product_categories,
        @auth_provider, @provider_id, @linked_providers,
        @role, @status, @plan_id, @terms_agreed_at, @privacy_agreed_at, @marketing_consent
      )
    `);
    stmt.run({
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.password_hash,
      business_name: user.business_name,
      brand_display_name: user.brand_display_name,
      industry: user.industry ?? "",
      phone: user.phone ?? "",
      business_type: user.business_type ?? "",
      sales_channels: user.sales_channels ?? "[]",
      product_categories: user.product_categories ?? "[]",
      auth_provider: user.auth_provider ?? "email",
      provider_id: user.provider_id ?? null,
      linked_providers: user.linked_providers ?? "[]",
      role: user.role ?? "user",
      status: user.status ?? "active",
      plan_id: user.plan_id ?? null,
      terms_agreed_at: user.terms_agreed_at ?? null,
      privacy_agreed_at: user.privacy_agreed_at ?? null,
      marketing_consent: user.marketing_consent ?? 0,
    });
    return getDb().prepare("SELECT * FROM users WHERE id = ?").get(user.id) as UserRow;
  },
  getUserByProvider(provider: string, providerId: string): UserRow | undefined {
    const primary = getDb()
      .prepare("SELECT * FROM users WHERE auth_provider = ? AND provider_id = ?")
      .get(provider, providerId) as UserRow | undefined;
    if (primary) return primary;
    // Search linked_providers (JSON array of {provider, providerId})
    const candidates = getDb()
      .prepare("SELECT * FROM users WHERE linked_providers != '[]'")
      .all() as UserRow[];
    for (const u of candidates) {
      try {
        const linked = JSON.parse(u.linked_providers || "[]") as Array<{ provider: string; providerId: string }>;
        if (linked.some((l) => l.provider === provider && l.providerId === providerId)) {
          return u;
        }
      } catch {}
    }
    return undefined;
  },
  linkProviderToUser(userId: string, provider: string, providerId: string) {
    const user = this.getUserById(userId);
    if (!user) return;
    let linked: Array<{ provider: string; providerId: string }> = [];
    try { linked = JSON.parse(user.linked_providers || "[]"); } catch {}
    if (!linked.some((l) => l.provider === provider && l.providerId === providerId)) {
      linked.push({ provider, providerId });
    }
    getDb()
      .prepare("UPDATE users SET linked_providers = ? WHERE id = ?")
      .run(JSON.stringify(linked), userId);
  },
  updateUser(id: string, patch: Partial<Pick<UserRow, "name" | "role" | "status" | "plan_id" | "business_name" | "brand_display_name">>) {
    const keys = Object.keys(patch);
    if (keys.length === 0) return;
    const set = keys.map((k) => `${k} = @${k}`).join(", ");
    getDb().prepare(`UPDATE users SET ${set} WHERE id = @id`).run({ ...patch, id });
  },
  setUserPlan(
    id: string,
    patch: Partial<{
      plan_slug: string | null;
      plan_status: string;
      trial_started_at: string | null;
      trial_ends_at: string | null;
      first_payment_done: number;
    }>
  ) {
    const entries: string[] = [];
    const params: any = { id };
    for (const [k, v] of Object.entries(patch)) {
      if (v !== undefined) {
        entries.push(`${k} = @${k}`);
        params[k] = v;
      }
    }
    if (entries.length === 0) return;
    getDb().prepare(`UPDATE users SET ${entries.join(", ")} WHERE id = @id`).run(params);
  },

  // ===== plans =====
  listPlans(includeArchived = true): PlanRow[] {
    const sql = includeArchived
      ? "SELECT * FROM plans ORDER BY price_monthly ASC"
      : "SELECT * FROM plans WHERE archived = 0 ORDER BY price_monthly ASC";
    return getDb().prepare(sql).all() as PlanRow[];
  },
  getPlan(id: string): PlanRow | undefined {
    return getDb().prepare("SELECT * FROM plans WHERE id = ?").get(id) as PlanRow | undefined;
  },
  getPlanBySlug(slug: string): PlanRow | undefined {
    return getDb().prepare("SELECT * FROM plans WHERE slug = ?").get(slug) as PlanRow | undefined;
  },
  createPlan(name: string, price: number, features: string[]): PlanRow {
    const id = uid("plan");
    getDb()
      .prepare("INSERT INTO plans (id, name, price_monthly, features) VALUES (?, ?, ?, ?)")
      .run(id, name, price, JSON.stringify(features));
    return this.getPlan(id)!;
  },
  updatePlan(
    id: string,
    patch: {
      name?: string;
      price_monthly?: number;
      features?: string[];
      archived?: number;
      trial_days?: number;
      first_payment_amount?: number | null;
      tools?: string[];
    }
  ) {
    const entries: string[] = [];
    const params: any = { id };
    if (patch.name !== undefined) { entries.push("name = @name"); params.name = patch.name; }
    if (patch.price_monthly !== undefined) { entries.push("price_monthly = @price_monthly"); params.price_monthly = patch.price_monthly; }
    if (patch.features !== undefined) { entries.push("features = @features"); params.features = JSON.stringify(patch.features); }
    if (patch.archived !== undefined) { entries.push("archived = @archived"); params.archived = patch.archived; }
    if (patch.trial_days !== undefined) { entries.push("trial_days = @trial_days"); params.trial_days = patch.trial_days; }
    if (patch.first_payment_amount !== undefined) { entries.push("first_payment_amount = @first_payment_amount"); params.first_payment_amount = patch.first_payment_amount; }
    if (patch.tools !== undefined) { entries.push("tools = @tools"); params.tools = JSON.stringify(patch.tools); }
    if (entries.length === 0) return;
    getDb().prepare(`UPDATE plans SET ${entries.join(", ")} WHERE id = @id`).run(params);
  },

  // ===== subscriptions =====
  listSubscriptions(): (SubscriptionRow & { user_email?: string; plan_name?: string })[] {
    return getDb()
      .prepare(
        `SELECT s.*, u.email as user_email, p.name as plan_name
         FROM subscriptions s
         LEFT JOIN users u ON u.id = s.user_id
         LEFT JOIN plans p ON p.id = s.plan_id
         ORDER BY s.started_at DESC LIMIT 500`
      )
      .all() as any;
  },
  getActiveSubscriptionByUser(userId: string): SubscriptionRow | undefined {
    return getDb()
      .prepare(
        "SELECT * FROM subscriptions WHERE user_id = ? AND status IN ('active','trialing') ORDER BY started_at DESC LIMIT 1"
      )
      .get(userId) as SubscriptionRow | undefined;
  },
  upsertSubscriptionForUser(
    userId: string,
    slug: string,
    amount: number,
    nextBillingAt: string
  ) {
    const plan = this.getPlanBySlug(slug);
    if (!plan) throw new Error("plan not found");
    const existing = this.getActiveSubscriptionByUser(userId);
    if (existing) {
      getDb()
        .prepare(
          "UPDATE subscriptions SET plan_id = ?, amount = ?, status = 'active', next_billing_at = ? WHERE id = ?"
        )
        .run(plan.id, amount, nextBillingAt, existing.id);
      return existing.id;
    }
    const id = uid("sub");
    getDb()
      .prepare(
        "INSERT INTO subscriptions (id, user_id, plan_id, amount, status, next_billing_at) VALUES (?, ?, ?, ?, 'active', ?)"
      )
      .run(id, userId, plan.id, amount, nextBillingAt);
    return id;
  },
  cancelSubscriptionForUser(userId: string) {
    getDb()
      .prepare("UPDATE subscriptions SET status = 'canceled' WHERE user_id = ? AND status IN ('active','trialing')")
      .run(userId);
  },
  createSubscription(user_id: string, plan_id: string, amount: number, note?: string): SubscriptionRow {
    const id = uid("sub");
    getDb()
      .prepare(
        "INSERT INTO subscriptions (id, user_id, plan_id, amount, note, next_billing_at) VALUES (?, ?, ?, ?, ?, datetime('now', '+30 days'))"
      )
      .run(id, user_id, plan_id, amount, note ?? null);
    return getDb().prepare("SELECT * FROM subscriptions WHERE id = ?").get(id) as SubscriptionRow;
  },
  updateSubscription(id: string, patch: { status?: string; note?: string; next_billing_at?: string; amount?: number }) {
    const entries: string[] = [];
    const params: any = { id };
    for (const [k, v] of Object.entries(patch)) {
      if (v !== undefined) { entries.push(`${k} = @${k}`); params[k] = v; }
    }
    if (entries.length === 0) return;
    getDb().prepare(`UPDATE subscriptions SET ${entries.join(", ")} WHERE id = @id`).run(params);
  },

  // ===== billing events =====
  recordBillingEvent(e: {
    user_id: string;
    kind: string;
    plan_slug: string | null;
    amount: number;
    note?: string;
  }) {
    const id = uid("be");
    getDb()
      .prepare(
        "INSERT INTO billing_events (id, user_id, kind, plan_slug, amount, note) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(id, e.user_id, e.kind, e.plan_slug, e.amount, e.note ?? null);
  },
  listBillingEvents(userId?: string, limit = 200): (BillingEventRow & { user_email?: string })[] {
    const sql = userId
      ? `SELECT b.*, u.email as user_email FROM billing_events b LEFT JOIN users u ON u.id = b.user_id WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT ?`
      : `SELECT b.*, u.email as user_email FROM billing_events b LEFT JOIN users u ON u.id = b.user_id ORDER BY b.created_at DESC LIMIT ?`;
    const stmt = getDb().prepare(sql);
    return (userId ? stmt.all(userId, limit) : stmt.all(limit)) as any;
  },
  getBillingSummary() {
    const d = getDb();
    const mrr = (d
      .prepare(
        "SELECT IFNULL(SUM(amount),0) as v FROM subscriptions WHERE status = 'active'"
      )
      .get() as { v: number }).v;
    const trialCount = (d
      .prepare("SELECT COUNT(*) as c FROM users WHERE plan_status = 'trialing'")
      .get() as { c: number }).c;
    const activeCount = (d
      .prepare("SELECT COUNT(*) as c FROM users WHERE plan_status = 'active'")
      .get() as { c: number }).c;
    const canceledCount = (d
      .prepare("SELECT COUNT(*) as c FROM users WHERE plan_status = 'canceled'")
      .get() as { c: number }).c;
    const revenue30d = (d
      .prepare(
        "SELECT IFNULL(SUM(amount),0) as v FROM billing_events WHERE kind = 'payment_success' AND created_at >= datetime('now','-30 days')"
      )
      .get() as { v: number }).v;
    const planDist = d
      .prepare(
        "SELECT plan_slug as slug, COUNT(*) as c FROM users WHERE plan_slug IS NOT NULL GROUP BY plan_slug"
      )
      .all() as { slug: string; c: number }[];
    return { mrr, trialCount, activeCount, canceledCount, revenue30d, planDist };
  },

  // ===== tickets =====
  listTickets(status?: string): TicketRow[] {
    const sql = status
      ? "SELECT * FROM support_tickets WHERE status = ? ORDER BY created_at DESC LIMIT 500"
      : "SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 500";
    return (status ? getDb().prepare(sql).all(status) : getDb().prepare(sql).all()) as TicketRow[];
  },
  createTicket(user_email: string, subject: string, body: string, priority = "normal"): TicketRow {
    const id = uid("tkt");
    getDb()
      .prepare("INSERT INTO support_tickets (id, user_email, subject, body, priority) VALUES (?, ?, ?, ?, ?)")
      .run(id, user_email, subject, body, priority);
    return getDb().prepare("SELECT * FROM support_tickets WHERE id = ?").get(id) as TicketRow;
  },
  updateTicket(id: string, patch: { status?: string; priority?: string }) {
    const entries: string[] = ["updated_at = datetime('now')"];
    const params: any = { id };
    if (patch.status) { entries.push("status = @status"); params.status = patch.status; }
    if (patch.priority) { entries.push("priority = @priority"); params.priority = patch.priority; }
    getDb().prepare(`UPDATE support_tickets SET ${entries.join(", ")} WHERE id = @id`).run(params);
  },

  // ===== notices =====
  listNotices(activeOnly = false): NoticeRow[] {
    const sql = activeOnly
      ? "SELECT * FROM notices WHERE active = 1 ORDER BY created_at DESC"
      : "SELECT * FROM notices ORDER BY created_at DESC";
    return getDb().prepare(sql).all() as NoticeRow[];
  },
  createNotice(title: string, body: string, kind: string): NoticeRow {
    const id = uid("ntc");
    getDb().prepare("INSERT INTO notices (id, title, body, kind) VALUES (?, ?, ?, ?)").run(id, title, body, kind);
    return getDb().prepare("SELECT * FROM notices WHERE id = ?").get(id) as NoticeRow;
  },
  updateNotice(id: string, patch: { title?: string; body?: string; kind?: string; active?: number }) {
    const entries: string[] = [];
    const params: any = { id };
    for (const [k, v] of Object.entries(patch)) {
      if (v !== undefined) { entries.push(`${k} = @${k}`); params[k] = v; }
    }
    if (entries.length === 0) return;
    getDb().prepare(`UPDATE notices SET ${entries.join(", ")} WHERE id = @id`).run(params);
  },
  deleteNotice(id: string) {
    getDb().prepare("DELETE FROM notices WHERE id = ?").run(id);
  },

  // ===== admin logs =====
  logAdmin(entry: { admin_id: string; admin_email: string; action: string; target_type?: string; target_id?: string; detail?: string }) {
    const id = uid("log");
    getDb()
      .prepare(
        "INSERT INTO admin_logs (id, admin_id, admin_email, action, target_type, target_id, detail) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        id,
        entry.admin_id,
        entry.admin_email,
        entry.action,
        entry.target_type ?? null,
        entry.target_id ?? null,
        entry.detail ?? null
      );
  },
  // ===== auth events (보안 감사 로그) =====
  createAuthEvent(entry: {
    kind: string;
    user_id: string | null;
    email: string | null;
    ip: string | null;
    user_agent: string | null;
    detail: string | null;
  }) {
    getDb()
      .prepare(
        "INSERT INTO auth_events (kind, user_id, email, ip, user_agent, detail) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(entry.kind, entry.user_id, entry.email, entry.ip, entry.user_agent, entry.detail);
  },
  // ===== token usage =====
  recordTokenUsage(entry: {
    user_id: string;
    session_id: string | null;
    agent_type: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
    cache_read_tokens?: number;
    cache_creation_tokens?: number;
  }) {
    getDb()
      .prepare(
        "INSERT INTO token_usage (user_id, session_id, agent_type, model, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        entry.user_id, entry.session_id, entry.agent_type, entry.model,
        entry.input_tokens, entry.output_tokens,
        entry.cache_read_tokens ?? 0, entry.cache_creation_tokens ?? 0
      );
  },
  getMonthlyTokenUsage(userId: string, days = 30): {
    input_tokens: number; output_tokens: number; cache_read_tokens: number; cache_creation_tokens: number; calls: number;
  } {
    const row = getDb().prepare(
      `SELECT
         COALESCE(SUM(input_tokens), 0) AS input_tokens,
         COALESCE(SUM(output_tokens), 0) AS output_tokens,
         COALESCE(SUM(cache_read_tokens), 0) AS cache_read_tokens,
         COALESCE(SUM(cache_creation_tokens), 0) AS cache_creation_tokens,
         COUNT(*) AS calls
       FROM token_usage
       WHERE user_id = ? AND created_at >= datetime('now', ?)`
    ).get(userId, `-${days} days`) as { input_tokens: number; output_tokens: number; cache_read_tokens: number; cache_creation_tokens: number; calls: number };
    return row;
  },

  listAuthEvents(filters: { user_id?: string; email?: string; kind?: string; limit?: number } = {}) {
    const where: string[] = [];
    const params: any[] = [];
    if (filters.user_id) { where.push("user_id = ?"); params.push(filters.user_id); }
    if (filters.email) { where.push("email = ?"); params.push(filters.email); }
    if (filters.kind) { where.push("kind = ?"); params.push(filters.kind); }
    const sql = `SELECT * FROM auth_events ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC LIMIT ?`;
    params.push(filters.limit ?? 200);
    return getDb().prepare(sql).all(...params);
  },

  // ===== brand profile =====
  getBrandProfile(userId: string): BrandProfileRow | undefined {
    return getDb().prepare("SELECT * FROM brand_profiles WHERE user_id = ?").get(userId) as BrandProfileRow | undefined;
  },
  upsertBrandProfile(userId: string, patch: Partial<Omit<BrandProfileRow, "user_id" | "updated_at">>) {
    const existing = this.getBrandProfile(userId);
    const now = new Date().toISOString();
    if (!existing) {
      getDb().prepare(
        `INSERT INTO brand_profiles (
           user_id, brand_voice, target_audience, unique_value, brand_story, do_not_use,
           hashtag_library, competitor_urls,
           reference_samples, style_guide, structure_templates, visual_refs,
           updated_at
         ) VALUES (
           @user_id, @brand_voice, @target_audience, @unique_value, @brand_story, @do_not_use,
           @hashtag_library, @competitor_urls,
           @reference_samples, @style_guide, @structure_templates, @visual_refs,
           @updated_at
         )`
      ).run({
        user_id: userId,
        brand_voice: patch.brand_voice ?? "",
        target_audience: patch.target_audience ?? "",
        unique_value: patch.unique_value ?? "",
        brand_story: patch.brand_story ?? "",
        do_not_use: patch.do_not_use ?? "",
        hashtag_library: patch.hashtag_library ?? "[]",
        competitor_urls: patch.competitor_urls ?? "[]",
        reference_samples: patch.reference_samples ?? "[]",
        style_guide: patch.style_guide ?? "{}",
        structure_templates: patch.structure_templates ?? "[]",
        visual_refs: patch.visual_refs ?? "[]",
        updated_at: now,
      });
    } else {
      const fields = [
        "brand_voice","target_audience","unique_value","brand_story","do_not_use",
        "hashtag_library","competitor_urls",
        "reference_samples","style_guide","structure_templates","visual_refs",
      ] as const;
      const sets: string[] = [];
      const params: Record<string, unknown> = { user_id: userId, updated_at: now };
      for (const f of fields) {
        if (patch[f] !== undefined) { sets.push(`${f} = @${f}`); params[f] = patch[f]; }
      }
      sets.push("updated_at = @updated_at");
      if (sets.length > 1) {
        getDb().prepare(`UPDATE brand_profiles SET ${sets.join(", ")} WHERE user_id = @user_id`).run(params);
      }
    }
  },

  // ===== content queue (자동 발행 큐) =====
  createQueueItem(item: {
    user_id: string;
    agent_type: string;
    channel: string;
    kind: string;
    title?: string;
    payload?: Record<string, unknown>;
    scheduled_at: string;
  }): ContentQueueRow {
    const id = uid("cq");
    getDb().prepare(
      `INSERT INTO content_queue (id, user_id, agent_type, channel, kind, title, payload, status, scheduled_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
    ).run(
      id, item.user_id, item.agent_type, item.channel, item.kind,
      item.title ?? "", JSON.stringify(item.payload ?? {}),
      item.scheduled_at
    );
    return getDb().prepare("SELECT * FROM content_queue WHERE id = ?").get(id) as ContentQueueRow;
  },
  listQueueItems(userId: string, filters: { status?: string; channel?: string; limit?: number } = {}): ContentQueueRow[] {
    const where: string[] = ["user_id = ?"];
    const params: any[] = [userId];
    if (filters.status) { where.push("status = ?"); params.push(filters.status); }
    if (filters.channel) { where.push("channel = ?"); params.push(filters.channel); }
    params.push(filters.limit ?? 200);
    return getDb().prepare(
      `SELECT * FROM content_queue WHERE ${where.join(" AND ")} ORDER BY scheduled_at ASC LIMIT ?`
    ).all(...params) as ContentQueueRow[];
  },
  getQueueItem(id: string): ContentQueueRow | undefined {
    return getDb().prepare("SELECT * FROM content_queue WHERE id = ?").get(id) as ContentQueueRow | undefined;
  },
  updateQueueItem(id: string, patch: Partial<Pick<ContentQueueRow, "status" | "published_at" | "external_ref" | "retry_count" | "last_error" | "scheduled_at" | "title" | "payload">>) {
    const allowed = ["status","published_at","external_ref","retry_count","last_error","scheduled_at","title","payload"];
    const sets: string[] = [];
    const params: Record<string, unknown> = { id };
    for (const [k, v] of Object.entries(patch)) {
      if (allowed.includes(k) && v !== undefined) { sets.push(`${k} = @${k}`); params[k] = v; }
    }
    if (sets.length === 0) return;
    sets.push("updated_at = datetime('now')");
    getDb().prepare(`UPDATE content_queue SET ${sets.join(", ")} WHERE id = @id`).run(params);
  },
  deleteQueueItem(userId: string, id: string) {
    getDb().prepare("DELETE FROM content_queue WHERE id = ? AND user_id = ?").run(id, userId);
  },
  // 워커가 가져갈 due 항목들 (status=pending && scheduled_at <= now)
  fetchDueQueueItems(limit = 20): ContentQueueRow[] {
    return getDb().prepare(
      "SELECT * FROM content_queue WHERE status = 'pending' AND scheduled_at <= datetime('now') ORDER BY scheduled_at ASC LIMIT ?"
    ).all(limit) as ContentQueueRow[];
  },

  // ===== reference pulls (URL → 본문 추출 기록) =====
  createReferencePull(r: {
    user_id: string;
    platform: string;
    url: string;
    title?: string;
    content?: string;
    author?: string;
    images?: string[];
    hashtags?: string[];
    label?: string;
    raw_meta?: Record<string, unknown>;
  }): ReferencePullRow {
    const id = uid("rp");
    getDb().prepare(
      `INSERT INTO reference_pulls (id, user_id, platform, url, title, content, author, images, hashtags, label, raw_meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, r.user_id, r.platform, r.url,
      r.title ?? "", r.content ?? "", r.author ?? null,
      JSON.stringify(r.images ?? []), JSON.stringify(r.hashtags ?? []),
      r.label ?? null, JSON.stringify(r.raw_meta ?? {})
    );
    return getDb().prepare("SELECT * FROM reference_pulls WHERE id = ?").get(id) as ReferencePullRow;
  },
  listReferencePulls(userId: string, limit = 100): ReferencePullRow[] {
    return getDb().prepare(
      "SELECT * FROM reference_pulls WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
    ).all(userId, limit) as ReferencePullRow[];
  },
  deleteReferencePull(userId: string, id: string) {
    getDb().prepare("DELETE FROM reference_pulls WHERE id = ? AND user_id = ?").run(id, userId);
  },

  // ===== products =====
  listProducts(userId: string, includeInactive = false): ProductRow[] {
    const sql = includeInactive
      ? "SELECT * FROM products WHERE user_id = ? ORDER BY updated_at DESC"
      : "SELECT * FROM products WHERE user_id = ? AND is_active = 1 ORDER BY updated_at DESC";
    return getDb().prepare(sql).all(userId) as ProductRow[];
  },
  getProduct(userId: string, id: string): ProductRow | undefined {
    return getDb().prepare("SELECT * FROM products WHERE user_id = ? AND id = ?").get(userId, id) as ProductRow | undefined;
  },
  createProduct(userId: string, p: Partial<Omit<ProductRow, "id" | "user_id" | "created_at" | "updated_at">>): ProductRow {
    const id = uid("prd");
    getDb().prepare(
      `INSERT INTO products (id, user_id, name, category, price, cost, features, selling_points, target_keywords, image_urls, external_url, notes, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, userId,
      p.name ?? "",
      p.category ?? "",
      p.price ?? null,
      p.cost ?? null,
      p.features ?? "[]",
      p.selling_points ?? "[]",
      p.target_keywords ?? "[]",
      p.image_urls ?? "[]",
      p.external_url ?? null,
      p.notes ?? null,
      p.is_active ?? 1,
    );
    return this.getProduct(userId, id)!;
  },
  updateProduct(userId: string, id: string, patch: Partial<ProductRow>) {
    const allowed = ["name","category","price","cost","features","selling_points","target_keywords","image_urls","external_url","notes","is_active"];
    const sets: string[] = [];
    const params: Record<string, unknown> = { id, user_id: userId };
    for (const [k, v] of Object.entries(patch)) {
      if (allowed.includes(k) && v !== undefined) { sets.push(`${k} = @${k}`); params[k] = v; }
    }
    if (sets.length === 0) return;
    sets.push("updated_at = datetime('now')");
    getDb().prepare(`UPDATE products SET ${sets.join(", ")} WHERE id = @id AND user_id = @user_id`).run(params);
  },
  deleteProduct(userId: string, id: string) {
    getDb().prepare("DELETE FROM products WHERE id = ? AND user_id = ?").run(id, userId);
  },

  // ===== library items =====
  listLibraryItems(userId: string, filters: { kind?: string; agent_type?: string; favorite?: boolean; q?: string; limit?: number } = {}): LibraryItemRow[] {
    const where: string[] = ["user_id = ?"];
    const params: any[] = [userId];
    if (filters.kind) { where.push("kind = ?"); params.push(filters.kind); }
    if (filters.agent_type) { where.push("agent_type = ?"); params.push(filters.agent_type); }
    if (filters.favorite) { where.push("is_favorite = 1"); }
    if (filters.q) {
      where.push("(title LIKE ? OR content LIKE ?)");
      params.push(`%${filters.q}%`, `%${filters.q}%`);
    }
    params.push(filters.limit ?? 200);
    return getDb().prepare(
      `SELECT * FROM library_items WHERE ${where.join(" AND ")} ORDER BY is_favorite DESC, updated_at DESC LIMIT ?`
    ).all(...params) as LibraryItemRow[];
  },
  getLibraryItem(userId: string, id: string): LibraryItemRow | undefined {
    return getDb().prepare("SELECT * FROM library_items WHERE id = ? AND user_id = ?").get(id, userId) as LibraryItemRow | undefined;
  },
  createLibraryItem(userId: string, item: Partial<Omit<LibraryItemRow, "id" | "user_id" | "created_at" | "updated_at">>): LibraryItemRow {
    const id = uid("lib");
    getDb().prepare(
      `INSERT INTO library_items (id, user_id, agent_type, kind, title, content, metadata, product_id, source_session_id, tags, is_favorite)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, userId,
      item.agent_type ?? "user",
      item.kind ?? "note",
      item.title ?? "(제목 없음)",
      item.content ?? "",
      item.metadata ?? "{}",
      item.product_id ?? null,
      item.source_session_id ?? null,
      item.tags ?? "[]",
      item.is_favorite ?? 0,
    );
    return this.getLibraryItem(userId, id)!;
  },
  updateLibraryItem(userId: string, id: string, patch: Partial<LibraryItemRow>) {
    const allowed = ["title","content","metadata","tags","is_favorite","product_id","kind"];
    const sets: string[] = [];
    const params: Record<string, unknown> = { id, user_id: userId };
    for (const [k, v] of Object.entries(patch)) {
      if (allowed.includes(k) && v !== undefined) { sets.push(`${k} = @${k}`); params[k] = v; }
    }
    if (sets.length === 0) return;
    sets.push("updated_at = datetime('now')");
    getDb().prepare(`UPDATE library_items SET ${sets.join(", ")} WHERE id = @id AND user_id = @user_id`).run(params);
  },
  deleteLibraryItem(userId: string, id: string) {
    getDb().prepare("DELETE FROM library_items WHERE id = ? AND user_id = ?").run(id, userId);
  },
  countLibraryItems(userId: string): { total: number; favorites: number; byKind: Record<string, number> } {
    const total = (getDb().prepare("SELECT COUNT(*) as c FROM library_items WHERE user_id = ?").get(userId) as { c: number }).c;
    const favorites = (getDb().prepare("SELECT COUNT(*) as c FROM library_items WHERE user_id = ? AND is_favorite = 1").get(userId) as { c: number }).c;
    const byKindRows = getDb().prepare("SELECT kind, COUNT(*) as c FROM library_items WHERE user_id = ? GROUP BY kind").all(userId) as { kind: string; c: number }[];
    const byKind: Record<string, number> = {};
    for (const r of byKindRows) byKind[r.kind] = r.c;
    return { total, favorites, byKind };
  },

  // ===== plan runs (기획 코어 v2 — 비서 자동화 룰북) =====
  // 모든 메서드는 user_id 격리 강제. id로만 접근하지 못하게 항상 (id AND user_id) 페어로 쿼리.
  createPlanRun(userId: string, input: {
    scope: string;
    input_json: string;
    spec_json: string;
    thinking_json?: string;
    cost_json?: string;
    self_learning?: string;
  }): PlanRunRow {
    const id = uid("plan2");
    getDb().prepare(
      `INSERT INTO plan_runs (id, user_id, scope, input_json, spec_json, thinking_json, cost_json, execution_log, self_learning, status, is_favorite)
       VALUES (?, ?, ?, ?, ?, ?, ?, '[]', ?, 'active', 0)`
    ).run(
      id, userId,
      input.scope,
      input.input_json,
      input.spec_json,
      input.thinking_json ?? "[]",
      input.cost_json ?? "{}",
      input.self_learning ?? "{}",
    );
    return this.getPlanRun(userId, id)!;
  },
  getPlanRun(userId: string, id: string): PlanRunRow | undefined {
    return getDb().prepare(
      "SELECT * FROM plan_runs WHERE id = ? AND user_id = ? AND status != 'deleted'"
    ).get(id, userId) as PlanRunRow | undefined;
  },
  listPlanRuns(userId: string, filters: {
    scope?: string;
    favorite?: boolean;
    limit?: number;
  } = {}): PlanRunRow[] {
    const where: string[] = ["user_id = ?", "status != 'deleted'"];
    const params: any[] = [userId];
    if (filters.scope) { where.push("scope = ?"); params.push(filters.scope); }
    if (filters.favorite) { where.push("is_favorite = 1"); }
    params.push(filters.limit ?? 100);
    return getDb().prepare(
      `SELECT * FROM plan_runs WHERE ${where.join(" AND ")} ORDER BY is_favorite DESC, updated_at DESC LIMIT ?`
    ).all(...params) as PlanRunRow[];
  },
  countPlanRuns(userId: string): { total: number; byScope: Record<string, number> } {
    const total = (getDb().prepare("SELECT COUNT(*) as c FROM plan_runs WHERE user_id = ? AND status != 'deleted'").get(userId) as { c: number }).c;
    const byScopeRows = getDb().prepare("SELECT scope, COUNT(*) as c FROM plan_runs WHERE user_id = ? AND status != 'deleted' GROUP BY scope").all(userId) as { scope: string; c: number }[];
    const byScope: Record<string, number> = {};
    for (const r of byScopeRows) byScope[r.scope] = r.c;
    return { total, byScope };
  },
  togglePlanRunFavorite(userId: string, id: string, value: boolean): boolean {
    const r = getDb().prepare(
      "UPDATE plan_runs SET is_favorite = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ? AND status != 'deleted'"
    ).run(value ? 1 : 0, id, userId);
    return (r.changes ?? 0) > 0;
  },
  softDeletePlanRun(userId: string, id: string): boolean {
    const r = getDb().prepare(
      "UPDATE plan_runs SET status = 'deleted', updated_at = datetime('now') WHERE id = ? AND user_id = ?"
    ).run(id, userId);
    return (r.changes ?? 0) > 0;
  },
  appendPlanExecutionLog(userId: string, id: string, entry: Record<string, unknown>): boolean {
    const row = this.getPlanRun(userId, id);
    if (!row) return false;
    let log: unknown[] = [];
    try { log = JSON.parse(row.execution_log); if (!Array.isArray(log)) log = []; } catch {}
    log.push({ ts: new Date().toISOString(), ...entry });
    // 최근 200건만 보관 (메모리/조회 보호)
    if (log.length > 200) log = log.slice(-200);
    const r = getDb().prepare(
      "UPDATE plan_runs SET execution_log = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
    ).run(JSON.stringify(log), id, userId);
    return (r.changes ?? 0) > 0;
  },
  updatePlanSelfLearning(userId: string, id: string, learning: Record<string, unknown>): boolean {
    const r = getDb().prepare(
      "UPDATE plan_runs SET self_learning = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
    ).run(JSON.stringify(learning), id, userId);
    return (r.changes ?? 0) > 0;
  },

  // ===== brand templates (카드뉴스 디자인 템플릿) =====
  // 사용자별 한도: 최대 30개. 초과 시 createBrandTemplate가 거부.
  countActiveBrandTemplates(userId: string): number {
    return (getDb().prepare("SELECT COUNT(*) as c FROM brand_templates WHERE user_id = ? AND status = 'active'").get(userId) as { c: number }).c;
  },
  listBrandTemplates(userId: string, filters: { favorite?: boolean; activeOnly?: boolean; limit?: number } = {}): BrandTemplateRow[] {
    const where: string[] = ["user_id = ?", "status = 'active'"];
    const params: any[] = [userId];
    if (filters.favorite) where.push("is_favorite = 1");
    if (filters.activeOnly) where.push("is_active = 1");
    params.push(filters.limit ?? 100);
    return getDb().prepare(
      `SELECT * FROM brand_templates WHERE ${where.join(" AND ")} ORDER BY is_active DESC, is_favorite DESC, updated_at DESC LIMIT ?`
    ).all(...params) as BrandTemplateRow[];
  },
  getBrandTemplate(userId: string, id: string): BrandTemplateRow | undefined {
    return getDb().prepare(
      "SELECT * FROM brand_templates WHERE id = ? AND user_id = ? AND status = 'active'"
    ).get(id, userId) as BrandTemplateRow | undefined;
  },
  getActiveBrandTemplate(userId: string): BrandTemplateRow | undefined {
    return getDb().prepare(
      "SELECT * FROM brand_templates WHERE user_id = ? AND status = 'active' AND is_active = 1 LIMIT 1"
    ).get(userId) as BrandTemplateRow | undefined;
  },
  createBrandTemplate(userId: string, t: {
    name: string;
    source: string;
    tokens_json: string;
    tone_profile?: string;
    reference_meta?: string;
    preview_image?: string | null;
  }): BrandTemplateRow {
    const cnt = this.countActiveBrandTemplates(userId);
    if (cnt >= 30) throw new Error("브랜드 템플릿 최대 30개 제한 — 오래된 템플릿을 삭제 또는 보관해주세요.");
    const id = uid("btpl");
    getDb().prepare(
      `INSERT INTO brand_templates (id, user_id, name, source, tokens_json, tone_profile, reference_meta, preview_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, userId,
      t.name.slice(0, 100),
      t.source,
      t.tokens_json,
      t.tone_profile ?? "{}",
      t.reference_meta ?? "{}",
      t.preview_image ?? null,
    );
    return this.getBrandTemplate(userId, id)!;
  },
  // 활성 템플릿 1개 강제 — 다른 모든 템플릿 비활성화 후 지정 템플릿만 활성
  activateBrandTemplate(userId: string, id: string): boolean {
    const target = this.getBrandTemplate(userId, id);
    if (!target) return false;
    const tx = getDb().transaction(() => {
      getDb().prepare("UPDATE brand_templates SET is_active = 0, updated_at = datetime('now') WHERE user_id = ? AND is_active = 1").run(userId);
      getDb().prepare("UPDATE brand_templates SET is_active = 1, updated_at = datetime('now') WHERE id = ? AND user_id = ?").run(id, userId);
    });
    tx();
    return true;
  },
  toggleBrandTemplateFavorite(userId: string, id: string, value: boolean): boolean {
    const r = getDb().prepare(
      "UPDATE brand_templates SET is_favorite = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ? AND status = 'active'"
    ).run(value ? 1 : 0, id, userId);
    return (r.changes ?? 0) > 0;
  },
  incrementBrandTemplateUsage(userId: string, id: string): void {
    getDb().prepare(
      "UPDATE brand_templates SET usage_count = usage_count + 1, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
    ).run(id, userId);
  },
  softDeleteBrandTemplate(userId: string, id: string): boolean {
    // 활성 템플릿이면 삭제 거부 (먼저 다른 걸로 활성화하라고)
    const t = this.getBrandTemplate(userId, id);
    if (!t) return false;
    if (t.is_active === 1) throw new Error("활성 템플릿은 삭제할 수 없습니다. 먼저 다른 템플릿을 활성화해 주세요.");
    const r = getDb().prepare(
      "UPDATE brand_templates SET status = 'deleted', is_active = 0, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
    ).run(id, userId);
    return (r.changes ?? 0) > 0;
  },

  // ===== monthly card plans (위저드 산출물) =====
  // 사용자별 active 한도: 12개.
  countActiveMonthlyPlans(userId: string): number {
    return (getDb().prepare("SELECT COUNT(*) as c FROM monthly_card_plans WHERE user_id = ? AND status != 'done'").get(userId) as { c: number }).c;
  },
  listMonthlyPlans(userId: string, limit = 50): MonthlyCardPlanRow[] {
    return getDb().prepare(
      "SELECT * FROM monthly_card_plans WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?"
    ).all(userId, limit) as MonthlyCardPlanRow[];
  },
  getMonthlyPlan(userId: string, id: string): MonthlyCardPlanRow | undefined {
    return getDb().prepare(
      "SELECT * FROM monthly_card_plans WHERE id = ? AND user_id = ?"
    ).get(id, userId) as MonthlyCardPlanRow | undefined;
  },
  createMonthlyPlan(userId: string, p: {
    month: string;
    plan_run_id?: string | null;
    brand_template_id: string;
    cards_json: string;
  }): MonthlyCardPlanRow {
    const cnt = this.countActiveMonthlyPlans(userId);
    if (cnt >= 12) throw new Error("진행 중인 월간 계획 최대 12개 제한 — 완료/삭제 후 다시 시도해 주세요.");
    const id = uid("mcp");
    getDb().prepare(
      `INSERT INTO monthly_card_plans (id, user_id, month, plan_run_id, brand_template_id, cards_json, status)
       VALUES (?, ?, ?, ?, ?, ?, 'planning')`
    ).run(id, userId, p.month, p.plan_run_id ?? null, p.brand_template_id, p.cards_json);
    return this.getMonthlyPlan(userId, id)!;
  },
  updateMonthlyPlan(userId: string, id: string, patch: { cards_json?: string; status?: string; approval_token?: string | null; progress_json?: string }): boolean {
    const allowed = ["cards_json", "status", "approval_token", "progress_json"];
    const sets: string[] = [];
    const params: Record<string, unknown> = { id, user_id: userId };
    for (const [k, v] of Object.entries(patch)) {
      if (allowed.includes(k) && v !== undefined) { sets.push(`${k} = @${k}`); params[k] = v; }
    }
    if (sets.length === 0) return false;
    sets.push("updated_at = datetime('now')");
    const r = getDb().prepare(
      `UPDATE monthly_card_plans SET ${sets.join(", ")} WHERE id = @id AND user_id = @user_id`
    ).run(params);
    return (r.changes ?? 0) > 0;
  },
  deleteMonthlyPlan(userId: string, id: string): boolean {
    const r = getDb().prepare("DELETE FROM monthly_card_plans WHERE id = ? AND user_id = ?").run(id, userId);
    return (r.changes ?? 0) > 0;
  },

  // ===== reference board =====
  listReferenceBoard(userId: string, opts: { brandId?: string | null; starredOnly?: boolean; limit?: number } = {}): ReferenceBoardRow[] {
    const where: string[] = ["user_id = ?", "status = 'active'"];
    const params: any[] = [userId];
    if (opts.brandId !== undefined) {
      if (opts.brandId === null) { where.push("(brand_id IS NULL OR brand_id = '')"); }
      else { where.push("brand_id = ?"); params.push(opts.brandId); }
    }
    if (opts.starredOnly) where.push("is_starred = 1");
    params.push(opts.limit ?? 60);
    return getDb().prepare(
      `SELECT * FROM reference_board WHERE ${where.join(" AND ")} ORDER BY is_starred DESC, fit_score DESC, updated_at DESC LIMIT ?`
    ).all(...params) as ReferenceBoardRow[];
  },
  getReference(userId: string, id: string): ReferenceBoardRow | undefined {
    return getDb().prepare("SELECT * FROM reference_board WHERE id = ? AND user_id = ? AND status = 'active'").get(id, userId) as ReferenceBoardRow | undefined;
  },
  createReference(userId: string, r: {
    brand_id?: string | null;
    source: string;
    domain?: string | null;
    title?: string;
    memo?: string;
    tags?: string[];
    preview_image?: string | null;
    design_tokens?: Record<string, unknown>;
    fit_score?: number;
    query?: string | null;
  }): ReferenceBoardRow {
    const cnt = (getDb().prepare("SELECT COUNT(*) as c FROM reference_board WHERE user_id = ? AND status = 'active'").get(userId) as { c: number }).c;
    if (cnt >= 200) throw new Error("레퍼런스 보드 한도(200건)에 도달했습니다.");
    const id = uid("ref");
    getDb().prepare(
      `INSERT INTO reference_board (id, user_id, brand_id, source, domain, title, memo, tags, preview_image, design_tokens, fit_score, query)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, userId,
      r.brand_id ?? null,
      r.source,
      r.domain ?? null,
      (r.title ?? "").slice(0, 200),
      (r.memo ?? "").slice(0, 1000),
      JSON.stringify(r.tags ?? []),
      r.preview_image ?? null,
      JSON.stringify(r.design_tokens ?? {}),
      Math.max(0, Math.min(100, r.fit_score ?? 0)),
      r.query ?? null,
    );
    return this.getReference(userId, id)!;
  },
  updateReference(userId: string, id: string, patch: { memo?: string; tags?: string[]; is_starred?: boolean; brand_id?: string | null; promoted_template_id?: string | null }): boolean {
    const sets: string[] = [];
    const params: Record<string, unknown> = { id, user_id: userId };
    if (patch.memo !== undefined) { sets.push("memo = @memo"); params.memo = patch.memo.slice(0, 1000); }
    if (patch.tags !== undefined) { sets.push("tags = @tags"); params.tags = JSON.stringify(patch.tags); }
    if (patch.is_starred !== undefined) { sets.push("is_starred = @is_starred"); params.is_starred = patch.is_starred ? 1 : 0; }
    if (patch.brand_id !== undefined) { sets.push("brand_id = @brand_id"); params.brand_id = patch.brand_id; }
    if (patch.promoted_template_id !== undefined) { sets.push("promoted_template_id = @promoted_template_id"); params.promoted_template_id = patch.promoted_template_id; }
    if (sets.length === 0) return false;
    sets.push("updated_at = datetime('now')");
    const r = getDb().prepare(`UPDATE reference_board SET ${sets.join(", ")} WHERE id = @id AND user_id = @user_id`).run(params);
    return (r.changes ?? 0) > 0;
  },
  softDeleteReference(userId: string, id: string): boolean {
    const r = getDb().prepare("UPDATE reference_board SET status = 'deleted', updated_at = datetime('now') WHERE id = ? AND user_id = ?").run(id, userId);
    return (r.changes ?? 0) > 0;
  },

  // ===== card library (편집 가능한 결과물 보관함) =====
  listCardLibrary(userId: string, opts: { brandId?: string | null; reviewState?: string; limit?: number } = {}): CardLibraryRow[] {
    const where: string[] = ["user_id = ?", "status = 'active'"];
    const params: any[] = [userId];
    if (opts.brandId !== undefined) {
      if (opts.brandId === null) where.push("(brand_id IS NULL OR brand_id = '')");
      else { where.push("brand_id = ?"); params.push(opts.brandId); }
    }
    if (opts.reviewState) { where.push("review_state = ?"); params.push(opts.reviewState); }
    params.push(opts.limit ?? 80);
    return getDb().prepare(
      `SELECT * FROM card_library WHERE ${where.join(" AND ")} ORDER BY is_favorite DESC, updated_at DESC LIMIT ?`
    ).all(...params) as CardLibraryRow[];
  },
  getCardLibrary(userId: string, id: string): CardLibraryRow | undefined {
    return getDb().prepare("SELECT * FROM card_library WHERE id = ? AND user_id = ? AND status = 'active'").get(id, userId) as CardLibraryRow | undefined;
  },
  createCardLibrary(userId: string, p: {
    brand_id?: string | null;
    monthly_plan_id?: string | null;
    card_id?: string | null;
    title: string;
    category?: string;
    cards_json: string;
    caption_json?: string;
    hashtags?: string[];
    template_id?: string | null;
    template_snapshot?: Record<string, unknown>;
    auto_flags?: unknown[];
    thumb?: string | null;
    cost_krw?: number;
  }): CardLibraryRow {
    const id = uid("clib");
    getDb().prepare(
      `INSERT INTO card_library (id, user_id, brand_id, monthly_plan_id, card_id, title, category, cards_json, caption_json, hashtags, template_id, template_snapshot, auto_flags, thumb, cost_krw)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, userId,
      p.brand_id ?? null,
      p.monthly_plan_id ?? null,
      p.card_id ?? null,
      p.title.slice(0, 200),
      (p.category ?? "").slice(0, 60),
      p.cards_json,
      p.caption_json ?? "{}",
      JSON.stringify(p.hashtags ?? []),
      p.template_id ?? null,
      JSON.stringify(p.template_snapshot ?? {}),
      JSON.stringify(p.auto_flags ?? []),
      p.thumb ?? null,
      p.cost_krw ?? 0,
    );
    // v1 스냅샷 자동 저장
    this.appendCardVersion(userId, id, { cards_json: p.cards_json, caption_json: p.caption_json ?? "{}", hashtags: p.hashtags ?? [], change_note: "AI 초안" });
    return this.getCardLibrary(userId, id)!;
  },
  updateCardLibrary(userId: string, id: string, patch: { cards_json?: string; caption_json?: string; hashtags?: string[]; review_state?: string; auto_flags?: unknown[]; is_favorite?: boolean; title?: string; thumb?: string | null; change_note?: string }): boolean {
    const allowed: Record<string, string> = {
      cards_json: "cards_json", caption_json: "caption_json", review_state: "review_state",
      title: "title", thumb: "thumb",
    };
    const sets: string[] = [];
    const params: Record<string, unknown> = { id, user_id: userId };
    for (const [k, dbCol] of Object.entries(allowed)) {
      const v = (patch as any)[k];
      if (v !== undefined) { sets.push(`${dbCol} = @${k}`); params[k] = v; }
    }
    if (patch.hashtags !== undefined) { sets.push("hashtags = @hashtags"); params.hashtags = JSON.stringify(patch.hashtags); }
    if (patch.auto_flags !== undefined) { sets.push("auto_flags = @auto_flags"); params.auto_flags = JSON.stringify(patch.auto_flags); }
    if (patch.is_favorite !== undefined) { sets.push("is_favorite = @is_favorite"); params.is_favorite = patch.is_favorite ? 1 : 0; }
    if (sets.length === 0) return false;
    sets.push("updated_at = datetime('now')");
    const r = getDb().prepare(`UPDATE card_library SET ${sets.join(", ")} WHERE id = @id AND user_id = @user_id`).run(params);
    if ((r.changes ?? 0) > 0 && (patch.cards_json !== undefined || patch.caption_json !== undefined || patch.hashtags !== undefined)) {
      const cur = this.getCardLibrary(userId, id);
      if (cur) {
        this.appendCardVersion(userId, id, {
          cards_json: cur.cards_json,
          caption_json: cur.caption_json,
          hashtags: JSON.parse(cur.hashtags || "[]"),
          change_note: patch.change_note ?? "수동 수정",
        });
      }
    }
    return (r.changes ?? 0) > 0;
  },
  softDeleteCardLibrary(userId: string, id: string): boolean {
    const r = getDb().prepare("UPDATE card_library SET status = 'deleted', updated_at = datetime('now') WHERE id = ? AND user_id = ?").run(id, userId);
    return (r.changes ?? 0) > 0;
  },

  // ===== card versions =====
  appendCardVersion(userId: string, libraryId: string, v: { cards_json: string; caption_json?: string; hashtags?: string[]; change_note?: string }): void {
    const next = ((getDb().prepare("SELECT COALESCE(MAX(version), 0) as m FROM card_versions WHERE library_id = ?").get(libraryId) as { m: number }).m) + 1;
    const id = uid("cver");
    getDb().prepare(
      `INSERT INTO card_versions (id, library_id, user_id, version, cards_json, caption_json, hashtags, change_note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, libraryId, userId, next, v.cards_json, v.caption_json ?? "{}", JSON.stringify(v.hashtags ?? []), (v.change_note ?? "").slice(0, 200));
    // 한 항목당 최대 30버전 — 초과 시 가장 오래된 버전 삭제
    getDb().prepare(
      `DELETE FROM card_versions WHERE library_id = ? AND version <= (
         SELECT version FROM card_versions WHERE library_id = ? ORDER BY version DESC LIMIT 1 OFFSET 30
       )`
    ).run(libraryId, libraryId);
  },
  listCardVersions(userId: string, libraryId: string): CardVersionRow[] {
    return getDb().prepare(
      "SELECT * FROM card_versions WHERE library_id = ? AND user_id = ? ORDER BY version DESC"
    ).all(libraryId, userId) as CardVersionRow[];
  },

  // ===== publish queue =====
  listPublishQueue(userId: string, status?: string, limit = 50): PublishQueueRow[] {
    if (status) {
      return getDb().prepare(
        "SELECT * FROM publish_queue WHERE user_id = ? AND status = ? ORDER BY scheduled_at ASC LIMIT ?"
      ).all(userId, status, limit) as PublishQueueRow[];
    }
    return getDb().prepare(
      "SELECT * FROM publish_queue WHERE user_id = ? ORDER BY scheduled_at ASC LIMIT ?"
    ).all(userId, limit) as PublishQueueRow[];
  },
  enqueuePublish(userId: string, p: { library_id: string; brand_id?: string | null; channel?: string; scheduled_at: string }): PublishQueueRow {
    const id = uid("pubq");
    getDb().prepare(
      `INSERT INTO publish_queue (id, user_id, brand_id, library_id, channel, scheduled_at) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, userId, p.brand_id ?? null, p.library_id, p.channel ?? "instagram", p.scheduled_at);
    return getDb().prepare("SELECT * FROM publish_queue WHERE id = ?").get(id) as PublishQueueRow;
  },
  cancelPublishQueue(userId: string, id: string): boolean {
    const r = getDb().prepare(
      "UPDATE publish_queue SET status = 'canceled', updated_at = datetime('now') WHERE id = ? AND user_id = ? AND status = 'queued'"
    ).run(id, userId);
    return (r.changes ?? 0) > 0;
  },

  listAdminLogs(limit = 100): AdminLogRow[] {
    return getDb()
      .prepare("SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT ?")
      .all(limit) as AdminLogRow[];
  },

  // ===== agent sessions =====
  getAgentSession(userId: string, agentType: string): AgentSessionRow | undefined {
    return getDb().prepare(
      "SELECT * FROM agent_sessions WHERE user_id = ? AND agent_type = ? ORDER BY started_at DESC LIMIT 1"
    ).get(userId, agentType) as AgentSessionRow | undefined;
  },
  getAgentSessionById(id: string): AgentSessionRow | undefined {
    return getDb().prepare("SELECT * FROM agent_sessions WHERE id = ?").get(id) as AgentSessionRow | undefined;
  },
  createAgentSession(userId: string, agentType: string, task: string): AgentSessionRow {
    const id = uid("asn");
    getDb().prepare(
      "INSERT INTO agent_sessions (id, user_id, agent_type, status, current_task) VALUES (?, ?, ?, 'running', ?)"
    ).run(id, userId, agentType, task);
    return getDb().prepare("SELECT * FROM agent_sessions WHERE id = ?").get(id) as AgentSessionRow;
  },
  updateAgentSession(id: string, patch: Partial<AgentSessionRow>) {
    const entries: string[] = [];
    const params: Record<string, unknown> = { id };
    const allowed = ["status","current_task","last_reported_at","completed_at","error_message","metadata","conversation_history"];
    for (const [k, v] of Object.entries(patch)) {
      if (allowed.includes(k) && v !== undefined) {
        entries.push(`${k} = @${k}`);
        params[k] = typeof v === "object" ? JSON.stringify(v) : v;
      }
    }
    if (entries.length === 0) return;
    getDb().prepare(`UPDATE agent_sessions SET ${entries.join(", ")} WHERE id = @id`).run(params);
  },
  getAllAgentSessions(userId: string): AgentSessionRow[] {
    return getDb().prepare(
      "SELECT * FROM agent_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT 4"
    ).all(userId) as AgentSessionRow[];
  },
  countAgentSessionsForUser(userId: string, agentType: string, daysWindow?: number): number {
    if (daysWindow && daysWindow > 0) {
      const row = getDb().prepare(
        "SELECT COUNT(*) as c FROM agent_sessions WHERE user_id = ? AND agent_type = ? AND started_at >= datetime('now', ?)"
      ).get(userId, agentType, `-${daysWindow} days`) as { c: number };
      return row.c;
    }
    const row = getDb().prepare(
      "SELECT COUNT(*) as c FROM agent_sessions WHERE user_id = ? AND agent_type = ?"
    ).get(userId, agentType) as { c: number };
    return row.c;
  },
  listRecentAgentSessions(userId: string, limit = 20): AgentSessionRow[] {
    return getDb().prepare(
      "SELECT * FROM agent_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ?"
    ).all(userId, limit) as AgentSessionRow[];
  },

  // ===== agent logs =====
  createAgentLog(entry: { session_id: string; agent_type: string; user_id: string; level: string; message: string; technical_detail?: string; metadata?: Record<string,unknown> }): AgentLogRow {
    const id = uid("alg");
    getDb().prepare(
      "INSERT INTO agent_logs (id, session_id, agent_type, user_id, level, message, technical_detail, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(id, entry.session_id, entry.agent_type, entry.user_id, entry.level, entry.message, entry.technical_detail ?? null, JSON.stringify(entry.metadata ?? {}));
    return getDb().prepare("SELECT * FROM agent_logs WHERE id = ?").get(id) as AgentLogRow;
  },
  listAgentLogs(sessionId: string, limit = 50): AgentLogRow[] {
    return getDb().prepare(
      "SELECT * FROM agent_logs WHERE session_id = ? ORDER BY created_at DESC LIMIT ?"
    ).all(sessionId, limit) as AgentLogRow[];
  },
  listRecentAgentLogs(userId: string, limit = 100): AgentLogRow[] {
    return getDb().prepare(
      "SELECT * FROM agent_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
    ).all(userId, limit) as AgentLogRow[];
  },

  // ===== approval requests =====
  createApprovalRequest(r: {
    session_id: string; user_id: string; agent_type: string;
    title: string; description: string; action_type: string;
    payload: Record<string,unknown>; preview_data?: Record<string,unknown>;
    urgency_level?: string; expires_in_minutes?: number;
    resume_data?: Record<string,unknown>;
  }): ApprovalRequestRow {
    const id = uid("apr");
    const expiresAt = new Date(Date.now() + (r.expires_in_minutes ?? 60) * 60 * 1000).toISOString();
    getDb().prepare(
      `INSERT INTO approval_requests (id,session_id,user_id,agent_type,title,description,action_type,payload,preview_data,urgency_level,expires_at,resume_data)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(id, r.session_id, r.user_id, r.agent_type, r.title, r.description, r.action_type,
      JSON.stringify(r.payload), JSON.stringify(r.preview_data ?? {}),
      r.urgency_level ?? "normal", expiresAt, JSON.stringify(r.resume_data ?? {}));
    return getDb().prepare("SELECT * FROM approval_requests WHERE id = ?").get(id) as ApprovalRequestRow;
  },
  listPendingApprovals(userId: string): ApprovalRequestRow[] {
    return getDb().prepare(
      "SELECT * FROM approval_requests WHERE user_id = ? AND status = 'pending' ORDER BY created_at ASC"
    ).all(userId) as ApprovalRequestRow[];
  },
  getApprovalRequest(id: string): ApprovalRequestRow | undefined {
    return getDb().prepare("SELECT * FROM approval_requests WHERE id = ?").get(id) as ApprovalRequestRow | undefined;
  },
  resolveApproval(id: string, action: "approved" | "rejected", resolvedBy: string, rejectReason?: string) {
    getDb().prepare(
      "UPDATE approval_requests SET status = ?, resolved_at = datetime('now'), resolved_by = ?, reject_reason = ? WHERE id = ?"
    ).run(action, resolvedBy, rejectReason ?? null, id);
  },

  // ===== financial records =====
  createFinancialRecord(r: { user_id: string; type: string; category: string; amount: number; description?: string; channel?: string; product_name?: string; date: string; tags?: string[]; generated_by?: string; source_session_id?: string }): FinancialRecordRow {
    const id = uid("fin");
    getDb().prepare(
      `INSERT INTO financial_records (id,user_id,type,category,amount,description,channel,product_name,date,tags,generated_by,source_session_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(id, r.user_id, r.type, r.category, r.amount, r.description ?? "", r.channel ?? null, r.product_name ?? null, r.date, JSON.stringify(r.tags ?? []), r.generated_by ?? "user", r.source_session_id ?? null);
    return getDb().prepare("SELECT * FROM financial_records WHERE id = ?").get(id) as FinancialRecordRow;
  },
  listFinancialRecords(userId: string, period?: string): FinancialRecordRow[] {
    if (period) {
      return getDb().prepare(
        "SELECT * FROM financial_records WHERE user_id = ? AND date LIKE ? ORDER BY date DESC LIMIT 500"
      ).all(userId, `${period}%`) as FinancialRecordRow[];
    }
    return getDb().prepare(
      "SELECT * FROM financial_records WHERE user_id = ? ORDER BY date DESC LIMIT 500"
    ).all(userId) as FinancialRecordRow[];
  },
  getFinancialSummary(userId: string, period: string): { total_revenue: number; total_expense: number; net_profit: number; ad_spend: number } {
    const d = getDb();
    const revenue = (d.prepare("SELECT IFNULL(SUM(amount),0) as v FROM financial_records WHERE user_id = ? AND type = 'revenue' AND date LIKE ?").get(userId, `${period}%`) as { v: number }).v;
    const expense = (d.prepare("SELECT IFNULL(SUM(amount),0) as v FROM financial_records WHERE user_id = ? AND type = 'expense' AND date LIKE ?").get(userId, `${period}%`) as { v: number }).v;
    const adSpend = (d.prepare("SELECT IFNULL(SUM(amount),0) as v FROM financial_records WHERE user_id = ? AND type = 'expense' AND category = 'ad' AND date LIKE ?").get(userId, `${period}%`) as { v: number }).v;
    return { total_revenue: revenue, total_expense: expense, net_profit: revenue - expense, ad_spend: adSpend };
  },

  // ===== settings =====
  getSettings(): Record<string, string> {
    const rows = getDb().prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
    const out: Record<string, string> = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
  },
  setSetting(key: string, value: string) {
    getDb()
      .prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
      .run(key, value);
  },
};
