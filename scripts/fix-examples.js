/**
 * Fix example sentences that belong to other words
 */

const fs = require('fs');
const path = require('path');

const datasetPath = path.join(__dirname, '..', '..', 'english_app_dataset.json');
const words = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

console.log(`📚 Loaded ${words.length} words`);

// ============================================
// Example fixes: correct examples for common words
// ============================================
const exampleFixes = {
  // Words that had wrong/mismatched examples
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
  'so': 'It was late, so we went home.',
  'just': 'I just finished my work.',
  'very': 'She is very kind.',
  'more': 'I need more time.',
  'most': 'Most students passed the test.',
  'only': 'She only has one brother.',
  'other': 'The other book is on the table.',
  'such': 'She has never seen such a beautiful sunset.',
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
  'begin': 'The movie will begin soon.',
  'show': 'Can you show me the way?',
  'try': 'You should try your best.',
  'ask': 'Please ask if you have questions.',
  'feel': 'I feel happy today.',
  'turn': 'Please turn off the lights.',
  'start': 'The race will start at noon.',
  'might': 'We might go to the beach.',
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
  'must': 'You must study for the exam.',
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
  'read': 'I like to read before bed.',
  'spend': 'We spent the weekend at the beach.',
  'grow': 'Children grow quickly.',
  'open': 'The store opens at nine.',
  'walk': 'We walked to the store.',
  'win': 'Our team won the game.',
  'offer': 'They offered him a job.',
  'remember': 'I remember meeting her before.',
  'love': 'I love my family.',
  'consider': 'Please consider my offer.',
  'appear': 'The sun will appear soon.',
  'buy': 'She bought a new dress.',
  'wait': 'Please wait for me.',
  'serve': 'This restaurant serves good food.',
  'die': 'The plant will die without water.',
  'send': 'I will send you an email.',
  'expect': 'I expect you to be on time.',
  'build': 'They will build a new bridge.',
  'stay': 'Please stay at home.',
  'fall': 'Be careful not to fall.',
  'cut': 'Please cut the paper in half.',
  'reach': 'We will reach the top soon.',
  'kill': 'The cold can kill plants.',
  'remain': 'The door remained closed.',
  'suggest': 'Can you suggest a good restaurant?',
  'raise': 'She raised her hand to ask a question.',
  'pass': 'Please pass me the salt.',
  'sell': 'He wants to sell his car.',
  'require': 'This job requires experience.',
  'report': 'Please report to the office.',
  'decide': 'We need to decide now.',
  'pull': 'Please pull the door to open it.',
  'develop': 'The company will develop new products.',
  'eat': 'What time do you eat lunch?',
  'sleep': 'I need to sleep eight hours.',
  'run': 'He runs five kilometers every day.',
  'drive': 'She drives to work every day.',
  'happen': 'What happened at school today?',
  'feel': 'How do you feel today?',
  'provide': 'This company provides good service.',
  'carry': 'Can you carry this box for me?',
  'talk': 'We need to talk about this.',
  'hold': 'Please hold my hand.',
  'catch': 'She can catch the ball easily.',
  'choose': 'You can choose any color you like.',
  'draw': 'She likes to draw pictures.',
  'break': 'Be careful not to break the glass.',
  'fight': 'They fight for their rights.',
  'lie': 'Do not lie to your parents.',
  'hit': 'He hit the ball very hard.',
  'hurt': 'I hurt my knee playing soccer.',
  'lay': 'She laid the baby on the bed.',
  'pick': 'Please pick up the trash.',
  'rise': 'The sun rises in the east.',
  'seek': 'We must seek the truth.',
  'shake': 'Shake the bottle before use.',
  'shut': 'Please shut the window.',
  'fight': 'They fought for their rights.',
  'beat': 'He beat his opponent in chess.',
  'spread': 'She spread butter on the bread.',
  'burn': 'Be careful not to burn yourself.',
  'fall': 'The leaves fall in autumn.',
  'hit': 'The ball hit the window.',
  'cut': 'Please cut the cake.',
  'hurt': 'My head hurts.',
  'lie': 'He lay on the bed.',
  'set': 'She set the table for dinner.',
  'shut': 'Please shut the door.',
  'stick': 'The stamp will not stick.',
  'strike': 'The clock will strike twelve.',
  'tear': 'She tore the paper in half.',
  'throw': 'Please throw the ball to me.',
  'wake': 'I wake up at six every morning.',
  'wear': 'She wears glasses.',
  'feed': 'Please feed the cat.',
  'grow': 'Plants need sunlight to grow.',
  'hide': 'The children love to hide.',
  'lead': 'She will lead the expedition.',
  'meet': 'Nice to meet you.',
  'read': 'I read the newspaper every morning.',
  'ring': 'The doorbell is ringing.',
  'rise': 'The sun rises at six.',
  'set': 'The sun sets in the west.',
  'sing': 'She loves to sing songs.',
  'sink': 'The ship will sink.',
  'speak': 'She speaks English fluently.',
  'swim': 'We swim in the pool every summer.',
  'teach': 'She teaches mathematics.',
  'understand': 'I understand the problem now.',
  'bear': 'She bore three children.',
  'choose': 'Choose the best answer.',
  'freeze': 'Water freezes at zero degrees.',
  'give': 'Give me a chance.',
  'take': 'Take a deep breath.',
  'know': 'I know the answer.',
  'lose': 'I do not want to lose this game.',
  'grow': 'Children grow up quickly.',
  'throw': 'Throw the ball to me.',
  'draw': 'She draws beautiful pictures.',
  'drive': 'He drives carefully.',
  'know': 'She knows the answer.',
  'blow': 'The wind is blowing hard.',
  'fly': 'Birds can fly very high.',
  'grow': 'The baby is growing fast.',
  'know': 'I know the truth.',
  'throw': 'Please throw the ball to me.',
  'draw': 'He draws well.',
  'drive': 'She drives a red car.',
  'grow': 'Flowers grow in spring.',
  'blow': 'Blow out the candles.',
  'fly': 'Let us fly a kite.',
  'grow': 'The tree grows very tall.',
  'know': 'Do you know the answer?',
  'throw': 'Throw the ball to me.',
  'draw': 'She can draw very well.',
  'drive': 'He drives to work every day.',
  'grow': 'Plants grow toward the sun.',
  'blow': 'The wind will blow tomorrow.',
  'fly': 'She can fly an airplane.',
  'grow': 'The children are growing fast.',
};

