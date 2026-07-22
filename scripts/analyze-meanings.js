const fs = require('fs');
const words = JSON.parse(fs.readFileSync('../english_app_dataset.json', 'utf8'));

const indoKeywords = ['untuk', 'dari', 'dalam', 'dengan', 'adalah', 'yang', 'pada', 'ke', 'di', 'dan', 'atau', 'ini', 'itu', 'sebuah', 'bagian', 'jenis', 'cara', 'hal', 'sesuatu', 'menjadi', 'tidak', 'lebih', 'sangat', 'telah', 'sudah', 'akan', 'dapat', 'bisa', 'hanya', 'juga', 'lain', 'oleh', 'karena', 'ketika', 'sebagai', 'antara', 'serta', 'maka', 'namun', 'tetapi', 'jika', 'bahwa', 'seperti', 'berupa', 'terjadi', 'memiliki', 'merupakan', 'tersebut'];

const categories = {
  empty: [],
  tooShort: [],
  englishLooking: [],
  nameLike: [],
  interjectionLike: [],
};

words.forEach(w => {
  const m = (w.meaning_id || '').trim();

  if (!m) {
    categories.empty.push(w.word);
    return;
  }

  if (m.length < 3) {
    categories.tooShort.push({ word: w.word, meaning: m });
    return;
  }

  // Check if meaning is mostly English
  const wordsArr = m.split(/\s+/);
  const englishWordCount = wordsArr.filter(word => /^[a-z]{3,}$/i.test(word) && !indoKeywords.includes(word.toLowerCase())).length;
  const ratio = englishWordCount / wordsArr.length;

  if (ratio > 0.6 && wordsArr.length > 2) {
    categories.englishLooking.push({ word: w.word, meaning: m.substring(0, 80) });
  }

  // Name patterns
  if (m.includes('Nama keluarga') || m.includes('Nama pemberian') || m.includes('Nama perempuan') || m.includes('Bentuk kecil dari nama')) {
    categories.nameLike.push({ word: w.word, meaning: m.substring(0, 80) });
  }

  // Interjection-like
  if (m.includes('Suara') || m.includes('kata seru') || m.includes('Seruan')) {
    categories.interjectionLike.push({ word: w.word, meaning: m.substring(0, 80) });
  }
});

console.log('=== RINGKASAN ===');
console.log('Total kata:', words.length);
console.log('Kosong:', categories.empty.length);
console.log('Terlalu pendek (<3):', categories.tooShort.length);
console.log('Arti bahasa Inggris:', categories.englishLooking.length);
console.log('Nama orang:', categories.nameLike.length);
console.log('Interjeksi:', categories.interjectionLike.length);

console.log('\n=== KATA KOSONG ===');
categories.empty.forEach(w => console.log('  ' + w));

console.log('\n=== ARTI TERLALU PENDEK ===');
categories.tooShort.forEach(w => console.log('  ' + w.word + ' -> ' + w.meaning));

console.log('\n=== ARTI BAHASA INGRIS (230) ===');
categories.englishLooking.forEach(w => console.log('  ' + w.word + ' -> ' + w.meaning));

console.log('\n=== NAMA ORANG (' + categories.nameLike.length + ') ===');
categories.nameLike.forEach(w => console.log('  ' + w.word + ' -> ' + w.meaning));

console.log('\n=== INTERJEKSI (' + categories.interjectionLike.length + ') ===');
categories.interjectionLike.forEach(w => console.log('  ' + w.word + ' -> ' + w.meaning));
