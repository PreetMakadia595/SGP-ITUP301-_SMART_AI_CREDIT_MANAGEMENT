-- PostgreSQL DDL Migration for AI Platform Management
-- Table: user_platforms

CREATE TABLE IF NOT EXISTS user_platforms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform_name VARCHAR(50) NOT NULL,
    subscription_plan VARCHAR(50) NOT NULL DEFAULT 'Pro',
    monthly_credits DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    remaining_credits DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    renewal_date VARCHAR(50) NOT NULL,
    monthly_cost DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    encrypted_api_key VARCHAR(512) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS ix_user_platforms_id ON user_platforms(id);
CREATE INDEX IF NOT EXISTS ix_user_platforms_user_id ON user_platforms(user_id);

-- Check Constraint for valid platform names
ALTER TABLE user_platforms
DROP CONSTRAINT IF EXISTS chk_user_platform_name;

ALTER TABLE user_platforms
ADD CONSTRAINT chk_user_platform_name 
CHECK (platform_name IN ('ChatGPT', 'Claude', 'Gemini', 'Cursor', 'GitHub Copilot', 'Perplexity', 'Lovable', 'Bolt'));
