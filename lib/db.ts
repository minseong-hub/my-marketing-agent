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
  } catch {}

  try {
    const cols = _db.prepare("PRAGMA table_info(plans)").all() as { name: string }[];
    const names = cols.map((c) => c.name);
    if (!names.includes("slug")) _db.exec("ALTER TABLE plans ADD COLUMN slug TEXT");
    if (!names.includes("trial_days")) _db.exec("ALTER TABLE plans ADD COLUMN trial_days INTEGER NOT NULL DEFAULT 7");
    if (!names.includes("first_payment_amount")) _db.exec("ALTER TABLE plans ADD COLUMN first_payment_amount INTEGER");
    if (!names.includes("tools")) _db.exec("ALTER TABLE plans ADD COLUMN tools TEXT NOT NULL DEFAULT '[]'");
  } catch {}

  seedDefaults(_db);

  return _db;
}

function seedDefaults(d: Database.Database) {
  // Seed canonical Starter/Growth/Pro plans (archive legacy ones without slug)
  const slugCount = (d.prepare("SELECT COUNT(*) as c FROM plans WHERE slug IN ('starter','growth','pro')").get() as { c: number }).c;
  if (slugCount < 3) {
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
  role: string;
  status: string;
  plan_id: string | null;
  plan_slug: string | null;
  plan_status: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  first_payment_done: number;
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
  createUser(user: Omit<UserRow, "created_at" | "role" | "status" | "plan_id" | "plan_slug" | "plan_status" | "trial_started_at" | "trial_ends_at" | "first_payment_done"> & Partial<Pick<UserRow, "role" | "status" | "plan_id">>): UserRow {
    const stmt = getDb().prepare(`
      INSERT INTO users (id, name, email, password_hash, business_name, brand_display_name, role, status, plan_id)
      VALUES (@id, @name, @email, @password_hash, @business_name, @brand_display_name, @role, @status, @plan_id)
    `);
    stmt.run({
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.password_hash,
      business_name: user.business_name,
      brand_display_name: user.brand_display_name,
      role: user.role ?? "user",
      status: user.status ?? "active",
      plan_id: user.plan_id ?? null,
    });
    return getDb().prepare("SELECT * FROM users WHERE id = ?").get(user.id) as UserRow;
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
  listAdminLogs(limit = 100): AdminLogRow[] {
    return getDb()
      .prepare("SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT ?")
      .all(limit) as AdminLogRow[];
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
