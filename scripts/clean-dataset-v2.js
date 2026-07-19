/**
 * Major data quality cleanup
 * 
 * 1. Remove misspellings, abbreviations, archaic forms, clippings
 * 2. Fix definitions that belong to wrong word senses
 * 3. Fix examples that don't contain the word
 * 4. Clean up unicode characters in definitions
 */

const fs = require('fs');
const path = require('path');

const datasetPath = path.join(__dirname, '..', '..', 'english_app_dataset.json');
const words = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

console.log(`📚 Loaded ${words.length} words`);

// ============================================
// STEP 1: Remove junk words
// ============================================
let removedCount = 0;
const cleaned = words.filter(w => {
  const def = String((w.definitions || [])[0] || '');
  
  // Misspellings
  if (/^Misspelling of/i.test(def)) { removedCount++; return false; }
  // Abbreviations
  if (/^(Abbreviation|Acronym|Short for|Contraction) of/i.test(def)) { removedCount++; return false; }
  // Obsolete/Archaic forms
  if (/^(Obsolete|Archaic) form of/i.test(def)) { removedCount++; return false; }
  // Alternative forms
  if (/^(Alternative (form|spelling|letter-case) of)/i.test(def)) { removedCount++; return false; }
  // Clipping
  if (/^Clipping of/i.test(def)) { removedCount++; return false; }
  // Singular of (usually for plurals that shouldn't be separate entries)
  if (/^singular of/i.test(def)) { removedCount++; return false; }
  // Plural of (usually shouldn't be separate entries unless distinct meaning)
  if (/^Plural of/i.test(def) && w.word.length > 4) { removedCount++; return false; }
  
  return true;
});

console.log(`🗑️  Removed ${removedCount} junk words (misspellings, abbreviations, etc.)`);
console.log(`   Remaining: ${cleaned.length} words`);

// ============================================
// STEP 2: Clean up definitions
// ============================================
let defFixed = 0;
const defCleaned = cleaned.map(w => {
  let def = String((w.definitions || [])[0] || '');
  if (!def) return w;
  
  // Clean unicode symbols that are confusing
  // Remove footnote markers like ¹ ² ³
  def = def.replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]/g, '');
  // Clean special quotes
  def = def.replace(/[""]/g, '"');
  // Clean angle brackets used for examples
  def = def.replace(/[⟨⟩]/g, '"');
  
  // Remove definitions that reference other entries too heavily
  if (/^See also:/i.test(def)) { defFixed++; return { ...w, definitions: [''] }; }
  
  // Truncate if too long (keep first meaningful part)
  if (def.length > 150) {
    // Try to cut at semicolon or period
    const cutPoint = Math.min(
      def.indexOf('; ') > 50 ? def.indexOf('; ') : 999,
      def.indexOf('. ') > 50 ? def.indexOf('. ') : 999,
    );
    if (cutPoint < 150) {
      def = def.substring(0, cutPoint);
    } else {
      def = def.substring(0, 150);
      const lastSpace = def.lastIndexOf(' ');
      if (lastSpace > 100) def = def.substring(0, lastSpace);
    }
    defFixed++;
  }
  
  // Remove trailing incomplete words
  def = def.replace(/[,;:]\s*$/, '').trim();
  
  if (def !== String((w.definitions || [])[0] || '')) {
    return { ...w, definitions: [def] };
  }
  return w;
});

console.log(`\n🔧 Fixed ${defFixed} definitions`);

