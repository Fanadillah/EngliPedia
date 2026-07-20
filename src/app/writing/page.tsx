"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Pen, ArrowLeft, Check, X, RotateCcw,
  Trophy, Sparkles, ChevronRight, Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import type { Word } from "@/types/word";
import { awardXp } from "@/lib/gamification";
import { useToast } from "@/components/ui/toast-provider";
import { Confetti } from "@/components/ui/confetti";
import { useRouter } from "next/navigation";

// ─── Types ──────────────────────────────────────────────────────────────

type Phase = "config" | "active" | "result";
type Difficulty = "basic" | "intermediate" | "advanced";

interface WritingConfig {
  questionCount: number;
  difficulty: "all" | Difficulty;
  showHint: boolean;
}

interface WritingResult {
  wordId: number;
  word: string;
  meaning: string;
  userAnswer: string;
  correct: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────

const QUESTION_COUNTS = [5, 10, 15, 20];
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

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");
}

/** Generate hint: show first letter + underscores for rest */
function generateHint(word: string): string {
  if (word.length <= 1) return word;
  return word[0] + "_".repeat(word.length - 1);
}

// ─── Component ──────────────────────────────────────────────────────────

export default function WritingPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [config, setConfig] = useState<WritingConfig>({
    questionCount: 10,
    difficulty: "all",
    showHint: true,
  });
  const [phase, setPhase] = useState<Phase>("config");
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [answerState, setAnswerState] = useState<"waiting" | "correct" | "incorrect">("waiting");
  const [results, setResults] = useState<WritingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef(0);

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
      setUserInput("");
      setAnswerState("waiting");
      setStreak(0);
      setBestStreak(0);
      startTimeRef.current = Date.now();
      setTimeout(() => inputRef.current?.focus(), 300);
    });
  };

  const currentWord = words[currentIndex];

  const handleSubmit = () => {
    if (!currentWord || answerState !== "waiting" || !userInput.trim()) return;

    const inputNorm = normalize(userInput);
    const wordNorm = normalize(currentWord.word);
    const isCorrect = inputNorm === wordNorm;

    setAnswerState(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      awardXp("learn_flashcard");
      setStreak((prev) => {
        const s = prev + 1;
        setBestStreak((best) => Math.max(best, s));
        if (s === 5) showToast({ type: "streak", message: "🔥 Streak 5!", duration: 2000 });
        if (s === 10) showToast({ type: "streak", message: "🔥🔥 Streak 10!", duration: 2000 });
        return s;
      });
      showToast({
        type: "success",
        message: "✅ Benar! +5 XP",
        duration: 1500,
      });
    } else {
      setStreak(0);
    }

    const result: WritingResult = {
      wordId: currentWord.id,
      word: currentWord.word,
      meaning: currentWord.meaning_id,
      userAnswer: userInput,
      correct: isCorrect,
    };
    setResults((prev) => [...prev, result]);

    // Auto-advance
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setUserInput("");
        setAnswerState("waiting");
        setTimeout(() => inputRef.current?.focus(), 300);
      } else {
        finishPractice();
      }
    }, isCorrect ? 1200 : 2500);
  };

  const finishPractice = () => {
    const correctCount = results.filter((r) => r.correct).length;
    const isPerfect = correctCount === words.length;

    awardXp("complete_session");
    if (isPerfect) {
      awardXp("master_word");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      showToast({
        type: "achievement",
        message: "🎉 Sempurna! Semua kata tertulis dengan benar!",
        duration: 4000,
      });
    }
    setPhase("result");
  };

  const totalScored = results.length;
  const correctCount = results.filter((r) => r.correct).length;
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Pen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Writing Practice</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Ketik kata Inggris dari arti Indonesia
              </p>
            </div>

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
                  Jumlah Soal
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

              {/* Hint toggle */}
              <div>
                <button
                  onClick={() => setConfig((c) => ({ ...c, showHint: !c.showHint }))}
                  className="flex items-center gap-3 w-full"
                >
                  <div className={`w-10 h-6 rounded-full transition-colors relative ${
                    config.showHint ? "bg-primary" : "bg-muted"
                  }`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${
                      config.showHint ? "left-4.5" : "left-0.5"
                    }`} />
                  </div>
                  <span className="text-sm font-medium">Tampilkan hint (huruf pertama)</span>
                </button>
              </div>

              {/* Info */}
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Pen className="w-3.5 h-3.5 text-blue-500" />
                  <span>Lihat arti, ketik kata Inggris yang benar</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>+5 XP per jawaban benar</span>
                </div>
              </div>
            </div>

            <button
              onClick={startPractice}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-base hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Menyiapkan...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Mulai Writing
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
        <div className="max-w-lg mx-auto p-4 space-y-4">
          {/* Progress header */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              Soal {currentIndex + 1} / {words.length}
            </span>
            <div className="flex items-center gap-3">
              {streak >= 3 && (
                <span className="text-xs font-bold text-orange-500">🔥 {streak}</span>
              )}
              <span className="text-xs text-muted-foreground">✅ {correctCount}</span>
            </div>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Question card */}
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
                Ketik kata Inggris untuk:
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary mb-2">
                {currentWord.meaning_id}
              </h2>
              {config.showHint && (
                <p className="text-lg font-mono text-muted-foreground tracking-[0.3em]">
                  {generateHint(currentWord.word)}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Input */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              disabled={answerState !== "waiting"}
              placeholder="Ketika jawabanmu di sini..."
              className={`w-full px-5 py-4 rounded-2xl bg-card border-2 text-lg font-medium text-center transition-all outline-none ${
                answerState === "correct"
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                  : answerState === "incorrect"
                  ? "border-rose-400 bg-rose-50 dark:bg-rose-950/20"
                  : "border-border focus:border-primary"
              }`}
              autoFocus
            />
          </div>

          {/* Submit */}
          {answerState === "waiting" && userInput.trim() && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Submit
              </button>
            </motion.div>
          )}

          {/* Answer feedback */}
          <AnimatePresence>
            {answerState !== "waiting" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-4 text-center ${
                  answerState === "correct"
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30"
                    : "bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30"
                }`}
              >
                <p className={`text-sm font-semibold ${
                  answerState === "correct"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}>
                  {answerState === "correct"
                    ? "✅ Benar! +5 XP"
                    : `❌ Jawaban: ${currentWord.word}`
                  }
                </p>
                {answerState === "incorrect" && currentWord.cara_baca && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Cara baca: {currentWord.cara_baca}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── Result Screen ─────────────────────────────────────────────────

  if (phase === "result") {
    const totalQuestions = words.length;
    const actualCorrect = results.filter((r) => r.correct).length;
    const percent = totalQuestions > 0 ? Math.round((actualCorrect / totalQuestions) * 100) : 0;
    const isPerfect = actualCorrect >= totalQuestions;
    const totalXp = actualCorrect * 5 + 30 + (isPerfect ? 25 : 0);
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
                isPerfect ? "from-amber-400 to-orange-500" : percent >= 60 ? "from-emerald-400 to-teal-500" : "from-blue-400 to-indigo-500"
              }`}>
                {isPerfect ? <Trophy className="w-8 h-8 text-white" /> : <Pen className="w-8 h-8 text-white" />}
              </div>
              <h2 className="text-xl font-bold">
                {isPerfect ? "🎉 Sempurna!" : percent >= 60 ? "Bagus! 👍" : "Terus belajar! 💪"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Writing selesai!</p>
            </div>

            {/* Score ring */}
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-muted" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r="42" fill="none" stroke="currentColor"
                    className={isPerfect ? "text-amber-500" : "text-blue-500"}
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
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{actualCorrect}</p>
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium">Benar</p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{totalQuestions - actualCorrect}</p>
                <p className="text-[10px] text-rose-500 dark:text-rose-400 font-medium">Salah</p>
              </div>
              <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-violet-600 dark:text-violet-400">+{totalXp}</p>
                <p className="text-[10px] text-violet-500 dark:text-violet-400 font-medium">XP</p>
              </div>
            </div>

            {bestStreak >= 3 && (
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-xl p-3 text-center">
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  🔥 Best Streak: {bestStreak}x
                </p>
              </div>
            )}

            <div className="text-center text-xs text-muted-foreground">
              Durasi: {minutes > 0 ? `${minutes}m ` : ""}{seconds}d
            </div>

            {/* Wrong answers review */}
            {results.filter((r) => !r.correct).length > 0 && (
              <div className="border-t border-border/50 pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">🔄 Review jawaban salah</p>
                <div className="space-y-2">
                  {results.filter((r) => !r.correct).map((r) => (
                    <div key={r.wordId} className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/20 rounded-xl px-3.5 py-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{r.meaning}</p>
                        <p className="text-sm font-semibold text-card-foreground">{r.word}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-rose-500">Jawabanmu: {r.userAnswer || "(kosong)"}</p>
                      </div>
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
