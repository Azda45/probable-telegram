-- DonasiKu Database Schema (Final Clean State)

CREATE DATABASE IF NOT EXISTS donate_platform
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE donate_platform;

-- Users table (streamers)
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
  max_amount INT DEFAULT 10000000,
  alert_sound VARCHAR(255) DEFAULT 'default',
  alert_duration INT DEFAULT 5,
  tts_enabled TINYINT(1) DEFAULT 1,
  tts_voice VARCHAR(255) DEFAULT '',
  total_received BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_stream_key (stream_key),
  INDEX idx_overlay_token (overlay_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  donor_name VARCHAR(100) NOT NULL,
  donor_email VARCHAR(255) NOT NULL,
  amount INT UNSIGNED NOT NULL,
  message TEXT DEFAULT NULL,
  shown_on_overlay TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table (Payment gateway details)
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  donation_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(100) UNIQUE NOT NULL,
  payment_type VARCHAR(50) DEFAULT 'qris',
  transaction_id VARCHAR(100) DEFAULT NULL,
  transaction_status VARCHAR(50) DEFAULT 'pending',
  qr_url VARCHAR(500) DEFAULT NULL,
  deeplink_url VARCHAR(500) DEFAULT NULL,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_status (transaction_status),
  INDEX idx_paid (paid_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
