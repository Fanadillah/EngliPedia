import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const NOISE_PATTERNS = [
  /♪+/g, /♫+/g,
  /\[Music\]/gi, /\[Applause\]/gi, /\[Laughter\]/gi, /\[Cheers\]/gi,
  /\[Screaming\]/gi,
];

const FILLER_WORDS = new Set([
  "wow","hey","huh","oh","ah","aw","aww","phew","ooh","aha","uh-huh","mm-hmm",
]);

const NON_SPEECH = new Set([
  "aaahh","aaahhh","aaahhhh","aaaahhhh","aaaahhh","aaaahh","aah",
  "ahh","ahhh","ahhhh","ohh","ohhh","oww","owww","gah",
  "ugh","uhh","uhhh","hmm","hmmm","whoa","woah",
  "yikes","eek","brr","shh","psst","d'oh","uh","grr","argh",
]);

function isFiller(w) {
  return FILLER_WORDS.has(w.toLowerCase().replace(/[^a-z]/g, ""));
}

function isScreamOrGrunt(w) {
  const clean = w.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean || clean.length <= 1) return false;
  if (NON_SPEECH.has(clean)) return true;
  const vowels = (clean.match(/[aeiou]/gi) || []).length;
  const cons = clean.length - vowels;
  if (cons > 0 && vowels === 0 && clean.length > 2) return true;
  if (/^(.)\1{3,}$/.test(clean)) return true;
  return false;
}

function cleanText(text) {
  let t = text;
  for (const p of NOISE_PATTERNS) t = t.replace(p, " ");
  t = t.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  return t;
}

function removeCharacterNames(text) {
  const namePattern = /^(?:[A-Z][A-Z .'’]+(?:\([^)]*\))?:\s*)/;
  let remaining = text;
  let found;
  while ((found = remaining.match(namePattern))) {
    remaining = remaining.slice(found[0].length).trimStart();
  }
  return remaining;
}

function decodeEntities(text) {
  return text
    .replace(/&#39;/g, "'").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

function removeFillers(text) {
  const words = text.split(/\s+/);
  const filtered = [];
  for (const w of words) {
    const clean = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (isFiller(clean) || isScreamOrGrunt(clean)) continue;
    filtered.push(w);
  }
  if (filtered.length < 2) return "";
  return filtered.join(" ");
}

function isLineWorthKeeping(text) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 2) return false;
  const nonContent = words.filter((w) => {
    const c = w.toLowerCase().replace(/[^a-z]/g, "");
    return isFiller(c) || isScreamOrGrunt(c);
  }).length;
  return nonContent / words.length <= 0.5;
}

function hasPunctuation(text) {
  return /[.!?]/.test(text);
}

function capitalize(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function splitWithPunctuation(text, maxWords = 14) {
  const sentenceEnd = /(?<=[.!?])\s+/g;
  let parts = text.split(sentenceEnd).filter(Boolean).map((s) => s.trim());

  const result = [];
  for (const part of parts) {
    const words = part.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) {
      result.push(part);
    } else {
      const mid = Math.ceil(words.length / 2);
      result.push(words.slice(0, mid).join(" "));
      result.push(words.slice(mid).join(" "));
    }
  }
  return result;
}

function splitWithoutPunctuation(text, maxWords = 10) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return [text];

  const result = [];
  for (let i = 0; i < words.length; i += maxWords) {
    const chunk = words.slice(i, i + maxWords);
    if (chunk.length >= 2) result.push(chunk.join(" "));
  }
  return result;
}

function processSentences(sentences) {
  const result = [];
  for (const sent of sentences) {
    let text = cleanText(sent.text);
    if (!text) continue;
    text = removeCharacterNames(text);
    text = decodeEntities(text);
    text = text.replace(/\s+/g, " ").trim();
    if (!text) continue;
    text = removeFillers(text);
    if (!text) continue;

    const subs = hasPunctuation(text)
      ? splitWithPunctuation(text)
      : splitWithoutPunctuation(text);

    for (const sub of subs) {
      if (!isLineWorthKeeping(sub)) continue;
      const s = capitalize(sub);
      result.push({ text: s, start: sent.start, end: sent.end });
    }
  }
  return result;
}

function processSegments(segments) {
  const result = [];
  for (const seg of segments) {
    let text = cleanText(seg.text);
    if (!text) continue;
    text = removeCharacterNames(text);
    text = decodeEntities(text);
    text = text.replace(/\s+/g, " ").trim();
    if (!text) continue;
    text = removeFillers(text);
    if (!text) continue;
    if (!isLineWorthKeeping(text)) continue;
    result.push({ ...seg, text });
  }
  return result;
}

function main() {
  const dir = join(__dirname, "..", "public", "transcripts");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const filePath = join(dir, file);
    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    const origSent = data.sentences.length;
    const origSeg = data.segments.length;
    data.segments = processSegments(data.segments);
    data.sentences = processSentences(data.sentences);
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`${file}: ${origSent}->${data.sentences.length} sentences, ${origSeg}->${data.segments.length} segments`);
  }
}

main();
