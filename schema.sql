-- DonasiKu Database Schema
-- Keep this file in sync with src/lib/schema/* and src/lib/services/*.

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
  is_active TINYINT(1) DEFAULT 1,
  is_admin TINYINT(1) DEFAULT 0,
  banned_at TIMESTAMP NULL DEFAULT NULL,
  bank_name VARCHAR(50) DEFAULT NULL,
  bank_account VARCHAR(50) DEFAULT NULL,
  withdrawn_amount BIGINT DEFAULT 0,
  total_received BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_stream_key (stream_key),
  INDEX idx_overlay_token (overlay_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Overlay settings table
CREATE TABLE IF NOT EXISTS overlay_settings (
  user_id VARCHAR(36) PRIMARY KEY,
  alert_sound VARCHAR(255) DEFAULT 'default',
  alert_duration INT DEFAULT 5000,
  overlay_style VARCHAR(20) DEFAULT 'right',
  overlay_animation VARCHAR(32) DEFAULT 'slide-up',
  overlay_animation_duration INT DEFAULT 500,
  overlay_animation_enabled TINYINT(1) DEFAULT 1,
  overlay_bg_color VARCHAR(7) DEFAULT '#1e293b',
  overlay_border_color VARCHAR(7) DEFAULT '#334155',
  overlay_text_color VARCHAR(7) DEFAULT '#fafafa',
  overlay_message_color VARCHAR(7) DEFAULT '#a1a1aa',
  overlay_accent_color VARCHAR(7) DEFAULT '#818cf8',
  overlay_progress_color VARCHAR(7) DEFAULT '#818cf8',
  overlay_progress_enabled TINYINT(1) DEFAULT 1,
  action_text VARCHAR(50) DEFAULT 'berdonasi',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  session_token_hash CHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_session_token_hash (session_token_hash),
  INDEX idx_sessions_user_id (user_id),
  INDEX idx_sessions_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(100) UNIQUE NOT NULL,
  donor_name VARCHAR(100) NOT NULL,
  donor_email VARCHAR(255) DEFAULT NULL,
  amount INT NOT NULL,
  message TEXT DEFAULT NULL,
  status_token_hash CHAR(64) DEFAULT NULL,
  shown_on_overlay TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_order_id (order_id),
  INDEX idx_status_token_hash (status_token_hash),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table (payment gateway details)
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
  INDEX idx_donation_id (donation_id),
  INDEX idx_status (transaction_status),
  INDEX idx_paid_at (paid_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  amount BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  bank_name VARCHAR(50) NOT NULL,
  bank_account VARCHAR(50) NOT NULL,
  processed_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_withdrawals_user (user_id),
  INDEX idx_withdrawals_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Platform Settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  setting_key VARCHAR(50) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id VARCHAR(36) NOT NULL,
  admin_username VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_admin (admin_id),
  INDEX idx_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blacklist Words table
CREATE TABLE IF NOT EXISTS blacklist_words (
  id INT AUTO_INCREMENT PRIMARY KEY,
  word VARCHAR(100) NOT NULL UNIQUE,
  added_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
