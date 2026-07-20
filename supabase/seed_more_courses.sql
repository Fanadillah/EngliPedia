-- Additional courses for Englipedia
-- Run in Supabase SQL Editor AFTER seed_learning_data.sql
-- Uses subqueries to find words by name (no hardcoded IDs)

-- ============================================
-- COURSE 2: English Percakapan Sehari-hari
-- ============================================
INSERT INTO courses (id, title, description, difficulty, theme, icon, color, sort_order, estimated_duration, learning_objectives) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'English Percakapan', 'Pelajari frasa dan ekspresi yang sering digunakan dalam percakapan sehari-hari. Cocok untuk pemula yang ingin lancar berkomunikasi.', 'beginner', 'Ocean Blue', 'MessageCircle', 'from-blue-500 to-cyan-500', 2, '2 minggu', ARRAY['Bisa menyapa dalam berbagai situasi', 'Memahami frasa umum percakapan', 'Bisa menanyakan dan memberikan informasi dasar']);

-- Units
INSERT INTO units (id, course_id, title, description, sort_order, learning_objectives) VALUES
('b1b2c3d4-e5f6-7890-abcd-ef1234567810', 'a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'Situasi Sosial', 'Frasa untuk situasi sosial sehari-hari', 1, ARRAY['Bisa menyapa dan berpamitan', 'Bisa menanyakan kabar']),
('b1b2c3d4-e5f6-7890-abcd-ef1234567811', 'a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'Di Restoran', 'Kosakata dan frasa saat di restoran', 2, ARRAY['Bisa memesan makanan', 'Bisa menanyakan menu']),
('b1b2c3d4-e5f6-7890-abcd-ef1234567812', 'a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'Belanja', 'Frasa untuk berbelanja', 3, ARRAY['Bisa menanyakan harga', 'Bisa melakukan pembelian']);

-- Lessons
INSERT INTO lessons (id, unit_id, title, description, lesson_type, sort_order) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567810', 'b1b2c3d4-e5f6-7890-abcd-ef1234567810', 'Menyapa & Berpamitan', 'Cara menyapa dan berpamitan dalam berbagai situasi', 'vocabulary', 1),
('c1b2c3d4-e5f6-7890-abcd-ef1234567811', 'b1b2c3d4-e5f6-7890-abcd-ef1234567810', 'Menanyakan Kabar', 'Frasa untuk menanyakan dan menjawab kabar', 'vocabulary', 2),
('c1b2c3d4-e5f6-7890-abcd-ef1234567812', 'b1b2c3d4-e5f6-7890-abcd-ef1234567811', 'Pesan Makanan', 'Frasa saat memesan makanan di restoran', 'vocabulary', 1),
('c1b2c3d4-e5f6-7890-abcd-ef1234567813', 'b1b2c3d4-e5f6-7890-abcd-ef1234567811', 'Minuman', 'Kosakata tentang minuman', 'vocabulary', 2),
('c1b2c3d4-e5f6-7890-abcd-ef1234567814', 'b1b2c3d4-e5f6-7890-abcd-ef1234567812', 'Menanyakan Harga', 'Frasa saat menanyakan dan menawar harga', 'vocabulary', 1),
('c1b2c3d4-e5f6-7890-abcd-ef1234567815', 'b1b2c3d4-e5f6-7890-abcd-ef1234567812', 'Bayar & Kembalian', 'Frasa saat membayar dan menerima kembalian', 'vocabulary', 2);

-- Lesson Words (using subqueries)
-- Lesson: Menyapa & Berpamitan
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567810', id, 1 FROM words WHERE word = 'hello' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567810', id, 2 FROM words WHERE word = 'goodbye' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567810', id, 3 FROM words WHERE word = 'please' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567810', id, 4 FROM words WHERE word = 'thank' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567810', id, 5 FROM words WHERE word = 'sorry' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567810', id, 6 FROM words WHERE word = 'excuse' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567810', id, 7 FROM words WHERE word = 'welcome' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567810', id, 8 FROM words WHERE word = 'help' LIMIT 1;

-- Lesson: Menanyakan Kabar
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567811', id, 1 FROM words WHERE word = 'how' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567811', id, 2 FROM words WHERE word = 'well' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567811', id, 3 FROM words WHERE word = 'fine' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567811', id, 4 FROM words WHERE word = 'good' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567811', id, 5 FROM words WHERE word = 'great' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567811', id, 6 FROM words WHERE word = 'new' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567811', id, 7 FROM words WHERE word = 'old' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567811', id, 8 FROM words WHERE word = 'today' LIMIT 1;

-- Lesson: Pesan Makanan
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567812', id, 1 FROM words WHERE word = 'eat' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567812', id, 2 FROM words WHERE word = 'food' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567812', id, 3 FROM words WHERE word = 'chicken' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567812', id, 4 FROM words WHERE word = 'fish' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567812', id, 5 FROM words WHERE word = 'meat' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567812', id, 6 FROM words WHERE word = 'rice' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567812', id, 7 FROM words WHERE word = 'bread' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567812', id, 8 FROM words WHERE word = 'egg' LIMIT 1;

-- Lesson: Minuman
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567813', id, 1 FROM words WHERE word = 'drink' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567813', id, 2 FROM words WHERE word = 'water' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567813', id, 3 FROM words WHERE word = 'coffee' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567813', id, 4 FROM words WHERE word = 'tea' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567813', id, 5 FROM words WHERE word = 'milk' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567813', id, 6 FROM words WHERE word = 'juice' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567813', id, 7 FROM words WHERE word = 'sugar' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567813', id, 8 FROM words WHERE word = 'hot' LIMIT 1;

-- Lesson: Menanyakan Harga
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567814', id, 1 FROM words WHERE word = 'how' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567814', id, 2 FROM words WHERE word = 'much' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567814', id, 3 FROM words WHERE word = 'cost' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567814', id, 4 FROM words WHERE word = 'price' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567814', id, 5 FROM words WHERE word = 'expensive' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567814', id, 6 FROM words WHERE word = 'cheap' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567814', id, 7 FROM words WHERE word = 'buy' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567814', id, 8 FROM words WHERE word = 'sell' LIMIT 1;

-- Lesson: Bayar & Kembalian
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567815', id, 1 FROM words WHERE word = 'pay' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567815', id, 2 FROM words WHERE word = 'money' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567815', id, 3 FROM words WHERE word = 'cash' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567815', id, 4 FROM words WHERE word = 'card' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567815', id, 5 FROM words WHERE word = 'change' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567815', id, 6 FROM words WHERE word = 'bill' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567815', id, 7 FROM words WHERE word = 'total' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567815', id, 8 FROM words WHERE word = 'receipt' LIMIT 1;


-- ============================================
-- COURSE 3: Kata Sifat & Deskripsi
-- ============================================
INSERT INTO courses (id, title, description, difficulty, theme, icon, color, sort_order, estimated_duration, learning_objectives) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567820', 'Kata Sifat', 'Pelajari kata sifat untuk mendeskripsikan orang, benda, dan situasi. Perluas kosakatamu dengan kata-kata deskriptif.', 'beginner', 'Rose Pink', 'Palette', 'from-pink-500 to-rose-500', 3, '2 minggu', ARRAY['Bisa mendeskripsikan orang dan benda', 'Memahami lawan kata (opposites)', 'Bisa menggunakan kata sifat dalam kalimat']);

-- Units
INSERT INTO units (id, course_id, title, description, sort_order, learning_objectives) VALUES
('b1b2c3d4-e5f6-7890-abcd-ef1234567820', 'a1b2c3d4-e5f6-7890-abcd-ef1234567820', 'Ukuran & Bentuk', 'Kata sifat untuk ukuran dan bentuk', 1, ARRAY['Bisa mendeskripsikan ukuran benda', 'Bisa mendeskripsikan bentuk']),
('b1b2c3d4-e5f6-7890-abcd-ef1234567821', 'a1b2c3d4-e5f6-7890-abcd-ef1234567820', 'Warna & Penampilan', 'Kata sifat untuk warna dan penampilan', 2, ARRAY['Bisa menyebutkan warna', 'Bisa mendeskripsikan penampilan']),
('b1b2c3d4-e5f6-7890-abcd-ef1234567822', 'a1b2c3d4-e5f6-7890-abcd-ef1234567820', 'Perasaan & Kepribadian', 'Kata sifat untuk perasaan dan sifat orang', 3, ARRAY['Bisa menyatakan perasaan', 'Bisa mendeskripsikan kepribadian']);

-- Lessons
INSERT INTO lessons (id, unit_id, title, description, lesson_type, sort_order) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567820', 'b1b2c3d4-e5f6-7890-abcd-ef1234567820', 'Ukuran', 'Kata sifat untuk mendeskripsikan ukuran', 'vocabulary', 1),
('c1b2c3d4-e5f6-7890-abcd-ef1234567821', 'b1b2c3d4-e5f6-7890-abcd-ef1234567820', 'Bentuk', 'Kata sifat untuk mendeskripsikan bentuk', 'vocabulary', 2),
('c1b2c3d4-e5f6-7890-abcd-ef1234567822', 'b1b2c3d4-e5f6-7890-abcd-ef1234567821', 'Warna', 'Kata sifat untuk warna', 'vocabulary', 1),
('c1b2c3d4-e5f6-7890-abcd-ef1234567823', 'b1b2c3d4-e5f6-7890-abcd-ef1234567821', 'Penampilan', 'Kata sifat untuk penampilan fisik', 'vocabulary', 2),
('c1b2c3d4-e5f6-7890-abcd-ef1234567824', 'b1b2c3d4-e5f6-7890-abcd-ef1234567822', 'Perasaan', 'Kata sifat untuk menyatakan perasaan', 'vocabulary', 1),
('c1b2c3d4-e5f6-7890-abcd-ef1234567825', 'b1b2c3d4-e5f6-7890-abcd-ef1234567822', 'Kepribadian', 'Kata sifat untuk mendeskripsikan sifat orang', 'vocabulary', 2);

-- Lesson Words
-- Lesson: Ukuran
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567820', id, 1 FROM words WHERE word = 'big' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567820', id, 2 FROM words WHERE word = 'small' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567820', id, 3 FROM words WHERE word = 'long' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567820', id, 4 FROM words WHERE word = 'short' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567820', id, 5 FROM words WHERE word = 'tall' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567820', id, 6 FROM words WHERE word = 'heavy' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567820', id, 7 FROM words WHERE word = 'light' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567820', id, 8 FROM words WHERE word = 'wide' LIMIT 1;

-- Lesson: Bentuk
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567821', id, 1 FROM words WHERE word = 'round' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567821', id, 2 FROM words WHERE word = 'flat' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567821', id, 3 FROM words WHERE word = 'thick' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567821', id, 4 FROM words WHERE word = 'thin' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567821', id, 5 FROM words WHERE word = 'deep' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567821', id, 6 FROM words WHERE word = 'high' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567821', id, 7 FROM words WHERE word = 'low' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567821', id, 8 FROM words WHERE word = 'straight' LIMIT 1;

-- Lesson: Warna
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567822', id, 1 FROM words WHERE word = 'red' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567822', id, 2 FROM words WHERE word = 'blue' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567822', id, 3 FROM words WHERE word = 'green' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567822', id, 4 FROM words WHERE word = 'yellow' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567822', id, 5 FROM words WHERE word = 'black' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567822', id, 6 FROM words WHERE word = 'white' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567822', id, 7 FROM words WHERE word = 'brown' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567822', id, 8 FROM words WHERE word = 'pink' LIMIT 1;

-- Lesson: Penampilan
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567823', id, 1 FROM words WHERE word = 'beautiful' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567823', id, 2 FROM words WHERE word = 'handsome' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567823', id, 3 FROM words WHERE word = 'clean' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567823', id, 4 FROM words WHERE word = 'dirty' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567823', id, 5 FROM words WHERE word = 'young' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567823', id, 6 FROM words WHERE word = 'old' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567823', id, 7 FROM words WHERE word = 'strong' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567823', id, 8 FROM words WHERE word = 'weak' LIMIT 1;

-- Lesson: Perasaan
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567824', id, 1 FROM words WHERE word = 'happy' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567824', id, 2 FROM words WHERE word = 'sad' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567824', id, 3 FROM words WHERE word = 'angry' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567824', id, 4 FROM words WHERE word = 'afraid' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567824', id, 5 FROM words WHERE word = 'tired' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567824', id, 6 FROM words WHERE word = 'sick' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567824', id, 7 FROM words WHERE word = 'surprise' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567824', id, 8 FROM words WHERE word = 'love' LIMIT 1;

-- Lesson: Kepribadian
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567825', id, 1 FROM words WHERE word = 'kind' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567825', id, 2 FROM words WHERE word = 'brave' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567825', id, 3 FROM words WHERE word = 'honest' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567825', id, 4 FROM words WHERE word = 'lazy' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567825', id, 5 FROM words WHERE word = 'smart' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567825', id, 6 FROM words WHERE word = 'funny' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567825', id, 7 FROM words WHERE word = 'shy' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567825', id, 8 FROM words WHERE word = 'friendly' LIMIT 1;


-- ============================================
-- COURSE 4: Kota & Perjalanan
-- ============================================
INSERT INTO courses (id, title, description, difficulty, theme, icon, color, sort_order, estimated_duration, learning_objectives) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567830', 'Kota & Perjalanan', 'Pelajari kosakata untuk berpergian, menjelajahi kota, dan menggunakan transportasi. Siap untuk petualangan!', 'elementary', 'Amber Gold', 'Map', 'from-amber-500 to-yellow-500', 4, '3 minggu', ARRAY['Bisa menyebutkan tempat umum', 'Bisa menggunakan transportasi', 'Bisa bertanya dan memberi arahan']);

-- Units
INSERT INTO units (id, course_id, title, description, sort_order, learning_objectives) VALUES
('b1b2c3d4-e5f6-7890-abcd-ef1234567830', 'a1b2c3d4-e5f6-7890-abcd-ef1234567830', 'Tempat Umum', 'Kosakata untuk tempat-tempat umum di kota', 1, ARRAY['Bisa menyebutkan tempat umum', 'Bisa menjelaskan fungsi tempat']),
('b1b2c3d4-e5f6-7890-abcd-ef1234567831', 'a1b2c3d4-e5f6-7890-abcd-ef1234567830', 'Transportasi', 'Kosakata untuk alat transportasi', 2, ARRAY['Bisa menyebutkan jenis transportasi', 'Bisa membeli tiket']),
('b1b2c3d4-e5f6-7890-abcd-ef1234567832', 'a1b2c3d4-e5f6-7890-abcd-ef1234567830', 'Navigasi', 'Frasa untuk bertanya dan memberi arahan', 3, ARRAY['Bisa bertanya arah', 'Bisa memberi instruksi']);

-- Lessons
INSERT INTO lessons (id, unit_id, title, description, lesson_type, sort_order) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567830', 'b1b2c3d4-e5f6-7890-abcd-ef1234567830', 'Tempat di Kota', 'Kosakata untuk tempat-tempat di kota', 'vocabulary', 1),
('c1b2c3d4-e5f6-7890-abcd-ef1234567831', 'b1b2c3d4-e5f6-7890-abcd-ef1234567830', 'Gedung & Fasilitas', 'Kosakata untuk gedung dan fasilitas umum', 'vocabulary', 2),
('c1b2c3d4-e5f6-7890-abcd-ef1234567832', 'b1b2c3d4-e5f6-7890-abcd-ef1234567831', 'Kendaraan', 'Jenis-jenis kendaraan', 'vocabulary', 1),
('c1b2c3d4-e5f6-7890-abcd-ef1234567833', 'b1b2c3d4-e5f6-7890-abcd-ef1234567831', 'Tiket & Perjalanan', 'Kosakata untuk tiket dan perjalanan', 'vocabulary', 2),
('c1b2c3d4-e5f6-7890-abcd-ef1234567834', 'b1b2c3d4-e5f6-7890-abcd-ef1234567832', 'Bertanya Arah', 'Frasa untuk menanyakan arah', 'vocabulary', 1),
('c1b2c3d4-e5f6-7890-abcd-ef1234567835', 'b1b2c3d4-e5f6-7890-abcd-ef1234567832', 'Memberi Arah', 'Frasa untuk memberikan petunjuk arah', 'vocabulary', 2);

-- Lesson Words
-- Lesson: Tempat di Kota
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567830', id, 1 FROM words WHERE word = 'city' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567830', id, 2 FROM words WHERE word = 'street' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567830', id, 3 FROM words WHERE word = 'park' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567830', id, 4 FROM words WHERE word = 'shop' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567830', id, 5 FROM words WHERE word = 'market' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567830', id, 6 FROM words WHERE word = 'bank' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567830', id, 7 FROM words WHERE word = 'hospital' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567830', id, 8 FROM words WHERE word = 'school' LIMIT 1;

-- Lesson: Gedung & Fasilitas
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567831', id, 1 FROM words WHERE word = 'building' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567831', id, 2 FROM words WHERE word = 'office' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567831', id, 3 FROM words WHERE word = 'hotel' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567831', id, 4 FROM words WHERE word = 'church' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567831', id, 5 FROM words WHERE word = 'museum' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567831', id, 6 FROM words WHERE word = 'library' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567831', id, 7 FROM words WHERE word = 'restaurant' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567831', id, 8 FROM words WHERE word = 'station' LIMIT 1;

-- Lesson: Kendaraan
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567832', id, 1 FROM words WHERE word = 'car' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567832', id, 2 FROM words WHERE word = 'bus' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567832', id, 3 FROM words WHERE word = 'train' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567832', id, 4 FROM words WHERE word = 'bicycle' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567832', id, 5 FROM words WHERE word = 'motorcycle' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567832', id, 6 FROM words WHERE word = 'airplane' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567832', id, 7 FROM words WHERE word = 'boat' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567832', id, 8 FROM words WHERE word = 'taxi' LIMIT 1;

-- Lesson: Tiket & Perjalanan
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567833', id, 1 FROM words WHERE word = 'ticket' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567833', id, 2 FROM words WHERE word = 'trip' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567833', id, 3 FROM words WHERE word = 'travel' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567833', id, 4 FROM words WHERE word = 'map' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567833', id, 5 FROM words WHERE word = 'suitcase' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567833', id, 6 FROM words WHERE word = 'passenger' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567833', id, 7 FROM words WHERE word = 'schedule' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567833', id, 8 FROM words WHERE word = 'delay' LIMIT 1;

-- Lesson: Bertanya Arah
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567834', id, 1 FROM words WHERE word = 'where' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567834', id, 2 FROM words WHERE word = 'left' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567834', id, 3 FROM words WHERE word = 'right' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567834', id, 4 FROM words WHERE word = 'straight' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567834', id, 5 FROM words WHERE word = 'near' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567834', id, 6 FROM words WHERE word = 'far' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567834', id, 7 FROM words WHERE word = 'next' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567834', id, 8 FROM words WHERE word = 'turn' LIMIT 1;

-- Lesson: Memberi Arah
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567835', id, 1 FROM words WHERE word = 'walk' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567835', id, 2 FROM words WHERE word = 'cross' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567835', id, 3 FROM words WHERE word = 'block' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567835', id, 4 FROM words WHERE word = 'corner' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567835', id, 5 FROM words WHERE word = 'across' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567835', id, 6 FROM words WHERE word = 'between' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567835', id, 7 FROM words WHERE word = 'behind' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567835', id, 8 FROM words WHERE word = 'front' LIMIT 1;


-- ============================================
-- COURSE 5: Waktu & Angka
-- ============================================
INSERT INTO courses (id, title, description, difficulty, theme, icon, color, sort_order, estimated_duration, learning_objectives) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567840', 'Waktu & Angka', 'Pelajari angka, waktu, hari, dan bulan dalam bahasa Inggris. Fondasi penting untuk percakapan sehari-hari.', 'beginner', 'Emerald Green', 'Clock', 'from-emerald-500 to-green-500', 5, '2 minggu', ARRAY['Bisa menghitung dalam bahasa Inggris', 'Bisa menyebutkan hari dan bulan', 'Bisa membaca jam']);

-- Units
INSERT INTO units (id, course_id, title, description, sort_order, learning_objectives) VALUES
('b1b2c3d4-e5f6-7890-abcd-ef1234567840', 'a1b2c3d4-e5f6-7890-abcd-ef1234567840', 'Angka', 'Kosakata angka dari 0-100', 1, ARRAY['Bisa menghitung dari 0-100', 'Bisa menulis angka dalam bahasa Inggris']),
('b1b2c3d4-e5f6-7890-abcd-ef1234567841', 'a1b2c3d4-e5f6-7890-abcd-ef1234567840', 'Waktu', 'Kosakata untuk waktu dan jam', 2, ARRAY['Bisa membaca jam', 'Bisa menyatakan waktu']),
('b1b2c3d4-e5f6-7890-abcd-ef1234567842', 'a1b2c3d4-e5f6-7890-abcd-ef1234567840', 'Hari & Bulan', 'Nama hari dan bulan', 3, ARRAY['Bisa menyebutkan hari', 'Bisa menyebutkan bulan']);

-- Lessons
INSERT INTO lessons (id, unit_id, title, description, lesson_type, sort_order) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567840', 'b1b2c3d4-e5f6-7890-abcd-ef1234567840', 'Angka 0-20', 'Belajar angka dari nol hingga dua puluh', 'vocabulary', 1),
('c1b2c3d4-e5f6-7890-abcd-ef1234567841', 'b1b2c3d4-e5f6-7890-abcd-ef1234567840', 'Angka 20-100', 'Belajar angka dari dua puluh hingga seratus', 'vocabulary', 2),
('c1b2c3d4-e5f6-7890-abcd-ef1234567842', 'b1b2c3d4-e5f6-7890-abcd-ef1234567841', 'Jam & Waktu', 'Kosakata untuk membaca jam', 'vocabulary', 1),
('c1b2c3d4-e5f6-7890-abcd-ef1234567843', 'b1b2c3d4-e5f6-7890-abcd-ef1234567841', 'Waktu dalam Sehari', 'Pagi, siang, sore, malam', 'vocabulary', 2),
('c1b2c3d4-e5f6-7890-abcd-ef1234567844', 'b1b2c3d4-e5f6-7890-abcd-ef1234567842', 'Hari', 'Nama hari dalam seminggu', 'vocabulary', 1),
('c1b2c3d4-e5f6-7890-abcd-ef1234567845', 'b1b2c3d4-e5f6-7890-abcd-ef1234567842', 'Bulan', 'Nama bulan dalam setahun', 'vocabulary', 2);

-- Lesson Words
-- Lesson: Angka 0-20
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567840', id, 1 FROM words WHERE word = 'one' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567840', id, 2 FROM words WHERE word = 'two' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567840', id, 3 FROM words WHERE word = 'three' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567840', id, 4 FROM words WHERE word = 'four' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567840', id, 5 FROM words WHERE word = 'five' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567840', id, 6 FROM words WHERE word = 'six' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567840', id, 7 FROM words WHERE word = 'seven' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567840', id, 8 FROM words WHERE word = 'eight' LIMIT 1;

-- Lesson: Angka 20-100
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567841', id, 1 FROM words WHERE word = 'nine' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567841', id, 2 FROM words WHERE word = 'ten' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567841', id, 3 FROM words WHERE word = 'eleven' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567841', id, 4 FROM words WHERE word = 'twelve' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567841', id, 5 FROM words WHERE word = 'twenty' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567841', id, 6 FROM words WHERE word = 'thirty' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567841', id, 7 FROM words WHERE word = 'forty' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567841', id, 8 FROM words WHERE word = 'fifty' LIMIT 1;

-- Lesson: Jam & Waktu
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567842', id, 1 FROM words WHERE word = 'time' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567842', id, 2 FROM words WHERE word = 'hour' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567842', id, 3 FROM words WHERE word = 'minute' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567842', id, 4 FROM words WHERE word = 'second' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567842', id, 5 FROM words WHERE word = 'clock' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567842', id, 6 FROM words WHERE word = 'early' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567842', id, 7 FROM words WHERE word = 'late' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567842', id, 8 FROM words WHERE word = 'now' LIMIT 1;

-- Lesson: Waktu dalam Sehari
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567843', id, 1 FROM words WHERE word = 'morning' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567843', id, 2 FROM words WHERE word = 'afternoon' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567843', id, 3 FROM words WHERE word = 'evening' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567843', id, 4 FROM words WHERE word = 'night' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567843', id, 5 FROM words WHERE word = 'today' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567843', id, 6 FROM words WHERE word = 'tomorrow' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567843', id, 7 FROM words WHERE word = 'yesterday' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567843', id, 8 FROM words WHERE word = 'always' LIMIT 1;

-- Lesson: Hari
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567844', id, 1 FROM words WHERE word = 'monday' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567844', id, 2 FROM words WHERE word = 'tuesday' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567844', id, 3 FROM words WHERE word = 'wednesday' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567844', id, 4 FROM words WHERE word = 'thursday' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567844', id, 5 FROM words WHERE word = 'friday' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567844', id, 6 FROM words WHERE word = 'saturday' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567844', id, 7 FROM words WHERE word = 'sunday' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567844', id, 8 FROM words WHERE word = 'week' LIMIT 1;

-- Lesson: Bulan
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567845', id, 1 FROM words WHERE word = 'january' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567845', id, 2 FROM words WHERE word = 'february' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567845', id, 3 FROM words WHERE word = 'march' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567845', id, 4 FROM words WHERE word = 'april' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567845', id, 5 FROM words WHERE word = 'may' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567845', id, 6 FROM words WHERE word = 'june' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567845', id, 7 FROM words WHERE word = 'july' LIMIT 1;
INSERT INTO lesson_words (lesson_id, word_id, sort_order)
SELECT 'c1b2c3d4-e5f6-7890-abcd-ef1234567845', id, 8 FROM words WHERE word = 'august' LIMIT 1;
