import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { nanoid } from "nanoid";
import pool from "./db";
import { RowDataPacket, ResultSetHeader, QueryResult } from "mysql2";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "secret";

export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  stream_key: string;
  overlay_token: string;
  min_amount: number;
  max_amount: number;
  alert_sound: string;
  alert_duration: number;
  tts_enabled: boolean;
  tts_voice: string;
  total_received: number;
  created_at: Date;
}

export interface Donation {
  id: string;
  user_id: string;
  order_id: string;
  donor_name: string;
  donor_email: string;
  amount: number;
  message: string | null;
  payment_type: string;
  transaction_id: string | null;
  transaction_status: string;
  qr_url: string | null;
  deeplink_url: string | null;
  paid_at: Date | null;
  shown_on_overlay: boolean;
  created_at: Date;
}

// ===================== AUTH =====================

export async function createUser(
  username: string,
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const id = uuidv4();
  const passwordHash = await bcrypt.hash(password, 12);
  const streamKey = nanoid(32);
  const overlayToken = nanoid(32);

  await pool.execute(
    `INSERT INTO users (id, username, email, password_hash, display_name, stream_key, overlay_token) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, username, email, passwordHash, displayName, streamKey, overlayToken]
  );

  return getUserById(id) as Promise<User>;
}

export async function authenticateUser(
  login: string,
  password: string
): Promise<User | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM users WHERE username = ? OR email = ?`,
    [login, login]
  );

  if (rows.length === 0) return null;

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  const { password_hash, ...rest } = user;
  return rest as User;
}

export async function getUserById(id: string): Promise<User | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, username, email, display_name, avatar_url, bio, stream_key, overlay_token,
            min_amount, max_amount, alert_sound, alert_duration, tts_enabled, tts_voice,
            total_received, created_at
     FROM users WHERE id = ?`,
    [id]
  );
  return rows.length > 0 ? (rows[0] as User) : null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, username, email, display_name, avatar_url, bio, stream_key, overlay_token,
            min_amount, max_amount, alert_sound, alert_duration, tts_enabled, tts_voice,
            total_received, created_at
     FROM users WHERE username = ?`,
    [username]
  );
  return rows.length > 0 ? (rows[0] as User) : null;
}

export async function getUserByOverlayToken(token: string): Promise<User | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, username, display_name, overlay_token, alert_sound, alert_duration, tts_enabled, tts_voice
     FROM users WHERE overlay_token = ?`,
    [token]
  );
  return rows.length > 0 ? (rows[0] as User) : null;
}

export async function updateUserSettings(
  userId: string,
  settings: Partial<Pick<User, "display_name" | "bio" | "min_amount" | "max_amount" | "alert_sound" | "alert_duration" | "tts_enabled" | "avatar_url" | "tts_voice">>
): Promise<void> {
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(settings)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) return;

  values.push(userId);
  await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
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

// ===================== TOKEN =====================

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): { id: string; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; username: string };
  } catch {
    return null;
  }
}

// ===================== DONATIONS =====================

export async function createDonation(data: {
  userId: string;
  orderId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  message?: string;
  qrUrl?: string;
  deeplinkUrl?: string;
  transactionId?: string;
}): Promise<Donation> {
  const id = uuidv4();
  const txId = uuidv4();

  // Sanitize & validate
  const sanitizedName = String(data.donorName).trim().substring(0, 100);
  const sanitizedEmail = String(data.donorEmail).trim().toLowerCase().substring(0, 255);
  const sanitizedMessage = data.message ? String(data.message).trim().substring(0, 500) : null;
  const amount = Math.floor(Number(data.amount));

  if (!sanitizedName) throw new Error("Nama donatur tidak valid");
  if (!sanitizedEmail || !sanitizedEmail.includes("@")) throw new Error("Email tidak valid");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Jumlah donasi tidak valid");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(
      `INSERT INTO donations (id, user_id, donor_name, donor_email, amount, message, shown_on_overlay)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [
        id,
        data.userId,
        sanitizedName,
        sanitizedEmail,
        amount,
        sanitizedMessage,
      ]
    );

    await conn.execute(
      `INSERT INTO transactions (id, donation_id, order_id, payment_type, transaction_id, transaction_status, qr_url, deeplink_url)
       VALUES (?, ?, ?, 'qris', ?, 'pending', ?, ?)`,
      [
        txId,
        id,
        data.orderId,
        data.transactionId || null,
        data.qrUrl || null,
        data.deeplinkUrl || null,
      ]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return getDonationById(id) as Promise<Donation>;
}

