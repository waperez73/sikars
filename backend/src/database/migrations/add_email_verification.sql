-- Email Verification Tokens Table Migration (CORRECTED)
-- File: backend/src/database/migrations/add_email_verification.sql
-- PostgreSQL compatible syntax

-- Create email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for email verification tokens
CREATE INDEX IF NOT EXISTS idx_verification_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_expires_at ON email_verification_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_used ON email_verification_tokens(used);

-- Add email_verified column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add created_at column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create indexes on users table
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add table comments
COMMENT ON TABLE email_verification_tokens IS 'Stores email verification tokens for user email confirmation';
COMMENT ON COLUMN email_verification_tokens.token IS 'Unique verification token sent to user email';
COMMENT ON COLUMN email_verification_tokens.used IS 'Whether the token has been used for verification';
COMMENT ON COLUMN email_verification_tokens.expires_at IS 'Token expiration timestamp (typically 24 hours)';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✓ Email verification table created successfully';
    RAISE NOTICE '✓ Indexes created';
    RAISE NOTICE '✓ Users table updated with email_verified column';
END $$;