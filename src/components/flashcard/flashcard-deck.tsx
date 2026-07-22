"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, ChevronLeft, ChevronRight, RotateCcw, Sparkles, Check, X, Brain, BookOpen } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Word } from "@/types/word";
import { awardXp, getXpEventMessage } from "@/lib/gamification";
import { addMistake } from "@/lib/learning";
import { recordReview, getDueCount, getDueWordIds, mergeCloudCards, getCardForWord, isMastered, getMasteryLevel, getMasteryStatus } from "@/lib/spaced-repetition";
import { loadSpacedRepetitionFromCloud } from "@/lib/cloud-sync";
import { getMistakes } from "@/lib/learning";
import { useAuth } from "@/components/auth/auth-context";
import { useToast } from "@/components/ui/toast-provider";
import { Confetti } from "@/components/ui/confetti";

// ─── Types ──────────────────────────────────────────────────────────────

type ReviewDifficulty = "again" | "hard" | "good" | "easy";

interface ReviewResult {
  word: Word;
  difficulty: ReviewDifficulty;
}

interface SessionStats {
  total: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
  totalXpEarned: number;
  duration: number; // seconds
}

// ─── Constants ──────────────────────────────────────────────────────────

const SESSION_SIZE = 10;
const XP_REWARDS: Record<ReviewDifficulty, number> = {
  again: 0,
  hard: 2,
  good: 5,
  easy: 10,
};

// ─── Component ──────────────────────────────────────────────────────────

