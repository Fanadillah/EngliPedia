const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findWord(word) {
  const { data } = await supabase.from('words').select('id').eq('word', word).limit(1).maybeSingle();
  return data?.id || null;
}

async function findWords(words) {
  const results = [];
  for (const w of words) {
    const id = await findWord(w);
    if (id) results.push({ word: w, id });
    else console.log(`  WARNING: "${w}" not found`);
  }
  return results;
}

const COURSE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567801';

const units = [
  { id: 'b1b2c3d4-e5f6-7890-abcd-ef1234567810', title: 'Kata Sifat Dasar', desc: 'Kata sifat untuk mendeskripsikan benda, orang, dan situasi', order: 4 },
  { id: 'b1b2c3d4-e5f6-7890-abcd-ef1234567820', title: 'Angka & Waktu', desc: 'Kosakata angka, hari, bulan, dan waktu', order: 5 },
  { id: 'b1b2c3d4-e5f6-7890-abcd-ef1234567830', title: 'Keluarga & Orang', desc: 'Kosakata tentang keluarga, profesi, dan orang', order: 6 },
  { id: 'b1b2c3d4-e5f6-7890-abcd-ef1234567840', title: 'Alam & Cuaca', desc: 'Kosakata tentang alam, hewan, tumbuhan, dan cuaca', order: 7 },
  { id: 'b1b2c3d4-e5f6-7890-abcd-ef1234567850', title: 'Teknologi & Pekerjaan', desc: 'Kosakata tentang teknologi, komputer, dan pekerjaan', order: 8 },
];

const lessons = [
  // Unit 4: Kata Sifat
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567810', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567810', title: 'Ukuran & Bentuk', desc: 'Kata sifat untuk mendeskripsikan ukuran dan bentuk benda', order: 1, words: ['big','small','long','short','tall','wide','narrow','round'] },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567811', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567810', title: 'Warna', desc: 'Kata sifat untuk warna', order: 2, words: ['red','blue','green','yellow','black','white','brown','pink'] },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567812', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567810', title: 'Rasa & Sensasi', desc: 'Kata sifat untuk rasa dan sensasi', order: 3, words: ['hot','cold','sweet','sour','bitter','fresh','soft','hard'] },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567813', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567810', title: 'Perasaan', desc: 'Kata sifat untuk menyatakan perasaan', order: 4, words: ['happy','sad','angry','afraid','tired','sick','love','sorry'] },
  // Unit 5: Angka & Waktu
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567820', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567820', title: 'Angka 1-20', desc: 'Belajar angka dari satu hingga dua puluh', order: 1, words: ['one','two','three','four','five','six','seven','eight'] },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567821', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567820', title: 'Angka 20-100', desc: 'Belajar angka puluhan', order: 2, words: ['nine','ten','eleven','twelve','twenty','thirty','forty','fifty'] },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567822', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567820', title: 'Waktu', desc: 'Kosakata tentang waktu dan jam', order: 3, words: ['time','hour','minute','morning','evening','today','tomorrow','yesterday'] },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567823', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567820', title: 'Hari', desc: 'Nama hari dalam seminggu', order: 4, words: ['monday','friday','saturday','week','day','month','year','season'] },
  // Unit 6: Keluarga & Orang
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567830', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567830', title: 'Anggota Keluarga', desc: 'Kosakata untuk anggota keluarga', order: 1, words: ['mother','father','sister','brother','son','daughter','husband','wife'] },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567831', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567830', title: 'Profesi', desc: 'Kosakata untuk berbagai profesi', order: 2, words: ['doctor','teacher','nurse','driver','farmer','cook','police','student'] },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567832', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567830', title: 'Tubuh Manusia', desc: 'Bagian-bagian tubuh manusia', order: 3, words: ['head','face','eye','ear','nose','mouth','hand','foot'] },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567833', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567830', title: 'Pakaian', desc: 'Kosakata untuk jenis pakaian', order: 4, words: ['shirt','pants','shoes','hat','coat','dress','sock','belt'] },
  // Unit 7: Alam & Cuaca
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567840', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567840', title: 'Hewan', desc: 'Kosakata untuk hewan', order: 1, words: ['dog','cat','bird','fish','horse','cow','chicken','rabbit'] },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567841', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567840', title: 'Tumbuhan & Alam', desc: 'Kosakata untuk tumbuhan dan alam', order: 2, words: ['tree','flower','grass','river','mountain','sea','forest','rock'] },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567842', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567840', title: 'Cuaca', desc: 'Kosakata untuk cuaca dan musim', order: 3, words: ['sun','rain','snow','wind','cloud','storm','summer','winter'] },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567843', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567840', title: 'Langit & Bumi', desc: 'Kosakata tentang langit dan bumi', order: 4, words: ['sky','moon','star','earth','ocean','island','sand','stone'] },
  // Unit 8: Teknologi & Pekerjaan
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567850', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567850', title: 'Komputer & Gadget', desc: 'Kosakata untuk perangkat teknologi', order: 1, words: ['computer','phone','screen','keyboard','mouse','internet','data','file'] },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567851', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567850', title: 'Kantor & Kerja', desc: 'Kosakata untuk situasi kantor', order: 2, words: ['office','meeting','project','report','team','boss','salary','work'] },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567852', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567850', title: 'Hobi & Aktivitas', desc: 'Kosakata untuk hobi dan aktivitas', order: 3, words: ['music','movie','game','sport','book','travel','sing','dance'] },
  { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567853', unitId: 'b1b2c3d4-e5f6-7890-abcd-ef1234567850', title: 'Di Restoran', desc: 'Kosakata untuk makan di restoran', order: 4, words: ['food','eat','drink','plate','cup','glass','fork','knife'] },
];

async function main() {
  console.log('=== INSERTING UNITS ===');
  for (const u of units) {
    const { error } = await supabase.from('units').upsert({
      id: u.id, course_id: COURSE_ID, title: u.title, description: u.desc,
      sort_order: u.order, learning_objectives: [],
    }, { onConflict: 'id' });
    console.log(error ? `  ERR: ${u.title}: ${error.message}` : `  OK: ${u.title}`);
  }

  console.log('\n=== INSERTING LESSONS & WORDS ===');
  let totalWords = 0;
  for (const l of lessons) {
    const { error: lErr } = await supabase.from('lessons').upsert({
      id: l.id, unit_id: l.unitId, title: l.title, description: l.desc,
      lesson_type: 'vocabulary', sort_order: l.order,
    }, { onConflict: 'id' });
    if (lErr) { console.log(`  ERR lesson ${l.title}: ${lErr.message}`); continue; }
    console.log(`  Lesson: ${l.title}`);

    const found = await findWords(l.words);
    for (let i = 0; i < found.length; i++) {
      const { error } = await supabase.from('lesson_words').upsert(
        { lesson_id: l.id, word_id: found[i].id, sort_order: i + 1 },
        { onConflict: 'lesson_id,word_id' }
      );
      if (error) console.log(`    ERR ${found[i].word}: ${error.message}`);
    }
    console.log(`    -> ${found.length} words`);
    totalWords += found.length;
  }

  const { count: c } = await supabase.from('courses').select('*', { count: 'exact', head: true });
  const { count: u } = await supabase.from('units').select('*', { count: 'exact', head: true });
  const { count: l } = await supabase.from('lessons').select('*', { count: 'exact', head: true });
  const { count: w } = await supabase.from('lesson_words').select('*', { count: 'exact', head: true });

  console.log(`\n=== FINAL: ${c} courses, ${u} units, ${l} lessons, ${w} lesson_words ===`);
}

main().catch(console.error);
