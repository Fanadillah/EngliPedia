"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic, MicOff, ArrowLeft, Volume2, Check, X, RotateCcw,
  Trophy, Sparkles, ChevronRight, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import type { Word } from "@/types/word";
import { awardXp, getXpEventMessage } from "@/lib/gamification";
import { useToast } from "@/components/ui/toast-provider";
import { Confetti } from "@/components/ui/confetti";
import { useRouter } from "next/navigation";

// ─── Types ──────────────────────────────────────────────────────────────

type Phase = "config" | "active" | "result";
type Difficulty = "basic" | "intermediate" | "advanced";

interface SpeakingConfig {
  questionCount: number;
  difficulty: "all" | Difficulty;
}

interface SpeakingResult {
  wordId: number;
  word: string;
  meaning: string;
  spoken: string;
  score: number; // 0-100 similarity
}

// ─── Constants ──────────────────────────────────────────────────────────

const QUESTION_COUNTS = [5, 10, 15];
const DIFFICULTY_LABELS: Record<string, string> = {
  all: "Semua Level",
  basic: "Dasar",
  intermediate: "Menengah",
  advanced: "Lanjut",
};
const DIFFICULTY_COLORS: Record<string, string> = {
  all: "from-primary to-secondary",
  basic: "from-green-500 to-emerald-500",
  intermediate: "from-amber-500 to-orange-500",
  advanced: "from-red-500 to-rose-500",
};

// ─── Helpers ────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

/** Simple string similarity (0-100) using longest common subsequence ratio */
function calculateSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 100;

  // LCS length
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  const lcs = dp[m][n];
  const maxLen = Math.max(m, n);
  return maxLen === 0 ? 0 : Math.round((lcs / maxLen) * 100);
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Sempurna!", color: "text-emerald-600" };
  if (score >= 70) return { label: "Bagus!", color: "text-blue-600" };
  if (score >= 50) return { label: "Cukup", color: "text-amber-600" };
  return { label: "Perlu latihan", color: "text-rose-600" };
}

// ─── Component ──────────────────────────────────────────────────────────

