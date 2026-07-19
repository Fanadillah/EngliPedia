"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles, Check, X, Brain, ArrowLeft, RotateCcw,
  Trophy, Zap, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import type { Word } from "@/types/word";
import { awardXp, getXpEventMessage } from "@/lib/gamification";
import { useToast } from "@/components/ui/toast-provider";
import { Confetti } from "@/components/ui/confetti";
import { useRouter } from "next/navigation";

// ─── Types ──────────────────────────────────────────────────────────────

type AnswerState = "waiting" | "correct" | "incorrect" | "timeout";
type Difficulty = "basic" | "intermediate" | "advanced";

interface QuizConfig {
  questionCount: number;
  difficulty: "all" | Difficulty;
}

interface QuizQuestion {
  word: Word;
  options: string[];
  correctIndex: number;
}

interface QuizResult {
  wordId: number;
  word: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
}

// ─── Constants ──────────────────────────────────────────────────────────

const QUIZ_SIZES = [5, 10, 15, 20];
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

const XP_PER_QUESTION = 5;
const XP_PERFECT_BONUS = 15;

// ─── Helpers ────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── Component ──────────────────────────────────────────────────────────

export default function QuizPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // Config state
  const [config, setConfig] = useState<QuizConfig>({
    questionCount: 10,
    difficulty: "all",
  });

  // Quiz state
  const [phase, setPhase] = useState<"config" | "active" | "result">("config");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("waiting");
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const startTimeRef = useRef(0);
  const autoNextRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch and generate questions
  // Returns true if successful, false if error
  const generateQuestions = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      let qb = supabase
        .from("words")
        .select("id, word, ipa, pos, meaning_id, definition, example, example_id, frequency, cara_baca, level")
        .not("meaning_id", "eq", "");

      if (config.difficulty !== "all") {
        qb = qb.eq("level", config.difficulty);
      }

      const { data, error } = await qb.limit(500);

      if (error) throw new Error(error.message);
      if (!data || data.length === 0) {
        throw new Error("Tidak ada kata tersedia untuk level ini");
      }

      const shuffled = shuffleArray(data as Word[]);
      const selected = shuffled.slice(0, config.questionCount);

      // Show warning if fewer words than requested
      if (selected.length < config.questionCount) {
        showToast({
          type: "info",
          message: `Hanya ${selected.length} kata tersedia untuk level ini`,
          duration: 3000,
        });
      }

      // Generate questions with 4 options each (1 correct + 3 random distractors)
      const allMeanings = (data as Word[]).map((w) => w.meaning_id).filter(Boolean);

      const generated: QuizQuestion[] = selected.map((word) => {
        // Get 3 random wrong meanings (not the correct one)
        const distractors = shuffleArray(
          allMeanings.filter((m) => m !== word.meaning_id)
        ).slice(0, 3);

        const options = shuffleArray([
          word.meaning_id,
          ...distractors.map((d) => d || "-"),
        ]);

        const correctIndex = options.indexOf(word.meaning_id);

        return {
          word,
          options,
          correctIndex,
        };
      });

      setQuestions(generated);
      return true;
    } catch (err: any) {
      setError(err.message || "Gagal memuat soal");
      return false;
    } finally {
      setLoading(false);
    }
  }, [config, showToast]);

  const startQuiz = () => {
    generateQuestions().then((success) => {
      if (!success) return; // Don't transition if error
      setPhase("active");
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setAnswerState("waiting");
      setResults([]);
      startTimeRef.current = Date.now();
    });
  };

  const currentQuestion = questions[currentIndex];

  // Handle answer selection
  const handleAnswer = (index: number) => {
    if (answerState !== "waiting" || !currentQuestion) return;

    setSelectedAnswer(index);
    const isCorrect = index === currentQuestion.correctIndex;

    if (isCorrect) {
      setAnswerState("correct");
      awardXp("learn_flashcard"); // +5 XP

      // Vibrant feedback
      showToast({
        type: "success",
        message: `✅ ${getXpEventMessage("learn_flashcard")}`,
        duration: 1500,
      });
    } else {
      setAnswerState("incorrect");
    }

    // Save result
    const result: QuizResult = {
      wordId: currentQuestion.word.id,
      word: currentQuestion.word.word,
      correct: isCorrect,
      userAnswer: currentQuestion.options[index],
      correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
    };
    setResults((prev) => [...prev, result]);

    // Auto-advance after delay
    autoNextRef.current = setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setAnswerState("waiting");
      } else {
        // Quiz done! Pass isCorrect directly to avoid stale closure
        finishQuiz(isCorrect);
      }
    }, isCorrect ? 1200 : 2000);
  };

  const finishQuiz = (lastWasCorrect: boolean) => {
    const correctCount = results.filter((r) => r.correct).length + (lastWasCorrect ? 1 : 0);
    const totalQuestions = questions.length;
    const isPerfect = correctCount >= totalQuestions;

    // Award session completion
    awardXp("complete_session"); // +30 XP

    if (isPerfect) {
      awardXp("master_word"); // +25 XP bonus for perfect
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      showToast({
        type: "achievement",
        message: "🎉 Sempurna! Bonus +25 XP!",
        duration: 4000,
      });
    } else {
      showToast({
        type: "xp",
        message: `📊 Quiz selesai! ${correctCount}/${totalQuestions} benar`,
        xpAmount: correctCount * XP_PER_QUESTION + 30,
        duration: 3000,
      });
    }

    setPhase("result");
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoNextRef.current) clearTimeout(autoNextRef.current);
    };
  }, []);

  const correctCount = results.filter((r) => r.correct).length;
  const totalAnswered = results.length;
  const duration = phase === "result" ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
  const percentage = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

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
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Quiz Vocabulary</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Uji pemahaman kosakatamu!
              </p>
            </div>

            {/* Error state */}
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

            {/* Settings */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-5">
              {/* Question count */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Jumlah Soal
                </p>
                <div className="flex gap-2">
                  {QUIZ_SIZES.map((size) => (
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
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>+{XP_PER_QUESTION} XP per jawaban benar</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>+{XP_PERFECT_BONUS} XP bonus jika semua benar!</span>
                </div>
              </div>
            </div>

            {/* Start button */}
            <button
              onClick={startQuiz}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-base hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Menyiapkan soal...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Mulai Quiz
                  <ChevronRight className="w-5 h-5" />
                </span>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Active Quiz ───────────────────────────────────────────────────

  if (phase === "active" && currentQuestion) {
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-lg mx-auto p-4 space-y-4">
          {/* Progress header */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              Soal {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-xs text-muted-foreground">
              ✅ {correctCount}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.word.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-card rounded-3xl border border-border p-6 sm:p-8 text-center shadow-lg"
            >
              {/* Word */}
              <div className="py-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Pilih arti yang benar
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {currentQuestion.word.word}
                </h2>
                {currentQuestion.word.ipa && (
                  <p className="text-sm font-mono text-muted-foreground mt-2">
                    {currentQuestion.word.ipa}
                  </p>
                )}
              </div>

              {/* Level badge */}
              <div className="flex justify-center mb-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${
                  DIFFICULTY_COLORS[currentQuestion.word.level] || DIFFICULTY_COLORS.basic
                }`}>
                  {DIFFICULTY_LABELS[currentQuestion.word.level] || "Dasar"}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Options */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.word.id + "-options"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-2.5"
            >
              {currentQuestion.options.map((option, idx) => {
                let buttonClass = "bg-card border-border text-card-foreground hover:bg-muted";

                if (answerState !== "waiting") {
                  if (idx === currentQuestion.correctIndex) {
                    buttonClass = "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 text-emerald-600 dark:text-emerald-400";
                  } else if (idx === selectedAnswer && !currentQuestion.options[currentQuestion.correctIndex]) {
                    buttonClass = "bg-rose-50 dark:bg-rose-950/30 border-rose-400 text-rose-600 dark:text-rose-400";
                  } else if (idx === selectedAnswer) {
                    buttonClass = "bg-rose-50 dark:bg-rose-950/30 border-rose-400 text-rose-600 dark:text-rose-400";
                  } else {
                    buttonClass = "bg-muted/50 border-border text-muted-foreground";
                  }
                }

                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    whileHover={answerState === "waiting" ? { scale: 1.01 } : {}}
                    whileTap={answerState === "waiting" ? { scale: 0.99 } : {}}
                    onClick={() => handleAnswer(idx)}
                    disabled={answerState !== "waiting"}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border-2 font-medium text-sm transition-all ${
                      answerState !== "waiting" && idx === selectedAnswer && idx !== currentQuestion.correctIndex
                        ? "scale-[0.98]"
                        : ""
                    } ${buttonClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        answerState !== "waiting"
                          ? idx === currentQuestion.correctIndex
                            ? "bg-emerald-400 text-white"
                            : idx === selectedAnswer
                            ? "bg-rose-400 text-white"
                            : "bg-muted text-muted-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {answerState !== "waiting" && idx === currentQuestion.correctIndex ? (
                          <Check className="w-4 h-4" />
                        ) : answerState !== "waiting" && idx === selectedAnswer ? (
                          <X className="w-4 h-4" />
                        ) : (
                          String.fromCharCode(65 + idx)
                        )}
                      </span>
                      <span className="flex-1">{option}</span>
                      {answerState !== "waiting" && idx === currentQuestion.correctIndex && (
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>

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
                    ? `✅ Benar! +${XP_PER_QUESTION} XP`
                    : `❌ Jawaban: ${currentQuestion.options[currentQuestion.correctIndex]}`
                  }
                </p>
                {answerState === "incorrect" && currentQuestion.word.cara_baca && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Baca: {currentQuestion.word.cara_baca}
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
    const totalQuestions = questions.length;
    const actualCorrect = results.filter((r) => r.correct).length;
    const percent = totalQuestions > 0 ? Math.round((actualCorrect / totalQuestions) * 100) : 0;
    const isPerfect = actualCorrect >= totalQuestions;
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
            {/* Header */}
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
                  <Sparkles className="w-8 h-8 text-white" />
                ) : (
                  <Brain className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-xl font-bold">
                {isPerfect
                  ? "🎉 Sempurna!"
                  : percent >= 60
                  ? "Bagus! 👍"
                  : "Terus belajar! 💪"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Quiz selesai!</p>
            </div>

            {/* Score */}
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
                    className={isPerfect ? "text-amber-500" : "text-primary"}
                    strokeWidth="8"
                    strokeLinecap="round"
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
                <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
                  +{actualCorrect * XP_PER_QUESTION + 30 + (isPerfect ? 25 : 0)}
                </p>
                <p className="text-[10px] text-violet-500 dark:text-violet-400 font-medium">XP</p>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Durasi: {minutes > 0 ? `${minutes}m ` : ""}{seconds}d
            </div>

            {/* Wrong answers review */}
            {results.filter((r) => !r.correct).length > 0 && (
              <div className="border-t border-border/50 pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  🔄 Review jawaban salah
                </p>
                <div className="space-y-2">
                  {results.filter((r) => !r.correct).map((r) => (
                    <div
                      key={r.wordId}
                      className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/20 rounded-xl px-3.5 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">{r.word}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {r.correctAnswer}
                        </p>
                      </div>
                      <X className="w-4 h-4 text-rose-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setPhase("config");
                  setResults([]);
                }}
                className="flex-1 py-3 rounded-xl bg-muted text-card-foreground font-semibold text-sm hover:bg-muted/80 transition-colors"
              >
                Menu
              </button>
              <button
                onClick={() => {
                  setResults([]);
                  startQuiz();
                }}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Quiz Lagi
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Fallback loading
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        Memuat...
      </div>
    </div>
  );
}
