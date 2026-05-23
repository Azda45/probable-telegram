import pool from "@/be/db";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";

let withdrawalsTableReady: Promise<void> | null = null;

async function createWithdrawalsTable(conn: PoolConnection): Promise<void> {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS withdrawals (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      amount BIGINT NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      bank_name VARCHAR(50) NOT NULL,
      bank_account VARCHAR(50) NOT NULL,
      processed_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_withdrawals_user (user_id),
      INDEX idx_withdrawals_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export function ensureWithdrawalsTable(): Promise<void> {
  withdrawalsTableReady ??= (async () => {
    const conn = await pool.getConnection();
    try {
      await createWithdrawalsTable(conn);
    } finally {
      conn.release();
    }
  })().catch((error) => {
    withdrawalsTableReady = null;
    throw error;
  });

  return withdrawalsTableReady;
}
