import { NextRequest, NextResponse } from "next/server";

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

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  name?: { simpleText?: string };
}

function segmentIntoSentences(segments: TranscriptSegment[]): Sentence[] {
  const sentences: Sentence[] = [];
  let currentWords: string[] = [];
  let currentStart = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const text = seg.text.trim();

    if (!text) continue;

    if (currentWords.length === 0) {
      currentStart = seg.start;
    }

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
        end: Math.min(
          seg.start + seg.duration + 0.3,
          nextSeg ? nextSeg.start : seg.start + seg.duration + 0.3
        ),
      });
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

  return sentences.filter((s) => s.text.split(/\s+/).length >= 2);
}

async function fetchViaInnerTube(videoId: string, lang: string): Promise<TranscriptSegment[] | null> {
  const resp = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: "ANDROID",
          clientVersion: "20.10.38",
        },
      },
      videoId,
    }),
  });

  if (!resp.ok) return null;

  const data = await resp.json();
  const tracks: CaptionTrack[] = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!Array.isArray(tracks) || tracks.length === 0) return null;

  const track = lang
    ? tracks.find((t) => t.languageCode === lang) ?? tracks[0]
    : tracks[0];

  if (!track?.baseUrl) return null;

  const xmlResp = await fetch(track.baseUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!xmlResp.ok) return null;

  const xml = await xmlResp.text();
  return parseTranscriptXml(xml);
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

function parseTranscriptXml(xml: string): TranscriptSegment[] {
  const results: TranscriptSegment[] = [];

  // Try srv3 format: <p t="ms" d="ms"><s>word</s>...</p>
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
    while ((sMatch = sRegex.exec(inner)) !== null) {
      text += sMatch[1];
    }
    if (!text) {
      text = inner.replace(/<[^>]+>/g, "");
    }

    text = text.trim();
    if (text) {
      results.push({
        text: decodeEntities(text),
        start: startMs / 1000,
        duration: durMs / 1000,
      });
    }
  }

  if (hasSrv3) return results;

  // Fall back to classic format: <text start="s" dur="s">content</text>
  const classicRegex = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
  while ((match = classicRegex.exec(xml)) !== null) {
    const text = match[3].trim();
    if (text) {
      results.push({
        text: decodeEntities(text),
        start: parseFloat(match[1]),
        duration: parseFloat(match[2]),
      });
    }
  }

  return results;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const lang = searchParams.get("lang") || "en";

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  try {
    let segments = await fetchViaInnerTube(videoId, lang);

    if (!segments || segments.length === 0) {
      return NextResponse.json({ error: "No subtitles available for this video" }, { status: 400 });
    }

    const sentences = segmentIntoSentences(segments);

    return NextResponse.json({ sentences, segments });
  } catch (error: any) {
    const message = error?.message || "Failed to fetch transcript";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
