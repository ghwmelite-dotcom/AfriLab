-- Migration: Add Google OAuth support to users table
-- Adds google_id for OAuth identification and auth_provider to track login method

-- SQLite doesn't allow UNIQUE in ALTER TABLE ADD COLUMN, so we add the column
-- then enforce uniqueness via a unique index
ALTER TABLE users ADD COLUMN google_id TEXT;
ALTER TABLE users ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'email';

-- Unique index ensures no two users share the same google_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
