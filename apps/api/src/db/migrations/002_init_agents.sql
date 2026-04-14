-- Migration 002: Agents table
CREATE TABLE agents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  slug                VARCHAR(200) UNIQUE NOT NULL,
  name_zh             VARCHAR(200) NOT NULL,
  name_en             VARCHAR(200),
  description_zh      TEXT NOT NULL,
  description_en      TEXT,
  tagline_zh          VARCHAR(500),
  tagline_en          VARCHAR(500),
  system_prompt       TEXT NOT NULL,
  system_prompt_lang  VARCHAR(10) DEFAULT 'zh-CN',
  mcp_config          JSONB,
  category            VARCHAR(100) DEFAULT 'other',
  tags                TEXT[] DEFAULT '{}',
  capabilities        TEXT[] DEFAULT '{}',
  supported_models    TEXT[] DEFAULT '{}',
  language_support    TEXT[] DEFAULT '{zh-CN}',
  avatar_url          TEXT,
  cover_url           TEXT,
  demo_video_url      TEXT,
  hire_count          INTEGER DEFAULT 0,
  try_count           INTEGER DEFAULT 0,
  rating_avg          DECIMAL(3,2) DEFAULT 0.00,
  rating_count        INTEGER DEFAULT 0,
  quality_score       DECIMAL(5,4) DEFAULT 0.0000,
  ranking_score       DECIMAL(10,6) DEFAULT 0.0,
  status              VARCHAR(50) DEFAULT 'draft',
  is_featured         BOOLEAN DEFAULT FALSE,
  featured_at         TIMESTAMPTZ,
  version             INTEGER DEFAULT 1,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  published_at        TIMESTAMPTZ
);

CREATE INDEX idx_agents_ranking ON agents(ranking_score DESC) WHERE status = 'published';
CREATE INDEX idx_agents_category ON agents(category) WHERE status = 'published';
CREATE INDEX idx_agents_creator ON agents(creator_id);
CREATE INDEX idx_agents_tags ON agents USING gin(tags);
CREATE INDEX idx_agents_capabilities ON agents USING gin(capabilities);
CREATE INDEX idx_agents_created_at ON agents(created_at DESC);
CREATE INDEX idx_agents_status ON agents(status);

-- Full text search (using trigger-maintained tsvector for immutability)
ALTER TABLE agents ADD COLUMN search_vector tsvector;

CREATE OR REPLACE FUNCTION agents_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.name_zh, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.name_en, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.tagline_zh, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.tagline_en, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.description_zh, '')), 'C') ||
    setweight(to_tsvector('simple', array_to_string(NEW.tags, ' ')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_search_vector_trigger
  BEFORE INSERT OR UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION agents_search_vector_update();

CREATE INDEX idx_agents_search ON agents USING gin(search_vector);
