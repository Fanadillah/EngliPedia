-- Englipedia Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. WORDS TABLE
-- ============================================
CREATE TABLE words (
  id BIGSERIAL PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  ipa TEXT DEFAULT '',
  pos TEXT DEFAULT '',
  meaning_id TEXT DEFAULT '',
  definition TEXT DEFAULT '',
  example TEXT DEFAULT '',
  example_id TEXT DEFAULT '',
  frequency INTEGER DEFAULT 0,
  cara_baca TEXT DEFAULT '',
  level TEXT DEFAULT 'basic' CHECK (level IN ('basic', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk pencarian
CREATE INDEX idx_words_word ON words(word);
CREATE INDEX idx_words_meaning_id ON words(meaning_id);
CREATE INDEX idx_words_level ON words(level);
CREATE INDEX idx_words_frequency ON words(frequency);

-- Full-text search index
CREATE INDEX idx_words_search ON words USING gin(to_tsvector('english', word || ' ' || meaning_id));

-- ============================================
-- 2. USER WORDS TABLE (untuk tracking belajar)
-- ============================================
CREATE TABLE user_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id BIGINT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'mastered')),
  mastery INTEGER DEFAULT 0 CHECK (mastery >= 0 AND mastery <= 100),
  last_reviewed TIMESTAMPTZ DEFAULT NOW(),
  next_review TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

CREATE INDEX idx_user_words_user_id ON user_words(user_id);
CREATE INDEX idx_user_words_word_id ON user_words(word_id);
CREATE INDEX idx_user_words_status ON user_words(status);
CREATE INDEX idx_user_words_next_review ON user_words(next_review);

-- ============================================
-- 2b. USER SAVED WORDS TABLE (favorit)
-- ============================================
CREATE TABLE user_saved_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id BIGINT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

CREATE INDEX idx_user_saved_words_user_id ON user_saved_words(user_id);
CREATE INDEX idx_user_saved_words_word_id ON user_saved_words(word_id);

-- ============================================
-- 3. USER PROFILES TABLE
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  streak INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  mastered_words INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  last_active_date TEXT DEFAULT '',
  daily_xp INTEGER DEFAULT 0,
  daily_xp_date TEXT DEFAULT '',
  viewed_words INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  last_session_date TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_words ENABLE ROW LEVEL SECURITY;

-- Words: semua orang bisa baca
CREATE POLICY "Words are viewable by everyone" ON words
  FOR SELECT USING (true);

-- User words: hanya pemilik yang bisa akses
CREATE POLICY "Users can view their own words" ON user_words
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own words" ON user_words
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own words" ON user_words
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own words" ON user_words
  FOR DELETE USING (auth.uid() = user_id);

-- User saved words: hanya pemilik yang bisa akses
CREATE POLICY "Users can view their own saved words" ON user_saved_words
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved words" ON user_saved_words
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved words" ON user_saved_words
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved words" ON user_saved_words
  FOR DELETE USING (auth.uid() = user_id);

-- User profiles: hanya pemilik yang bisa akses
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 5. AUTOMATIC PROFILE CREATION
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. FUNCTION UNTUK SEARCH
-- ============================================
CREATE OR REPLACE FUNCTION search_words(query TEXT)
RETURNS SETOF words AS $$
  SELECT *
  FROM words
  WHERE
    word ILIKE '%' || query || '%'
    OR meaning_id ILIKE '%' || query || '%'
    OR cara_baca ILIKE '%' || query || '%'
  ORDER BY
    CASE
      WHEN word ILIKE query || '%' THEN 0
      WHEN word ILIKE '%' || query || '%' THEN 1
      ELSE 2
    END,
    frequency DESC
  LIMIT 50;
$$ LANGUAGE sql;
