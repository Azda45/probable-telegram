import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { v4 as uuidv4 } from "uuid";
import type { RowDataPacket } from "mysql2";
import pool from "@/be/db";
import { ensureUserCoreColumns } from "@/be/schema";
import { createDefaultOverlaySettings } from "./overlay-settings";
import type { OverlayOwner, User } from "./types";

export async function createUser(username: string, email: string, password: string, displayName: string): Promise<User> {
  const id = uuidv4();
  const passwordHash = await bcrypt.hash(password, 12);
  const streamKey = nanoid(32);
  const overlayToken = nanoid(32);

  await pool.execute(
    `INSERT INTO users (id, username, email, password_hash, display_name, stream_key, overlay_token)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, username, email, passwordHash, displayName, streamKey, overlayToken]
  );
  await createDefaultOverlaySettings(id);

  return getUserById(id) as Promise<User>;
}

export async function authenticateUser(login: string, password: string): Promise<User | null> {
  await ensureUserCoreColumns();

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM users WHERE username = ? OR email = ?`,
    [login, login]
  );
  if (rows.length === 0) return null;

  const user = rows[0];
  if (Number(user.is_active) !== 1 || user.banned_at) return null;
  if (!(await bcrypt.compare(password, user.password_hash))) return null;

  const rest = { ...user };
  delete rest.password_hash;
  return rest as User;
}

export async function getUserById(id: string): Promise<User | null> {
  await ensureUserCoreColumns();

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, username, email, display_name, avatar_url, bio, stream_key, overlay_token,
            min_amount, max_amount, total_received, created_at, bank_name, bank_account, is_admin
     FROM users WHERE id = ?`,
    [id]
  );
  return rows.length > 0 ? (rows[0] as User) : null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  await ensureUserCoreColumns();

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, username, email, display_name, avatar_url, bio, stream_key, overlay_token,
            min_amount, max_amount, total_received, created_at, bank_name, bank_account, is_admin
     FROM users WHERE username = ?`,
    [username]
  );
  return rows.length > 0 ? (rows[0] as User) : null;
}

export async function getUserByOverlayToken(token: string): Promise<OverlayOwner | null> {
  await ensureUserCoreColumns();

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, username, display_name, overlay_token
     FROM users WHERE overlay_token = ?`,
    [token]
  );
  return rows.length > 0 ? (rows[0] as OverlayOwner) : null;
}

const USER_SETTING_ASSIGNMENTS = {
  display_name: "display_name = ?",
  bio: "bio = ?",
  min_amount: "min_amount = ?",
  max_amount: "max_amount = ?",
  avatar_url: "avatar_url = ?",
  bank_name: "bank_name = ?",
  bank_account: "bank_account = ?",
} as const;

export async function updateUserSettings(
  userId: string,
  settings: Partial<Pick<User, "display_name" | "bio" | "min_amount" | "max_amount" | "avatar_url" | "bank_name" | "bank_account">>
): Promise<void> {
  await ensureUserCoreColumns();

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(settings)) {
    const assignment = USER_SETTING_ASSIGNMENTS[key as keyof typeof USER_SETTING_ASSIGNMENTS];
    if (value !== undefined && assignment) {
      fields.push(assignment);
      values.push(value);
    }
  }

  if (fields.length === 0) return;

  values.push(userId);
  await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
}

export async function regenerateKeys(userId: string): Promise<{ streamKey: string; overlayToken: string }> {
  const streamKey = nanoid(32);
  const overlayToken = nanoid(32);
  await pool.execute(
    `UPDATE users SET stream_key = ?, overlay_token = ? WHERE id = ?`,
    [streamKey, overlayToken, userId]
  );
  return { streamKey, overlayToken };
}
