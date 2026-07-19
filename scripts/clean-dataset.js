/**
 * Script untuk membersihkan dataset sebelum import ke Supabase
 * 
 * Fixes:
 * 1. IPA kosong → isi dari mapping kata umum
 * 2. Definition terlalu panjang → ambil kalimat pertama saja
 * 3. Definition membingungkan → skip jika terlalu pendek/generic
 * 4. Kata sampah → hapus misspelling, kata terlalu pendek
 * 5. Word type yang salah → fix manual untuk kata umum
 */

const fs = require('fs');
const path = require('path');

const datasetPath = path.join(__dirname, '..', '..', 'english_app_dataset.json');
const words = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

console.log(`📥 Loaded ${words.length} words`);

// ============================================
// 1. IPA mapping untuk kata umum
// ============================================
const commonIPA = {
  'the': '/ðə/', 'a': '/ə/', 'an': '/ən/', 'and': '/ænd/', 'or': '/ɔːr/',
  'but': '/bʌt/', 'if': '/ɪf/', 'is': '/ɪz/', 'are': '/ɑːr/', 'was': '/wɒz/',
  'were': '/wɜːr/', 'be': '/biː/', 'been': '/biːn/', 'being': '/ˈbiːɪŋ/',
  'have': '/hæv/', 'has': '/hæz/', 'had': '/hæd/', 'do': '/duː/', 'does': '/dʌz/',
  'did': '/dɪd/', 'will': '/wɪl/', 'would': '/wʊd/', 'could': '/kʊd/',
  'should': '/ʃʊd/', 'may': '/meɪ/', 'might': '/maɪt/', 'must': '/mʌst/',
  'shall': '/ʃæl/', 'can': '/kæn/', 'not': '/nɒt/', 'no': '/noʊ/',
  'so': '/soʊ/', 'very': '/ˈveri/', 'just': '/dʒʌst/', 'than': '/ðæn/',
  'that': '/ðæt/', 'this': '/ðɪs/', 'these': '/ðiːz/', 'those': '/ðoʊz/',
  'what': '/wɒt/', 'which': '/wɪtʃ/', 'who': '/huː/', 'when': '/wɛn/',
  'where': '/wɛr/', 'how': '/haʊ/', 'all': '/ɔːl/', 'each': '/iːtʃ/',
  'every': '/ˈɛvri/', 'both': '/boʊθ/', 'few': '/fjuː/', 'more': '/mɔːr/',
  'most': '/moʊst/', 'other': '/ˈʌðər/', 'some': '/sʌm/', 'such': '/sʌtʃ/',
  'only': '/ˈoʊnli/', 'own': '/oʊn/', 'same': '/seɪm/', 'as': '/æz/',
  'at': '/æt/', 'by': '/baɪ/', 'for': '/fɔːr/', 'from': '/frɒm/',
  'in': '/ɪn/', 'into': '/ˈɪntuː/', 'of': '/ɒv/', 'on': '/ɒn/',
  'out': '/aʊt/', 'to': '/tuː/', 'up': '/ʌp/', 'with': '/wɪð/',
  'about': '/əˈbaʊt/', 'after': '/ˈɑːftər/', 'before': '/bɪˈfɔːr/',
  'between': '/bɪˈtwiːn/', 'during': '/ˈdjʊərɪŋ/', 'through': '/θruː/',
  'under': '/ˈʌndər/', 'over': '/ˈoʊvər/', 'against': '/əˈɡɛnst/',
  'its': '/ɪts/', 'it': '/ɪt/', 'he': '/hiː/', 'she': '/ʃiː/',
  'we': '/wiː/', 'they': '/ðeɪ/', 'me': '/miː/', 'him': '/hɪm/',
  'her': '/hɜːr/', 'us': '/ʌs/', 'them': '/ðɛm/', 'my': '/maɪ/',
  'your': '/jɔːr/', 'his': '/hɪz/', 'our': '/aʊər/', 'their': '/ðɛr/',
  'you': '/juː/', 'i': '/aɪ/', 'am': '/æm/',
  'im': '/aɪm/', 'isnt': '/ˈɪznt/', 'dont': '/doʊnt/', 'cant': '/kænt/',
  'wont': '/woʊnt/', 'didnt': '/ˈdɪdnt/', 'doesnt': '/ˈdʌznt/',
  'wasnt': '/ˈwɒznt/', 'werent': '/ˈwɜːrnt/', 'havent': '/ˈhævənt/',
  'hasnt': '/ˈhæznt/', 'hadnt': '/ˈhædnt/', 'wouldnt': '/ˈwʊdnt/',
  'couldnt': '/ˈkʊdnt/', 'shouldnt': '/ˈʃʊdnt/', 'aint': '/eɪnt/',
  'youre': '/jʊər/', 'hes': '/hiːz/', 'shes': '/ʃiːz/',
  'theyre': '/ðeɪr/', 'youll': '/jʊl/', 'hell': '/hiːl/',
  'shell': '/ʃɛl/', 'well': '/wɛl/', 'theyll': '/ðeɪl/',
  'ive': '/aɪv/', 'youve': '/juːv/', 'theyve': '/ðeɪv/', 'weve': '/wiːv/',
  'norfolk': '/ˈnɔːrfək/',
};

