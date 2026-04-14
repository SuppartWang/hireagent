-- Migration 001: Users table
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   TEXT,
  oauth_provider  VARCHAR(50),
  oauth_id        VARCHAR(255),
  username        VARCHAR(100) UNIQUE NOT NULL,
  display_name    VARCHAR(200),
  avatar_url      TEXT,
  bio             TEXT,
  preferred_lang  VARCHAR(10) DEFAULT 'zh-CN',
  total_points    INTEGER DEFAULT 0,
  badge_tier      VARCHAR(50) DEFAULT '新星',
  is_admin        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
