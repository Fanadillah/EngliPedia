-- Run this in Supabase SQL Editor to add gamification columns
-- to the existing user_profiles table

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS daily_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_xp_date TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS viewed_words INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_sessions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_session_date TEXT DEFAULT '';

-- Add example_id column to words table if missing
ALTER TABLE words
  ADD COLUMN IF NOT EXISTS example_id TEXT DEFAULT '';

-- Create user_saved_words table if missing
CREATE TABLE IF NOT EXISTS user_saved_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id BIGINT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- RLS for user_saved_words
ALTER TABLE user_saved_words ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own saved words" ON user_saved_words
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own saved words" ON user_saved_words
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own saved words" ON user_saved_words
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own saved words" ON user_saved_words
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_saved_words_user_id ON user_saved_words(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_words_word_id ON user_saved_words(word_id);
