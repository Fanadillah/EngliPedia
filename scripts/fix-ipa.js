/**
 * Comprehensive IPA fix script
 * Fixes all wrong IPA entries found in the dataset
 */

const fs = require('fs');
const path = require('path');

const datasetPath = path.join(__dirname, '..', '..', 'english_app_dataset.json');
const words = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

console.log(`📚 Loaded ${words.length} words`);

// ============================================
// Manual IPA fixes
// ============================================
const ipaFixes = {
  // Previous fixes
  'of': '/ɒv/',
  'is': '/ɪz/',
  'are': '/ɑːr/',
  'was': '/wɒz/',
  'do': '/duː/',
  
  // Newly found wrong IPA (IPA was for a different word)
  'they': '/ðeɪ/',
  'them': '/ðɛm/',
  'their': '/ðɛr/',
  'his': '/hɪz/',
  'hit': '/hɪt/',
  'you': '/juː/',
  'me': '/miː/',
  'so': '/soʊ/',
  'as': '/æz/',
  'now': '/naʊ/',
  'hey': '/heɪ/',
  'him': '/hɪm/',
  'art': '/ɑːrt/',
  'hum': '/hʌm/',
  'honor': '/ˈɑːnər/',
  'honour': '/ˈɒnər/',
  'ms': '/mɪz/',
  'pc': '/ˌpiːˈsiː/',
  'tv': '/ˌtiːˈviː/',
  'che': '/tʃeɪ/',
  'ava': '/ˈɑːvə/',
  'ernie': '/ˈɜːrni/',
  'ran': '/ræn/',
  
  // Additional common words that might have wrong IPA
  'she': '/ʃiː/',
  'he': '/hiː/',
  'her': '/hɜːr/',
  'us': '/ʌs/',
  'we': '/wiː/',
  'my': '/maɪ/',
  'your': '/jɔːr/',
  'our': '/aʊər/',
  'its': '/ɪts/',
  'that': '/ðæt/',
  'this': '/ðɪs/',
  'these': '/ðiːz/',
  'those': '/ðoʊz/',
  'what': '/wɒt/',
  'when': '/wɛn/',
  'where': '/wɛr/',
  'which': '/wɪtʃ/',
  'who': '/huː/',
  'why': '/waɪ/',
  'how': '/haʊ/',
  'have': '/hæv/',
  'has': '/hæz/',
  'had': '/hæd/',
  'will': '/wɪl/',
  'would': '/wʊd/',
  'could': '/kʊd/',
  'should': '/ʃʊd/',
  'may': '/meɪ/',
  'might': '/maɪt/',
  'must': '/mʌst/',
  'can': '/kæn/',
  'not': '/nɒt/',
  'but': '/bʌt/',
  'and': '/ænd/',
  'the': '/ðə/',
  'to': '/tuː/',
  'in': '/ɪn/',
  'on': '/ɒn/',
  'at': '/æt/',
  'by': '/baɪ/',
  'for': '/fɔːr/',
  'from': '/frɒm/',
  'with': '/wɪð/',
  'about': '/əˈbaʊt/',
  'up': '/ʌp/',
  'out': '/aʊt/',
  'if': '/ɪf/',
  'or': '/ɔːr/',
  'no': '/noʊ/',
  'go': '/ɡoʊ/',
  'be': '/biː/',
  'am': '/æm/',
  'an': '/ən/',
  'up': '/ʌp/',
  'it': '/ɪt/',
  'at': '/æt/',
  'all': '/ɔːl/',
  'one': '/wʌn/',
  'two': '/tuː/',
  'old': '/oʊld/',
  'oh': '/oʊ/',
  'hi': '/haɪ/',
  'hey': '/heɪ/',
  'yes': '/jɛs/',
  'very': '/ˈveri/',
  'just': '/dʒʌst/',
  'than': '/ðæn/',
  'only': '/ˈoʊnli/',
  'some': '/sʌm/',
  'other': '/ˈʌðər/',
  'more': '/mɔːr/',
  'most': '/moʊst/',
  'such': '/sʌtʃ/',
  'after': '/ˈɑːftər/',
  'before': '/bɪˈfɔːr/',
  'between': '/bɪˈtwiːn/',
  'through': '/θruː/',
  'under': '/ˈʌndər/',
  'over': '/ˈoʊvər/',
  'against': '/əˈɡɛnst/',
  'into': '/ˈɪntuː/',
};

let fixed = 0;
const updated = words.map(w => {
  if (ipaFixes[w.word]) {
    const oldIPA = w.ipa_us || '(empty)';
    console.log(`  Fix: ${w.word.padEnd(12)} | ${oldIPA.padEnd(22)} → ${ipaFixes[w.word]}`);
    fixed++;
    return { ...w, ipa_us: ipaFixes[w.word] };
  }
  return w;
});

console.log(`\n📊 Fixed ${fixed} words`);

fs.writeFileSync(datasetPath, JSON.stringify(updated, null, 2), 'utf-8');
console.log(`✅ Saved to english_app_dataset.json`);
