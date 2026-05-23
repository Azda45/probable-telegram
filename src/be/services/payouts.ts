import type { RowDataPacket } from "mysql2";
import pool from "@/be/db";
import { ensureWithdrawalsTable } from "@/be/schema/withdrawals";

export async function getAdminPayouts(page: number = 1, limit: number = 20, status: string = "all"): Promise<{ payouts: any[], total: number }> {
  await ensureWithdrawalsTable();
  const offset = (page - 1) * limit;

  let statusCondition = "";
  let queryParams: string[] = [];

  if (status !== "all") {
    statusCondition = "WHERE w.status = ?";
    queryParams.push(status);
  }

  const [countRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(w.id) as total FROM withdrawals w ${statusCondition}`,
    queryParams
  );
  const total = Number(countRows[0]?.total || 0);

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT w.*, u.username, u.display_name, u.email 
     FROM withdrawals w 
     JOIN users u ON u.id = w.user_id 
     ${statusCondition}
     ORDER BY w.created_at DESC 
     LIMIT ? OFFSET ?`,
    [...queryParams, limit.toString(), offset.toString()]
  );

  return { payouts: rows, total };
}

export async function getAdminBalances(page: number = 1, limit: number = 20): Promise<{ balances: any[], total: number }> {
  const offset = (page - 1) * limit;

  const [countRows] = await pool.execute<RowDataPacket[]>(`SELECT COUNT(id) as total FROM users`);
  const total = Number(countRows[0]?.total || 0);

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, username, display_name, email, bank_name, bank_account, 
            total_received, withdrawn_amount, 
            (total_received - withdrawn_amount) as current_balance 
     FROM users 
     ORDER BY current_balance DESC 
     LIMIT ? OFFSET ?`,
    [limit.toString(), offset.toString()]
  );

  return { balances: rows, total };
}

export async function processPayout(withdrawalId: string, action: "approve" | "reject"): Promise<void> {
  await ensureWithdrawalsTable();
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT * FROM withdrawals WHERE id = ? FOR UPDATE`,
      [withdrawalId]
    );

    if (rows.length === 0) throw new Error("Withdrawal not found");
    const withdrawal = rows[0];

    if (withdrawal.status !== "pending") throw new Error("Withdrawal is not pending");

    if (action === "approve") {
      // Mark as approved
      await conn.execute(
        `UPDATE withdrawals SET status = 'approved', processed_at = NOW() WHERE id = ?`,
        [withdrawalId]
      );
      
      // We already subtracted the balance from user when they requested it? No, wait. 
      // If they haven't requested it yet (since we don't have user withdrawal logic), let's assume withdrawn_amount increments upon approval.
      await conn.execute(
        `UPDATE users SET withdrawn_amount = withdrawn_amount + ? WHERE id = ?`,
        [withdrawal.amount, withdrawal.user_id]
      );
    } else {
      // Reject
      await conn.execute(
        `UPDATE withdrawals SET status = 'rejected', processed_at = NOW() WHERE id = ?`,
        [withdrawalId]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
