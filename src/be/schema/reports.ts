import pool from "@/be/db";

let reportsTableReady: Promise<void> | null = null;

export function ensureReportsTable(): Promise<void> {
  reportsTableReady ??= (async () => {
    const conn = await pool.getConnection();
    try {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS reports (
          id INT AUTO_INCREMENT PRIMARY KEY,
          target_user_id VARCHAR(36) NOT NULL,
          reporter_name VARCHAR(100),
          reason TEXT NOT NULL,
          status ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_reports_status (status),
          INDEX idx_reports_target (target_user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } finally {
      conn.release();
    }
  })().catch((error) => {
    reportsTableReady = null;
    throw error;
  });

  return reportsTableReady;
}
