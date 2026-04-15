import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;
  const dbPath = path.resolve(process.cwd(), "data/users.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  _db = new Database(dbPath);
  _db.pragma("journal_mode = WAL");
  // 테이블이 없으면 생성
  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      business_name TEXT NOT NULL,
      brand_display_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  return _db;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  business_name: string;
  brand_display_name: string;
  created_at: string;
}

export const db = {
  getUserByEmail(email: string): UserRow | undefined {
    return getDb()
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as UserRow | undefined;
  },

  createUser(user: Omit<UserRow, "created_at">): UserRow {
    const stmt = getDb().prepare(`
      INSERT INTO users (id, name, email, password_hash, business_name, brand_display_name)
      VALUES (@id, @name, @email, @password_hash, @business_name, @brand_display_name)
    `);
    stmt.run({
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.password_hash,
      business_name: user.business_name,
      brand_display_name: user.brand_display_name,
    });
    return getDb()
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(user.id) as UserRow;
  },
};
