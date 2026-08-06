import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isPostgres = Boolean(
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.PGHOST ||
  process.env.DB_TYPE === 'postgres'
);

let sqliteDb: any = null;
let pgPool: pg.Pool | null = null;

if (isPostgres) {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (connectionString) {
    pgPool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
  } else {
    pgPool = new Pool({
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'oxybott',
    });
  }
  console.log('[DB] Configured for PostgreSQL database provider.');
} else {
  const dbPath = path.resolve(__dirname, '../../oxybott.db');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');
  console.log('[DB] Configured for SQLite database provider at:', dbPath);
}

// Convert SQLite parameter placeholders (?) to Postgres placeholders ($1, $2...)
function convertSql(sql: string): string {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

export const db = {
  isPostgres,

  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    if (isPostgres && pgPool) {
      const pgSql = convertSql(sql);
      const res = await pgPool.query(pgSql, params);
      return (res.rows[0] as T) || null;
    } else {
      const stmt = sqliteDb.prepare(sql);
      return (stmt.get(...params) as T) || null;
    }
  },

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (isPostgres && pgPool) {
      const pgSql = convertSql(sql);
      const res = await pgPool.query(pgSql, params);
      return res.rows as T[];
    } else {
      const stmt = sqliteDb.prepare(sql);
      return stmt.all(...params) as T[];
    }
  },

  async run(sql: string, params: any[] = []): Promise<{ changes: number; rowCount?: number }> {
    if (isPostgres && pgPool) {
      const pgSql = convertSql(sql);
      const res = await pgPool.query(pgSql, params);
      return { changes: res.rowCount || 0, rowCount: res.rowCount || 0 };
    } else {
      const stmt = sqliteDb.prepare(sql);
      const info = stmt.run(...params);
      return { changes: info.changes };
    }
  },

  async exec(sql: string): Promise<void> {
    if (isPostgres && pgPool) {
      await pgPool.query(sql);
    } else {
      sqliteDb.exec(sql);
    }
  },
};

export async function initDatabase() {
  if (isPostgres && pgPool) {
    try {
      // Test PostgreSQL connection
      await pgPool.query('SELECT 1');
      console.log('[DB] PostgreSQL connected successfully.');

      // 1. Users Table
      await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          username VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          password_hash TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Magic Links Table
      await db.exec(`
        CREATE TABLE IF NOT EXISTS magic_links (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. Password Reset Tokens Table
      await db.exec(`
        CREATE TABLE IF NOT EXISTS password_resets (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('[DB] PostgreSQL tables initialized successfully.');
    } catch (err) {
      console.error('[DB] PostgreSQL connection or initialization error:', err);
    }
  } else {
    // SQLite Tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS magic_links (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('[DB] SQLite Database initialized successfully.');
  }
}
