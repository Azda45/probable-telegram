import type { RowDataPacket } from "mysql2";
import pool from "@/be/db";
import { ensureOverlaySettingsTable, ensureUserCoreColumns } from "@/be/schema";
import {
  DEFAULT_OVERLAY_ANIMATION_SETTINGS,
  sanitizeOverlayAnimationSettings,
} from "@/shared/overlay-animation";
import type { OverlayOwner, OverlaySettings } from "./types";

const DEFAULT_OVERLAY_SETTINGS: Omit<OverlaySettings, "user_id"> = {
  alert_sound: "default",
  alert_duration: 5000,
  overlay_style: "right",
  overlay_bg_color: "#1e293b",
  overlay_border_color: "#334155",
  overlay_text_color: "#fafafa",
  overlay_message_color: "#a1a1aa",
  overlay_accent_color: "#818cf8",
  overlay_progress_color: "#818cf8",
  overlay_progress_enabled: true,
  ...DEFAULT_OVERLAY_ANIMATION_SETTINGS,
};

function sanitizeAlertSound(value: unknown): string {
  return value === "none" ? "none" : "default";
}

function sanitizeAlertDuration(value: unknown): number {
  const duration = Number(value);
  if (!Number.isFinite(duration)) return DEFAULT_OVERLAY_SETTINGS.alert_duration;
  return Math.max(5000, duration);
}

function sanitizeOverlayStyle(value: unknown): OverlaySettings["overlay_style"] {
  return value === "left" || value === "none" ? value : "right";
}

function sanitizeHexColor(value: unknown, fallback: string): string {
  return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}

function normalizeOverlaySettings(userId: string, source: Record<string, unknown>): OverlaySettings {
  return {
    user_id: userId,
    alert_sound: sanitizeAlertSound(source.alert_sound),
    alert_duration: sanitizeAlertDuration(source.alert_duration),
    overlay_style: sanitizeOverlayStyle(source.overlay_style),
    overlay_bg_color: sanitizeHexColor(source.overlay_bg_color, DEFAULT_OVERLAY_SETTINGS.overlay_bg_color),
    overlay_border_color: sanitizeHexColor(source.overlay_border_color, DEFAULT_OVERLAY_SETTINGS.overlay_border_color),
    overlay_text_color: sanitizeHexColor(source.overlay_text_color, DEFAULT_OVERLAY_SETTINGS.overlay_text_color),
    overlay_message_color: sanitizeHexColor(source.overlay_message_color, DEFAULT_OVERLAY_SETTINGS.overlay_message_color),
    overlay_accent_color: sanitizeHexColor(source.overlay_accent_color, DEFAULT_OVERLAY_SETTINGS.overlay_accent_color),
    overlay_progress_color: sanitizeHexColor(source.overlay_progress_color, DEFAULT_OVERLAY_SETTINGS.overlay_progress_color),
    overlay_progress_enabled: source.overlay_progress_enabled === undefined
      ? DEFAULT_OVERLAY_SETTINGS.overlay_progress_enabled
      : Boolean(Number(source.overlay_progress_enabled)),
    ...sanitizeOverlayAnimationSettings(source),
  };
}

