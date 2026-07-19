/**
 * Script untuk generate cara_baca dari IPA menggunakan converter TypeScript
 * 
 * Cara pakai:
 *   node scripts/generate-cara-baca.js
 */

const fs = require('fs');
const path = require('path');

// Inline converter (sama seperti src/lib/ipa-converter.ts)
const IPA_TOKENS = {
  "tʃ": "ch", "dʒ": "j",
  "θ": "th", "ð": "dh", "ʃ": "sh", "ʒ": "zh", "ŋ": "ng",
  "eɪ": "ey", "aɪ": "ai", "ɔɪ": "oi", "aʊ": "au", "oʊ": "ou",
  "iː": "ii", "uː": "uu", "ɑː": "aa", "ɔː": "oo", "ɜː": "er",
  "ɪ": "i", "ʊ": "u", "ɛ": "e", "ə": "e", "æ": "ae", "ʌ": "a", "ɒ": "o",
  "b": "b", "d": "d", "f": "f", "ɡ": "g", "g": "g", "h": "h",
  "j": "y", "k": "k", "l": "l", "m": "m", "n": "n", "p": "p",
  "r": "r", "ɹ": "r", "ɾ": "r", "s": "s", "t": "t", "v": "v",
  "w": "w", "x": "ks", "y": "y", "z": "z",
  "ɚ": "er", "ɝ": "er", "ʔ": "",
};

const SORTED_TOKENS = Object.keys(IPA_TOKENS).sort((a, b) => b.length - a.length);
const TOKEN_REGEX = new RegExp(SORTED_TOKENS.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");

function tokenizeIPA(ipa) {
  const tokens = [];
  let match;
  TOKEN_REGEX.lastIndex = 0;
  while ((match = TOKEN_REGEX.exec(ipa)) !== null) {
    tokens.push(match[0]);
  }
  return tokens;
}

function ipaToIndonesian(ipa) {
  if (!ipa) return "";
  
  let cleaned = ipa.trim()
    .replace(/^[/\[]|[/\]]$/g, "")
    .replace(/[ˌ]/g, "")
    .replace(/[˥˦˧˨˩]/g, "");

  const stressPositions = new Set();
  const stressRegex = /[ˈ']/g;
  let m;
  while ((m = stressRegex.exec(cleaned)) !== null) {
    stressPositions.add(m.index + 1);
  }
  cleaned = cleaned.replace(/[ˈ']/g, "");

  const syllables = cleaned.split(/[.]/);

  let syllableStartPos = 0;
  const convertedSyllables = syllables.map((syl, sylIdx) => {
    const tokens = tokenizeIPA(syl);
    let converted = tokens.map(t => IPA_TOKENS[t] ?? t).join("");
    
    if (sylIdx === 0 || stressPositions.has(syllableStartPos)) {
      converted = converted.toUpperCase();
    }
    
    syllableStartPos += syl.length + 1;
    return converted;
  });

  let result = convertedSyllables
    .filter(s => s.length > 0)
    .join("-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return result.toUpperCase();
}

// ============================================
// Load dataset
// ============================================
const datasetPath = path.join(__dirname, '..', '..', 'english_app_dataset.json');
const words = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

console.log(`📚 Loaded ${words.length} words`);

let generated = 0;
let skipped = 0;
let sampleOutputs = [];

const updated = words.map(w => {
  const ipa = w.ipa_us || w.ipa_uk || '';
  
  if (!ipa) {
    skipped++;
    return { ...w, cara_baca: w.cara_baca || '' };
  }
  
  const caraBaca = ipaToIndonesian(ipa);
  generated++;
  
  if (sampleOutputs.length < 20) {
    sampleOutputs.push(`${w.word} | ${ipa} | ${caraBaca}`);
  }
  
  return { ...w, cara_baca: caraBaca };
});

// Print samples
console.log('\n📝 Sample outputs:');
console.log('Word'.padEnd(15) + 'IPA'.padEnd(25) + 'Cara Baca');
console.log('-'.repeat(55));
sampleOutputs.forEach(s => console.log(s));

console.log(`\n📊 Results:`);
console.log(`  Generated: ${generated} words`);
console.log(`  Skipped (no IPA): ${skipped} words`);
console.log(`  Total: ${updated.length} words`);

// Save
fs.writeFileSync(datasetPath, JSON.stringify(updated, null, 2), 'utf-8');
console.log(`\n✅ Saved to english_app_dataset.json`);
