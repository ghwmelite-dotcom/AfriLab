-- Add demo user tracking columns
-- Demo users and their data are automatically cleaned up after 24 hours

-- Add demo columns to users table
ALTER TABLE users ADD COLUMN is_demo INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN demo_expires_at TEXT;

-- Create index for demo cleanup queries
CREATE INDEX IF NOT EXISTS idx_users_demo ON users(is_demo, demo_expires_at);

-- Add demo columns to lab_sessions table
ALTER TABLE lab_sessions ADD COLUMN is_demo INTEGER DEFAULT 0;

-- Create index for demo session cleanup
CREATE INDEX IF NOT EXISTS idx_lab_sessions_demo ON lab_sessions(is_demo);
