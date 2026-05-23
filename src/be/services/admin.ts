import type { RowDataPacket } from "mysql2";
import pool from "@/be/db";
import type { User } from "./types";

export interface AdminStats {
  totalUsers: number;
  totalDonations: number;
  totalRevenue: number;
  activeUsers: number;
  platformFeeAmount: number;
}

export async function getAdminPlatformStats(): Promise<AdminStats> {
  const [userStatsRows] = await pool.execute<RowDataPacket[]>(
    `SELECT 
       COUNT(*) as totalUsers,
       SUM(CASE WHEN is_active = 1 AND banned_at IS NULL THEN 1 ELSE 0 END) as activeUsers
     FROM users`
  );

  const [actualDonationStats] = await pool.execute<RowDataPacket[]>(
    `SELECT 
       COUNT(d.id) as totalDonations,
       COALESCE(SUM(d.amount), 0) as totalRevenue
     FROM donations d
     JOIN transactions t ON t.donation_id = d.id
     WHERE t.transaction_status = 'settlement' OR t.transaction_status = 'capture'`
  );

  const totalRevenue = Number(actualDonationStats[0]?.totalRevenue || 0);

  return {
    totalUsers: Number(userStatsRows[0]?.totalUsers || 0),
    activeUsers: Number(userStatsRows[0]?.activeUsers || 0),
    totalDonations: Number(actualDonationStats[0]?.totalDonations || 0),
    totalRevenue,
    platformFeeAmount: totalRevenue * 0.05, // 5% flat fee estimation
  };
}

export async function getAdminUsersList(status: string = "all"): Promise<any[]> {
  let query = `
    SELECT id, username, email, display_name, avatar_url, bio, is_admin, total_received, created_at, banned_at, is_active, bank_name, bank_account
    FROM users
  `;
  const params: any[] = [];

  if (status === "suspended") {
    query += " WHERE is_active = 0 OR banned_at IS NOT NULL";
  } else if (status === "payout_accounts") {
    query += " WHERE bank_name IS NOT NULL AND bank_account IS NOT NULL";
  }

  query += " ORDER BY total_received DESC";

  const [rows] = await pool.execute<RowDataPacket[]>(query, params);
  return rows;
}

export async function getAdminUsers(page: number = 1, limit: number = 20): Promise<{ users: User[], total: number }> {
  const offset = (page - 1) * limit;

  const [countRows] = await pool.execute<RowDataPacket[]>(`SELECT COUNT(*) as total FROM users`);
  const total = Number(countRows[0]?.total || 0);

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, username, email, display_name, avatar_url, bio,
            stream_key, overlay_token, min_amount, max_amount,
            total_received, created_at, is_admin, banned_at, is_active
     FROM users
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [limit.toString(), offset.toString()]
  );

  return {
    users: rows as User[],
    total
  };
}

export async function toggleUserBan(userId: string, isBanned: boolean): Promise<void> {
  if (isBanned) {
    await pool.execute(`UPDATE users SET banned_at = NOW(), is_active = 0 WHERE id = ?`, [userId]);
    // Also invalidate their sessions
    await pool.execute(`DELETE FROM sessions WHERE user_id = ?`, [userId]);
  } else {
    await pool.execute(`UPDATE users SET banned_at = NULL, is_active = 1 WHERE id = ?`, [userId]);
  }
}

export async function getGlobalDonations(page: number = 1, limit: number = 20, status: string = "all"): Promise<{ donations: any[], total: number }> {
  const offset = (page - 1) * limit;

  let statusCondition = "";
  let queryParams: string[] = [];

  if (status !== "all") {
    if (status === "settlement") {
      statusCondition = "WHERE t.transaction_status IN ('settlement', 'capture')";
    } else {
      statusCondition = "WHERE t.transaction_status = ?";
      queryParams.push(status);
    }
  }

  const countQuery = `
    SELECT COUNT(d.id) as total 
    FROM donations d
    JOIN transactions t ON t.donation_id = d.id
    ${statusCondition}
  `;

  const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, queryParams);
  const total = Number(countRows[0]?.total || 0);

  const selectQuery = `
    SELECT d.id, d.order_id, d.donor_name, d.amount, d.message, d.created_at,
           u.username as streamer_username, u.display_name as streamer_name,
           t.transaction_status
    FROM donations d
    JOIN users u ON u.id = d.user_id
    JOIN transactions t ON t.donation_id = d.id
    ${statusCondition}
    ORDER BY d.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.execute<RowDataPacket[]>(selectQuery, [...queryParams, limit.toString(), offset.toString()]);

  return { donations: rows, total };
}

export async function getAdminAnalytics(): Promise<any[]> {
  // Returns last 30 days of daily revenue
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT DATE(d.created_at) as date, SUM(d.amount) as revenue, COUNT(d.id) as count
     FROM donations d
     JOIN transactions t ON t.donation_id = d.id
     WHERE t.transaction_status IN ('settlement', 'capture')
       AND d.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     GROUP BY DATE(d.created_at)
     ORDER BY date ASC`
  );

  return rows.map(r => ({
    date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
    revenue: Number(r.revenue),
    count: Number(r.count)
  }));
}

export async function toggleUserAdmin(userId: string, isAdmin: boolean): Promise<void> {
  await pool.execute(
    "UPDATE users SET is_admin = ? WHERE id = ?",
    [isAdmin ? 1 : 0, userId]
  );
}
