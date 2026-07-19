/**
 * Script untuk import dataset ke Supabase via Node.js
 * 
 * Perlu Service Role Key (bukan anon key) untuk bypass RLS.
 * Ambil dari: Supabase Dashboard → Settings → API → service_role key
 * 
 * Isi di .env.local:
 *   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing env vars');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  Using anon key (may fail due to RLS). Add SUPABASE_SERVICE_ROLE_KEY to .env.local for best results.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const datasetPath = path.join(__dirname, '..', '..', 'english_app_dataset.json');
const words = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

console.log(`📚 Loaded ${words.length} words`);

function getDefinition(defs) {
  if (!defs) return '';
  if (Array.isArray(defs)) {
    let d = String(defs[0] || '');
    if (d.includes(';')) d = d.split(';')[0].trim();
    return d.length > 500 ? d.substring(0, 500) : d;
  }
  return String(defs).substring(0, 500);
}

function getExample(examples) {
  if (!examples) return '';
  if (Array.isArray(examples)) return String(examples[0] || '').substring(0, 500);
  return String(examples).substring(0, 500);
}

function convertWord(w, index) {
  const freq = w.zipf || 0;
  const level = freq >= 7 ? 'basic' : freq >= 5 ? 'intermediate' : 'advanced';

  return {
    id: index + 1,
    word: w.word,
    ipa: w.ipa_us || w.ipa_uk || '',
    pos: w.word_type || '',
    meaning_id: w.meaning_id || '',
    definition: getDefinition(w.definitions),
    example: getExample(w.examples),
    example_id: w.example_id || '',
    frequency: Math.round(freq),
    cara_baca: w.cara_baca || '',
    level: level,
  };
}

async function importWords() {
  const BATCH_SIZE = 500;
  const totalBatches = Math.ceil(words.length / BATCH_SIZE);

  console.log(`🚀 Importing ${words.length} words in ${totalBatches} batches...`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE).map((w, idx) => convertWord(w, i + idx));
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    process.stdout.write(`  Batch ${batchNum}/${totalBatches}... `);

    const { data, error } = await supabase
      .from('words')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.log(`❌ ${error.message}`);
      errorCount++;
    } else {
      console.log(`✅ ${batch.length} words`);
      successCount += batch.length;
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n========================================');
  console.log(`✅ Import complete!`);
  console.log(`   Success: ${successCount} words`);
  console.log(`   Errors: ${errorCount} batches`);
  console.log('========================================');
}

importWords().catch(console.error);
