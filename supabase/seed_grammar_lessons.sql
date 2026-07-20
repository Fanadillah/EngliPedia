-- Grammar lessons seed data
-- Run in Supabase SQL Editor AFTER migration_grammar.sql and seed_learning_data.sql

-- ============================================
-- NEW UNIT: Grammar (in English Dasar course)
-- ============================================
INSERT INTO units (id, course_id, title, description, sort_order, learning_objectives) VALUES
('b1b2c3d4-e5f6-7890-abcd-ef1234567850', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Grammar Dasar', 'Pelajari tata bahasa Inggris dasar untuk membangun kalimat yang benar', 4, ARRAY['Bisa membuat kalimat Simple Present', 'Bisa menggunakan Past Tense untuk kejadian masa lalu', 'Memahami perubahan kata kerja untuk subject berbeda']);

-- ============================================
-- LESSON 1: Simple Present Tense
-- ============================================
INSERT INTO lessons (id, unit_id, title, description, lesson_type, sort_order) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567850', 'b1b2c3d4-e5f6-7890-abcd-ef1234567850', 'Simple Present Tense', 'Pelajari cara menggunakan Simple Present untuk kebiasaan dan fakta', 'grammar', 1);

-- Explanation 1: Apa itu Simple Present?
INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567850', 'explanation', 1, 'Apa itu Simple Present?', '{
  "text": "Simple Present Tense digunakan untuk menyatakan kebiasaan, kebenaran umum, dan fakta. Tenses ini menggunakan kata kerja bentuk dasar (base form).",
  "pattern": "Subject + Verb (base form)",
  "notes": [
    "Untuk subject I, You, We, They: gunakan kata kerja dasar",
    "Untuk subject He, She, It: tambahkan -s atau -es di akhir kata kerja",
    "Kata kerja berakhir -s, -sh, -ch, -x, -o: tambahkan -es (wash → washes, go → goes)",
    "Kata kerja berakhir konsonan + y: y berubah jadi -ies (study → studies)"
  ]
}');

-- Explanation 2: Kata Kerja Tidak Beraturan
INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567850', 'explanation', 2, 'Kata Kerja Tidak Beraturan', '{
  "text": "Beberapa kata kerja memiliki bentuk yang tidak beraturan. Perhatikan perubahan pada kata kerja \"be\" di bawah ini.",
  "pattern": "Subject + to be (am/is/are)",
  "notes": [
    "I → am (I am a student)",
    "He, She, It → is (She is a teacher)",
    "You, We, They → are (They are friends)"
  ]
}');

-- Examples
INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567850', 'example', 3, 'Contoh Kalimat', '{
  "sentence": "I wake up at 7 AM every day.",
  "translation": "Saya bangun jam 7 setiap hari.",
  "highlight": ["wake", "up"]
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567850', 'example', 4, 'Contoh Kalimat', '{
  "sentence": "She goes to school by bus.",
  "translation": "Dia pergi ke sekolah dengan bus.",
  "highlight": ["goes"]
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567850', 'example', 5, 'Contoh Kalimat', '{
  "sentence": "They play football every weekend.",
  "translation": "Mereka bermain sepak bola setiap akhir pekan.",
  "highlight": ["play"]
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567850', 'example', 6, 'Contoh Kalimat', '{
  "sentence": "He watches TV every night.",
  "translation": "Dia menonton TV setiap malam.",
  "highlight": ["watches"]
}');

-- Exercises
INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567850', 'exercise', 7, 'Latihan 1', '{
  "type": "fill_blank",
  "question": "I ___ (go) to work every morning.",
  "answer": "go",
  "hint": "Untuk subject \"I\", gunakan kata kerja dasar"
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567850', 'exercise', 8, 'Latihan 2', '{
  "type": "fill_blank",
  "question": "She ___ (watch) movies on weekends.",
  "answer": "watches",
  "hint": "Untuk subject \"She\", tambahkan -es"
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567850', 'exercise', 9, 'Latihan 3', '{
  "type": "mcq",
  "question": "Which is correct?",
  "answer": "He drinks coffee every morning.",
  "options": ["He drink coffee every morning.", "He drinks coffee every morning.", "He drinking coffee every morning.", "He drinkeds coffee every morning."]
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567850', 'exercise', 10, 'Latihan 4', '{
  "type": "fill_blank",
  "question": "They ___ (study) English every day.",
  "answer": "study",
  "hint": "Untuk subject \"They\", gunakan kata kerja dasar"
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567850', 'exercise', 11, 'Latihan 5', '{
  "type": "mcq",
  "question": "Choose the correct sentence:",
  "answer": "It rains a lot in Jakarta.",
  "options": ["It rain a lot in Jakarta.", "It rains a lot in Jakarta.", "It raining a lot in Jakarta.", "It rained a lot in Jakarta."]
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567850', 'exercise', 12, 'Latihan 6', '{
  "type": "fill_blank",
  "question": "My mother ___ (cook) dinner every night.",
  "answer": "cooks",
  "hint": "Untuk subject \"My mother\" (She), tambahkan -s"
}');


-- ============================================
-- LESSON 2: Past Tense (Regular Verbs)
-- ============================================
INSERT INTO lessons (id, unit_id, title, description, lesson_type, sort_order) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567851', 'b1b2c3d4-e5f6-7890-abcd-ef1234567850', 'Past Tense (Regular)', 'Pelajari cara menggunakan Past Tense untuk kejadian masa lalu', 'grammar', 2);

-- Explanation 1: Apa itu Past Tense?
INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567851', 'explanation', 1, 'Apa itu Past Tense?', '{
  "text": "Simple Past Tense digunakan untuk menyatakan kejadian yang sudah terjadi di masa lalu. Untuk kata kerja regular (beraturan), tambahkan -ed di akhir kata kerja.",
  "pattern": "Subject + Verb-ed (regular) / Verb 2 (irregular)",
  "notes": [
    "Kata kerja regular: tambahkan -ed (walk → walked, play → played)",
    "Kata kerja berakhir -e: tambahkan -d (like → liked, love → loved)",
    "Kata kerja berakhir konsonan + y: y berubah jadi -ied (study → studied)",
    "Kata kerja pendek 1 suku kata + konsonan: gandakan konsonan + ed (stop → stopped)"
  ]
}');

-- Explanation 2: Kata Kerja Tidak Beraturan
INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567851', 'explanation', 2, 'Kata Kerja Tidak Beraturan', '{
  "text": "Beberapa kata kerja memiliki bentuk masa lalu yang tidak beraturan. Bentuk ini harus dihafal karena tidak mengikuti aturan -ed.",
  "pattern": "Subject + Verb 2 (irregular)",
  "notes": [
    "go → went (Saya pergi ke pasar)",
    "eat → ate (Dia makan nasi)",
    "see → saw (Kita melihat burung)",
    "come → came (Mereka datang kemarin)",
    "take → took (Saya mengambil buku)"
  ]
}');

-- Examples
INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567851', 'example', 3, 'Contoh Kalimat', '{
  "sentence": "I walked to school yesterday.",
  "translation": "Saya berjalan ke sekolah kemarin.",
  "highlight": ["walked"]
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567851', 'example', 4, 'Contoh Kalimat', '{
  "sentence": "She studied English last night.",
  "translation": "Dia belajar Bahasa Inggris tadi malam.",
  "highlight": ["studied"]
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567851', 'example', 5, 'Contoh Kalimat', '{
  "sentence": "They played football yesterday.",
  "translation": "Mereka bermain sepak bola kemarin.",
  "highlight": ["played"]
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567851', 'example', 6, 'Contoh Kalimat', '{
  "sentence": "He went to the market this morning.",
  "translation": "Dia pergi ke pasar tadi pagi.",
  "highlight": ["went"]
}');

-- Exercises
INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567851', 'exercise', 7, 'Latihan 1', '{
  "type": "fill_blank",
  "question": "I ___ (walk) to school yesterday.",
  "answer": "walked",
  "hint": "Tambahkan -ed"
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567851', 'exercise', 8, 'Latihan 2', '{
  "type": "fill_blank",
  "question": "She ___ (study) English last night.",
  "answer": "studied",
  "hint": "Konsonan + y → -ied"
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567851', 'exercise', 9, 'Latihan 3', '{
  "type": "mcq",
  "question": "Which is the past tense of \"go\"?",
  "answer": "went",
  "options": ["goed", "went", "going", "gone"]
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567851', 'exercise', 10, 'Latihan 4', '{
  "type": "fill_blank",
  "question": "They ___ (play) football yesterday.",
  "answer": "played",
  "hint": "Tambahkan -ed"
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567851', 'exercise', 11, 'Latihan 5', '{
  "type": "mcq",
  "question": "Which is correct?",
  "answer": "She liked the movie.",
  "options": ["She liked the movie.", "She likeed the movie.", "She liking the movie.", "She likes the movie."]
}');

INSERT INTO lesson_content (lesson_id, content_type, sort_order, title, content) VALUES
('c1b2c3d4-e5f6-7890-abcd-ef1234567851', 'exercise', 12, 'Latihan 6', '{
  "type": "fill_blank",
  "question": "He ___ (eat) breakfast at 7 AM.",
  "answer": "ate",
  "hint": "Kata kerja tidak beraturan: eat → ate"
}');
