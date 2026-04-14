-- Migration 003: Reviews, hires, points, badges
CREATE TABLE agent_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id        UUID REFERENCES agents(id) ON DELETE CASCADE,
  version         INTEGER NOT NULL,
  system_prompt   TEXT NOT NULL,
  mcp_config      JSONB,
  changelog_zh    TEXT,
  changelog_en    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, version)
);

CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id        UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  rating          SMALLINT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment_zh      TEXT,
  comment_en      TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  helpful_count   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, user_id)
);

CREATE INDEX idx_reviews_agent ON reviews(agent_id, created_at DESC);

CREATE TABLE agent_hires (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id        UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  hire_type       VARCHAR(50) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hires_agent ON agent_hires(agent_id, created_at DESC);
CREATE INDEX idx_hires_recent ON agent_hires(agent_id, created_at DESC);

CREATE TABLE point_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  agent_id        UUID REFERENCES agents(id) ON DELETE SET NULL,
  amount          INTEGER NOT NULL,
  reason          VARCHAR(100) NOT NULL,
  description_zh  TEXT,
  description_en  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_points_user ON point_transactions(user_id, created_at DESC);

CREATE TABLE badges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_type      VARCHAR(100) NOT NULL,
  earned_at       TIMESTAMPTZ DEFAULT NOW(),
  agent_id        UUID REFERENCES agents(id) ON DELETE SET NULL
);

CREATE TABLE agent_bookmarks (
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  agent_id   UUID REFERENCES agents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, agent_id)
);

CREATE TABLE ranking_snapshots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id      UUID REFERENCES agents(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  hire_count    INTEGER DEFAULT 0,
  rating_avg    DECIMAL(3,2) DEFAULT 0,
  ranking_score DECIMAL(10,6) DEFAULT 0,
  UNIQUE(agent_id, snapshot_date)
);
