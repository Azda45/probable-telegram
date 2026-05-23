import pool from "@/be/db";

let blacklistTableReady: Promise<void> | null = null;

export function ensureBlacklistTable(): Promise<void> {
  blacklistTableReady ??= (async () => {
    const conn = await pool.getConnection();
    try {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS blacklist_words (
          id INT AUTO_INCREMENT PRIMARY KEY,
          word VARCHAR(100) NOT NULL UNIQUE,
          added_by VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } finally {
      conn.release();
    }
  })().catch((error) => {
    blacklistTableReady = null;
    throw error;
  });

  return blacklistTableReady;
}
