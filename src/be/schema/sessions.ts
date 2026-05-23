import pool from "@/be/db";
import type { PoolConnection } from "mysql2/promise";

let sessionsTableReady: Promise<void> | null = null;

async function ensureSessionsTableWithConnection(conn: PoolConnection): Promise<void> {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      session_token_hash CHAR(64) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_session_token_hash (session_token_hash),
      INDEX idx_sessions_user_id (user_id),
      INDEX idx_sessions_expires_at (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export function ensureSessionsTable(conn?: PoolConnection): Promise<void> {
  if (conn) return ensureSessionsTableWithConnection(conn);

  sessionsTableReady ??= (async () => {
    const migrationConn = await pool.getConnection();
    try {
      await ensureSessionsTableWithConnection(migrationConn);
    } finally {
      migrationConn.release();
    }
  })().catch((error) => {
    sessionsTableReady = null;
    throw error;
  });

  return sessionsTableReady;
}
