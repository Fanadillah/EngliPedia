require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Check current columns
  const { data, error } = await supabase.from('words').select('*').limit(1).single();
  if (error) { console.log('Error:', error.message); return; }
  
  const cols = Object.keys(data);
  console.log('Current columns:', cols.join(', '));
  
  const hasExampleId = cols.includes('example_id');
  console.log('Has example_id:', hasExampleId);
  
  if (!hasExampleId) {
    console.log('Need to add example_id column via Supabase SQL Editor');
    console.log('Run this SQL in Supabase Dashboard:');
    console.log('  ALTER TABLE words ADD COLUMN example_id TEXT DEFAULT \'\';');
  }
}
run();
