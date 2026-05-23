import pool from "@/be/db";
import type { PoolConnection } from "mysql2/promise";
import { DONATION_COLUMN_DEFINITIONS, ensureTableColumn } from "./columns";

let donationSecurityColumnsReady: Promise<void> | null = null;

async function ensureDonationsColumn(
  conn: PoolConnection,
  columnName: keyof typeof DONATION_COLUMN_DEFINITIONS
): Promise<void> {
  await ensureTableColumn(conn, "donations", columnName, DONATION_COLUMN_DEFINITIONS[columnName]);
}

async function ensureDonationSecurityColumnsWithConnection(conn: PoolConnection): Promise<void> {
  await ensureDonationsColumn(conn, "status_token_hash");
}

export function ensureDonationSecurityColumns(conn?: PoolConnection): Promise<void> {
  if (conn) return ensureDonationSecurityColumnsWithConnection(conn);

  donationSecurityColumnsReady ??= (async () => {
    const migrationConn = await pool.getConnection();
    try {
      await ensureDonationSecurityColumnsWithConnection(migrationConn);
    } finally {
      migrationConn.release();
    }
  })().catch((error) => {
    donationSecurityColumnsReady = null;
    throw error;
  });

  return donationSecurityColumnsReady;
}

export async function createDonationsTable(conn: PoolConnection): Promise<void> {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS donations (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      order_id VARCHAR(100) UNIQUE NOT NULL,
      donor_name VARCHAR(100) NOT NULL,
      donor_email VARCHAR(255) DEFAULT NULL,
      amount INT NOT NULL,
      message TEXT DEFAULT NULL,
      status_token_hash CHAR(64) DEFAULT NULL,
      shown_on_overlay TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_order_id (order_id),
      INDEX idx_status_token_hash (status_token_hash),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function createTransactionsTable(conn: PoolConnection): Promise<void> {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(36) PRIMARY KEY,
      donation_id VARCHAR(36) NOT NULL,
      order_id VARCHAR(100) UNIQUE NOT NULL,
      payment_type VARCHAR(50) DEFAULT 'qris',
      transaction_id VARCHAR(100) DEFAULT NULL,
      transaction_status VARCHAR(50) DEFAULT 'pending',
      qr_url VARCHAR(500) DEFAULT NULL,
      deeplink_url VARCHAR(500) DEFAULT NULL,
      paid_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
      INDEX idx_donation_id (donation_id),
      INDEX idx_status (transaction_status),
      INDEX idx_paid_at (paid_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
