-- Complete Detailed PostgreSQL Schema for ValueMomentum HR Onboarding Platform
-- Designed to capture every minute detail, relationship constraint, index, and default values.

-- 1. Users Table (Handles authentications, roles, locations, and benefits eligibility)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('candidate', 'hr', 'tag', 'alumni')),
    location VARCHAR(50) NOT NULL CHECK (location IN ('india', 'us')),
    joining_bonus BOOLEAN DEFAULT FALSE,
    relocation BOOLEAN DEFAULT FALSE,
    relocation_city VARCHAR(100) DEFAULT '',
    alumni BOOLEAN DEFAULT FALSE,
    designation VARCHAR(100) DEFAULT '',
    department VARCHAR(100) DEFAULT '',
    joined_date VARCHAR(50),
    left_date VARCHAR(50),
    years_worked DOUBLE PRECISION DEFAULT 0.0
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Candidates Table (Handles candidate workflow tracker status and upload metrics)
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('ready', 'pending')),
    docs INTEGER DEFAULT 0,
    total INTEGER DEFAULT 12,
    dept VARCHAR(100) NOT NULL,
    selected BOOLEAN DEFAULT FALSE,
    pending_docs JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);

-- 3. Onboarding Forms Table (Stores detailed profile inputs)
CREATE TABLE IF NOT EXISTS onboarding_forms (
    id SERIAL PRIMARY KEY,
    candidate_email VARCHAR(255) UNIQUE NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    personal_info JSONB DEFAULT '{}'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    employment JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_forms_email ON onboarding_forms(candidate_email);

-- 4. Documents Table (Stores validated document metadata and AI OCR metrics)
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(100) PRIMARY KEY,
    candidate_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    uploaded_at VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('valid', 'invalid', 'warning', 'pending')),
    overall_confidence INTEGER DEFAULT 0,
    checks JSONB DEFAULT '{}'::jsonb,
    extracted_data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_documents_candidate ON documents(candidate_email);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

-- 5. Reference Checks Table (Tracks background checks and referee feedback)
CREATE TABLE IF NOT EXISTS reference_checks (
    id SERIAL PRIMARY KEY,
    candidate_id VARCHAR(50) NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    reference_name VARCHAR(255) NOT NULL,
    reference_email VARCHAR(255) NOT NULL,
    reference_phone VARCHAR(50) NOT NULL,
    reference_company VARCHAR(255) NOT NULL,
    reference_position VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    request_date VARCHAR(50) NOT NULL,
    response_date VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('completed', 'pending')),
    rating INTEGER,
    feedback TEXT DEFAULT '',
    sent_date VARCHAR(50) NOT NULL,
    token VARCHAR(100) UNIQUE,
    created_at VARCHAR(100) NOT NULL,
    updated_at VARCHAR(100) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reference_candidate ON reference_checks(candidate_id);

-- 6. Document Expiry Table (Tracks document renewals and expiration boundaries)
CREATE TABLE IF NOT EXISTS document_expiry (
    id SERIAL PRIMARY KEY,
    candidate_id VARCHAR(50) NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_number VARCHAR(100) NOT NULL,
    issue_date VARCHAR(50) NOT NULL,
    expiry_date VARCHAR(50) NOT NULL,
    days_until_expiry INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('valid', 'critical', 'warning')),
    notes TEXT DEFAULT '',
    created_at VARCHAR(100) NOT NULL,
    updated_at VARCHAR(100) NOT NULL,
    reminder_sent BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_expiry_candidate ON document_expiry(candidate_id);

-- 7. Audit Logs Table (Captures secure system usage and change tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp VARCHAR(100) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    location VARCHAR(50) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);

-- 8. Chat History Table (Stores support session logs)
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    candidate_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('bot', 'user', 'system')),
    timestamp DOUBLE PRECISION NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_candidate ON chat_history(candidate_email);

-- 9. Offer Details Table (TAG Team exclusive Offer Letter system)
CREATE TABLE IF NOT EXISTS offer_details (
    id VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    candidate_phone VARCHAR(50) NOT NULL,
    candidate_pan VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    source VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    joining_date DATE NOT NULL,
    facility VARCHAR(255) NOT NULL,
    work_mode VARCHAR(255) NOT NULL,
    total_salary NUMERIC(15, 2) NOT NULL,
    current_ctc NUMERIC(15, 2) NOT NULL,
    extra_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_path VARCHAR(500),
    salary_breakdown TEXT
);

CREATE INDEX IF NOT EXISTS idx_offer_details_username ON offer_details(username);
CREATE INDEX IF NOT EXISTS idx_offer_details_email ON offer_details(candidate_email);