export async function getDonationById(id: string): Promise<Donation | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT d.*, t.order_id, t.payment_type, t.transaction_id, t.transaction_status, t.qr_url, t.deeplink_url, t.paid_at 
     FROM donations d
     JOIN transactions t ON d.id = t.donation_id
     WHERE d.id = ?`,
    [id]
  );
  return rows.length > 0 ? (rows[0] as Donation) : null;
}

export async function getDonationByOrderId(orderId: string): Promise<Donation | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT d.*, t.order_id, t.payment_type, t.transaction_id, t.transaction_status, t.qr_url, t.deeplink_url, t.paid_at 
     FROM donations d
     JOIN transactions t ON d.id = t.donation_id
     WHERE t.order_id = ?`,
    [orderId]
  );
  return rows.length > 0 ? (rows[0] as Donation) : null;
}

export async function updateDonationStatus(
  orderId: string,
  status: string,
  transactionId?: string
): Promise<void> {
  const paidAt = ["settlement", "capture"].includes(status)
    ? new Date()
    : null;

  await pool.execute(
    `UPDATE transactions SET transaction_status = ?, transaction_id = COALESCE(?, transaction_id), paid_at = COALESCE(?, paid_at), updated_at = NOW() WHERE order_id = ?`,
    [status, transactionId || null, paidAt, orderId]
  );

  // Update user total_received – guarded to prevent double-increment on duplicate webhook calls
  if (["settlement", "capture"].includes(status)) {
    await pool.execute(
      `UPDATE users u
       JOIN donations d ON d.user_id = u.id
       JOIN transactions t ON t.donation_id = d.id
       SET u.total_received = u.total_received + d.amount
       WHERE t.order_id = ? AND t.paid_at IS NOT NULL
         AND (SELECT COUNT(*) FROM transactions t2 WHERE t2.order_id = ? AND t2.transaction_status IN ('settlement','capture')) = 1`,
      [orderId, orderId]
    );
  }
}

export async function getUserDonations(
  userId: string,
  page: number = 1,
  limit: number = 20,
  status?: string
): Promise<{ donations: Donation[]; total: number }> {
  let whereClause = "WHERE d.user_id = ?";
  const params: (string | number)[] = [userId];

  if (status) {
    if (status === "success") {
      whereClause += " AND t.transaction_status IN ('settlement', 'capture')";
    } else if (status === "pending") {
      whereClause += " AND t.transaction_status = 'pending'";
    } else if (status === "failed") {
      whereClause += " AND t.transaction_status IN ('cancel', 'expire', 'deny', 'fraud')";
    } else {
      whereClause += " AND t.transaction_status = ?";
      params.push(status);
    }
  }

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total 
     FROM donations d 
     JOIN transactions t ON d.id = t.donation_id 
     ${whereClause}`,
    params
  );

  const total = countRows[0].total;
  const offset = (page - 1) * limit;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT d.id, d.donor_name, d.donor_email, d.amount, d.message, d.created_at, 
            t.order_id, t.transaction_status, t.paid_at 
     FROM donations d
     JOIN transactions t ON d.id = t.donation_id
     ${whereClause} 
     ORDER BY d.created_at DESC 
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { donations: rows as Donation[], total };
}

export async function getDonationStats(userId: string): Promise<{
  totalAmount: number;
  totalDonations: number;
  todayAmount: number;
  todayDonations: number;
  topDonors: Array<{ donor_name: string; total: number; count: number }>;
}> {
  const [totalRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COALESCE(SUM(d.amount), 0) as totalAmount, COUNT(*) as totalDonations 
     FROM donations d
     JOIN transactions t ON d.id = t.donation_id
     WHERE d.user_id = ? AND t.transaction_status IN ('settlement','capture')`,
    [userId]
  );

  const [todayRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COALESCE(SUM(d.amount), 0) as todayAmount, COUNT(*) as todayDonations 
     FROM donations d
     JOIN transactions t ON d.id = t.donation_id
     WHERE d.user_id = ? AND t.transaction_status IN ('settlement','capture') AND DATE(t.paid_at) = CURDATE()`,
    [userId]
  );

  const [topDonors] = await pool.execute<RowDataPacket[]>(
    `SELECT d.donor_name, SUM(d.amount) as total, COUNT(*) as count 
     FROM donations d
     JOIN transactions t ON d.id = t.donation_id
     WHERE d.user_id = ? AND t.transaction_status IN ('settlement','capture')
     GROUP BY d.donor_name ORDER BY total DESC LIMIT 10`,
    [userId]
  );

  return {
    totalAmount: totalRows[0].totalAmount,
    totalDonations: totalRows[0].totalDonations,
    todayAmount: todayRows[0].todayAmount,
    todayDonations: todayRows[0].todayDonations,
    topDonors: topDonors as Array<{ donor_name: string; total: number; count: number }>,
  };
}