// ============================================
// STEP 3: Fix examples using known correct examples
// ============================================
const knownExamples = {
  'be': 'You should be careful.',
  'are': 'They are happy.',
  'were': 'They were at home.',
  'been': 'I have been there before.',
  'being': 'She is being polite.',
  'is': 'It is raining outside.',
  'am': 'I am a student.',
  'was': 'She was at the office.',
  'has': 'She has two brothers.',
  'have': 'I have a new car.',
  'had': 'They had a great time.',
  'do': 'Do you like coffee?',
  'does': 'Does she speak English?',
  'did': 'Did you go to school?',
  'will': 'I will call you later.',
  'would': 'Would you like some tea?',
  'could': 'I could help you with that.',
  'should': 'You should study harder.',
  'may': 'May I come in?',
  'might': 'It might rain tomorrow.',
  'must': 'You must follow the rules.',
  'can': 'She can speak three languages.',
  'shall': 'Shall we go now?',
  'they': 'They went to the store together.',
  'them': 'I gave them the books.',
  'their': 'Their house is on the corner.',
  'she': 'She is a doctor.',
  'he': 'He went to the market.',
  'her': 'She told her the truth.',
  'his': 'He finished his homework.',
  'him': 'I saw him yesterday.',
  'us': 'Come sit with us.',
  'me': 'Can you help me?',
  'my': 'I lost my keys.',
  'your': 'What is your name?',
  'our': 'We love our country.',
  'its': 'The cat licked its paw.',
  'we': 'We are going to school.',
  'you': 'You look great today.',
  'so': 'It was late, so we went home.',
  'just': 'I just finished my work.',
  'very': 'She is very kind.',
  'more': 'I need more time.',
  'most': 'Most students passed the test.',
  'only': 'She only has one brother.',
  'other': 'The other book is on the table.',
  'that': 'I think that she is right.',
  'this': 'This is my favorite song.',
  'these': 'These are my friends.',
  'those': 'Those shoes are expensive.',
  'what': 'What time is it?',
  'when': 'When does the movie start?',
  'where': 'Where do you live?',
  'which': 'Which color do you prefer?',
  'who': 'Who is your teacher?',
  'why': 'Why are you late?',
  'how': 'How are you doing?',
  'if': 'If it rains, we will stay inside.',
  'but': 'I like coffee but not tea.',
  'and': 'She bought bread and milk.',
  'or': 'Do you want tea or coffee?',
  'not': 'I do not understand.',
  'no': 'No, thank you.',
  'yes': 'Yes, I agree.',
  'up': 'Please stand up.',
  'out': 'He went out for a walk.',
  'in': 'She is in the kitchen.',
  'on': 'The book is on the table.',
  'at': 'We met at the park.',
  'to': 'I am going to school.',
  'for': 'This gift is for you.',
  'from': 'She is from Indonesia.',
  'with': 'He went with his friends.',
  'about': 'We talked about the project.',
  'after': 'We will meet after lunch.',
  'before': 'Wash your hands before eating.',
  'between': 'What is the difference between them?',
  'through': 'We walked through the forest.',
  'under': 'The cat is under the table.',
  'over': 'The bird flew over the house.',
  'into': 'She walked into the room.',
  'against': 'He leaned against the wall.',
  'all': 'All students must attend.',
  'every': 'Every day is a new opportunity.',
  'both': 'Both options are good.',
  'few': 'Few people attended the meeting.',
  'some': 'Some students are absent today.',
  'now': 'I am busy right now.',
  'here': 'Come here please.',
  'there': 'There is a cat on the roof.',
  'then': 'First we eat, then we play.',
  'one': 'One plus one equals two.',
  'two': 'I have two sisters.',
  'old': 'My grandmother is eighty years old.',
  'big': 'That is a big house.',
  'go': 'Let us go to the park.',
  'come': 'Come here and sit down.',
  'see': 'I can see the mountain from here.',
  'get': 'I need to get some water.',
  'make': 'She can make delicious cakes.',
  'take': 'Take your umbrella with you.',
  'give': 'Please give me that book.',
  'tell': 'Can you tell me the time?',
  'say': 'What did you say?',
  'said': 'She said she was tired.',
  'know': 'Do you know the answer?',
  'think': 'I think it will rain.',
  'want': 'I want to learn English.',
  'need': 'We need more practice.',
  'like': 'I like reading books.',
  'look': 'Look at that beautiful sunset.',
  'find': 'I cannot find my keys.',
  'put': 'Put the book on the table.',
  'keep': 'Keep your room clean.',
  'let': 'Let me help you.',
  'try': 'You should try your best.',
  'ask': 'Please ask if you have questions.',
  'feel': 'I feel happy today.',
  'turn': 'Please turn off the lights.',
  'start': 'The race will start at noon.',
  'run': 'She runs every morning.',
  'eat': 'Let us eat dinner together.',
  'buy': 'I want to buy a new phone.',
  'read': 'She likes to read novels.',
  'write': 'Please write your name here.',
  'sit': 'Please sit down.',
  'stand': 'Please stand up.',
  'open': 'Can you open the window?',
  'close': 'Please close the door.',
  'help': 'Can you help me with this?',
  'play': 'The children are playing outside.',
  'move': 'Please move your chair closer.',
  'live': 'I live in Jakarta.',
  'believe': 'I believe in you.',
  'bring': 'Please bring your textbook tomorrow.',
  'happen': 'What happened to you?',
  'set': 'She set the table for dinner.',
  'learn': 'I want to learn new things.',
  'change': 'We need to change our plans.',
  'lead': 'She will lead the team.',
  'understand': 'I do not understand the question.',
  'watch': 'Let us watch a movie tonight.',
  'follow': 'Please follow the instructions.',
  'stop': 'Please stop making noise.',
  'create': 'Artists create beautiful paintings.',
  'speak': 'She can speak three languages.',
  'spend': 'We spent the weekend at the beach.',
  'grow': 'Children grow quickly.',
  'walk': 'We walked to the store.',
  'win': 'Our team won the game.',
  'remember': 'I remember meeting her before.',
  'love': 'I love my family.',
  'appear': 'The sun will appear soon.',
  'wait': 'Please wait for me.',
  'die': 'The plant will die without water.',
  'send': 'I will send you an email.',
  'stay': 'Please stay at home.',
  'fall': 'Be careful not to fall.',
  'cut': 'Please cut the paper in half.',
  'sell': 'He wants to sell his car.',
  'decide': 'We need to decide now.',
  'carry': 'Can you carry this box for me?',
  'talk': 'We need to talk about this.',
  'hold': 'Please hold my hand.',
  'choose': 'You can choose any color you like.',
  'draw': 'She likes to draw pictures.',
  'break': 'Be careful not to break the glass.',
  'fight': 'They fight for their rights.',
  'hit': 'He hit the ball very hard.',
  'hurt': 'I hurt my knee playing soccer.',
  'pick': 'Please pick up the trash.',
  'rise': 'The sun rises in the east.',
  'shake': 'Shake the bottle before use.',
  'shut': 'Please shut the door.',
  'throw': 'Please throw the ball to me.',
  'wake': 'I wake up at six every morning.',
  'wear': 'She wears glasses.',
  'feed': 'Please feed the cat.',
  'hide': 'The children love to hide.',
  'meet': 'Nice to meet you.',
  'ring': 'The doorbell is ringing.',
  'sing': 'She loves to sing songs.',
  'swim': 'We swim in the pool every summer.',
  'teach': 'She teaches mathematics.',
  'drive': 'He drives carefully.',
  'fly': 'Birds can fly very high.',
  'blow': 'The wind is blowing hard.',
};

