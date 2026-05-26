import { v4 as uuidv4 } from "uuid";
import type { RowDataPacket } from "mysql2";
import pool from "@/be/db";
import { SESSION_TOKEN_PATTERN } from "@/shared/auth-constants";
import { env } from "@/be/env";
import { ensureSessionsTable, ensureUserCoreColumns } from "@/be/schema";
import { createSessionToken, hashToken } from "./tokens";
import type { AuthSession, User } from "./types";

export async function cleanupExpiredSessions(): Promise<void> {
  await ensureSessionsTable();
  await pool.execute(`DELETE FROM sessions WHERE expires_at <= NOW()`);
}

export async function createSession(userId: string): Promise<AuthSession> {
  await ensureSessionsTable();
  await cleanupExpiredSessions();

  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE_SECONDS * 1000);

  await pool.execute(
    `INSERT INTO sessions (id, user_id, session_token_hash, expires_at)
     VALUES (?, ?, ?, ?)`,
    [uuidv4(), userId, hashToken(token), expiresAt]
  );

  return { token, expiresAt };
}

export async function deleteSessionByToken(token: string | undefined): Promise<void> {
  if (!token || !SESSION_TOKEN_PATTERN.test(token)) return;

  await ensureSessionsTable();
  await pool.execute(`DELETE FROM sessions WHERE session_token_hash = ?`, [hashToken(token)]);
}

export async function getUserBySessionToken(token: string | undefined): Promise<User | null> {
  if (!token || !SESSION_TOKEN_PATTERN.test(token)) return null;

  await ensureUserCoreColumns();
  await ensureSessionsTable();

  const tokenHash = hashToken(token);
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT u.id, u.username, u.email, u.display_name, u.avatar_url, u.bio,
             u.overlay_token, u.min_amount, u.max_amount,
             u.total_received, u.created_at, u.bank_name, u.bank_account, u.is_admin,
             u.youtube_url, u.instagram_url, u.twitter_url, u.facebook_url
      FROM sessions s
      JOIN users u ON u.id = s.user_id
     WHERE s.session_token_hash = ?
       AND s.expires_at > NOW()
       AND u.is_active = 1
       AND u.banned_at IS NULL`,
    [tokenHash]
  );

  if (rows.length === 0) return null;
  await pool.execute(`UPDATE sessions SET updated_at = NOW() WHERE session_token_hash = ?`, [tokenHash]);
  return rows[0] as User;
}
