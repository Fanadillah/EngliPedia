/**
 * Script untuk generate SQL INSERT statements dari dataset
 * 
 * Cara pakai:
 *   node scripts/generate-sql.js > import.sql
 * 
 * Lalu copy-paste output ke Supabase SQL Editor
 */

const fs = require('fs');
const path = require('path');

const datasetPath = path.join(__dirname, '..', '..', 'english_app_dataset.json');
const words = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

console.log('-- Englipedia Dataset Import');
console.log(`-- Total: ${words.length} words`);
console.log('-- Generated at:', new Date().toISOString());
console.log('');
console.log('BEGIN;');
console.log('');

// Helper: escape SQL string
function escape(str) {
  if (!str) return '';
  if (Array.isArray(str)) return escape(str[0]);
  return String(str).replace(/'/g, "''");
}

// Helper: truncate to max length
function truncate(str, maxLen) {
  if (!str) return '';
  const s = String(str);
  return s.length > maxLen ? s.substring(0, maxLen) : s;
}

// Helper: get first definition from array
function getDefinition(defs) {
  if (!defs) return '';
  if (Array.isArray(defs)) {
    // Take first definition, clean it up
    let d = String(defs[0] || '');
    // Truncate at semicolons if too long
    if (d.includes(';')) {
      d = d.split(';')[0].trim();
    }
    return truncate(d, 500);
  }
  return truncate(String(defs), 500);
}

// Helper: get first example from array
function getExample(examples) {
  if (!examples) return '';
  if (Array.isArray(examples)) {
    return truncate(String(examples[0] || ''), 500);
  }
  return truncate(String(examples), 500);
}

// Helper: simple cara_baca from word
function generateCaraBaca(word) {
  if (!word) return '';
  // Simple phonetic approximation for Indonesian speakers
  return word.toLowerCase();
}

// Generate INSERT statements in batches of 200
const BATCH_SIZE = 200;

for (let i = 0; i < words.length; i += BATCH_SIZE) {
  const batch = words.slice(i, i + BATCH_SIZE);
  
  const values = batch.map((w, idx) => {
    const id = i + idx + 1;
    const freq = w.zipf || 0;
    const level = freq >= 7 ? 'basic' : freq >= 5 ? 'intermediate' : 'advanced';
    const ipa = w.ipa_us || w.ipa_uk || '';
    const pos = w.word_type || '';
    const meaningId = w.meaning_id || '';
    const definition = getDefinition(w.definitions);
    const example = getExample(w.examples);
    const caraBaca = w.cara_baca || '';
    
    return `(${id}, '${escape(w.word)}', '${escape(ipa)}', '${escape(pos)}', '${escape(meaningId)}', '${escape(definition)}', '${escape(example)}', ${Math.round(freq)}, '${escape(caraBaca)}', '${escape(level)}')`;
  }).join(',\n  ');
  
  console.log(`INSERT INTO words (id, word, ipa, pos, meaning_id, definition, example, frequency, cara_baca, level) VALUES`);
  console.log(`  ${values}`);
  console.log(`ON CONFLICT (id) DO NOTHING;`);
  console.log('');
}

console.log('COMMIT;');
console.log(`-- Total: ${words.length} words imported`);
