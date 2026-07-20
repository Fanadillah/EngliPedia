"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  Volume2,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FadeIn } from "@/components/ui/motion-components";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/utils/supabase/client";
import { awardXp } from "@/lib/gamification";
import type { Word } from "@/types/word";

type ReviewQuestion = {
  word: Word;
  type: "meaning" | "reverse" | "listening";
  question: string;
  correctAnswer: string;
  options: string[];
};

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function UnitReviewPage() {
  const params = useParams();
  const unitId = params.unitId as string;

  const [loading, setLoading] = useState(true);
  const [unitTitle, setUnitTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [step, setStep] = useState<"intro" | "quiz" | "complete">("intro");

  useEffect(() => {
    loadUnitData();
  }, [unitId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUnitData = async () => {
    setLoading(true);
    const supabase = createClient();

    // Get unit info
    const { data: unit } = await supabase
      .from("units")
      .select("title, course_id")
      .eq("id", unitId)
      .single<{ title: string; course_id: string }>();

    if (unit) {
      setUnitTitle(unit.title);
      setCourseId(unit.course_id);
    }

    // Get all lessons in this unit
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id")
      .eq("unit_id", unitId);

    if (!lessons || lessons.length === 0) {
      setLoading(false);
      return;
    }

    // Get all words from lessons in this unit
    const lessonIds = (lessons as { id: string }[]).map((l) => l.id);
    const { data: lessonWords } = await supabase
      .from("lesson_words")
      .select("word_id, sort_order")
      .in("lesson_id", lessonIds);

    if (!lessonWords || lessonWords.length === 0) {
      setLoading(false);
      return;
    }

    // Get unique word IDs
    const wordIds = [...new Set((lessonWords as { word_id: number }[]).map((lw) => lw.word_id))];

    // Fetch word details
    const { data: wordsData } = await supabase
      .from("words")
      .select("*")
      .in("id", wordIds);

    if (!wordsData || wordsData.length === 0) {
      setLoading(false);
      return;
    }

    const allWords = wordsData as Word[];

    // Generate 10 questions (or all if less than 10)
    const shuffled = shuffleArray(allWords);
    const questionWords = shuffled.slice(0, Math.min(10, shuffled.length));

    const reviewQuestions: ReviewQuestion[] = questionWords.map((word, idx) => {
      const roll = idx % 3;

      if (roll === 0) {
        // English → Indonesian MCQ
        const wrongOptions = shuffleArray(
          allWords.filter((w) => w.id !== word.id && w.meaning_id)
        )
          .slice(0, 3)
          .map((w) => w.meaning_id);

        const options = shuffleArray([word.meaning_id, ...wrongOptions]);

        return {
          word,
          type: "meaning",
          question: word.word,
          correctAnswer: word.meaning_id,
          options,
        };
      } else if (roll === 1) {
        // Indonesian → English MCQ
        const wrongOptions = shuffleArray(
          allWords.filter((w) => w.id !== word.id && w.word)
        )
          .slice(0, 3)
          .map((w) => w.word);

        const options = shuffleArray([word.word, ...wrongOptions]);

        return {
          word,
          type: "reverse",
          question: word.meaning_id,
          correctAnswer: word.word,
          options,
        };
      } else {
        // Listening → type answer
        return {
          word,
          type: "listening",
          question: `Dengarkan dan ketik kata yang kamu dengar`,
          correctAnswer: word.word,
          options: [],
        };
      }
    });

    setQuestions(shuffleArray(reviewQuestions));
    setLoading(false);
  };

  const playWord = (text: string) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  };

  const checkAnswer = (selected: string) => {
    if (result) return;
    setSelectedOption(selected);
    const isCorrect = selected.toLowerCase().trim() === questions[currentIdx].correctAnswer.toLowerCase().trim();
    setResult(isCorrect ? "correct" : "wrong");
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setResult(null);
    } else {
      awardXp("complete_session");
      setStep("complete");
    }
  };

  // ─── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-yellow-50/50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="space-y-4">
            <div className="h-8 w-32 bg-muted/50 animate-pulse rounded" />
            <div className="h-48 bg-muted/50 animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Intro ──────────────────────────────────────────────────────
  if (step === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-yellow-50/50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <Link href={`/learn/${courseId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <FadeIn>
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Unit Review</h1>
              <p className="text-muted-foreground mb-2">{unitTitle}</p>
              <p className="text-sm text-muted-foreground mb-8">
                {questions.length} soal campuran — MCQ & Listening
              </p>
              <Button onClick={() => setStep("quiz")} size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8">
                Mulai Review
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  // ─── Complete ────────────────────────────────────────────────────
  if (step === "complete") {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const grade = percentage >= 90 ? "A" : percentage >= 80 ? "B" : percentage >= 70 ? "C" : percentage >= 60 ? "D" : "F";
    const gradeColor = percentage >= 80 ? "text-green-500" : percentage >= 60 ? "text-yellow-500" : "text-red-500";
    const passed = percentage >= 60;

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-yellow-50/50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <FadeIn>
            <div className="text-center py-12">
              {/* Confetti */}
              <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                {[...Array(25)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      background: ["#f59e0b", "#f97316", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6"][i % 6],
                    }}
                    initial={{ top: -10, opacity: 1, rotate: 0 }}
                    animate={{ top: "110%", opacity: [1, 1, 0], rotate: Math.random() * 720 - 360, x: Math.random() * 200 - 100 }}
                    transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: "easeOut" }}
                  />
                ))}
              </div>

              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${passed ? "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-amber-200 dark:shadow-amber-900/30" : "bg-gradient-to-br from-gray-400 to-gray-500"}`}>
                  <Trophy className="w-14 h-14 text-white" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h1 className="text-3xl font-bold text-foreground mb-1">
                  {passed ? "Luar Biasa!" : "Coba Lagi!"}
                </h1>
                <p className="text-muted-foreground mb-6">Unit Review — {unitTitle}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="rounded-2xl bg-white dark:bg-gray-900 border border-amber-100 dark:border-amber-900/30 p-4 shadow-sm">
                    <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">+30</p>
                    <p className="text-[10px] text-muted-foreground">XP Earned</p>
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-gray-900 border border-green-100 dark:border-green-900/30 p-4 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{percentage}%</p>
                    <p className="text-[10px] text-muted-foreground">Skor</p>
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 p-4 shadow-sm">
                    <Sparkles className="w-5 h-5 text-violet-500 mx-auto mb-1" />
                    <p className={`text-2xl font-bold ${gradeColor}`}>{grade}</p>
                    <p className="text-[10px] text-muted-foreground">Grade</p>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <div className="rounded-2xl bg-white dark:bg-gray-900 border border-amber-100 dark:border-amber-900/30 p-5 mb-8 text-left shadow-sm max-w-sm mx-auto">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Rincian</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Benar</span>
                    <span className="font-medium text-green-600">{score}/{questions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-foreground">Salah</span>
                    <span className="font-medium text-red-500">{questions.length - score}/{questions.length}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                <div className="flex flex-col gap-3">
                  {!passed && (
                    <Button onClick={() => { setScore(0); setCurrentIdx(0); setSelectedOption(null); setResult(null); setStep("intro"); }} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white h-12">
                      Coba Lagi
                    </Button>
                  )}
                  <Link href={`/learn/${courseId}`} className="w-full">
                    <Button variant="outline" className="w-full border-amber-200 dark:border-amber-800">Kembali ke Course</Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  // ─── Quiz ────────────────────────────────────────────────────────
  const q = questions[currentIdx];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-yellow-50/50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/20">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Unit Review</Badge>
          <span>{currentIdx + 1}/{questions.length}</span>
          <span className="ml-auto text-amber-600 dark:text-amber-400 font-medium">{score}/{currentIdx + (result ? 1 : 0)}</span>
        </div>
        <div className="h-2 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden mb-6">
          <motion.div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>

        <FadeIn key={currentIdx}>
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-amber-100 dark:border-amber-900/30 shadow-lg p-6">
            {/* Question type badge */}
            <div className="flex items-center gap-2 mb-4">
              <Badge className={`text-xs ${
                q.type === "meaning" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                : q.type === "reverse" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              }`}>
                {q.type === "meaning" ? "English → Indonesia" : q.type === "reverse" ? "Indonesia → English" : "Listening"}
              </Badge>
            </div>

            {/* Listening: auto play */}
            {q.type === "listening" && (
              <div className="text-center mb-6">
                <button
                  onClick={() => playWord(q.correctAnswer)}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Volume2 className="w-8 h-8 text-white" />
                </button>
                <p className="text-xs text-muted-foreground">Klik untuk mendengarkan</p>
              </div>
            )}

            {/* Question */}
            <p className="text-lg font-semibold text-foreground text-center mb-6">{q.question}</p>

            {/* MCQ options */}
            {q.type !== "listening" && (
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => checkAnswer(opt)}
                    disabled={!!result}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                      result && opt === q.correctAnswer
                        ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        : result && opt === selectedOption
                        ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        : selectedOption === opt
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                        : "border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Listening: type input */}
            {q.type === "listening" && !result && (
              <div className="space-y-3">
                <input
                  type="text"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                      checkAnswer((e.target as HTMLInputElement).value);
                    }
                  }}
                  placeholder="Ketik kata yang kamu dengar..."
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-900 text-foreground text-center text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Result */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2">
                {result === "correct" ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <p className="text-green-600 dark:text-green-400 font-medium">Benar!</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-600 dark:text-red-400 font-medium">Jawaban: {q.correctAnswer}</p>
                  </>
                )}
              </motion.div>
            )}

            {/* Next button */}
            {result && (
              <div className="mt-6">
                <Button onClick={handleNext} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                  {currentIdx < questions.length - 1 ? "Selanjutnya" : "Lihat Hasil"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
