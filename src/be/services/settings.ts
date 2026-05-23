import type { RowDataPacket } from "mysql2";
import pool from "@/be/db";
import { ensureSettingsTables } from "@/be/schema/settings";

export async function getPlatformSettings(): Promise<Record<string, string>> {
  await ensureSettingsTables();
  
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT setting_key, setting_value FROM platform_settings"
  );
  
  const settings: Record<string, string> = {};
  rows.forEach(r => {
    settings[r.setting_key] = r.setting_value;
  });
  
  return settings;
}

export async function updatePlatformSettings(settings: Record<string, string>, adminId: string, adminUsername: string): Promise<void> {
  await ensureSettingsTables();
  
  for (const [key, value] of Object.entries(settings)) {
    await pool.execute(
      "INSERT INTO platform_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
      [key, value, value]
    );
  }

  await createAuditLog(adminId, adminUsername, "UPDATE_SETTINGS", `Updated platform settings: ${Object.keys(settings).join(', ')}`);
}

export async function createAuditLog(adminId: string, adminUsername: string, action: string, details: string): Promise<void> {
  await ensureSettingsTables();
  
  await pool.execute(
    "INSERT INTO audit_logs (admin_id, admin_username, action, details) VALUES (?, ?, ?, ?)",
    [adminId, adminUsername, action, details]
  );
}

export async function getAuditLogs(page: number = 1, limit: number = 50): Promise<{ logs: any[], total: number }> {
  await ensureSettingsTables();
  const offset = (page - 1) * limit;

  const [countRows] = await pool.execute<RowDataPacket[]>("SELECT COUNT(id) as total FROM audit_logs");
  const total = Number(countRows[0]?.total || 0);

  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [limit.toString(), offset.toString()]
  );

  return { logs: rows, total };
}

export async function getAdminUsers(): Promise<any[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id, username, email, display_name, created_at FROM users WHERE is_admin = 1"
  );
  return rows;
}
