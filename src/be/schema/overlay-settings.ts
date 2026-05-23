import pool from "@/be/db";
import type { PoolConnection } from "mysql2/promise";
import { OVERLAY_SETTINGS_COLUMN_DEFINITIONS, ensureTableColumn } from "./columns";

let overlaySettingsTableReady: Promise<void> | null = null;

async function ensureOverlaySettingsColumnsWithConnection(conn: PoolConnection): Promise<void> {
  for (const [columnName, definition] of Object.entries(OVERLAY_SETTINGS_COLUMN_DEFINITIONS)) {
    await ensureTableColumn(conn, "overlay_settings", columnName, definition);
  }
}

async function ensureOverlaySettingsTableWithConnection(conn: PoolConnection): Promise<void> {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS overlay_settings (
      user_id VARCHAR(36) PRIMARY KEY,
      alert_sound VARCHAR(255) DEFAULT 'default',
      alert_duration INT DEFAULT 5000,
      overlay_style VARCHAR(20) DEFAULT 'right',
      overlay_animation VARCHAR(32) DEFAULT 'slide-up',
      overlay_animation_duration INT DEFAULT 500,
      overlay_animation_enabled TINYINT(1) DEFAULT 1,
      overlay_bg_color VARCHAR(7) DEFAULT '#1e293b',
      overlay_border_color VARCHAR(7) DEFAULT '#334155',
      overlay_text_color VARCHAR(7) DEFAULT '#fafafa',
      overlay_message_color VARCHAR(7) DEFAULT '#a1a1aa',
      overlay_accent_color VARCHAR(7) DEFAULT '#818cf8',
      overlay_progress_color VARCHAR(7) DEFAULT '#818cf8',
      overlay_progress_enabled TINYINT(1) DEFAULT 1,
      action_text VARCHAR(50) DEFAULT 'berdonasi',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await ensureOverlaySettingsColumnsWithConnection(conn);
}

export function ensureOverlaySettingsTable(conn?: PoolConnection): Promise<void> {
  if (conn) return ensureOverlaySettingsTableWithConnection(conn);

  overlaySettingsTableReady ??= (async () => {
    const migrationConn = await pool.getConnection();
    try {
      await ensureOverlaySettingsTableWithConnection(migrationConn);
    } finally {
      migrationConn.release();
    }
  })().catch((error) => {
    overlaySettingsTableReady = null;
    throw error;
  });

  return overlaySettingsTableReady;
}
