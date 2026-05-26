import type { RowDataPacket } from "mysql2";
import type { PoolConnection } from "mysql2/promise";

export const USER_COLUMN_DEFINITIONS = {
  max_amount: "INT DEFAULT 10000000",
  is_active: "TINYINT(1) DEFAULT 1",
  is_admin: "TINYINT(1) DEFAULT 0",
  banned_at: "TIMESTAMP NULL DEFAULT NULL",
  bank_name: "VARCHAR(50) DEFAULT NULL",
  bank_account: "VARCHAR(50) DEFAULT NULL",
  withdrawn_amount: "BIGINT DEFAULT 0",
  youtube_url: "VARCHAR(255) DEFAULT NULL",
  instagram_url: "VARCHAR(255) DEFAULT NULL",
  twitter_url: "VARCHAR(255) DEFAULT NULL",
  facebook_url: "VARCHAR(255) DEFAULT NULL",
} as const;

export const DONATION_COLUMN_DEFINITIONS = {
  status_token_hash: "CHAR(64) DEFAULT NULL",
} as const;

export const OVERLAY_SETTINGS_COLUMN_DEFINITIONS = {
  overlay_bg_color: "VARCHAR(7) DEFAULT '#1e293b'",
  overlay_border_color: "VARCHAR(7) DEFAULT '#334155'",
  overlay_text_color: "VARCHAR(7) DEFAULT '#fafafa'",
  overlay_message_color: "VARCHAR(7) DEFAULT '#a1a1aa'",
  overlay_accent_color: "VARCHAR(7) DEFAULT '#818cf8'",
  overlay_progress_color: "VARCHAR(7) DEFAULT '#818cf8'",
  overlay_progress_enabled: "TINYINT(1) DEFAULT 1",
  action_text: "VARCHAR(50) DEFAULT 'berdonasi'",
} as const;

export async function ensureTableColumn(
  conn: PoolConnection,
  tableName: "users" | "donations" | "overlay_settings",
  columnName: string,
  definition: string
): Promise<void> {
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );

  if (rows.length === 0) {
    await conn.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}
