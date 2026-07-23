import { NextRequest, NextResponse } from "next/server";
import { fetchTranscript } from "youtube-transcript";

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
        end: seg.start + seg.duration,
      });
      currentWords = [];
    }
  }

  if (currentWords.length > 0) {
    const lastSeg = segments[segments.length - 1];
    sentences.push({
      text: currentWords.join(" "),
      start: currentStart,
      end: lastSeg.start + lastSeg.duration,
    });
  }

  return sentences.filter((s) => s.text.split(/\s+/).length >= 2);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const lang = searchParams.get("lang") || "en";

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  try {
    const raw = await fetchTranscript(videoId, { lang });
    const segments: TranscriptSegment[] = (raw as any[]).map((s) => ({
      text: s.text,
      start: s.offset ?? s.seconds ?? s.start ?? 0,
      duration: s.duration ?? 0,
    }));

    const sentences = segmentIntoSentences(segments);

    return NextResponse.json({ sentences, segments });
  } catch (error: any) {
    const message = error?.message || "Failed to fetch transcript";
    if (message.includes("disabled")) {
      return NextResponse.json({ error: "Subtitles disabled for this video" }, { status: 400 });
    }
    if (message.includes("not available")) {
      return NextResponse.json({ error: "No subtitles available" }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