export function FlashcardDeck({ mode = "normal" }: { mode?: "normal" | "mistakes" }) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const startTimeRef = useRef<number>(0);
  const masteryAwardedRef = useRef(false);
  const { showToast } = useToast();
  const { user } = useAuth();
  const [dueCount, setDueCount] = useState(0);

  // Fetch words on mount
  useEffect(() => {
    loadWords();
  }, [mode]);

  const loadWords = async () => {
    setLoading(true);
    const supabase = createClient();

    let sessionWords: Word[] = [];

    if (mode === "mistakes" && user) {
      // Load words from user_mistakes
      const mistakes = await getMistakes();
      if (mistakes.length > 0) {
        const mistakeIds = mistakes.map((m) => m.word_id);
        const { data } = await supabase
          .from("words")
          .select("id, word, ipa, pos, meaning_id, definition, example, example_id, frequency, cara_baca, level, conjugations")
          .in("id", mistakeIds)
          .limit(SESSION_SIZE);
        if (data) sessionWords = data as Word[];
      }
    } else {
      // Normal mode: pull spaced repetition data from cloud first
      if (user) {
        try {
          const cloudCards = await loadSpacedRepetitionFromCloud();
          if (cloudCards.length > 0) {
            mergeCloudCards(cloudCards);
          }
        } catch {
          // Silent fail
        }
      }

      const dueIds = getDueWordIds();
      setDueCount(getDueCount());

      // 1. Load due words first
      if (dueIds.length > 0) {
        const { data: dueData } = await supabase
          .from("words")
          .select("id, word, ipa, pos, meaning_id, definition, example, example_id, frequency, cara_baca, level, conjugations")
          .in("id", dueIds)
          .limit(SESSION_SIZE);
        if (dueData) sessionWords = dueData as Word[];
      }

      // 2. Fill remaining slots with new words
      const remaining = SESSION_SIZE - sessionWords.length;
      if (remaining > 0) {
        const existingIds = sessionWords.map((w) => w.id);
        let qb = supabase
          .from("words")
          .select("id, word, ipa, pos, meaning_id, definition, example, example_id, frequency, cara_baca, level, conjugations")
          .not("meaning_id", "eq", "")
          .not("ipa", "eq", "")
          .gte("frequency", 2);

        if (existingIds.length > 0) {
          qb = qb.not("id", "in", `(${existingIds.join(",")})`);
        }

        const { data: newData } = await qb.order("id", { ascending: false }).limit(200);

        if (newData && newData.length > 0) {
          const shuffled = [...newData].sort(() => Math.random() - 0.5);
          sessionWords = [...sessionWords, ...shuffled.slice(0, remaining)];
        }
      }
    }

    setWords(sessionWords);
    setLoading(false);
  };

  const startSession = () => {
    setSessionStarted(true);
    setCurrentIndex(0);
    setFlipped(false);
    setResults([]);
    setSessionDone(false);
    setSessionStats(null);
    startTimeRef.current = Date.now();
    masteryAwardedRef.current = false;
  };

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleFlip = () => {
    if (!swiping) setFlipped((prev) => !prev);
  };

  const handleReview = useCallback(
    (difficulty: ReviewDifficulty) => {
      if (!words[currentIndex]) return;

      const word = words[currentIndex];

      // Check mastery BEFORE review
      const cardBefore = getCardForWord(word.id);
      const wasMastered = cardBefore ? isMastered(cardBefore) : false;

      // Save to spaced repetition system
      recordReview(word.id, difficulty);

      // Track mistakes for again/hard
      if (difficulty === "again" || difficulty === "hard") {
        addMistake(word.id, "flashcard");
      }

      // Award XP only via proper gamification system
      if (difficulty === "easy") {
        awardXp("learn_flashcard"); // +10 XP
      }

      // Mastery: check if this review JUST made the word mastered (SM-2 criteria)
      const cardAfter = getCardForWord(word.id);
      const isNowMastered = cardAfter ? isMastered(cardAfter) : false;

      if (isNowMastered && !wasMastered && !masteryAwardedRef.current) {
        masteryAwardedRef.current = true;
        awardXp("master_word"); // +25 XP
        showToast({
          type: "success",
          message: `Kata "${word.word}" berhasil dikuasai!`,
        });
      }

      const newResult: ReviewResult = { word, difficulty };
      const newResults = [...results, newResult];
      setResults(newResults);

      // Move to next card or finish
      if (currentIndex < words.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setFlipped(false);
      } else {
        // Session complete!
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        const easyCount = newResults.filter((r) => r.difficulty === "easy").length;
        const goodCount = newResults.filter((r) => r.difficulty === "good").length;
        const hardCount = newResults.filter((r) => r.difficulty === "hard").length;
        const againCount = newResults.filter((r) => r.difficulty === "again").length;

        // Award session completion XP
        awardXp("complete_session"); // +30 XP

        // Calculate total XP earned: only easy cards award XP (10 each) + session bonus (30)
        // good/hard/again are tracked for stats but don't award XP
        const totalXpEarned = easyCount * XP_REWARDS.easy + 30;

        setSessionStats({
          total: SESSION_SIZE,
          again: againCount,
          hard: hardCount,
          good: goodCount,
          easy: easyCount,
          totalXpEarned,
          duration,
        });
        setSessionDone(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);

        showToast({
          type: "achievement",
          message: `🎉 Sesi selesai! +${totalXpEarned} XP`,
          xpAmount: totalXpEarned,
          duration: 4000,
        });
      }
    },
    [currentIndex, words, results, showToast]
  );

  const handleSwipeEnd = useCallback(
    (_: any, info: { offset: { x: number } }) => {
      setSwiping(false);
      if (info.offset.x < -80) {
        // Swipe left = Hard — langsung review tanpa animasi perantara
        handleReview("hard");
      } else if (info.offset.x > 80) {
        // Swipe right = Easy — langsung review tanpa animasi perantara
        handleReview("easy");
      }
    },
    [handleReview]
  );

  const currentWord = words[currentIndex];
  const currentCard = currentWord ? getCardForWord(currentWord.id) : null;
  const currentMasteryLevel = currentCard ? getMasteryLevel(currentCard) : 0;
  const currentMasteryStatus = currentCard ? getMasteryStatus(currentCard) : "new";

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-[320px] sm:w-[380px] h-[440px] bg-card rounded-3xl border border-border p-8 animate-pulse">
          <div className="h-6 w-24 bg-muted rounded-full mx-auto mb-6" />
          <div className="h-10 w-40 bg-muted rounded-lg mx-auto mb-3" />
          <div className="h-5 w-28 bg-muted/50 rounded mx-auto mb-8" />
          <div className="space-y-3 mt-auto">
            <div className="h-10 bg-muted rounded-xl" />
            <div className="h-10 bg-muted/50 rounded-xl" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">Menyiapkan kartu...</p>
      </div>
    );
  }

  // No words found
  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <BookOpen className="w-10 h-10 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold text-foreground/80">Tidak ada kata tersedia</p>
        <p className="text-sm text-muted-foreground mt-1">Coba lagi nanti</p>
        <button
          onClick={loadWords}
          className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  // Session done — summary screen
  if (sessionDone && sessionStats) {
    const percentage = Math.round((sessionStats.easy / sessionStats.total) * 100);
    const minutes = Math.floor(sessionStats.duration / 60);
    const seconds = sessionStats.duration % 60;
    const praise =
      percentage >= 80
        ? "Luar biasa! 🎉"
        : percentage >= 50
        ? "Bagus! Lanjutkan! 💪"
        : "Terus belajar! 📚";

    return (
      <div className="max-w-md mx-auto">
        <Confetti active={showConfetti} particleCount={100} duration={3000} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-card rounded-3xl border border-border p-6 space-y-5"
        >
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold">{praise}</h2>
            <p className="text-sm text-muted-foreground mt-1">Sesi belajar selesai!</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-3 text-center">
              <RotateCcw className="w-4 h-4 text-rose-500 dark:text-rose-400 mx-auto mb-0.5" />
              <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{sessionStats.again}</p>
              <p className="text-[9px] text-rose-500 dark:text-rose-400 font-medium">Lupa</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-3 text-center">
              <X className="w-4 h-4 text-orange-500 dark:text-orange-400 mx-auto mb-0.5" />
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{sessionStats.hard}</p>
              <p className="text-[9px] text-orange-500 dark:text-orange-400 font-medium">Sulit</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 text-center">
              <Brain className="w-4 h-4 text-amber-500 dark:text-amber-400 mx-auto mb-0.5" />
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{sessionStats.good}</p>
              <p className="text-[9px] text-amber-500 dark:text-amber-400 font-medium">Lumayan</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 text-center">
              <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mx-auto mb-0.5" />
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{sessionStats.easy}</p>
              <p className="text-[9px] text-emerald-500 dark:text-emerald-400 font-medium">Mudah</p>
            </div>
          </div>

          {/* XP + Duration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-violet-50 dark:bg-violet-950/30 rounded-xl px-3 py-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
              <span className="text-sm font-bold text-violet-600 dark:text-violet-400">+{sessionStats.totalXpEarned}</span>
              <span className="text-[10px] text-violet-500 dark:text-violet-400 font-medium">XP</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {minutes > 0 ? `${minutes}m ` : ""}{seconds}d
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSessionDone(false);
                setSessionStarted(false);
                setResults([]);
              }}
              className="flex-1 py-3 rounded-xl bg-muted text-card-foreground font-semibold text-sm hover:bg-muted/80 transition-colors"
            >
              Menu Utama
            </button>
            <button
              onClick={() => {
                loadWords();
                startSession();
              }}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Sesi Baru
            </button>
          </div>

          {/* Hard words to review */}
          {sessionStats.hard > 0 && (
            <div className="border-t border-border/50 pt-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Kata yang perlu diulang ({sessionStats.hard})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {results
                  .filter((r) => r.difficulty === "hard")
                  .map((r) => (
                    <span
                      key={r.word.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-medium"
                    >
                      {r.word.word}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Start screen
  if (!sessionStarted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Siap Belajar?</h2>
          <p className="text-sm text-muted-foreground mb-2">
            {words.length} kata tersedia untuk sesi ini
          </p>
          <ul className="text-xs text-muted-foreground space-y-1.5 mb-6">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Ketuk kartu untuk melihat arti
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              Geser kanan atau tekan <strong>Easy</strong> jika mudah
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
              Geser kiri atau tekan <strong>Hard</strong> jika sulit
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
              Tekan <strong>Again</strong> jika tidak ingat
            </li>
          </ul>

          {/* Due for review badge */}
          {dueCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                {dueCount} kata perlu diulang hari ini
              </span>
            </div>
          )}
          <button
            onClick={startSession}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-base hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
          >
            Mulai Sesi
          </button>
          <p className="text-[10px] text-muted-foreground mt-3">
            Sesi terdiri dari {SESSION_SIZE} kata
          </p>
        </motion.div>
      </div>
    );
  }

  // Active flashcard
  return (
    <div className="flex flex-col items-center justify-center py-4 px-4">
      {/* Progress bar */}
      <div className="w-full max-w-[380px] mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {currentIndex + 1} / {words.length}
          </span>
          <span className="text-xs text-muted-foreground">
            {results.length > 0 && (
              <span>
                ✅ {results.filter((r) => r.difficulty === "easy").length} · 
                💪 {results.filter((r) => r.difficulty === "good").length} · 
                🔄 {results.filter((r) => r.difficulty === "hard").length}
              </span>
            )}
          </span>
        </div>            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex) / words.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.id}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-[320px] sm:w-[380px]"
          style={{ perspective: "1200px" }}
        >
          <motion.div
            className="relative cursor-grab active:cursor-grabbing"
            style={{ transformStyle: "preserve-3d" }}
            animate={{
              rotateY: flipped ? 180 : 0,
            }}
            transition={{
              rotateY: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragStart={() => setSwiping(true)}
            onDragEnd={handleSwipeEnd}
            whileDrag={{
              scale: 1.02,
              rotate: 2,
            }}
          >
            {/* Card Front */}
            <div
              className="bg-card rounded-3xl border border-border p-8 shadow-lg shadow-gray-200/50 dark:shadow-black/20"
              style={{ backfaceVisibility: "hidden" }}
              onClick={handleFlip}
            >
              <div className="text-center space-y-4">
                {/* Level indicator */}
                <div className="flex justify-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white ${
                      currentWord.level === "basic"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : currentWord.level === "intermediate"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500"
                        : "bg-gradient-to-r from-red-500 to-rose-500"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        currentWord.level === "basic"
                          ? "bg-green-400"
                          : currentWord.level === "intermediate"
                          ? "bg-yellow-400"
                          : "bg-red-400"
                      }`}
                    />
                    {currentWord.level === "basic"
                      ? "Dasar"
                      : currentWord.level === "intermediate"
                      ? "Menengah"
                      : "Lanjut"}
                  </span>
                  {currentMasteryStatus !== "new" && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      currentMasteryStatus === "mastered"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        : currentMasteryStatus === "reviewing"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    }`}>
                      {currentMasteryStatus === "mastered" ? "🏆 Dikuasai" : currentMasteryStatus === "reviewing" ? "📖 Reviewing" : "📝 Learning"}
                    </span>
                  )}
                </div>

                {/* Word */}
                <div className="py-4">
                  <h2 className="text-4xl font-bold tracking-tight text-foreground">
                    {currentWord.word}
                  </h2>
                  {currentWord.ipa && (
                    <p className="text-sm font-mono text-muted-foreground mt-2">{currentWord.ipa}</p>
                  )}
                  {currentCard && currentMasteryLevel > 0 && (
                    <div className="mt-3 max-w-[200px] mx-auto">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            currentMasteryStatus === "mastered"
                              ? "bg-gradient-to-r from-emerald-400 to-green-500"
                              : "bg-gradient-to-r from-blue-400 to-indigo-500"
                          }`}
                          style={{ width: `${currentMasteryLevel}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 text-center">
                        Mastery: {currentMasteryLevel}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Pronunciation button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentWord.word);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  Dengarkan
                </button>

                {/* Flip hint */}
                <div className="pt-4">
                  <p className="text-xs text-muted-foreground/50 flex items-center justify-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    Ketuk untuk lihat arti
                    <ChevronLeft className="w-3 h-3" />
                  </p>
                </div>
              </div>
            </div>

            {/* Card Back */}
            <div
              className="absolute inset-0 bg-card rounded-3xl border border-border p-8 shadow-lg shadow-gray-200/50 dark:shadow-black/20"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
              onClick={handleFlip}
            >
              <div className="text-center space-y-4 h-full flex flex-col">
                {/* Mini word */}
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {currentWord.word}
                </p>

                {/* Arti */}
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-2xl font-bold text-primary">
                    {currentWord.meaning_id}
                  </p>
                  {currentWord.pos && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ({currentWord.pos})
                    </p>
                  )}
                </div>

                {/* Cara baca */}
                {currentWord.cara_baca && (
                  <div className="inline-flex items-center gap-2 bg-muted rounded-xl px-4 py-2 mx-auto">
                    <span className="text-xs text-muted-foreground">Baca:</span>
                    <span className="text-sm font-bold text-card-foreground">{currentWord.cara_baca}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(currentWord.cara_baca.replace(/-/g, " "));
                      }}
                      className="p-1 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-primary" />
                    </button>
                  </div>
                )}

                {/* Definition (if available) */}
                {currentWord.definition && (
                  <p className="text-xs text-muted-foreground/80 italic leading-relaxed max-w-xs mx-auto">
                    &ldquo;{currentWord.definition.length > 80
                      ? currentWord.definition.slice(0, 80) + "..."
                      : currentWord.definition}&rdquo;
                  </p>
                )}

                {/* Back hint */}
                <p className="text-xs text-muted-foreground/50 flex items-center justify-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  Ketuk untuk balik
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Review buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 mt-6 w-full max-w-[380px]"
      >
        {/* Again */}
        <button
          onClick={() => handleReview("again")}
          className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-100 dark:hover:bg-rose-950/50 active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Lupa</span>
        </button>

        {/* Hard */}
        <button
          onClick={() => handleReview("hard")}
          className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-semibold text-xs hover:bg-orange-100 dark:hover:bg-orange-950/50 active:scale-95 transition-all"
        >
          <X className="w-4 h-4" />
          <span>Sulit</span>
        </button>

        {/* Good */}
        <button
          onClick={() => handleReview("good")}
          className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-semibold text-xs hover:bg-amber-100 dark:hover:bg-amber-950/50 active:scale-95 transition-all"
        >
          <Brain className="w-4 h-4" />
          <span>Lumayan</span>
        </button>

        {/* Easy */}
        <button
          onClick={() => handleReview("easy")}
          className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-semibold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-950/50 active:scale-95 transition-all"
        >
          <Check className="w-4 h-4" />
          <span>Mudah</span>
        </button>
      </motion.div>

      {/* Swipe hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-[10px] text-muted-foreground/50 mt-3"
      >
        Geser kanan (Easy) · kiri (Hard) · tekan Lupa (Again)
      </motion.p>
    </div>
  );
}
