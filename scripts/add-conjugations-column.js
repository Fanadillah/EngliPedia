require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: "ALTER TABLE words ADD COLUMN IF NOT EXISTS conjugations JSONB DEFAULT NULL"
  });

  if (error) {
    console.log('RPC not available:', error.message);
    console.log('');
    console.log('Run this SQL manually in Supabase Dashboard > SQL Editor:');
    console.log('');
    console.log('ALTER TABLE words ADD COLUMN IF NOT EXISTS conjugations JSONB DEFAULT NULL;');
  } else {
    console.log('Column added successfully!');
  }
}
run();