export default function SpeakingPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [config, setConfig] = useState<SpeakingConfig>({
    questionCount: 10,
    difficulty: "all",
  });
  const [phase, setPhase] = useState<Phase>("config");
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [results, setResults] = useState<SpeakingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [audioSupported, setAudioSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAudioSupported(false);
    }
  }, []);

  const loadWords = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      let qb = supabase
        .from("words")
        .select("id, word, ipa, pos, meaning_id, definition, example, example_id, frequency, cara_baca, level")
        .not("word", "eq", "")
        .not("meaning_id", "eq", "");

      if (config.difficulty !== "all") {
        qb = qb.eq("level", config.difficulty);
      }

      const { data, error: dbError } = await qb.limit(500);
      if (dbError) throw new Error(dbError.message);
      if (!data || data.length === 0) {
        throw new Error("Tidak ada kata tersedia untuk level ini");
      }

      const shuffled = shuffleArray(data as Word[]);
      const selected = shuffled.slice(0, config.questionCount);

      if (selected.length < config.questionCount) {
        showToast({
          type: "info",
          message: `Hanya ${selected.length} kata tersedia`,
          duration: 3000,
        });
      }

      setWords(selected);
      return true;
    } catch (err: any) {
      setError(err.message || "Gagal memuat kata");
      return false;
    } finally {
      setLoading(false);
    }
  }, [config, showToast]);

  const startPractice = () => {
    loadWords().then((success) => {
      if (!success) return;
      setPhase("active");
      setCurrentIndex(0);
      setResults([]);
      setSpokenText("");
      setShowMeaning(false);
      startTimeRef.current = Date.now();
    });
  };

  const currentWord = words[currentIndex];

  const speakWord = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.75;
    window.speechSynthesis.speak(u);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast({ type: "error", message: "Speech recognition tidak didukung di browser ini" });
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      setSpokenText("");
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript = event.results[i][0].transcript;
      }
      setSpokenText(transcript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "no-speech") {
        showToast({ type: "info", message: "Tidak ada suara terdeteksi, coba lagi" });
      } else if (event.error !== "aborted") {
        showToast({ type: "error", message: "Error: " + event.error });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const submitAnswer = () => {
    if (!currentWord) return;

    const score = calculateSimilarity(spokenText, currentWord.word);
    const result: SpeakingResult = {
      wordId: currentWord.id,
      word: currentWord.word,
      meaning: currentWord.meaning_id,
      spoken: spokenText,
      score,
    };
    setResults((prev) => [...prev, result]);

    if (score >= 70) {
      awardXp("learn_flashcard");
      showToast({
        type: "success",
        message: `✅ ${getScoreLabel(score).label} (+5 XP)`,
        duration: 1500,
      });
    } else {
      showToast({
        type: "info",
        message: `🎤 ${getScoreLabel(score).label}: "${spokenText || "(kosong)"}"`,
        duration: 2000,
      });
    }

    // Auto advance
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSpokenText("");
        setShowMeaning(false);
      } else {
        finishPractice();
      }
    }, 1500);
  };

  const finishPractice = () => {
    const correctCount = results.filter((r) => r.score >= 70).length;
    const isPerfect = correctCount === words.length;
    const totalXp = correctCount * 5 + 30 + (isPerfect ? 25 : 0);

    awardXp("complete_session");

    if (isPerfect) {
      awardXp("master_word");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      showToast({
        type: "achievement",
        message: "🎉 Sempurna! Semua kata diucapkan dengan benar!",
        duration: 4000,
      });
    }

    setPhase("result");
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const totalScored = results.length;
  const avgScore = totalScored > 0 ? Math.round(results.reduce((a, r) => a + r.score, 0) / totalScored) : 0;
  const duration = phase === "result" ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;

  // ── Config Screen ─────────────────────────────────────────────────

  if (phase === "config") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="p-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Speaking Practice</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Latihan pengucapan kosakata Inggris
              </p>
            </div>

            {!audioSupported && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl px-4 py-3"
              >
                <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Speech Recognition tidak didukung di browser ini. Coba gunakan Chrome.
                </p>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl px-4 py-3"
              >
                <p className="text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0" />
                  {error}
                </p>
              </motion.div>
            )}

            <div className="bg-card rounded-2xl border border-border p-5 space-y-5">
              {/* Question count */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Jumlah Kata
                </p>
                <div className="flex gap-2">
                  {QUESTION_COUNTS.map((size) => (
                    <button
                      key={size}
                      onClick={() => setConfig((c) => ({ ...c, questionCount: size }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        config.questionCount === size
                          ? "bg-primary text-white shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Level Kata
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["all", "basic", "intermediate", "advanced"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setConfig((c) => ({ ...c, difficulty: d }))}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        config.difficulty === d
                          ? `text-white bg-gradient-to-r ${DIFFICULTY_COLORS[d]} shadow-sm`
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {DIFFICULTY_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mic className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Klik mikrofon dan ucapkan kata yang ditampilkan</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>+5 XP per kata diucapkan dengan benar</span>
                </div>
              </div>
            </div>

            <button
              onClick={startPractice}
              disabled={loading || !audioSupported}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-base hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Menyiapkan...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Mulai Speaking
                  <ChevronRight className="w-5 h-5" />
                </span>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Active Practice ───────────────────────────────────────────────

  if (phase === "active" && currentWord) {
    const progress = ((currentIndex + 1) / words.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        <Confetti active={showConfetti} particleCount={60} duration={2000} />
        <div className="max-w-lg mx-auto p-4 space-y-4">
          {/* Progress header */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              Kata {currentIndex + 1} / {words.length}
            </span>
            <span className="text-xs text-muted-foreground">
              🎤 {results.filter((r) => r.score >= 70).length} benar
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Word card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWord.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-card rounded-3xl border border-border p-6 sm:p-8 text-center shadow-lg"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Ucapkan kata ini
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
                {currentWord.word}
              </h2>
              {currentWord.ipa && (
                <p className="text-sm font-mono text-muted-foreground mb-3">
                  {currentWord.ipa}
                </p>
              )}

              {/* Listen button */}
              <div className="flex justify-center gap-3 mb-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => speakWord(currentWord.word)}
                  className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <Volume2 className="w-5 h-5 text-primary" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMeaning(!showMeaning)}
                  className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors text-xs font-medium text-muted-foreground"
                >
                  {showMeaning ? currentWord.meaning_id : "Tampilkan Arti"}
                </motion.button>
              </div>

              {/* Level badge */}
              <div className="flex justify-center">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${
                  DIFFICULTY_COLORS[currentWord.level] || DIFFICULTY_COLORS.basic
                }`}>
                  {DIFFICULTY_LABELS[currentWord.level] || "Dasar"}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Microphone button */}
          <div className="flex flex-col items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isListening ? stopListening : startListening}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-rose-500 shadow-lg shadow-rose-500/40"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25"
              }`}
            >
              {isListening && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-rose-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              {isListening ? (
                <MicOff className="w-8 h-8 text-white relative z-10" />
              ) : (
                <Mic className="w-8 h-8 text-white relative z-10" />
              )}
            </motion.button>
            <p className="text-sm text-muted-foreground">
              {isListening ? "Mendengarkan... klik untuk berhenti" : "Klik untuk mulai bicara"}
            </p>
          </div>

          {/* Spoken text display */}
          <AnimatePresence>
            {spokenText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-card rounded-2xl border border-border p-4 text-center"
              >
                <p className="text-xs text-muted-foreground mb-1">Yang kamu ucapkan:</p>
                <p className="text-lg font-bold text-foreground">&quot;{spokenText}&quot;</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={`text-sm font-semibold ${getScoreLabel(calculateSimilarity(spokenText, currentWord.word)).color}`}>
                    {calculateSimilarity(spokenText, currentWord.word)}% cocok
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          {spokenText && !isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={submitAnswer}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Submit Jawaban
              </button>
            </motion.div>
          )}

          {/* Skip button */}
          <button
            onClick={() => {
              const result: SpeakingResult = {
                wordId: currentWord.id,
                word: currentWord.word,
                meaning: currentWord.meaning_id,
                spoken: "",
                score: 0,
              };
              setResults((prev) => [...prev, result]);
              if (currentIndex < words.length - 1) {
                setCurrentIndex((prev) => prev + 1);
                setSpokenText("");
                setShowMeaning(false);
              } else {
                finishPractice();
              }
            }}
            className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Lewati
          </button>
        </div>
      </div>
    );
  }

  // ── Result Screen ─────────────────────────────────────────────────

  if (phase === "result") {
    const totalQuestions = words.length;
    const correctCount = results.filter((r) => r.score >= 70).length;
    const percent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const isPerfect = correctCount === totalQuestions;
    const totalXp = correctCount * 5 + 30 + (isPerfect ? 25 : 0);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        <Confetti active={showConfetti} particleCount={120} duration={3000} />
        <div className="max-w-md mx-auto p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-card rounded-3xl border border-border p-6 space-y-5"
          >
            <div className="text-center">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto mb-3 shadow-sm ${
                isPerfect
                  ? "from-amber-400 to-orange-500"
                  : percent >= 60
                  ? "from-emerald-400 to-teal-500"
                  : "from-blue-400 to-indigo-500"
              }`}>
                {isPerfect ? (
                  <Trophy className="w-8 h-8 text-white" />
                ) : percent >= 60 ? (
                  <Mic className="w-8 h-8 text-white" />
                ) : (
                  <Sparkles className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-xl font-bold">
                {isPerfect ? "🎉 Sempurna!" : percent >= 60 ? "Bagus! 👍" : "Terus latihan! 💪"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Speaking selesai!</p>
            </div>

            {/* Score ring */}
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-muted" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r="42" fill="none" stroke="currentColor"
                    className={isPerfect ? "text-amber-500" : "text-emerald-500"}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${percent * 2.64} 264`}
                    initial={{ strokeDasharray: "0 264" }}
                    animate={{ strokeDasharray: `${percent * 2.64} 264` }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{percent}%</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{correctCount}</p>
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium">Benar</p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{totalQuestions - correctCount}</p>
                <p className="text-[10px] text-rose-500 dark:text-rose-400 font-medium">Perlu</p>
              </div>
              <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-violet-600 dark:text-violet-400">+{totalXp}</p>
                <p className="text-[10px] text-violet-500 dark:text-violet-400 font-medium">XP</p>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Durasi: {minutes > 0 ? `${minutes}m ` : ""}{seconds}d
            </div>

            {/* Words review */}
            {results.length > 0 && (
              <div className="border-t border-border/50 pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Detail pengucapan</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {results.map((r) => (
                    <div key={r.wordId} className={`flex items-center justify-between rounded-xl px-3.5 py-2 ${
                      r.score >= 70 ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-rose-50 dark:bg-rose-950/20"
                    }`}>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-card-foreground">{r.word}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {r.spoken ? `"${r.spoken}"` : "(dilewati)"}
                        </p>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${
                        r.score >= 70 ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {r.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setPhase("config"); setResults([]); }}
                className="flex-1 py-3 rounded-xl bg-muted text-card-foreground font-semibold text-sm hover:bg-muted/80 transition-colors"
              >
                Menu
              </button>
              <button
                onClick={() => { setResults([]); startPractice(); }}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Latihan Lagi
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        Memuat...
      </div>
    </div>
  );
}