// ============================================
// 2. Word type fixes
// ============================================
const posFixes = {
  'the': 'article', 'a': 'article', 'an': 'article',
  'and': 'conjunction', 'or': 'conjunction', 'but': 'conjunction',
  'nor': 'conjunction', 'yet': 'conjunction', 'so': 'conjunction',
  'if': 'conjunction', 'because': 'conjunction', 'although': 'conjunction',
  'while': 'conjunction', 'since': 'conjunction', 'unless': 'conjunction',
  'until': 'conjunction', 'whether': 'conjunction',
  'in': 'preposition', 'on': 'preposition', 'at': 'preposition',
  'by': 'preposition', 'for': 'preposition', 'with': 'preposition',
  'from': 'preposition', 'to': 'preposition', 'of': 'preposition',
  'about': 'preposition', 'into': 'preposition', 'through': 'preposition',
  'during': 'preposition', 'before': 'preposition', 'after': 'preposition',
  'above': 'preposition', 'below': 'preposition', 'between': 'preposition',
  'under': 'preposition', 'over': 'preposition', 'against': 'preposition',
  'is': 'verb', 'are': 'verb', 'was': 'verb', 'were': 'verb',
  'be': 'verb', 'been': 'verb', 'being': 'verb',
  'have': 'verb', 'has': 'verb', 'had': 'verb',
  'do': 'verb', 'does': 'verb', 'did': 'verb',
  'will': 'verb', 'would': 'verb', 'could': 'verb',
  'should': 'verb', 'may': 'verb', 'might': 'verb', 'must': 'verb',
  'shall': 'verb', 'can': 'verb',
  'not': 'adverb', 'never': 'adverb', 'always': 'adverb',
  'often': 'adverb', 'sometimes': 'adverb', 'usually': 'adverb',
  'here': 'adverb', 'there': 'adverb', 'now': 'adverb', 'then': 'adverb',
  'very': 'adverb', 'really': 'adverb', 'quite': 'adverb',
  'i': 'pronoun', 'you': 'pronoun', 'he': 'pronoun', 'she': 'pronoun',
  'it': 'pronoun', 'we': 'pronoun', 'they': 'pronoun',
  'me': 'pronoun', 'him': 'pronoun', 'her': 'pronoun',
  'us': 'pronoun', 'them': 'pronoun',
  'my': 'pronoun', 'your': 'pronoun', 'his': 'pronoun',
  'its': 'pronoun', 'our': 'pronoun', 'their': 'pronoun',
  'this': 'demonstrative', 'that': 'demonstrative',
  'these': 'demonstrative', 'those': 'demonstrative',
};

// ============================================
// 3. Kata yang harus dihapus
// ============================================
const removePatterns = [
  /^im$/,   // misspelling
  /^isnt$/, // misspelling  
  /^dont$/, // misspelling
  /^cant$/, // misspelling
  /^wont$/, // misspelling
  /^didnt$/, // misspelling
  /^doesnt$/, // misspelling
  /^wasnt$/, // misspelling
  /^werent$/, // misspelling
  /^havent$/, // misspelling
  /^hasnt$/, // misspelling
  /^hadnt$/, // misspelling
  /^wouldnt$/, // misspelling
  /^couldnt$/, // misspelling
  /^shouldnt$/, // misspelling
  /^youre$/, // contraction
  /^hes$/, // contraction
  /^shes$/, // contraction
  /^theyre$/, // contraction
  /^youll$/, // contraction
  /^hell$/, // too ambiguous
  /^shell$/, // too ambiguous
  /^theyll$/, // contraction
  /^ive$/, // contraction
  /^youve$/, // contraction
  /^theyve$/, // contraction
  /^weve$/, // contraction
  /^aint$/, // nonstandard
];

