import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { PLAN_DEFINITIONS, PLAN_ORDER } from "./plans";

let _db: Database.Database | null = null;

function getDb(): Database.Database {
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
  `);

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
