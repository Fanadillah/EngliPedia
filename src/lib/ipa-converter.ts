/**
 * IPA Tokenizer & Indonesian Pronunciation Converter
 * 
 * Berdasarkan rules dari converterAlaIndonesia.md
 * Menggunakan tokenizer untuk handle multi-char phonemes dengan benar
 */

type PronunciationOptions = {
  uppercase?: boolean;
  preserveStress?: boolean;
};

// Multi-char phonemes harus diproses DULU sebelum single-char
const IPA_TOKENS: Record<string, string> = {
  // Affricates
  "tʃ": "ch",
  "dʒ": "j",

  // Digraphs / Special sounds
  "θ": "th",
  "ð": "dh",
  "ʃ": "sh",
  "ʒ": "zh",
  "ŋ": "ng",

  // Diphthongs
  "eɪ": "ey",
  "aɪ": "ai",
  "ɔɪ": "oi",
  "aʊ": "au",
  "oʊ": "ou",

  // Long vowels
  "iː": "ii",
  "uː": "uu",
  "ɑː": "aa",
  "ɔː": "oo",
  "ɜː": "er",

  // Short vowels
  "ɪ": "i",
  "ʊ": "u",
  "ɛ": "e",
  "ə": "e",
  "æ": "ae",
  "ʌ": "a",
  "ɒ": "o",

  // Consonants
  "b": "b",
  "d": "d",
  "f": "f",
  "ɡ": "g",
  "g": "g",
  "h": "h",
  "j": "y",
  "k": "k",
  "l": "l",
  "m": "m",
  "n": "n",
  "p": "p",
  "r": "r",
  "ɹ": "r",
  "ɾ": "r",
  "s": "s",
  "t": "t",
  "v": "v",
  "w": "w",
  "x": "ks",
  "y": "y",
  "z": "z",

  // R-colored vowels
  "ɚ": "er",
  "ɝ": "er",

  // Glottal stop
  "ʔ": "",
};

// Build sorted token list (longest first)
const SORTED_TOKENS = Object.keys(IPA_TOKENS).sort((a, b) => b.length - a.length);
const TOKEN_REGEX = new RegExp(SORTED_TOKENS.map(escapeRegex).join("|"), "g");

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Tokenize IPA string into phonemes
 */
function tokenizeIPA(ipa: string): string[] {
  const tokens: string[] = [];
  let match;
  TOKEN_REGEX.lastIndex = 0;

  while ((match = TOKEN_REGEX.exec(ipa)) !== null) {
    tokens.push(match[0]);
  }

  return tokens;
}

/**
 * Convert IPA to Indonesian pronunciation
 * 
 * "beautiful" → "BYUU-ti-fel"
 * "comfortable" → "KAM-fer-te-bel"
 * "environment" → "in-vai-ren-ment"
 */
export function ipaToIndonesian(
  ipa: string,
  options: PronunciationOptions = {}
): string {
  const { uppercase = true, preserveStress = false } = options;

  if (!ipa) return "";

  // Clean IPA string: remove / [ ] and extra symbols
  let cleaned = ipa
    .trim()
    .replace(/^[/\[]|[/\]]$/g, "")
    .replace(/[ˌ]/g, "")
    .replace(/[˥˦˧˨˩]/g, "");

  // Detect stress positions
  const stressPositions = new Set<number>();
  const stressRegex = /[ˈ']/g;
  let stressMatch;
  while ((stressMatch = stressRegex.exec(cleaned)) !== null) {
    stressPositions.add(stressMatch.index + 1);
  }

  // Remove stress markers
  cleaned = cleaned.replace(/[ˈ']/g, "");

  // Split by syllable boundaries (periods)
  const syllables = cleaned.split(/[.]/);

  // Convert each syllable
  const convertedSyllables = syllables.map((syl, sylIdx) => {
    const tokens = tokenizeIPA(syl);
    let converted = tokens.map(t => IPA_TOKENS[t] ?? t).join("");

    // Capitalize primary stress syllable
    if (sylIdx === 0 || stressPositions.has(getSyllableStartPos(syllables, sylIdx))) {
      converted = converted.toUpperCase();
    }

    return converted;
  });

  let result = convertedSyllables
    .filter(s => s.length > 0)
    .join("-");

  // Clean up
  result = result
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/\s+/g, "");

  return uppercase ? result.toUpperCase() : result;
}

/**
 * Calculate starting position of a syllable in original IPA
 */
function getSyllableStartPos(syllables: string[], index: number): number {
  let pos = 0;
  for (let i = 0; i < index; i++) {
    pos += syllables[i].length + 1; // +1 for the dot
  }
  return pos;
}

/**
 * Batch convert: returns word with cara_baca
 */
export function generateCaraBaca(word: string, ipa: string): string {
  if (!ipa) return "";
  return ipaToIndonesian(ipa, { uppercase: true, preserveStress: false });
}
