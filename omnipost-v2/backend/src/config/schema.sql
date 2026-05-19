-- ================================================================
-- OmniPost Database Schema
-- PostgreSQL 15+
-- Run: psql -U omnipost_user -d omnipost_db -f schema.sql
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(255) UNIQUE,
  mobile         VARCHAR(15)  UNIQUE,
  password_hash  TEXT,
  avatar         TEXT,
  bio            TEXT,
  plan           VARCHAR(20)  NOT NULL DEFAULT 'free' CHECK (plan IN ('free','creator','agency')),
  language       VARCHAR(5)   NOT NULL DEFAULT 'en',
  is_verified    BOOLEAN      NOT NULL DEFAULT FALSE,
  google_id      VARCHAR(100) UNIQUE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email  ON users(email);
CREATE INDEX idx_users_mobile ON users(mobile);

-- ─── Social Accounts ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_accounts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform            VARCHAR(30) NOT NULL,
  platform_user_id    VARCHAR(100) NOT NULL,
  username            VARCHAR(100),
  display_name        VARCHAR(100),
  avatar              TEXT,
  -- Tokens stored encrypted (AES-256-GCM)
  access_token_enc    TEXT NOT NULL,
  refresh_token_enc   TEXT,
  token_expires_at    TIMESTAMPTZ,
  status              VARCHAR(20) NOT NULL DEFAULT 'connected'
                      CHECK (status IN ('connected','expired','disconnected','error')),
  account_type        VARCHAR(20) DEFAULT 'personal',
  followers_count     INT,
  connected_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, platform, platform_user_id)
);

CREATE INDEX idx_social_accounts_user    ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_status  ON social_accounts(user_id, status);

-- ─── Posts ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text          TEXT,
  hashtags      TEXT[]    NOT NULL DEFAULT '{}',
  media_ids     UUID[]    NOT NULL DEFAULT '{}',
  status        VARCHAR(20) NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft','scheduled','publishing','published','partial','failed')),
  scheduled_at  TIMESTAMPTZ,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status  ON posts(user_id, status);
CREATE INDEX idx_posts_scheduled ON posts(scheduled_at) WHERE status = 'scheduled';

-- ─── Post Targets ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_targets (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id            UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  social_account_id  UUID NOT NULL REFERENCES social_accounts(id),
  platform           VARCHAR(30) NOT NULL,
  platform_post_id   VARCHAR(200),
  status             VARCHAR(20) NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','publishing','success','failed')),
  error_message      TEXT,
  post_url           TEXT,
  -- Custom overrides per platform
  custom_text        TEXT,
  custom_hashtags    TEXT[],
  published_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_post_targets_post_id ON post_targets(post_id);

-- ─── Post Analytics ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_analytics (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_id     UUID NOT NULL REFERENCES post_targets(id) ON DELETE CASCADE,
  impressions   BIGINT DEFAULT 0,
  reach         BIGINT DEFAULT 0,
  likes         INT    DEFAULT 0,
  comments      INT    DEFAULT 0,
  shares        INT    DEFAULT 0,
  saves         INT    DEFAULT 0,
  clicks        INT    DEFAULT 0,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_target ON post_analytics(target_id);

-- ─── Media Assets ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_assets (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  thumb_url    TEXT,
  type         VARCHAR(10) NOT NULL CHECK (type IN ('image','video','audio','gif')),
  filename     VARCHAR(255) NOT NULL,
  size         BIGINT NOT NULL,
  width        INT,
  height       INT,
  duration     INT,
  alt_text     TEXT,
  s3_key       TEXT NOT NULL,
  tags         TEXT[] DEFAULT '{}',
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_user ON media_assets(user_id);

-- ─── Hashtag Sets ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hashtag_sets (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  tags       TEXT[] NOT NULL DEFAULT '{}',
  use_count  INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Subscriptions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan            VARCHAR(20) NOT NULL CHECK (plan IN ('free','creator','agency')),
  status          VARCHAR(20) NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','cancelled','past_due','trialing')),
  razorpay_sub_id VARCHAR(100),
  amount          INT NOT NULL DEFAULT 0,
  start_date      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date        TIMESTAMPTZ,
  trial_ends_at   TIMESTAMPTZ,
  next_bill_date  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(40) NOT NULL,
  title       VARCHAR(200) NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  action_url  TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user   ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ─── OTP Store (short-lived, use Redis in prod) ─────────────────
CREATE TABLE IF NOT EXISTS otps (
  mobile     VARCHAR(15) PRIMARY KEY,
  otp_hash   TEXT NOT NULL,
  attempts   INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Triggers: updated_at ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_users_updated_at          BEFORE UPDATE ON users          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_posts_updated_at           BEFORE UPDATE ON posts           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
