-- Additional columns and tables for Learning System v2
-- Run in Supabase SQL Editor AFTER migration_learning_system.sql

-- ============================================
-- 1. ADD LEARNING OBJECTIVES TO COURSES
-- ============================================
ALTER TABLE courses ADD COLUMN IF NOT EXISTS estimated_duration TEXT DEFAULT '';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS learning_objectives TEXT[] DEFAULT '{}';

-- ============================================
-- 2. ADD LEARNING OBJECTIVES TO UNITS
-- ============================================
ALTER TABLE units ADD COLUMN IF NOT EXISTS learning_objectives TEXT[] DEFAULT '{}';
ALTER TABLE units ADD COLUMN IF NOT EXISTS target_words INTEGER DEFAULT 0;
ALTER TABLE units ADD COLUMN IF NOT EXISTS target_description TEXT DEFAULT '';

-- ============================================
-- 3. USER MISTAKES TABLE (review wrong answers)
-- ============================================
CREATE TABLE IF NOT EXISTS user_mistakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id BIGINT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  mistake_count INTEGER DEFAULT 1,
  context TEXT DEFAULT '',
  last_mistake_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_user_mistakes_user_id ON user_mistakes(user_id);

ALTER TABLE user_mistakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own mistakes" ON user_mistakes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mistakes" ON user_mistakes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mistakes" ON user_mistakes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mistakes" ON user_mistakes FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. USER DAILY GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_daily_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_xp_goal INTEGER DEFAULT 20,
  daily_words_goal INTEGER DEFAULT 5,
  daily_lessons_goal INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE user_daily_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own daily goals" ON user_daily_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own daily goals" ON user_daily_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily goals" ON user_daily_goals FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 5. USER DAILY TASKS TABLE (tracks today's tasks)
-- ============================================
CREATE TABLE IF NOT EXISTS user_daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  task_type TEXT NOT NULL CHECK (task_type IN ('learn_words', 'review_words', 'complete_lesson', 'practice_quiz', 'daily_challenge')),
  task_description TEXT DEFAULT '',
  target_count INTEGER DEFAULT 1,
  current_count INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_date, task_type)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_tasks_user_date ON user_daily_tasks(user_id, task_date);

ALTER TABLE user_daily_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own daily tasks" ON user_daily_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own daily tasks" ON user_daily_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily tasks" ON user_daily_tasks FOR UPDATE USING (auth.uid() = user_id);