export async function createDefaultOverlaySettings(userId: string): Promise<void> {
  await ensureOverlaySettingsTable();
  await pool.execute(
    `INSERT IGNORE INTO overlay_settings (
       user_id, alert_sound, alert_duration, overlay_style,
       overlay_animation, overlay_animation_duration, overlay_animation_enabled,
       overlay_bg_color, overlay_border_color, overlay_text_color,
       overlay_message_color, overlay_accent_color, overlay_progress_color,
       overlay_progress_enabled
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      DEFAULT_OVERLAY_SETTINGS.alert_sound,
      DEFAULT_OVERLAY_SETTINGS.alert_duration,
      DEFAULT_OVERLAY_SETTINGS.overlay_style,
      DEFAULT_OVERLAY_SETTINGS.overlay_animation,
      DEFAULT_OVERLAY_SETTINGS.overlay_animation_duration,
      DEFAULT_OVERLAY_SETTINGS.overlay_animation_enabled ? 1 : 0,
      DEFAULT_OVERLAY_SETTINGS.overlay_bg_color,
      DEFAULT_OVERLAY_SETTINGS.overlay_border_color,
      DEFAULT_OVERLAY_SETTINGS.overlay_text_color,
      DEFAULT_OVERLAY_SETTINGS.overlay_message_color,
      DEFAULT_OVERLAY_SETTINGS.overlay_accent_color,
      DEFAULT_OVERLAY_SETTINGS.overlay_progress_color,
      DEFAULT_OVERLAY_SETTINGS.overlay_progress_enabled ? 1 : 0,
    ]
  );
}

export async function getOverlaySettingsByUserId(userId: string): Promise<OverlaySettings> {
  await createDefaultOverlaySettings(userId);

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT user_id, alert_sound, alert_duration, overlay_style,
            overlay_animation, overlay_animation_duration, overlay_animation_enabled,
            overlay_bg_color, overlay_border_color, overlay_text_color,
            overlay_message_color, overlay_accent_color, overlay_progress_color,
            overlay_progress_enabled
     FROM overlay_settings
     WHERE user_id = ?`,
    [userId]
  );

  const row = rows[0] || { user_id: userId, ...DEFAULT_OVERLAY_SETTINGS };
  return normalizeOverlaySettings(userId, row as Record<string, unknown>);
}

export async function getOverlaySettingsByToken(token: string): Promise<{ user: OverlayOwner; settings: OverlaySettings } | null> {
  await ensureUserCoreColumns();

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, username, display_name, overlay_token
     FROM users WHERE overlay_token = ?`,
    [token]
  );
  if (rows.length === 0) return null;

  const user = rows[0] as OverlayOwner;
  return { user, settings: await getOverlaySettingsByUserId(user.id) };
}

export async function updateOverlaySettings(
  userId: string,
  settings: Partial<Omit<OverlaySettings, "user_id">>
): Promise<OverlaySettings> {
  await ensureOverlaySettingsTable();

  const normalized = normalizeOverlaySettings(userId, {
    ...DEFAULT_OVERLAY_SETTINGS,
    ...settings,
  });

  await pool.execute(
    `INSERT INTO overlay_settings (
       user_id, alert_sound, alert_duration, overlay_style,
       overlay_animation, overlay_animation_duration, overlay_animation_enabled,
       overlay_bg_color, overlay_border_color, overlay_text_color,
       overlay_message_color, overlay_accent_color, overlay_progress_color,
       overlay_progress_enabled
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       alert_sound = VALUES(alert_sound),
       alert_duration = VALUES(alert_duration),
       overlay_style = VALUES(overlay_style),
       overlay_animation = VALUES(overlay_animation),
       overlay_animation_duration = VALUES(overlay_animation_duration),
       overlay_animation_enabled = VALUES(overlay_animation_enabled),
       overlay_bg_color = VALUES(overlay_bg_color),
       overlay_border_color = VALUES(overlay_border_color),
       overlay_text_color = VALUES(overlay_text_color),
       overlay_message_color = VALUES(overlay_message_color),
       overlay_accent_color = VALUES(overlay_accent_color),
       overlay_progress_color = VALUES(overlay_progress_color),
       overlay_progress_enabled = VALUES(overlay_progress_enabled)`,
    [
      userId,
      normalized.alert_sound,
      normalized.alert_duration,
      normalized.overlay_style,
      normalized.overlay_animation,
      normalized.overlay_animation_duration,
      normalized.overlay_animation_enabled ? 1 : 0,
      normalized.overlay_bg_color,
      normalized.overlay_border_color,
      normalized.overlay_text_color,
      normalized.overlay_message_color,
      normalized.overlay_accent_color,
      normalized.overlay_progress_color,
      normalized.overlay_progress_enabled ? 1 : 0,
    ]
  );

  return normalized;
}
