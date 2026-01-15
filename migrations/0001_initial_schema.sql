-- AfriLab Database Schema
-- Initial migration for D1 SQLite

-- =====================
-- INSTITUTIONS
-- =====================
CREATE TABLE IF NOT EXISTS institutions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    country TEXT,
    logo_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Create index for institution code lookup
CREATE INDEX IF NOT EXISTS idx_institutions_code ON institutions(code);

-- =====================
-- USERS
-- =====================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'instructor', 'admin')) DEFAULT 'student',
    institution_id TEXT REFERENCES institutions(id) ON DELETE SET NULL,
    avatar_url TEXT,
    is_active INTEGER DEFAULT 1,
    email_verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Create indexes for user lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =====================
-- SESSIONS
-- =====================
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- =====================
-- DISCIPLINES
-- =====================
CREATE TABLE IF NOT EXISTS disciplines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Insert default disciplines
INSERT OR IGNORE INTO disciplines (id, name, slug, description, icon, color) VALUES
    ('chem', 'Chemistry', 'chemistry', 'Virtual chemistry experiments including titrations, spectroscopy, and organic synthesis', 'beaker', '#3b82f6'),
    ('bio', 'Biology', 'biology', 'Biology labs including microscopy, dissection, and cell studies', 'dna', '#22c55e'),
    ('phys', 'Physics', 'physics', 'Physics experiments in mechanics, optics, and electromagnetism', 'atom', '#f59e0b'),
    ('pharm', 'Pharmacy', 'pharmacy', 'Pharmaceutical compounding, drug interactions, and pharmacokinetics', 'pill', '#ec4899'),
    ('med', 'Medical Sciences', 'medical', 'Clinical simulations, patient scenarios, and diagnostic reasoning', 'heart-pulse', '#ef4444');

-- =====================
-- EXPERIMENTS
-- =====================
CREATE TABLE IF NOT EXISTS experiments (
    id TEXT PRIMARY KEY,
    discipline_id TEXT NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    difficulty TEXT NOT NULL CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    duration_minutes INTEGER DEFAULT 60,
    instructions TEXT, -- JSON array of steps
    simulation_config TEXT, -- JSON object
    safety_notes TEXT,
    learning_objectives TEXT, -- JSON array
    prerequisites TEXT, -- JSON array of experiment IDs
    thumbnail_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_experiments_discipline ON experiments(discipline_id);
CREATE INDEX IF NOT EXISTS idx_experiments_difficulty ON experiments(difficulty);
CREATE UNIQUE INDEX IF NOT EXISTS idx_experiments_slug ON experiments(discipline_id, slug);

-- Insert Chemistry experiments
INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives, instructions, simulation_config) VALUES
    ('chem-titration-01', 'chem', 'Acid-Base Titration', 'acid-base-titration',
     'Learn the fundamentals of volumetric analysis by performing an acid-base titration with phenolphthalein indicator.',
     'beginner', 45,
     'Always add acid to base, never the reverse. Wear safety goggles and lab coat. Handle glassware carefully.',
     '["Understand the principles of acid-base neutralization", "Learn proper titration technique", "Calculate unknown concentrations using titration data", "Identify the endpoint using indicators"]',
     '[{"id": 1, "title": "Setup Equipment", "description": "Arrange the burette, flask, and beaker on the lab bench", "action": "drag_equipment"},{"id": 2, "title": "Fill Burette", "description": "Fill the burette with NaOH solution and record initial volume", "action": "fill_burette"},{"id": 3, "title": "Prepare Flask", "description": "Add HCl solution to the Erlenmeyer flask and add indicator", "action": "prepare_flask"},{"id": 4, "title": "Titrate", "description": "Slowly add NaOH while swirling until color change", "action": "titrate"},{"id": 5, "title": "Record Results", "description": "Record final volume and calculate concentration", "action": "record_results"}]',
     '{"type": "titration", "acid": {"name": "Hydrochloric Acid", "formula": "HCl", "concentration": 0.1, "volume": 25}, "base": {"name": "Sodium Hydroxide", "formula": "NaOH", "concentration": 0.1, "volume": 50}, "indicator": "phenolphthalein"}');

-- =====================
-- LAB SESSIONS
-- =====================
CREATE TABLE IF NOT EXISTS lab_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK(status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress',
    current_step INTEGER DEFAULT 0,
    data TEXT, -- JSON object with session data
    score REAL,
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    time_spent_seconds INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_lab_sessions_user ON lab_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_experiment ON lab_sessions(experiment_id);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_status ON lab_sessions(status);

-- =====================
-- MEASUREMENTS
-- =====================
CREATE TABLE IF NOT EXISTS measurements (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES lab_sessions(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    label TEXT,
    step_number INTEGER,
    recorded_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_measurements_session ON measurements(session_id);

-- =====================
-- ASSESSMENTS
-- =====================
CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL REFERENCES lab_sessions(id) ON DELETE CASCADE,
    ai_feedback TEXT,
    manual_feedback TEXT,
    grade TEXT,
    rubric_scores TEXT, -- JSON object with rubric criteria scores
    instructor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_assessments_session ON assessments(session_id);

-- =====================
-- AI CONVERSATIONS
-- =====================
CREATE TABLE IF NOT EXISTS ai_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    experiment_id TEXT REFERENCES experiments(id) ON DELETE SET NULL,
    session_id TEXT REFERENCES lab_sessions(id) ON DELETE SET NULL,
    messages TEXT NOT NULL, -- JSON array of messages
    token_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON ai_conversations(session_id);

-- =====================
-- COURSE ASSIGNMENTS (for instructors)
-- =====================
CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    instructor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id TEXT REFERENCES institutions(id) ON DELETE CASCADE,
    experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    is_required INTEGER DEFAULT 1,
    max_attempts INTEGER DEFAULT 3,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_assignments_instructor ON assignments(instructor_id);
CREATE INDEX IF NOT EXISTS idx_assignments_institution ON assignments(institution_id);

-- =====================
-- STUDENT ENROLLMENTS
-- =====================
CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    attempts INTEGER DEFAULT 0,
    best_score REAL,
    completed INTEGER DEFAULT 0,
    enrolled_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_assignment ON enrollments(assignment_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_unique ON enrollments(student_id, assignment_id);
