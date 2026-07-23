"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  RotateCcw,
  Volume2,
  ChevronRight,
  Check,
  X,
  Trophy,
  Film,
  Headphones,
  SkipForward,
} from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { awardXp } from "@/lib/gamification";

// ─── Pre-configured Videos ──────────────────────────────────────────────

interface VideoMeta {
  id: string;
  title: string;
  thumbnail: string;
  level: string;
  source: string;
}

const VIDEOS: VideoMeta[] = [
  {
    id: "wmiIUN-7qhE",
    title: "Toy Story 4 - Trailer",
    thumbnail: "",
    level: "Basic",
    source: "Pixar / Disney",
  },
  {
    id: "SkcucKDrbOI",
    title: "How to Train Your Dragon 3 - Trailer",
    thumbnail: "",
    level: "Basic",
    source: "DreamWorks",
  },
  {
    id: "ep-ieEG06qg",
    title: "The Pursuit of Happyness - First Impression",
    thumbnail: "",
    level: "Intermediate",
    source: "Columbia Pictures",
  },
  {
    id: "2RB3edZyeYw",
    title: "The Social Network - Trailer",
    thumbnail: "",
    level: "Intermediate",
    source: "Sony Pictures",
  },
  {
    id: "6hB3S9bIaco",
    title: "The Shawshank Redemption - Trailer",
    thumbnail: "",
    level: "Intermediate",
    source: "Castle Rock",
  },
  {
    id: "TcMBFSGVi1c",
    title: "Avengers: Endgame - I Am Iron Man",
    thumbnail: "",
    level: "Advanced",
    source: "Marvel Studios",
  },
];

// ─── Types ──────────────────────────────────────────────────────────────

interface Sentence {
  text: string;
  start: number;
  end: number;
}

interface WordStatus {
  word: string;
  typed: string;
  status: "correct" | "close" | "wrong" | "pending";
}

interface SentenceResult {
  sentence: Sentence;
  accuracy: number;
  correctWords: number;
  totalWords: number;
  isSkipped: boolean;
  attempts: number;
}

type Phase = "select" | "loading" | "active" | "result";

// ─── Helpers ────────────────────────────────────────────────────────────

function normalizeWord(w: string): string {
  return w.toLowerCase().replace(/[^a-zA-Z0-9']/g, "");
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function compareWords(input: string, expected: string): WordStatus[] {
  const inputWords = input.trim().split(/\s+/).filter(Boolean);
  const expectedWords = expected.trim().split(/\s+/).filter(Boolean);

  return expectedWords.map((word, i) => {
    const typed = inputWords[i] || "";
    if (!typed) return { word, typed: "", status: "pending" };

    const normTyped = normalizeWord(typed);
    const normExpected = normalizeWord(word);

    if (normTyped === normExpected) {
      return { word, typed, status: "correct" };
    }
    if (levenshtein(normTyped, normExpected) <= 2) {
      return { word, typed, status: "close" };
    }
    return { word, typed, status: "wrong" };
  });
}

// ─── YouTube Player Hook ────────────────────────────────────────────────

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | null;
  }
}

function useYouTubePlayer(videoId: string, onReady?: () => void) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(-1);

  useEffect(() => {
    if (!videoId || !containerRef.current) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(tag, firstScript);

    const onAPIReady = () => {
      if (playerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        height: "100%",
        width: "100%",
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: () => {
            setReady(true);
            onReady?.();
          },
          onStateChange: (event: any) => {
            stateRef.current = event.data;
          },
        },
      });
    };

    if (window.YT?.Player) {
      onAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onAPIReady;
    }

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, [videoId, onReady]);

  const seekTo = useCallback((time: number) => {
    playerRef.current?.seekTo(time, true);
  }, []);

  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const getCurrentTime = useCallback((): number => {
    return playerRef.current?.getCurrentTime() ?? 0;
  }, []);

  return { playerRef, containerRef, ready, seekTo, play, pause, getCurrentTime, stateRef };
}

// ─── Main Component ─────────────────────────────────────────────────────

