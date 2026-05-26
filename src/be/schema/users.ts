import pool from "@/be/db";
import type { PoolConnection } from "mysql2/promise";
import { USER_COLUMN_DEFINITIONS, ensureTableColumn } from "./columns";

let userCoreColumnsReady: Promise<void> | null = null;

async function ensureUsersColumn(
  conn: PoolConnection,
  columnName: keyof typeof USER_COLUMN_DEFINITIONS
): Promise<void> {
  await ensureTableColumn(conn, "users", columnName, USER_COLUMN_DEFINITIONS[columnName]);
}

async function ensureUserCoreColumnsWithConnection(conn: PoolConnection): Promise<void> {
  await ensureUsersColumn(conn, "max_amount");
  await ensureUsersColumn(conn, "is_active");
  await ensureUsersColumn(conn, "is_admin");
  await ensureUsersColumn(conn, "banned_at");
  await ensureUsersColumn(conn, "bank_name");
  await ensureUsersColumn(conn, "bank_account");
  await ensureUsersColumn(conn, "withdrawn_amount");
  await ensureUsersColumn(conn, "youtube_url");
  await ensureUsersColumn(conn, "instagram_url");
  await ensureUsersColumn(conn, "twitter_url");
  await ensureUsersColumn(conn, "facebook_url");
}

export function ensureUserCoreColumns(conn?: PoolConnection): Promise<void> {
  if (conn) return ensureUserCoreColumnsWithConnection(conn);

  userCoreColumnsReady ??= (async () => {
    const migrationConn = await pool.getConnection();
    try {
      await ensureUserCoreColumnsWithConnection(migrationConn);
    } finally {
      migrationConn.release();
    }
  })().catch((error) => {
    userCoreColumnsReady = null;
    throw error;
  });

  return userCoreColumnsReady;
}

export async function createUsersTable(conn: PoolConnection): Promise<void> {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      avatar_url VARCHAR(500) DEFAULT NULL,
      bio TEXT DEFAULT NULL,
      overlay_token VARCHAR(64) UNIQUE NOT NULL,
      min_amount INT DEFAULT 1000,
      max_amount INT DEFAULT 10000000,
      is_active TINYINT(1) DEFAULT 1,
      is_admin TINYINT(1) DEFAULT 0,
      banned_at TIMESTAMP NULL DEFAULT NULL,
      youtube_url VARCHAR(255) DEFAULT NULL,
      instagram_url VARCHAR(255) DEFAULT NULL,
      twitter_url VARCHAR(255) DEFAULT NULL,
      facebook_url VARCHAR(255) DEFAULT NULL,
      bank_name VARCHAR(50) DEFAULT NULL,
      bank_account VARCHAR(50) DEFAULT NULL,
      withdrawn_amount BIGINT DEFAULT 0,
      total_received BIGINT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_username (username),
      INDEX idx_overlay_token (overlay_token)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
