import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "@/be/db";
import { ensureBlacklistTable } from "@/be/schema/blacklist";

export async function getDonationMessages(page: number = 1, limit: number = 20): Promise<{ messages: any[], total: number }> {
  const offset = (page - 1) * limit;

  // We only want donations that actually have a message and are paid
  const baseCondition = "WHERE d.message IS NOT NULL AND d.message != '' AND t.transaction_status IN ('settlement', 'capture')";

  const [countRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(d.id) as total 
     FROM donations d
     JOIN transactions t ON t.donation_id = d.id
     ${baseCondition}`
  );
  const total = Number(countRows[0]?.total || 0);

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT d.id, d.donor_name, d.amount, d.message, d.created_at,
            u.username as streamer_username
     FROM donations d
     JOIN users u ON u.id = d.user_id
     JOIN transactions t ON t.donation_id = d.id
     ${baseCondition}
     ORDER BY d.created_at DESC
     LIMIT ? OFFSET ?`,
    [limit.toString(), offset.toString()]
  );

  return { messages: rows, total };
}

export async function deleteDonationMessage(donationId: string): Promise<void> {
  await pool.execute(
    "UPDATE donations SET message = '[Pesan telah dihapus oleh Admin]' WHERE id = ?",
    [donationId]
  );
}

export async function resetCreatorOverlayToken(creatorId: string): Promise<string> {
  const { randomBytes } = await import("crypto");
  const newToken = randomBytes(32).toString("hex");
  
  await pool.execute(
    "UPDATE users SET overlay_token = ? WHERE id = ?",
    [newToken, creatorId]
  );
  
  return newToken;
}

export async function getBlacklistWords(): Promise<any[]> {
  await ensureBlacklistTable();
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM blacklist_words ORDER BY created_at DESC"
  );
  return rows;
}

export async function addBlacklistWord(word: string, adminUsername: string): Promise<number> {
  await ensureBlacklistTable();
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO blacklist_words (word, added_by) VALUES (?, ?)",
      [word.toLowerCase().trim(), adminUsername]
    );
    return result.insertId;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error("Kata tersebut sudah ada di daftar blacklist.");
    }
    throw error;
  }
}

export async function removeBlacklistWord(id: string): Promise<void> {
  await ensureBlacklistTable();
  await pool.execute("DELETE FROM blacklist_words WHERE id = ?", [id]);
}