// ============================================
// 4. Definition cleanup
// ============================================
function cleanDefinition(defs) {
  if (!defs || !Array.isArray(defs) || defs.length === 0) return '';
  
  let def = String(defs[0] || '');
  
  // Take first sentence (split by period, semicolon, or comma followed by space+capital)
  // But keep it meaningful - at least 10 chars
  const sentences = def.split(/;\s*|(?<=\w\.)\s+(?=[A-Z])/);
  if (sentences.length > 0) {
    def = sentences[0].trim();
  }
  
  // Remove "Used before..." type generic definitions if too vague
  // Truncate to 150 chars max
  if (def.length > 150) {
    // Try to cut at a word boundary
    def = def.substring(0, 150);
    const lastSpace = def.lastIndexOf(' ');
    if (lastSpace > 100) {
      def = def.substring(0, lastSpace);
    }
    // Remove trailing incomplete word
    def = def.replace(/[,;:]\s*$/, '').trim();
  }
  
  return def;
}

// ============================================
// 5. Clean example
// ============================================
function cleanExample(examples) {
  if (!examples || !Array.isArray(examples) || examples.length === 0) return '';
  
  let ex = String(examples[0] || '');
  
  // Truncate at 200 chars
  if (ex.length > 200) {
    ex = ex.substring(0, 200);
    const lastSpace = ex.lastIndexOf(' ');
    if (lastSpace > 100) {
      ex = ex.substring(0, lastSpace);
    }
  }
  
  return ex;
}

// ============================================
// CLEAN!
// ============================================
let removed = 0;
let fixedIPA = 0;
let fixedPos = 0;
let fixedDef = 0;
let fixedExample = 0;

const cleaned = words.filter(w => {
  // Remove misspellings and contractions
  if (removePatterns.some(p => p.test(w.word))) {
    removed++;
    return false;
  }
  return true;
}).map(w => {
  // Fix IPA
  let ipa = w.ipa_us || w.ipa_uk || '';
  if (!ipa && commonIPA[w.word]) {
    ipa = commonIPA[w.word];
    fixedIPA++;
  }
  
  // Fix POS
  let pos = w.word_type || '';
  if (posFixes[w.word]) {
    pos = posFixes[w.word];
    fixedPos++;
  }
  
  // Fix definition
  const origDef = String((w.definitions || [])[0] || '');
  const def = cleanDefinition(w.definitions);
  if (def !== origDef && origDef.length > 150) fixedDef++;
  
  // Fix example
  const origEx = String((w.examples || [])[0] || '');
  const ex = cleanExample(w.examples);
  if (ex !== origEx) fixedExample++;
  
  return {
    ...w,
    ipa_us: ipa,
    word_type: pos,
    definitions: def ? [def] : w.definitions,
    examples: ex ? [ex] : w.examples,
  };
});

console.log(`\n📊 Cleaning results:`);
console.log(`  Removed: ${removed} words (misspellings/contractions)`);
console.log(`  Fixed IPA: ${fixedIPA} words`);
console.log(`  Fixed POS: ${fixedPos} words`);
console.log(`  Fixed definitions: ${fixedDef} words`);
console.log(`  Fixed examples: ${fixedExample} words`);
console.log(`  Final: ${cleaned.length} words`);

// Verify
const stillNoIPA = cleaned.filter(w => !w.ipa_us && !w.ipa_uk).length;
console.log(`\n  Still no IPA: ${stillNoIPA} (${Math.round(stillNoIPA/cleaned.length*100)}%)`);

const stillLongDef = cleaned.filter(w => {
  const d = String((w.definitions || [])[0] || '');
  return d.length > 150;
}).length;
console.log(`  Still long definitions: ${stillLongDef}`);

// Save
const outPath = path.join(__dirname, '..', '..', 'english_app_dataset.json');
fs.writeFileSync(outPath, JSON.stringify(cleaned, null, 2), 'utf-8');
console.log(`\n✅ Saved to english_app_dataset.json`);
