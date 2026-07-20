-- Seed data for English Learning System
-- Run this AFTER migration_learning_system.sql in Supabase SQL Editor

-- ============================================
-- 1. COURSE: English Dasar (Beginner)
-- ============================================
INSERT INTO courses (id, title, description, difficulty, theme, icon, color, sort_order) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'English Dasar', 'Pelajari kosakata dasar bahasa Inggris untuk pemula. Mulai dari sapaan, kata kerja, hingga kata benda sehari-hari.', 'beginner', 'Cosmic Purple', 'GraduationCap', 'from-violet-500 to-purple-500', 1);

-- ============================================
-- 2. UNITS
-- ============================================
INSERT INTO units (id, course_id, title, description, sort_order) VALUES
('b1b2c3d4-e5f6-7890-abcd-ef1234567801', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Sapaan & Perkenalan', 'Kosakata untuk menyapa dan memperkenalkan diri dalam bahasa Inggris', 1),
('b1b2c3d4-e5f6-7890-abcd-ef1234567802', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Kata Kerja Dasar', 'Kata kerja penting yang sering digunakan sehari-hari', 2),
('b1b2c3d4-e5f6-7890-abcd-ef1234567803', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Kata Benda Sehari-hari', 'Kata benda untuk benda dan hal di sekitar kita', 3);

-- ============================================
-- 3. LESSONS
-- ============================================

-- Unit 1: Sapaan & Perkenalan
INSERT INTO lessons (id, unit_id, title, description, lesson_type, sort_order) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567801', 'b1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Sapaan Umum', 'Kata-kata sapaan yang sering digunakan dalam percakapan sehari-hari', 'vocabulary', 1),
('c1b2c3d4-e5f6-7890-abcd-ef1234567802', 'b1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Memperkenalkan Diri', 'Kata-kata untuk berkenalan dan memperkenalkan diri', 'vocabulary', 2);

-- Unit 2: Kata Kerja Dasar
INSERT INTO lessons (id, unit_id, title, description, lesson_type, sort_order) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567803', 'b1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Kata Kerja Kegiatan', 'Kata kerja untuk aktivitas sehari-hari', 'vocabulary', 1),
('c1b2c3d4-e5f6-7890-abcd-ef1234567804', 'b1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Kata Kerja Komunikasi', 'Kata kerja untuk berkomunikasi dengan orang lain', 'vocabulary', 2);

-- Unit 3: Kata Benda Sehari-hari
INSERT INTO lessons (id, unit_id, title, description, lesson_type, sort_order) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567805', 'b1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Benda di Rumah', 'Kata benda untuk benda-benda yang ada di rumah', 'vocabulary', 1),
('c1b2c3d4-e5f6-7890-abcd-ef1234567806', 'b1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Makanan & Minuman', 'Kata benda untuk makanan dan minuman', 'vocabulary', 2);

-- ============================================
-- 4. LESSON WORDS (using word IDs from import.sql)
-- ============================================

-- Lesson 1: Sapaan Umum (word IDs: hello=846, hi=1033, goodbye=924, bye=1829, good=672, morning=1332, afternoon=2353, evening=1482, night=755, day=201)
INSERT INTO lesson_words (lesson_id, word_id, sort_order) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567801', 846, 1),   -- hello
('c1b2c3d4-e5f6-7890-abcd-ef1234567801', 1033, 2),  -- hi
('c1b2c3d4-e5f6-7890-abcd-ef1234567801', 924, 3),   -- goodbye
('c1b2c3d4-e5f6-7890-abcd-ef1234567801', 1829, 4),  -- bye
('c1b2c3d4-e5f6-7890-abcd-ef1234567801', 1332, 5),  -- morning
('c1b2c3d4-e5f6-7890-abcd-ef1234567801', 2353, 6),  -- afternoon
('c1b2c3d4-e5f6-7890-abcd-ef1234567801', 1482, 7),  -- evening
('c1b2c3d4-e5f6-7890-abcd-ef1234567801', 755, 8);   -- night

-- Lesson 2: Memperkenalkan Diri (word IDs: name=178, my=29, i=127, am=366, is=9, are=21, you=12, your=32, what=68, this=16)
INSERT INTO lesson_words (lesson_id, word_id, sort_order) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567802', 178, 1),   -- name
('c1b2c3d4-e5f6-7890-abcd-ef1234567802', 29, 2),    -- my
('c1b2c3d4-e5f6-7890-abcd-ef1234567802', 127, 3),   -- I
('c1b2c3d4-e5f6-7890-abcd-ef1234567802', 366, 4),   -- am
('c1b2c3d4-e5f6-7890-abcd-ef1234567802', 9, 5),     -- is
('c1b2c3d4-e5f6-7890-abcd-ef1234567802', 21, 6),    -- are
('c1b2c3d4-e5f6-7890-abcd-ef1234567802', 12, 7),    -- you
('c1b2c3d4-e5f6-7890-abcd-ef1234567802', 32, 8);    -- your

-- Lesson 3: Kata Kerja Kegiatan (word IDs: go=387, come=406, see=546, get=471, make=467, do=355, have=22, take=661, give=543, want=506)
INSERT INTO lesson_words (lesson_id, word_id, sort_order) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567803', 387, 1),   -- go
('c1b2c3d4-e5f6-7890-abcd-ef1234567803', 406, 2),   -- come
('c1b2c3d4-e5f6-7890-abcd-ef1234567803', 546, 3),   -- see
('c1b2c3d4-e5f6-7890-abcd-ef1234567803', 471, 4),   -- get
('c1b2c3d4-e5f6-7890-abcd-ef1234567803', 467, 5),   -- make
('c1b2c3d4-e5f6-7890-abcd-ef1234567803', 355, 6),   -- do
('c1b2c3d4-e5f6-7890-abcd-ef1234567803', 661, 7),   -- take
('c1b2c3d4-e5f6-7890-abcd-ef1234567803', 543, 8);   -- give

-- Lesson 4: Kata Kerja Komunikasi (word IDs: say=280, tell=551, ask=651, speak=1207, talk=1012, call=675, listen=1779, read=808, write=610, hear=925)
INSERT INTO lesson_words (lesson_id, word_id, sort_order) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567804', 280, 1),   -- say
('c1b2c3d4-e5f6-7890-abcd-ef1234567804', 551, 2),   -- tell
('c1b2c3d4-e5f6-7890-abcd-ef1234567804', 651, 3),   -- ask
('c1b2c3d4-e5f6-7890-abcd-ef1234567804', 1207, 4),  -- speak
('c1b2c3d4-e5f6-7890-abcd-ef1234567804', 1012, 5),  -- talk
('c1b2c3d4-e5f6-7890-abcd-ef1234567804', 675, 6),   -- call
('c1b2c3d4-e5f6-7890-abcd-ef1234567804', 1779, 7),  -- listen
('c1b2c3d4-e5f6-7890-abcd-ef1234567804', 808, 8);   -- read

-- Lesson 5: Benda di Rumah (word IDs: house=531, home=443, room=787, door=883, window=1049, table=1053, chair=1139, bed=1021, light=624, water=557)
INSERT INTO lesson_words (lesson_id, word_id, sort_order) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567805', 531, 1),   -- house
('c1b2c3d4-e5f6-7890-abcd-ef1234567805', 443, 2),   -- home
('c1b2c3d4-e5f6-7890-abcd-ef1234567805', 787, 3),   -- room
('c1b2c3d4-e5f6-7890-abcd-ef1234567805', 883, 4),   -- door
('c1b2c3d4-e5f6-7890-abcd-ef1234567805', 1049, 5),  -- window
('c1b2c3d4-e5f6-7890-abcd-ef1234567805', 1053, 6),  -- table
('c1b2c3d4-e5f6-7890-abcd-ef1234567805', 1139, 7),  -- chair
('c1b2c3d4-e5f6-7890-abcd-ef1234567805', 1021, 8);  -- bed

-- Lesson 6: Makanan & Minuman (word IDs: food=439, water=557, coffee=1548, tea=1312, bread=1541, rice=1744, milk=1361, sugar=1638, eat=539, drink=617)
INSERT INTO lesson_words (lesson_id, word_id, sort_order) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567806', 439, 1),   -- food
('c1b2c3d4-e5f6-7890-abcd-ef1234567806', 557, 2),   -- water
('c1b2c3d4-e5f6-7890-abcd-ef1234567806', 1548, 3),  -- coffee
('c1b2c3d4-e5f6-7890-abcd-ef1234567806', 1312, 4),  -- tea
('c1b2c3d4-e5f6-7890-abcd-ef1234567806', 1541, 5),  -- bread
('c1b2c3d4-e5f6-7890-abcd-ef1234567806', 1744, 6),  -- rice
('c1b2c3d4-e5f6-7890-abcd-ef1234567806', 1361, 7),  -- milk
('c1b2c3d4-e5f6-7890-abcd-ef1234567806', 1638, 8);  -- sugar
