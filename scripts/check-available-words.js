const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data: courses } = await supabase.from('courses').select('*');
  const { data: units } = await supabase.from('units').select('*');
  const { data: lessons } = await supabase.from('lessons').select('*');
  const { data: lessonWords } = await supabase.from('lesson_words').select('*');

  console.log('=== CURRENT STATE ===');
  console.log('Courses:', courses.length);
  courses.forEach(c => console.log('  ' + c.title + ' (' + c.difficulty + ')'));
  console.log('Units:', units.length);
  console.log('Lessons:', lessons.length);
  console.log('Lesson Words:', lessonWords.length);

  const usedWordIds = new Set(lessonWords.map(lw => lw.word_id));

  // Get all words
  const { data: allWords } = await supabase.from('words')
    .select('id, word, meaning_id, level, pos')
    .order('frequency', { ascending: false });

  const available = allWords.filter(w => !usedWordIds.has(w.id));
  console.log('\nAvailable words:', available.length);

  // Group by level
  const basic = available.filter(w => w.level === 'basic');
  const intermediate = available.filter(w => w.level === 'intermediate');
  const advanced = available.filter(w => w.level === 'advanced');

  console.log('Basic:', basic.length);
  console.log('Intermediate:', intermediate.length);
  console.log('Advanced:', advanced.length);

  // Show top words per level
  console.log('\n--- TOP BASIC ---');
  basic.slice(0, 50).forEach(w => console.log(`  ${w.id}: ${w.word} = ${w.meaning_id} [${w.pos}]`));

  console.log('\n--- TOP INTERMEDIATE ---');
  intermediate.slice(0, 50).forEach(w => console.log(`  ${w.id}: ${w.word} = ${w.meaning_id} [${w.pos}]`));
})();
