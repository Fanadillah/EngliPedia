import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const VIDEOS = [
  "wmiIUN-7qhE",
  "SkcucKDrbOI",
  "ep-ieEG06qg",
  "2RB3edZyeYw",
  "6hB3S9bIaco",
  "TcMBFSGVi1c",
];

async function fetchTranscript(videoId, lang = "en") {
  const resp = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
    },
    body: JSON.stringify({
      context: { client: { clientName: "ANDROID", clientVersion: "20.10.38", hl: "en", gl: "US" } },
      videoId,
    }),
  });

  if (!resp.ok) {
    console.log(`  ✗ InnerTube returned ${resp.status} for ${videoId}`);
    return null;
  }

  const data = await resp.json();
  const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!Array.isArray(tracks) || tracks.length === 0) {
    console.log(`  ✗ No caption tracks for ${videoId}`);
    return null;
  }

  const track = lang
    ? tracks.find((t) => t.languageCode === lang) ?? tracks[0]
    : tracks[0];

  if (!track?.baseUrl) {
    console.log(`  ✗ No baseUrl for ${videoId}`);
    return null;
  }

  const xmlResp = await fetch(track.baseUrl, {
    headers: { "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)" },
  });

  if (!xmlResp.ok) {
    console.log(`  ✗ Failed to fetch XML for ${videoId}: ${xmlResp.status}`);
    return null;
  }

  const xml = await xmlResp.text();

  // parse transcript XML
  const segments = [];
  const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let match;
  let hasSrv3 = false;
  while ((match = pRegex.exec(xml)) !== null) {
    hasSrv3 = true;
    const startMs = parseInt(match[1], 10);
    const durMs = parseInt(match[2], 10);
    const inner = match[3];
    let text = "";
    const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
    let sMatch;
    while ((sMatch = sRegex.exec(inner)) !== null) text += sMatch[1];
    if (!text) text = inner.replace(/<[^>]+>/g, "");
    text = text.trim();
    if (text) {
      segments.push({ text, start: startMs / 1000, duration: durMs / 1000 });
    }
  }

  if (!hasSrv3) {
    const classicRegex = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
    while ((match = classicRegex.exec(xml)) !== null) {
      const text = match[3].trim();
      if (text) segments.push({ text, start: parseFloat(match[1]), duration: parseFloat(match[2]) });
    }
  }

  return segments;
}

function segmentIntoSentences(segments) {
  const sentences = [];
  let currentWords = [];
  let currentStart = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const text = seg.text.trim();
    if (!text) continue;
    if (currentWords.length === 0) currentStart = seg.start;
    currentWords.push(text);
    const lastChar = text[text.length - 1];
    const isEndOfSentence = ".!?".includes(lastChar);
    const nextSeg = segments[i + 1];
    const gap = nextSeg ? nextSeg.start - (seg.start + seg.duration) : 0;
    const hasLongGap = gap > 1.5;

    if (isEndOfSentence || hasLongGap) {
      const fullText = currentWords.join(" ");
      sentences.push({
        text: fullText,
        start: currentStart,
        end: Math.min(seg.start + seg.duration + 0.3, nextSeg ? nextSeg.start : seg.start + seg.duration + 0.3),
      });
      currentWords = [];
    }
  }

  if (currentWords.length > 0) {
    const lastSeg = segments[segments.length - 1];
    sentences.push({ text: currentWords.join(" "), start: currentStart, end: lastSeg.start + lastSeg.duration + 0.3 });
  }

  return sentences.filter((s) => s.text.split(/\s+/).length >= 2);
}

async function main() {
  const outDir = join(__dirname, "..", "public", "transcripts");
  mkdirSync(outDir, { recursive: true });

  for (const videoId of VIDEOS) {
    console.log(`Fetching ${videoId}...`);
    const segments = await fetchTranscript(videoId);
    if (segments && segments.length > 0) {
      const sentences = segmentIntoSentences(segments);
      const data = { videoId, sentences, segments };
      writeFileSync(join(outDir, `${videoId}.json`), JSON.stringify(data, null, 2));
      console.log(`  ✓ Saved ${sentences.length} sentences, ${segments.length} segments`);
    } else {
      console.log(`  ✗ Failed to fetch transcript for ${videoId}`);
    }
  }
}

main().catch(console.error);
