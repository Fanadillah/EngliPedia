"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, ArrowLeft, Check, X, RotateCcw,
  Trophy, Sparkles, ChevronRight, Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { awardXp } from "@/lib/gamification";
import { useToast } from "@/components/ui/toast-provider";
import { Confetti } from "@/components/ui/confetti";
import { useRouter } from "next/navigation";

// ─── Types ──────────────────────────────────────────────────────────────

type Phase = "select" | "active" | "result";

interface GrammarLesson {
  lesson_id: string;
  lesson_title: string;
  course_title: string;
}

interface ExerciseItem {
  type: "fill_blank" | "mcq";
  instruction: string;
  question: string;
  answer: string;
  options?: string[];
  hint?: string;
}

interface ExerciseResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────

export default function GrammarPracticePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [phase, setPhase] = useState<Phase>("select");
  const [lessons, setLessons] = useState<GrammarLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<GrammarLesson | null>(null);

  // Active exercise state
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<"waiting" | "correct" | "incorrect">("waiting");
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const startTimeRef = useRef(0);

  useEffect(() => {
    loadGrammarLessons();
  }, []);

  const loadGrammarLessons = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Get all grammar lessons with their course titles
      const { data: contentLessons } = await supabase
        .from("lesson_content")
        .select("lesson_id")
        .limit(100);

      if (!contentLessons || contentLessons.length === 0) {
        setLessons([]);
        setLoading(false);
        return;
      }

      // Get unique lesson IDs
      const lessonIds = [...new Set(contentLessons.map((c: any) => c.lesson_id))];

      // Get lesson details
      const { data: lessonData } = await supabase
        .from("lessons")
        .select("id, title, unit_id")
        .in("id", lessonIds);

      if (!lessonData || lessonData.length === 0) {
        setLessons([]);
        setLoading(false);
        return;
      }

      // Get unit titles
      const unitIds = [...new Set(lessonData.map((l: any) => l.unit_id))];
      const { data: unitData } = await supabase
        .from("units")
        .select("id, title, course_id")
        .in("id", unitIds);

      // Get course titles
      const courseIds = [...new Set((unitData || []).map((u: any) => u.course_id))];
      const { data: courseData } = await supabase
        .from("courses")
        .select("id, title")
        .in("id", courseIds);

      // Build lookup maps
      const unitMap = new Map((unitData || []).map((u: any) => [u.id, u]));
      const courseMap = new Map((courseData || []).map((c: any) => [c.id, c]));

      const grammarLessons: GrammarLesson[] = lessonData.map((l: any) => {
        const unit = unitMap.get(l.unit_id);
        const course = unit ? courseMap.get(unit.course_id) : null;
        return {
          lesson_id: l.id,
          lesson_title: l.title,
          course_title: course?.title || "Unknown",
        };
      });

      setLessons(grammarLessons);
    } catch (error) {
      console.error("Failed to load grammar lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const startLesson = async (lesson: GrammarLesson) => {
    setSelectedLesson(lesson);
    const supabase = createClient();

    const { data: content } = await supabase
      .from("lesson_content")
      .select("*")
      .eq("lesson_id", lesson.lesson_id)
      .order("sort_order");

    if (!content || content.length === 0) {
      showToast({ type: "error", message: "Tidak ada latihan grammar" });
      return;
    }

    // Extract exercises from content
    const allExercises: ExerciseItem[] = [];
    for (const item of content as any[]) {
      if (item.content_type === "exercise" && item.content) {
        const ex = item.content;
        if (ex.type === "fill_blank") {
          allExercises.push({
            type: "fill_blank",
            instruction: ex.instruction || "Isi bagian yang kosong",
            question: ex.question || "",
            answer: ex.answer || "",
            hint: ex.hint,
          });
        } else if (ex.type === "mcq") {
          allExercises.push({
            type: "mcq",
            instruction: ex.instruction || "Pilih jawaban yang benar",
            question: ex.question || "",
            answer: ex.correct || "",
            options: ex.options || [],
          });
        }
      }
    }

    if (allExercises.length === 0) {
      showToast({ type: "info", message: "Tidak ada latihan dalam lesson ini" });
      return;
    }

    setExercises(allExercises);
    setCurrentIndex(0);
    setUserInput("");
    setSelectedOption(null);
    setAnswerState("waiting");
    setShowHint(false);
    setResults([]);
    startTimeRef.current = Date.now();
    setPhase("active");
  };

  const currentExercise = exercises[currentIndex];

  const handleSubmit = () => {
    if (!currentExercise || answerState !== "waiting") return;

    let isCorrect = false;
    let userAnswer = "";

    if (currentExercise.type === "fill_blank") {
      if (!userInput.trim()) return;
      userAnswer = userInput.trim();
      isCorrect = userInput.trim().toLowerCase() === currentExercise.answer.toLowerCase();
    } else if (currentExercise.type === "mcq") {
      if (selectedOption === null) return;
      userAnswer = currentExercise.options![selectedOption];
      isCorrect = userAnswer.toLowerCase() === currentExercise.answer.toLowerCase();
    }

    setAnswerState(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      awardXp("learn_flashcard");
      showToast({ type: "success", message: "✅ Benar! +5 XP", duration: 1500 });
    }

    setResults((prev) => [
      ...prev,
      {
        question: currentExercise.question,
        userAnswer,
        correctAnswer: currentExercise.answer,
        correct: isCorrect,
      },
    ]);

    setTimeout(() => {
      if (currentIndex < exercises.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setUserInput("");
        setSelectedOption(null);
        setAnswerState("waiting");
        setShowHint(false);
      } else {
        finishPractice();
      }
    }, isCorrect ? 1200 : 2000);
  };

  const finishPractice = () => {
    const correctCount = results.filter((r) => r.correct).length + (answerState === "correct" ? 1 : 0);
    const isPerfect = correctCount === exercises.length;
    awardXp("complete_session");
    if (isPerfect) {
      awardXp("master_word");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setPhase("result");
  };

  // ── Select Screen ─────────────────────────────────────────────────

  if (phase === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-xl mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Grammar Practice</h1>
                <p className="text-sm text-muted-foreground">Latihan grammar dari course yang sudah kamu pelajari</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground/80">Belum ada grammar lesson</p>
              <p className="text-sm text-muted-foreground mt-1">
                Selesaikan lesson grammar di menu Belajar untuk membuka latihan di sini
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <motion.button
                  key={lesson.lesson_id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => startLesson(lesson)}
                  className="w-full bg-card rounded-2xl border border-border p-4 text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-foreground">{lesson.lesson_title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{lesson.course_title}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Active Exercise ───────────────────────────────────────────────

  if (phase === "active" && currentExercise) {
    const progress = ((currentIndex + 1) / exercises.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-lg mx-auto p-4 space-y-4">
          {/* Progress */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              Soal {currentIndex + 1} / {exercises.length}
            </span>
            <span className="text-xs text-muted-foreground">
              ✅ {results.filter((r) => r.correct).length}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Exercise card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  currentExercise.type === "fill_blank"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                }`}>
                  {currentExercise.type === "fill_blank" ? "Isi Kosong" : "Pilihan Ganda"}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {currentExercise.instruction}
              </p>

              {/* Question with blank */}
              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <p className="text-lg font-medium text-foreground leading-relaxed">
                  {currentExercise.type === "fill_blank"
                    ? currentExercise.question.split("___").map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="inline-block min-w-[80px] border-b-2 border-primary mx-1 text-center text-primary font-bold">
                              {answerState !== "waiting" ? currentExercise.answer : "___"}
                            </span>
                          )}
                        </span>
                      ))
                    : currentExercise.question
                  }
                </p>
              </div>

              {/* Fill blank input */}
              {currentExercise.type === "fill_blank" && (
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                  disabled={answerState !== "waiting"}
                  placeholder="Ketik jawabanmu..."
                  className={`w-full px-4 py-3 rounded-xl bg-card border-2 text-base font-medium text-center transition-all outline-none ${
                    answerState === "correct"
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                      : answerState === "incorrect"
                      ? "border-rose-400 bg-rose-50 dark:bg-rose-950/20"
                      : "border-border focus:border-primary"
                  }`}
                  autoFocus
                />
              )}

              {/* MCQ options */}
              {currentExercise.type === "mcq" && currentExercise.options && (
                <div className="space-y-2">
                  {currentExercise.options.map((option, idx) => {
                    let btnClass = "bg-card border-border text-card-foreground hover:bg-muted";
                    if (answerState !== "waiting") {
                      if (option.toLowerCase() === currentExercise.answer.toLowerCase()) {
                        btnClass = "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 text-emerald-600";
                      } else if (idx === selectedOption) {
                        btnClass = "bg-rose-50 dark:bg-rose-950/30 border-rose-400 text-rose-600";
                      } else {
                        btnClass = "bg-muted/50 border-border text-muted-foreground";
                      }
                    } else if (idx === selectedOption) {
                      btnClass = "bg-primary/10 border-primary text-primary";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (answerState === "waiting") setSelectedOption(idx);
                        }}
                        disabled={answerState !== "waiting"}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${btnClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            answerState !== "waiting"
                              ? option.toLowerCase() === currentExercise.answer.toLowerCase()
                                ? "bg-emerald-400 text-white"
                                : idx === selectedOption
                                ? "bg-rose-400 text-white"
                                : "bg-muted text-muted-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {answerState !== "waiting" && option.toLowerCase() === currentExercise.answer.toLowerCase()
                              ? <Check className="w-4 h-4" />
                              : answerState !== "waiting" && idx === selectedOption
                              ? <X className="w-4 h-4" />
                              : String.fromCharCode(65 + idx)
                            }
                          </span>
                          <span className="flex-1">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Hint */}
              {currentExercise.hint && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    {showHint ? "Sembunyikan Hint" : "Tampilkan Hint"}
                  </button>
                  {showHint && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-sm text-amber-600 dark:text-amber-400 mt-1 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2"
                    >
                      💡 {currentExercise.hint}
                    </motion.p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Submit button */}
          {answerState === "waiting" &&
            ((currentExercise.type === "fill_blank" && userInput.trim()) ||
              (currentExercise.type === "mcq" && selectedOption !== null)) && (
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

          {/* Feedback */}
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
                    : `❌ Jawaban: ${currentExercise.answer}`
                  }
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── Result Screen ─────────────────────────────────────────────────

  if (phase === "result") {
    const totalQuestions = exercises.length;
    const actualCorrect = results.filter((r) => r.correct).length;
    const percent = totalQuestions > 0 ? Math.round((actualCorrect / totalQuestions) * 100) : 0;
    const isPerfect = actualCorrect >= totalQuestions;
    const totalXp = actualCorrect * 5 + 30 + (isPerfect ? 25 : 0);
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
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
                {isPerfect ? <Trophy className="w-8 h-8 text-white" /> : <BookOpen className="w-8 h-8 text-white" />}
              </div>
              <h2 className="text-xl font-bold">
                {isPerfect ? "🎉 Sempurna!" : percent >= 60 ? "Bagus! 👍" : "Terus belajar! 💪"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedLesson?.lesson_title} — Selesai!
              </p>
            </div>

            {/* Score ring */}
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-muted" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r="42" fill="none" stroke="currentColor"
                    className={isPerfect ? "text-amber-500" : "text-primary"}
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

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-emerald-600">{actualCorrect}</p>
                <p className="text-[10px] text-emerald-500 font-medium">Benar</p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-rose-600">{totalQuestions - actualCorrect}</p>
                <p className="text-[10px] text-rose-500 font-medium">Salah</p>
              </div>
              <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-violet-600">+{totalXp}</p>
                <p className="text-[10px] text-violet-500 font-medium">XP</p>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Durasi: {minutes > 0 ? `${minutes}m ` : ""}{seconds}d
            </div>

            {/* Wrong answers review */}
            {results.filter((r) => !r.correct).length > 0 && (
              <div className="border-t border-border/50 pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">🔄 Review</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {results.filter((r) => !r.correct).map((r, i) => (
                    <div key={i} className="bg-rose-50 dark:bg-rose-950/20 rounded-xl px-3.5 py-2">
                      <p className="text-xs text-muted-foreground truncate">{r.question}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-rose-500">Jawaban: {r.userAnswer || "(kosong)"}</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">{r.correctAnswer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setPhase("select"); setResults([]); }}
                className="flex-1 py-3 rounded-xl bg-muted text-card-foreground font-semibold text-sm hover:bg-muted/80 transition-colors"
              >
                Pilih Lesson
              </button>
              {selectedLesson && (
                <button
                  onClick={() => { setResults([]); startLesson(selectedLesson); }}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Ulangi
                </button>
              )}
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