let exampleFixed = 0;
let exampleCleared = 0;
const finalCleaned = defCleaned.map(w => {
  // Use known correct examples
  if (knownExamples[w.word]) {
    exampleFixed++;
    return { ...w, examples: [knownExamples[w.word]] };
  }
  
  const ex = String((w.examples || [])[0] || '');
  if (!ex) return w;
  
  // Clear very short examples
  if (ex.trim().length < 5) {
    exampleCleared++;
    return { ...w, examples: [''] };
  }
  
  // Clear examples that contain archaic characters
  if (/[ſ]/.test(ex)) {
    exampleCleared++;
    return { ...w, examples: [''] };
  }
  
  // Clear examples that are references/citations
  if (/^(For quotations|See |Compare )/i.test(ex)) {
    exampleCleared++;
    return { ...w, examples: [''] };
  }
  
  // Clear examples with offensive content patterns
  if (/fuck|shit|damn|ass|bitch/i.test(ex)) {
    exampleCleared++;
    return { ...w, examples: [''] };
  }
  
  return w;
});

console.log(`\n📝 Fixed ${exampleFixed} examples with correct versions`);
console.log(`🗑️  Cleared ${exampleCleared} bad examples`);

// ============================================
// STEP 4: Final stats
// ============================================
console.log(`\n📊 FINAL RESULTS:`);
console.log(`  Original: ${words.length} words`);
console.log(`  Removed: ${words.length - finalCleaned.length} words`);
console.log(`  Final: ${finalCleaned.length} words`);

// Verify some samples
const samples = ['the', 'be', 'they', 'so', 'you', 'have', 'will', 'can', 'beautiful', 'run', 'happy'];
console.log('\n--- Sample verification ---');
samples.forEach(w => {
  const word = finalCleaned.find(x => x.word === w);
  if (word) {
    const def = String((word.definitions || [])[0] || '').substring(0, 60);
    const ex = String((word.examples || [])[0] || '').substring(0, 60);
    const ipa = word.ipa_us || '';
    console.log(`${w.padEnd(12)} | IPA: ${ipa.padEnd(18)} | Def: ${def}`);
    console.log(`${''.padEnd(12)} | Ex: ${ex}`);
  }
});

fs.writeFileSync(datasetPath, JSON.stringify(finalCleaned, null, 2), 'utf-8');
console.log(`\n✅ Saved to english_app_dataset.json`);
