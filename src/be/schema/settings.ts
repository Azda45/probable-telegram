import pool from "@/be/db";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";

let settingsTableReady: Promise<void> | null = null;

async function createSettingsTables(conn: PoolConnection): Promise<void> {
  // Platform settings table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      setting_key VARCHAR(50) PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Audit logs table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id VARCHAR(36) NOT NULL,
      admin_username VARCHAR(50) NOT NULL,
      action VARCHAR(100) NOT NULL,
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_audit_admin (admin_id),
      INDEX idx_audit_action (action)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Insert default settings if empty
  const [rows] = await conn.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM platform_settings");
  if (rows[0].count === 0) {
    await conn.execute(
      "INSERT INTO platform_settings (setting_key, setting_value) VALUES (?, ?), (?, ?), (?, ?)",
      [
        "platform_fee_percentage", "5",
        "min_withdrawal_amount", "50000",
        "maintenance_mode", "false"
      ]
    );
  }
}

export function ensureSettingsTables(): Promise<void> {
  settingsTableReady ??= (async () => {
    const conn = await pool.getConnection();
    try {
      await createSettingsTables(conn);
    } finally {
      conn.release();
    }
  })().catch((error) => {
    settingsTableReady = null;
    throw error;
  });

  return settingsTableReady;
}
