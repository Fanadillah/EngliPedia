import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface Sentence {
  text: string;
  start: number;
  end: number;
}

/**
 * Segment raw transcript segments into proper sentences.
 * Rules:
 * - Max 8 words per sentence (user-friendly typing chunks)
 * - Break on punctuation (.!?)
 * - Break on long gaps (>1.5s)
 * - Filter out 1-word sentences
 * - Fix ellipsis-connected words: "meet...Forky!" → "meet... Forky!"
 */
function segmentIntoSentences(segments: TranscriptSegment[]): Sentence[] {
  const sentences: Sentence[] = [];
  let currentWords: string[] = [];
  let currentStart = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    let text = seg.text.trim();
    if (!text) continue;

    // Fix ellipsis-connected words: "meet...Forky" → "meet... Forky"
    text = text.replace(/([a-zA-Z])\.{3,}([a-zA-Z])/g, '$1... $2');
    // Fix word!word → word! word
    text = text.replace(/([a-zA-Z])[!?]+([a-zA-Z])/g, '$1$2 $3');

    if (currentWords.length === 0) currentStart = seg.start;
    currentWords.push(text);

    const lastChar = text[text.length - 1];
    const isEndOfSentence = ".!?".includes(lastChar);
    const nextSeg = segments[i + 1];
    const gap = nextSeg ? nextSeg.start - (seg.start + seg.duration) : 0;
    const hasLongGap = gap > 1.5;

    // Force break at 8 words max
    const wordCount = currentWords.join(" ").split(/\s+/).length;
    const forcedBreak = wordCount >= 8;

    if (isEndOfSentence || hasLongGap || forcedBreak) {
      const fullText = currentWords.join(" ");
      const end = Math.min(
        seg.start + seg.duration + 0.3,
        nextSeg ? nextSeg.start : seg.start + seg.duration + 0.3
      );
      sentences.push({ text: fullText, start: currentStart, end });
      currentWords = [];
    }
  }

  if (currentWords.length > 0) {
    const lastSeg = segments[segments.length - 1];
    sentences.push({
      text: currentWords.join(" "),
      start: currentStart,
      end: lastSeg.start + lastSeg.duration + 0.3,
    });
  }

  // Remove 1-word sentences (too short to type)
  return sentences.filter((s) => s.text.split(/\s+/).length >= 2);
}

async function fetchLiveTranscript(videoId: string, lang: string): Promise<TranscriptSegment[] | null> {
  try {
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
    if (!resp.ok) return null;
    const data = await resp.json();
    const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!Array.isArray(tracks) || tracks.length === 0) return null;
    const track = lang ? tracks.find((t: any) => t.languageCode === lang) ?? tracks[0] : tracks[0];
    if (!track?.baseUrl) return null;
    const xmlResp = await fetch(track.baseUrl, {
      headers: { "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)" },
    });
    if (!xmlResp.ok) return null;
    const xml = await xmlResp.text();

    const segments: TranscriptSegment[] = [];
    const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
    let match: RegExpExecArray | null;
    let hasSrv3 = false;
    while ((match = pRegex.exec(xml)) !== null) {
      hasSrv3 = true;
      const startMs = parseInt(match[1], 10);
      const durMs = parseInt(match[2], 10);
      const inner = match[3];
      let text = "";
      const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
      let sMatch: RegExpExecArray | null;
      while ((sMatch = sRegex.exec(inner)) !== null) text += sMatch[1];
      if (!text) text = inner.replace(/<[^>]+>/g, "");
      text = text.trim();
      if (text) segments.push({ text, start: startMs / 1000, duration: durMs / 1000 });
    }
    if (!hasSrv3) {
      const classicRegex = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
      while ((match = classicRegex.exec(xml)) !== null) {
        const text = match[3].trim();
        if (text) segments.push({ text, start: parseFloat(match[1]), duration: parseFloat(match[2]) });
      }
    }
    return segments.length > 0 ? segments : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const lang = searchParams.get("lang") || "en";
  if (!videoId) return NextResponse.json({ error: "Missing videoId" }, { status: 400 });

  // Try static cached file first
  const filePath = join(process.cwd(), "public", "transcripts", `${videoId}.json`);
  if (existsSync(filePath)) {
    try {
      const cached = JSON.parse(readFileSync(filePath, "utf-8"));
      const sentences = cached.sentences || segmentIntoSentences(cached.segments);
      return NextResponse.json({ sentences, segments: cached.segments });
    } catch {
      // fall through to live fetch
    }
  }

  // Fallback: try live InnerTube API
  const segments = await fetchLiveTranscript(videoId, lang);
  if (!segments || segments.length === 0) {
    return NextResponse.json({ error: "No subtitles available for this video" }, { status: 400 });
  }

  const sentences = segmentIntoSentences(segments);
  return NextResponse.json({ sentences, segments });
}
