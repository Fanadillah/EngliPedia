-- Run this in Supabase SQL Editor
-- Adds SM-2 spaced repetition columns to user_words table

-- Add SM-2 algorithm columns
ALTER TABLE user_words
  ADD COLUMN IF NOT EXISTS easiness_factor NUMERIC(4,2) DEFAULT 2.5,
  ADD COLUMN IF NOT EXISTS interval_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS repetitions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_review_date DATE,
  ADD COLUMN IF NOT EXISTS next_review_date DATE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Index for efficient due-words queries per user
CREATE INDEX IF NOT EXISTS idx_user_words_user_next_review
  ON user_words(user_id, next_review_date)
  WHERE next_review_date IS NOT NULL;

-- Add updated_at to user_profiles for timestamp-based merge
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Function to auto-update updated_at on user_words
CREATE OR REPLACE FUNCTION update_user_words_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_user_words_updated ON user_words;
CREATE TRIGGER trigger_user_words_updated
  BEFORE UPDATE ON user_words
  FOR EACH ROW EXECUTE FUNCTION update_user_words_timestamp();

-- Function to auto-update updated_at on user_profiles
CREATE OR REPLACE FUNCTION update_user_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_profiles_updated ON user_profiles;
CREATE TRIGGER trigger_user_profiles_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_user_profiles_timestamp();
