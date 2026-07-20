-- Grammar lesson content table
-- Run in Supabase SQL Editor AFTER migration_learning_system.sql

-- ============================================
-- LESSON CONTENT TABLE (for grammar lessons)
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('explanation', 'example', 'exercise')),
  sort_order INTEGER DEFAULT 0,
  title TEXT DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_content_lesson_id ON lesson_content(lesson_id);

ALTER TABLE lesson_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lesson content is viewable by everyone" ON lesson_content FOR SELECT USING (true);
