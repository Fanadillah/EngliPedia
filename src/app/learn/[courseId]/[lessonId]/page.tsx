"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FadeIn } from "@/components/ui/motion-components";
import { motion, AnimatePresence } from "motion/react";
import { getLessonWords, updateLessonProgress } from "@/lib/learning";
import { awardXp } from "@/lib/gamification";
import type { Word } from "@/types/word";
import { createClient } from "@/utils/supabase/client";

type Step = "intro" | "learn" | "practice" | "complete";

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function LessonPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [words, setWords] = useState<(Word & { sort_order: number })[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [step, setStep] = useState<Step>("intro");
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lessonTitle, setLessonTitle] = useState("");
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());

  const [practiceWords, setPracticeWords] = useState<(Word & { sort_order: number })[]>([]);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceOptions, setPracticeOptions] = useState<string[]>([]);

  const loadLesson = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: lesson } = await supabase
        .from("lessons")
        .select("title")
        .eq("id", lessonId)
        .single<{ title: string }>();

      if (lesson) setLessonTitle(lesson.title);

      const lessonWords = await getLessonWords(lessonId);
      setWords(lessonWords);

      await updateLessonProgress(lessonId, "in_progress", 0, 0);
    } catch (error) {
      console.error("Failed to load lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLesson();
  }, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartLesson = () => {
    setStep("learn");
    setCurrentWordIndex(0);
    setShowMeaning(false);
  };

  const handleNextWord = () => {
    setShowMeaning(false);

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      startPractice();
    }
  };

  const handlePrevWord = () => {
    if (currentWordIndex > 0) {
      setShowMeaning(false);
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  const startPractice = () => {
    const shuffled = shuffleArray(words);
    setPracticeWords(shuffled);
    setCurrentPracticeIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setPracticeScore(0);
    setStep("practice");
  };

  const buildOptionsForWord = (correctWord: Word) => {
    const allMeanings = words
      .filter((w) => w.id !== correctWord.id)
      .map((w) => w.meaning_id);
    const wrongAnswers = shuffleArray(allMeanings).slice(0, 3);
    return shuffleArray([correctWord.meaning_id, ...wrongAnswers]);
  };

  useEffect(() => {
    if (step === "practice" && practiceWords.length > 0) {
      setPracticeOptions(buildOptionsForWord(practiceWords[currentPracticeIndex]));
    }
  }, [step, currentPracticeIndex, practiceWords]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const correct = answer === practiceWords[currentPracticeIndex].meaning_id;
    setIsCorrect(correct);

    if (correct) {
      setPracticeScore((prev) => prev + 1);
      setCompletedWords((prev) => new Set([...prev, practiceWords[currentPracticeIndex].id]));
    }

    setTimeout(() => {
      if (currentPracticeIndex < practiceWords.length - 1) {
        setCurrentPracticeIndex(currentPracticeIndex + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        finishLesson();
      }
    }, 1500);
  };

  const finishLesson = async () => {
    const learned = completedWords.size;
    const score = practiceWords.length > 0 ? Math.round((practiceScore / practiceWords.length) * 100) : 0;

    await updateLessonProgress(lessonId, "completed", learned, score);

    awardXp("complete_session");

    setStep("complete");
  };

  const playPronunciation = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="space-y-4">
            <div className="h-8 w-32 bg-muted/50 animate-pulse rounded" />
            <div className="h-64 bg-muted/50 animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <Link
            href={`/learn/${courseId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <div className="text-center py-16">
            <p className="text-muted-foreground">Tidak ada kata dalam lesson ini</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <Link
            href={`/learn/${courseId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>

          <FadeIn>
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-violet-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{lessonTitle}</h1>
              <p className="text-muted-foreground mb-2">
                {words.length} kata untuk dipelajari
              </p>
              <div className="flex items-center justify-center gap-2 mb-8">
                {words.slice(0, 5).map((w) => (
                  <Badge key={w.id} className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                    {w.word}
                  </Badge>
                ))}
                {words.length > 5 && (
                  <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    +{words.length - 5}
                  </Badge>
                )}
              </div>
              <Button
                onClick={handleStartLesson}
                size="lg"
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8"
              >
                Mulai Belajar
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  if (step === "learn") {
    const currentWord = words[currentWordIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Link
                href={`/learn/${courseId}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Keluar
              </Link>
              <span className="text-sm text-muted-foreground">
                {currentWordIndex + 1}/{words.length}
              </span>
            </div>
            <div className="h-2 bg-violet-100 dark:bg-violet-900/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentWord.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 shadow-lg overflow-hidden">
                <div className="p-8 text-center border-b border-violet-50 dark:border-violet-900/20">
                  <h2 className="text-4xl font-bold text-foreground mb-2">{currentWord.word}</h2>
                  {currentWord.ipa && (
                    <p className="text-lg text-muted-foreground mb-2">/{currentWord.ipa}/</p>
                  )}
                  {currentWord.cara_baca && (
                    <p className="text-sm text-violet-500 mb-4">{currentWord.cara_baca}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => playPronunciation(currentWord.word)}
                    className="border-violet-200 dark:border-violet-800"
                  >
                    <Volume2 className="w-4 h-4 mr-1" />
                    Dengarkan
                  </Button>
                </div>

                <div className="p-6">
                  {!showMeaning ? (
                    <Button
                      onClick={() => setShowMeaning(true)}
                      variant="outline"
                      className="w-full border-violet-200 dark:border-violet-800"
                    >
                      Tunjukkan Arti
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 mb-2">
                          {currentWord.pos}
                        </Badge>
                        <h3 className="text-xl font-semibold text-foreground">{currentWord.meaning_id}</h3>
                      </div>

                      {currentWord.example && (
                        <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4">
                          <p className="text-sm text-foreground italic">&quot;{currentWord.example}&quot;</p>
                          {currentWord.example_id && (
                            <p className="text-xs text-muted-foreground mt-1">&quot;{currentWord.example_id}&quot;</p>
                          )}
                        </div>
                      )}

                      <Button
                        onClick={() => playPronunciation(currentWord.word)}
                        variant="ghost"
                        className="w-full text-violet-600 dark:text-violet-400"
                      >
                        <Volume2 className="w-4 h-4 mr-1" />
                        Dengarkan lagi
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handlePrevWord}
                  disabled={currentWordIndex === 0}
                  variant="outline"
                  className="flex-1 border-violet-200 dark:border-violet-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Sebelumnya
                </Button>
                <Button
                  onClick={handleNextWord}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                >
                  {currentWordIndex === words.length - 1 ? "Mulai Quiz" : "Selanjutnya"}
                  {currentWordIndex < words.length - 1 && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (step === "practice") {
    const currentWord = practiceWords[currentPracticeIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Quiz</span>
              <span className="text-sm text-muted-foreground">
                {currentPracticeIndex + 1}/{practiceWords.length}
              </span>
            </div>
            <div className="h-2 bg-violet-100 dark:bg-violet-900/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentPracticeIndex + 1) / practiceWords.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentWord.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 shadow-lg p-8 text-center mb-6">
                <p className="text-sm text-muted-foreground mb-4">Apa artinya?</p>
                <h2 className="text-3xl font-bold text-foreground mb-2">{currentWord.word}</h2>
                {currentWord.ipa && (
                  <p className="text-muted-foreground">/{currentWord.ipa}/</p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => playPronunciation(currentWord.word)}
                  className="mt-4"
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  Dengarkan
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {practiceOptions.map((option) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer = option === currentWord.meaning_id;
                  const showResult = selectedAnswer !== null;

                  let bgColor = "bg-white dark:bg-gray-900 border-violet-100 dark:border-violet-900/30";
                  if (showResult && isCorrectAnswer) {
                    bgColor = "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700";
                  } else if (showResult && isSelected && !isCorrectAnswer) {
                    bgColor = "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700";
                  }

                  return (
                    <Button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                      variant="outline"
                      className={`h-auto py-4 text-base font-medium ${bgColor}`}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>

              {selectedAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  {isCorrect ? (
                    <p className="text-green-600 dark:text-green-400 font-medium">Benar!</p>
                  ) : (
                    <p className="text-red-600 dark:text-red-400 font-medium">
                      Jawaban: {currentWord.meaning_id}
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (step === "complete") {
    const score = practiceWords.length > 0 ? Math.round((practiceScore / practiceWords.length) * 100) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <FadeIn>
            <div className="text-center py-16">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <h1 className="text-3xl font-bold text-foreground mb-2">Selesai!</h1>
              <p className="text-muted-foreground mb-8">Kamu sudah menyelesaikan lesson ini</p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 p-4">
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {words.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Kata Dipelajari</p>
                </div>
                <div className="rounded-xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 p-4">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {score}%
                  </p>
                  <p className="text-xs text-muted-foreground">Skor Quiz</p>
                </div>
                <div className="rounded-xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 p-4">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    +{10 + (score >= 80 ? 5 : 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">XP Didapat</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href={`/learn/${courseId}`} className="flex-1">
                  <Button variant="outline" className="w-full border-violet-200 dark:border-violet-800">
                    Kembali ke Course
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
                    Beranda
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  return null;
}