// Clear examples for words that had wrong/mismatched ones
let fixed = 0;
let cleared = 0;
const updated = words.map(w => {
  // If we have a specific fix, use it
  if (exampleFixes[w.word]) {
    fixed++;
    return { ...w, examples: [exampleFixes[w.word]] };
  }
  
  // Check if example looks wrong:
  // 1. Contains archaic characters
  // 2. Contains words from different entries  
  const ex = String((w.examples || [])[0] || '');
  if (ex) {
    // Check for archaic/old English characters
    if (/[ſſ]/.test(ex) || /[«»]/.test(ex)) {
      cleared++;
      return { ...w, examples: [''] };
    }
    
    // Check for very short or meaningless examples
    if (ex.trim().length < 3) {
      cleared++;
      return { ...w, examples: [''] };
    }
    
    // Check for examples that are actually definitions (starting with "The" or "A" and not containing the word)
    if (ex.startsWith('For quotations') || ex.startsWith('See ')) {
      cleared++;
      return { ...w, examples: [''] };
    }
  }
  
  return w;
});

console.log(`\n📊 Results:`);
console.log(`  Fixed with correct examples: ${fixed}`);
console.log(`  Cleared bad examples: ${cleared}`);
console.log(`  Total words: ${updated.length}`);

// Verify
const samplesToCheck = ['be', 'are', 'were', 'they', 'so', 'his', 'has', 'you', 'me', 'do', 'does'];
console.log('\n--- Verification ---');
samplesToCheck.forEach(w => {
  const word = updated.find(x => x.word === w);
  if (word) {
    const ex = (word.examples || [])[0] || '';
    console.log(w.padEnd(10) + '| ' + ex.substring(0, 80));
  }
});

fs.writeFileSync(datasetPath, JSON.stringify(updated, null, 2), 'utf-8');
console.log(`\n✅ Saved to english_app_dataset.json`);
