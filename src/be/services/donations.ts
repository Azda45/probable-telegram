import { v4 as uuidv4 } from "uuid";
import type { RowDataPacket } from "mysql2";
import pool from "@/be/db";
import { ensureDonationSecurityColumns } from "@/be/schema";
import { hashDonationStatusToken } from "./tokens";
import type { Donation, DonationStatusUpdate } from "./types";

export async function createDonation(data: {
  userId: string;
  orderId: string;
  statusTokenHash: string;
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
  const sanitizedName = String(data.donorName).trim().substring(0, 100);
  const sanitizedEmail = String(data.donorEmail).trim().toLowerCase().substring(0, 255);
  const sanitizedMessage = data.message ? String(data.message).trim().substring(0, 500) : null;
  const amount = Math.floor(Number(data.amount));

  if (!sanitizedName) throw new Error("Nama donatur tidak valid");
  if (!sanitizedEmail || !sanitizedEmail.includes("@")) throw new Error("Email tidak valid");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Jumlah donasi tidak valid");
  await ensureDonationSecurityColumns();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `INSERT INTO donations (id, user_id, order_id, donor_name, donor_email, amount, message, status_token_hash, shown_on_overlay)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [id, data.userId, data.orderId, sanitizedName, sanitizedEmail, amount, sanitizedMessage, data.statusTokenHash]
    );
    await conn.execute(
      `INSERT INTO transactions (id, donation_id, order_id, payment_type, transaction_id, transaction_status, qr_url, deeplink_url)
       VALUES (?, ?, ?, 'qris', ?, 'pending', ?, ?)`,
      [txId, id, data.orderId, data.transactionId || null, data.qrUrl || null, data.deeplinkUrl || null]
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

export async function getDonationByOrderIdForStatus(orderId: string, statusToken: string): Promise<Donation | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT d.id, d.user_id, d.order_id, d.amount, t.transaction_status, t.paid_at
     FROM donations d
     JOIN transactions t ON d.id = t.donation_id
     WHERE t.order_id = ? AND d.status_token_hash = ?`,
    [orderId, hashDonationStatusToken(statusToken)]
  );
  return rows.length > 0 ? (rows[0] as Donation) : null;
}

export async function updateDonationStatus(orderId: string, status: string, transactionId?: string): Promise<DonationStatusUpdate> {
  const paidStatuses = new Set(["settlement", "capture"]);
  const requestedIsPaid = paidStatuses.has(status);
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT t.transaction_status, t.paid_at, d.amount, d.user_id
       FROM transactions t
       JOIN donations d ON d.id = t.donation_id
       WHERE t.order_id = ?
       FOR UPDATE`,
      [orderId]
    );
    if (rows.length === 0) throw new Error(`Transaction not found for order ${orderId}`);

    const row = rows[0];
    const previousStatus = String(row.transaction_status);
    const previousPaidAt = row.paid_at ? new Date(row.paid_at) : null;
    const alreadyPaid = paidStatuses.has(previousStatus) && previousPaidAt !== null;
    const currentStatus = alreadyPaid && !requestedIsPaid ? previousStatus : status;
    const paidAt = requestedIsPaid ? previousPaidAt || new Date() : previousPaidAt;
    const becamePaid = !alreadyPaid && requestedIsPaid;
    const statusChanged = currentStatus !== previousStatus;

    await conn.execute(
      `UPDATE transactions
       SET transaction_status = ?, transaction_id = COALESCE(?, transaction_id), paid_at = COALESCE(?, paid_at), updated_at = NOW()
       WHERE order_id = ?`,
      [currentStatus, transactionId || null, paidAt, orderId]
    );

    if (becamePaid) {
      await conn.execute(`UPDATE users SET total_received = total_received + ? WHERE id = ?`, [row.amount, row.user_id]);
    }

    await conn.commit();
    return { previousStatus, currentStatus, becamePaid, statusChanged, paidAt };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
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

  if (status === "success") whereClause += " AND t.transaction_status IN ('settlement', 'capture')";
  else if (status === "pending") whereClause += " AND t.transaction_status = 'pending'";
  else if (status === "failed") whereClause += " AND t.transaction_status IN ('cancel', 'expire', 'deny', 'fraud')";
  else if (status) {
    whereClause += " AND t.transaction_status = ?";
    params.push(status);
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
