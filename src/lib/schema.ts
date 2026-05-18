import pool from "./db";

export async function initDatabase(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    // Users table (streamers)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        avatar_url VARCHAR(500) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        stream_key VARCHAR(64) UNIQUE NOT NULL,
        overlay_token VARCHAR(64) UNIQUE NOT NULL,
        min_amount INT DEFAULT 1000,
        alert_sound VARCHAR(255) DEFAULT 'default',
        alert_duration INT DEFAULT 5,
        overlay_style VARCHAR(20) DEFAULT 'right',
        total_received BIGINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_stream_key (stream_key),
        INDEX idx_overlay_token (overlay_token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Donations table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS donations (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        order_id VARCHAR(100) UNIQUE NOT NULL,
        donor_name VARCHAR(100) NOT NULL,
        donor_email VARCHAR(255) DEFAULT NULL,
        amount INT NOT NULL,
        message TEXT DEFAULT NULL,
        payment_type VARCHAR(50) DEFAULT 'qris',
        transaction_id VARCHAR(100) DEFAULT NULL,
        transaction_status VARCHAR(50) DEFAULT 'pending',
        qr_url VARCHAR(500) DEFAULT NULL,
        deeplink_url VARCHAR(500) DEFAULT NULL,
        paid_at TIMESTAMP NULL DEFAULT NULL,
        shown_on_overlay TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_order_id (order_id),
        INDEX idx_status (transaction_status),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("✅ Database tables initialized successfully");
  } finally {
    conn.release();
  }
}
