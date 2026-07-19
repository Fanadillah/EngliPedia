const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Try adding column via a simple upsert test
  const { error } = await supabase
    .from('words')
    .update({ example_id: 'test' })
    .eq('id', 1);

  if (error && error.message.includes('example_id')) {
    console.log('Column does not exist yet. Need to add it via SQL Editor.');
    console.log('Run this in Supabase SQL Editor:');
    console.log("ALTER TABLE words ADD COLUMN IF NOT EXISTS example_id TEXT DEFAULT '';");
  } else {
    // Reset the test value
    await supabase.from('words').update({ example_id: '' }).eq('id', 1);
    console.log('Column example_id already exists!');
  }
}

main();