export default function VideoLearningPage() {
  const { showToast } = useToast();

  // Phase
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedVideo, setSelectedVideo] = useState<VideoMeta | null>(null);

  // Transcript
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Session
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SentenceResult[]>([]);
  const [userInput, setUserInput] = useState("");
  const [wordStatuses, setWordStatuses] = useState<WordStatus[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [sessionStats, setSessionStats] = useState<{
    totalSentences: number;
    completed: number;
    skipped: number;
    avgAccuracy: number;
    totalCorrect: number;
    totalWords: number;
    xpEarned: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSentence = sentences[currentIndex];

  // YouTube player
  const handlePlayerReady = useCallback(() => {
    // auto-start when ready
  }, []);

  const { containerRef, ready: playerReady, seekTo, play, pause, getCurrentTime } = useYouTubePlayer(
    selectedVideo?.id || "",
    handlePlayerReady
  );

  // ── Load Transcript ─────────────────────────────────────────────────

  const loadTranscript = async (videoId: string) => {
    setPhase("loading");
    setLoadingError(null);
    try {
      const res = await fetch(`/api/youtube-transcript?videoId=${videoId}&lang=en`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load transcript");
      if (!data.sentences || data.sentences.length === 0) {
        throw new Error("No sentences found in transcript");
      }
      setSentences(data.sentences);
      setPhase("active");
    } catch (err: any) {
      setLoadingError(err.message);
      setPhase("select");
      showToast({ type: "error", message: `Gagal muat subtitle: ${err.message}` });
    }
  };

  // ── Select Video ────────────────────────────────────────────────────

  const handleSelectVideo = (video: VideoMeta) => {
    setSelectedVideo(video);
    setCurrentIndex(0);
    setResults([]);
    setUserInput("");
    setWordStatuses([]);
    setAttempts(0);
    setSubmitted(false);
    setSessionStarted(false);
    setSessionStats(null);
    loadTranscript(video.id);
  };

  // ── Play Sentence Segment ───────────────────────────────────────────

  const stopPlayback = useCallback(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
    pause();
    setIsPlaying(false);
    inputRef.current?.focus();
  }, [pause]);

  const playSegment = useCallback((start: number, end: number) => {
    if (!playerReady) return;
    seekTo(start);
    play();
    setIsPlaying(true);

    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);

    const duration = end - start;
    playTimeoutRef.current = setTimeout(() => {
      stopPlayback();
    }, (duration + 2) * 1000);

    playIntervalRef.current = setInterval(() => {
      const currentTime = getCurrentTime();
      if (currentTime >= end) {
        stopPlayback();
      }
    }, 200);
  }, [playerReady, seekTo, play, getCurrentTime, stopPlayback]);

  // ── Start Session ───────────────────────────────────────────────────

  const startSession = () => {
    setSessionStarted(true);
    setCurrentIndex(0);
    setResults([]);
    setUserInput("");
    setWordStatuses([]);
    setAttempts(0);
    setSubmitted(false);

    // Small delay to let player seek
    setTimeout(() => {
      const s = sentences[0];
      if (s) playSegment(s.start, s.end);
    }, 500);
  };

  // Re-play current sentence
  const replaySentence = () => {
    if (!currentSentence) return;
    setUserInput("");
    setWordStatuses([]);
    setSubmitted(false);
    setAttempts((p) => p + 1);
    // Remove previous result for this sentence to prevent score inflation
    setResults((prev) => prev.filter((r) => r.sentence.start !== currentSentence.start));
    playSegment(currentSentence.start, currentSentence.end);
  };

  // ── Compare as User Types ───────────────────────────────────────────

  useEffect(() => {
    if (!currentSentence || submitted) return;
    const statuses = compareWords(userInput, currentSentence.text);
    setWordStatuses(statuses);
  }, [userInput, currentSentence, submitted]);

  // ── Submit ──────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!currentSentence || submitted) return;

    const statuses = compareWords(userInput, currentSentence.text);
    setWordStatuses(statuses);
    setSubmitted(true);

    const correctCount = statuses.filter((s) => s.status === "correct").length;
    const totalWords = statuses.length;
    const accuracy = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;

    const result: SentenceResult = {
      sentence: currentSentence,
      accuracy,
      correctWords: correctCount,
      totalWords,
      isSkipped: false,
      attempts: attempts + 1,
    };

    const newResults = [...results, result];
    setResults(newResults);

    // Award XP if accuracy >= 80%
    if (accuracy >= 80) {
      awardXp("learn_flashcard");
    }
  };

  // ── Next Sentence ───────────────────────────────────────────────────

  const goNext = () => {
    if (currentIndex >= sentences.length - 1) {
      finishSession();
      return;
    }
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setUserInput("");
    setWordStatuses([]);
    setSubmitted(false);
    setAttempts(0);

    const next = sentences[nextIdx];
    setTimeout(() => playSegment(next.start, next.end), 300);
  };

  // ── Skip Sentence ───────────────────────────────────────────────────

  const skipSentence = () => {
    if (!currentSentence || submitted) return;

    const totalWords = currentSentence.text.split(/\s+/).length;
    const result: SentenceResult = {
      sentence: currentSentence,
      accuracy: 0,
      correctWords: 0,
      totalWords,
      isSkipped: true,
      attempts: attempts + 1,
    };

    const updatedResults = [...results, result];
    setResults(updatedResults);
    setSubmitted(true);

    setTimeout(() => {
      if (currentIndex >= sentences.length - 1) {
        finishSessionWith(updatedResults);
      } else {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setUserInput("");
        setWordStatuses([]);
        setSubmitted(false);
        setAttempts(0);
        setTimeout(() => playSegment(sentences[nextIdx].start, sentences[nextIdx].end), 300);
      }
    }, 800);
  };

  // ── Finish Session ──────────────────────────────────────────────────

  const finishSessionWith = (finalResults: SentenceResult[]) => {
    stopPlayback();

    const totalSentences = sentences.length;
    const completed = finalResults.filter((r) => !r.isSkipped).length;
    const skipped = finalResults.filter((r) => r.isSkipped).length;
    const totalCorrect = finalResults.reduce((sum, r) => sum + r.correctWords, 0);
    const totalWords = finalResults.reduce((sum, r) => sum + r.totalWords, 0);
    const avgAccuracy = totalWords > 0 ? Math.round((totalCorrect / totalWords) * 100) : 0;

    awardXp("complete_session");

    setSessionStats({
      totalSentences,
      completed,
      skipped,
      avgAccuracy,
      totalCorrect,
      totalWords,
      xpEarned: 30 + Math.floor(avgAccuracy / 20) * 5,
    });
    setPhase("result");
  };

  const finishSession = () => {
    finishSessionWith(results);
  };

  // ── Listen for Enter key ────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !submitted) {
      handleSubmit();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  // ── Loading Skeleton ────────────────────────────────────────────────

  const renderLoading = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-muted animate-pulse mx-auto" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Memuat subtitle...
        </p>
      </div>
    </div>
  );

  // ── Video Selection ─────────────────────────────────────────────────

  const renderSelect = () => (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Belajar dari Video</h1>
            <p className="text-sm text-muted-foreground">
              Dengarkan subtitle YouTube dan ketik ulang kalimatnya
            </p>
          </div>
        </div>

        {loadingError && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl px-4 py-3">
            <p className="text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              {loadingError}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Pilih Video
          </p>
          {VIDEOS.map((video) => (
            <motion.button
              key={video.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelectVideo(video)}
              className="w-full text-left bg-card rounded-2xl border border-border p-4 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-14 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0 relative overflow-hidden">
                  <Film className="w-6 h-6 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-card-foreground truncate">
                    {video.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {video.source}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-gradient-to-r from-primary to-secondary">
                    {video.level}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Active Learning ─────────────────────────────────────────────────

  const renderActive = () => {
    if (!sessionStarted) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center px-4">
          <div className="text-center max-w-sm space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto">
              <Headphones className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold">{sentences.length} Kalimat</h2>
            <p className="text-sm text-muted-foreground">
              Kamu akan mendengar {sentences.length} kalimat dari video ini. 
              Setelah setiap kalimat, ketik ulang apa yang kamu dengar.
            </p>
            <ul className="text-xs text-muted-foreground space-y-2 text-left">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Video akan otomatis berhenti setiap kalimat
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Ketik ulang kalimat yang kamu dengar
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Kata yang benar akan otomatis terdeteksi
              </li>
            </ul>
            <button
              onClick={startSession}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-base hover:opacity-90 transition-opacity shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Mulai Belajar
            </button>
          </div>
        </div>
      );
    }

    const progress = ((currentIndex + 1) / sentences.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
          {/* Progress */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              {currentIndex + 1} / {sentences.length} kalimat
            </span>
            <span className="text-xs text-muted-foreground">
              ✅ {results.filter((r) => r.accuracy >= 80).length} tepat
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* YouTube Player */}
          <div className="rounded-2xl overflow-hidden border border-border shadow-md bg-black aspect-video relative">
            <div ref={containerRef} className="w-full h-full" />
            {isPlaying && (
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/60 text-white text-[10px] flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                Playing
              </div>
            )}
          </div>

          {/* Subtitle */}
          {showSubtitle && submitted && currentSentence && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-3 text-center"
            >
              <p className="text-xs text-muted-foreground mb-1">Subtitle:</p>
              <p className="text-sm font-medium text-card-foreground">
                {currentSentence.text}
              </p>
            </motion.div>
          )}

          {/* Typing input */}
          <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ketik ulang yang kamu dengar:
              </p>
              <button
                onClick={() => setShowSubtitle((s) => !s)}
                className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
              >
                {showSubtitle ? "Sembunyikan" : "Tampilkan"} subtitle
              </button>
            </div>

            {/* Word status display */}
            {wordStatuses.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-3 bg-muted/50 rounded-xl min-h-[40px]">
                {wordStatuses.map((ws, i) => (
                  <span
                    key={i}
                    className={`px-1.5 py-0.5 rounded text-sm font-medium transition-colors ${
                      ws.status === "correct"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        : ws.status === "close"
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                        : ws.status === "wrong"
                        ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {ws.typed || ws.word}
                  </span>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={submitted}
                placeholder="Ketik di sini..."
                className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-sm focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:bg-card transition-all outline-none disabled:opacity-50"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {!submitted && userInput.trim() && (
                <button
                  onClick={() => setUserInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {submitted ? (
                <>
                  {currentIndex < sentences.length - 1 ? (
                    <button
                      onClick={goNext}
                      className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
                    >
                      Selanjutnya
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={finishSession}
                      className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
                    >
                      Lihat Hasil
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleSubmit}
                    disabled={!userInput.trim()}
                    className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Cek Jawaban
                  </button>
                  <button
                    onClick={replaySentence}
                    className="py-3 px-4 rounded-xl bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    title="Putar ulang"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={skipSentence}
                    className="py-3 px-4 rounded-xl bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    title="Lewati"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Feedback */}
            {submitted && currentSentence && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-3 text-center ${
                  wordStatuses.filter((w) => w.status === "correct").length /
                    wordStatuses.length >=
                  0.8
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30"
                    : "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    wordStatuses.filter((w) => w.status === "correct").length /
                      wordStatuses.length >=
                    0.8
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {wordStatuses.filter((w) => w.status === "correct").length} /{" "}
                  {wordStatuses.length} kata benar
                  {wordStatuses.filter((w) => w.status === "correct").length /
                    wordStatuses.length >=
                    0.8 && " ✅"}
                </p>
              </motion.div>
            )}
          </div>

          {/* Bottom padding */}
          <div className="h-8" />
        </div>
      </div>
    );
  };

  // ── Result Screen ───────────────────────────────────────────────────

  const renderResult = () => {
    if (!sessionStats) return null;
    const isGood = sessionStats.avgAccuracy >= 70;

    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-md mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-3xl border border-border p-6 space-y-5"
          >
            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto mb-3 shadow-sm ${
                  isGood
                    ? "from-amber-400 to-orange-500"
                    : "from-blue-400 to-indigo-500"
                }`}
              >
                {isGood ? (
                  <Trophy className="w-8 h-8 text-white" />
                ) : (
                  <Headphones className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-xl font-bold">
                {isGood ? "Bagus! 🎉" : "Terus belajar! 💪"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedVideo?.title}
              </p>
            </div>

            {/* Score ring */}
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="currentColor"
                    className="text-muted"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="currentColor"
                    className={isGood ? "text-amber-500" : "text-primary"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="0 264"
                    initial={{ strokeDasharray: "0 264" }}
                    animate={{
                      strokeDasharray: `${sessionStats.avgAccuracy * 2.64} 264`,
                    }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">
                    {sessionStats.avgAccuracy}%
                  </span>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {sessionStats.completed}
                </p>
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium">
                  Dijawab
                </p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  {sessionStats.skipped}
                </p>
                <p className="text-[10px] text-rose-500 dark:text-rose-400 font-medium">
                  Dilewati
                </p>
              </div>
              <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
                  +{sessionStats.xpEarned}
                </p>
                <p className="text-[10px] text-violet-500 dark:text-violet-400 font-medium">
                  XP
                </p>
              </div>
            </div>

            {/* Word accuracy detail */}
            <div className="bg-muted/50 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Akurasi kata</span>
                <span className="font-bold text-foreground">
                  {sessionStats.totalCorrect}/{sessionStats.totalWords} (
                  {sessionStats.avgAccuracy}%)
                </span>
              </div>
            </div>

            {/* Results list */}
            {results.length > 0 && (
              <div className="border-t border-border/50 pt-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Detail Kalimat
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                        r.isSkipped
                          ? "bg-rose-50 dark:bg-rose-950/20"
                          : r.accuracy >= 80
                          ? "bg-emerald-50 dark:bg-emerald-950/20"
                          : "bg-amber-50 dark:bg-amber-950/20"
                      }`}
                    >
                      <span className="truncate flex-1 font-medium text-card-foreground">
                        {r.sentence.text.substring(0, 40)}...
                      </span>
                      <span className="shrink-0 ml-2 font-bold">
                        {r.isSkipped ? "⏭" : `${r.accuracy}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setPhase("select");
                  setSelectedVideo(null);
                  setSessionStats(null);
                }}
                className="flex-1 py-3 rounded-xl bg-muted text-card-foreground font-semibold text-sm hover:bg-muted/80 transition-colors"
              >
                Pilih Video Lain
              </button>
              <button
                onClick={() => {
                  setResults([]);
                  setSessionStarted(false);
                  setPhase("active");
                }}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Ulangi
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────

  if (phase === "loading") return renderLoading();
  if (phase === "select") return renderSelect();
  if (phase === "active") return renderActive();
  if (phase === "result") return renderResult();

  return renderSelect();
}
