require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Count words with empty example
  const { count: total } = await supabase.from('words').select('*', { count: 'exact', head: true });
  
  const { count: emptyExample } = await supabase.from('words').select('*', { count: 'exact', head: true }).eq('example', '');
  
  const { count: emptyExampleId } = await supabase.from('words').select('*', { count: 'exact', head: true }).eq('example_id', '');
  
  const { count: hasExample } = await supabase.from('words').select('*', { count: 'exact', head: true }).neq('example', '');
  
  console.log(`Total words: ${total}`);
  console.log(`Empty example: ${emptyExample}`);
  console.log(`Has example: ${hasExample}`);
  console.log(`Empty example_id: ${emptyExampleId}`);
  
  // Sample some empty example words
  const { data } = await supabase.from('words').select('word, example, example_id, definition').eq('example', '').order('frequency', { ascending: false }).limit(20);
  console.log('\nTop 20 words without example:');
  data.forEach(w => console.log(`  ${w.word} (freq=${w.frequency}): def=${w.definition.substring(0, 60)}`));
}
run();
