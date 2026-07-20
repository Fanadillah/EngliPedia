"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  CheckCircle2,
  BookOpen,
  Pen,
  Headphones,
  Type,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { FadeIn } from "@/components/ui/motion-components";
import { motion, AnimatePresence } from "motion/react";
import { getLessonWords, updateLessonProgress, addMistake } from "@/lib/learning";
import { awardXp } from "@/lib/gamification";
import type { Word } from "@/types/word";
import { createClient } from "@/utils/supabase/client";

type Step =
  | "intro"
  | "vocabulary"
  | "pronunciation"
  | "fill_blank"
  | "listening"
  | "writing"
  | "complete";

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
  const [lessonType, setLessonType] = useState("vocabulary");
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());

  // Pronunciation state
  const [pronIndex, setPronIndex] = useState(0);

  // Fill-in-the-blank state
  const [fbWords, setFbWords] = useState<(Word & { sort_order: number })[]>([]);
  const [fbIndex, setFbIndex] = useState(0);
  const [fbAnswer, setFbAnswer] = useState("");
  const [fbCorrect, setFbCorrect] = useState<boolean | null>(null);
  const [fbScore, setFbScore] = useState(0);

  // Listening state
  const [listenWords, setListenWords] = useState<(Word & { sort_order: number })[]>([]);
  const [listenIndex, setListenIndex] = useState(0);
  const [listenInput, setListenInput] = useState("");
  const [listenCorrect, setListenCorrect] = useState<boolean | null>(null);
  const [listenScore, setListenScore] = useState(0);

  // Writing state
  const [writingWords, setWritingWords] = useState<(Word & { sort_order: number })[]>([]);
  const [writingIndex, setWritingIndex] = useState(0);
  const [writingInput, setWritingInput] = useState("");
  const [writingAccepted, setWritingAccepted] = useState<boolean | null>(null);
  const [writingScore, setWritingScore] = useState(0);

  // Overall score
  const [totalActivities, setTotalActivities] = useState(0);
  const [completedActivities, setCompletedActivities] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Load Lesson ───────────────────────────────────────────────────
  const loadLesson = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: lesson } = await supabase
        .from("lessons")
        .select("title, lesson_type")
        .eq("id", lessonId)
        .single<{ title: string; lesson_type: string }>();

      if (lesson) {
        setLessonTitle(lesson.title);
        setLessonType(lesson.lesson_type || "vocabulary");
      }

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

  // ─── Helpers ───────────────────────────────────────────────────────
  const playPronunciation = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const normalize = (s: string) => s.toLowerCase().trim().replace(/[.,!?;'"]/g, "");

  // ─── Intro → Vocabulary ───────────────────────────────────────────
  const handleStartLesson = () => {
    setStep("vocabulary");
    setCurrentWordIndex(0);
    setShowMeaning(false);
  };

  // ─── Vocabulary Navigation ─────────────────────────────────────────
  const handleNextWord = () => {
    setShowMeaning(false);
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      startPronunciation();
    }
  };

  const handlePrevWord = () => {
    if (currentWordIndex > 0) {
      setShowMeaning(false);
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  // ─── Pronunciation Step ────────────────────────────────────────────
  const startPronunciation = () => {
    setPronIndex(0);
    setTotalActivities((prev) => prev + words.length);
    setStep("pronunciation");
  };

  const handlePronNext = () => {
    if (pronIndex < words.length - 1) {
      setPronIndex(pronIndex + 1);
    } else {
      startFillBlank();
    }
  };

  // ─── Fill-in-the-Blank Step ────────────────────────────────────────
  const startFillBlank = () => {
    const shuffled = shuffleArray(words);
    setFbWords(shuffled);
    setFbIndex(0);
    setFbAnswer("");
    setFbCorrect(null);
    setFbScore(0);
    setTotalActivities((prev) => prev + shuffled.length);
    setStep("fill_blank");
  };

  const handleFbSubmit = () => {
    const correct = normalize(fbAnswer) === normalize(fbWords[fbIndex].meaning_id);
    setFbCorrect(correct);

    if (correct) {
      setFbScore((prev) => prev + 1);
      setCompletedActivities((prev) => prev + 1);
    } else {
      addMistake(fbWords[fbIndex].id, lessonTitle);
    }

    setTimeout(() => {
      if (fbIndex < fbWords.length - 1) {
        setFbIndex(fbIndex + 1);
        setFbAnswer("");
        setFbCorrect(null);
      } else {
        startListening();
      }
    }, 1500);
  };

  // ─── Listening Step ────────────────────────────────────────────────
  const startListening = () => {
    const shuffled = shuffleArray(words).slice(0, Math.min(5, words.length));
    setListenWords(shuffled);
    setListenIndex(0);
    setListenInput("");
    setListenCorrect(null);
    setListenScore(0);
    setTotalActivities((prev) => prev + shuffled.length);

    // Auto play first word
    setTimeout(() => {
      if (shuffled.length > 0) playPronunciation(shuffled[0].word);
    }, 500);

    setStep("listening");
  };

  const handleListenSubmit = () => {
    const correct = normalize(listenInput) === normalize(listenWords[listenIndex].word);
    setListenCorrect(correct);

    if (correct) {
      setListenScore((prev) => prev + 1);
      setCompletedActivities((prev) => prev + 1);
    } else {
      addMistake(listenWords[listenIndex].id, lessonTitle);
    }

    setTimeout(() => {
      if (listenIndex < listenWords.length - 1) {
        const nextIdx = listenIndex + 1;
        setListenIndex(nextIdx);
        setListenInput("");
        setListenCorrect(null);
        playPronunciation(listenWords[nextIdx].word);
      } else {
        startWriting();
      }
    }, 1500);
  };

  // ─── Writing Step ──────────────────────────────────────────────────
  const startWriting = () => {
    const shuffled = shuffleArray(words).slice(0, Math.min(3, words.length));
    setWritingWords(shuffled);
    setWritingIndex(0);
    setWritingInput("");
    setWritingAccepted(null);
    setWritingScore(0);
    setTotalActivities((prev) => prev + shuffled.length);
    setStep("writing");
  };

  const handleWritingSubmit = () => {
    const word = writingWords[writingIndex];
    const inputNorm = normalize(writingInput);
    const correct =
      inputNorm === normalize(word.word) ||
      inputNorm === normalize(word.meaning_id);
    setWritingAccepted(correct);

    if (correct) {
      setWritingScore((prev) => prev + 1);
      setCompletedActivities((prev) => prev + 1);
    } else {
      addMistake(word.id, lessonTitle);
    }

    setTimeout(() => {
      if (writingIndex < writingWords.length - 1) {
        setWritingIndex(writingIndex + 1);
        setWritingInput("");
        setWritingAccepted(null);
      } else {
        finishLesson();
      }
    }, 1500);
  };

  // ─── Finish ────────────────────────────────────────────────────────
  const finishLesson = async () => {
    const learned = completedWords.size;
    const score = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    await updateLessonProgress(lessonId, "completed", learned, score);
    awardXp("complete_session");
    setStep("complete");
  };

  // ─── Loading / Empty ──────────────────────────────────────────────
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
          <Link href={`/learn/${courseId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <div className="text-center py-16">
            <p className="text-muted-foreground">Tidak ada kata dalam lesson ini</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── INTRO ────────────────────────────────────────────────────────
  if (step === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <Link href={`/learn/${courseId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <FadeIn>
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-violet-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{lessonTitle}</h1>
              <p className="text-muted-foreground mb-2">{words.length} kata untuk dipelajari</p>
              <div className="flex items-center justify-center gap-2 mb-6">
                {words.slice(0, 5).map((w) => (
                  <Badge key={w.id} className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">{w.word}</Badge>
                ))}
                {words.length > 5 && <Badge className="bg-gray-100 text-gray-600">+{words.length - 5}</Badge>}
              </div>

              {/* Activity overview */}
              <div className="grid grid-cols-2 gap-3 mb-8 text-left max-w-sm mx-auto">
                {[
                  { icon: BookOpen, label: "Vocabulary", color: "text-violet-500" },
                  { icon: Volume2, label: "Pronunciation", color: "text-blue-500" },
                  { icon: Pen, label: "Fill in the Blank", color: "text-green-500" },
                  { icon: Headphones, label: "Listening", color: "text-orange-500" },
                  { icon: Type, label: "Writing", color: "text-pink-500" },
                ].map((a) => (
                  <div key={a.label} className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-gray-900/50">
                    <a.icon className={`w-4 h-4 ${a.color}`} />
                    <span className="text-xs font-medium text-foreground">{a.label}</span>
                  </div>
                ))}
              </div>

              <Button onClick={handleStartLesson} size="lg" className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8">
                Mulai Belajar
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  // ─── VOCABULARY ────────────────────────────────────────────────────
  if (step === "vocabulary") {
    const currentWord = words[currentWordIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">Vocabulary</Badge>
            <span>{currentWordIndex + 1}/{words.length}</span>
          </div>
          <div className="h-2 bg-violet-100 dark:bg-violet-900/30 rounded-full overflow-hidden mb-6">
            <motion.div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentWord.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 shadow-lg overflow-hidden">
                <div className="p-8 text-center border-b border-violet-50 dark:border-violet-900/20">
                  <h2 className="text-4xl font-bold text-foreground mb-2">{currentWord.word}</h2>
                  {currentWord.ipa && <p className="text-lg text-muted-foreground mb-2">/{currentWord.ipa}/</p>}
                  {currentWord.cara_baca && <p className="text-sm text-violet-500 mb-4">{currentWord.cara_baca}</p>}
                  <Button variant="outline" size="sm" onClick={() => playPronunciation(currentWord.word)} className="border-violet-200 dark:border-violet-800">
                    <Volume2 className="w-4 h-4 mr-1" /> Dengarkan
                  </Button>
                </div>
                <div className="p-6">
                  {!showMeaning ? (
                    <Button onClick={() => setShowMeaning(true)} variant="outline" className="w-full border-violet-200 dark:border-violet-800">Tunjukkan Arti</Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 mb-2">{currentWord.pos}</Badge>
                        <h3 className="text-xl font-semibold text-foreground">{currentWord.meaning_id}</h3>
                      </div>
                      {currentWord.example && (
                        <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4">
                          <p className="text-sm text-foreground italic">&quot;{currentWord.example}&quot;</p>
                          {currentWord.example_id && <p className="text-xs text-muted-foreground mt-1">&quot;{currentWord.example_id}&quot;</p>}
                        </div>
                      )}
                      <Button onClick={() => playPronunciation(currentWord.word)} variant="ghost" className="w-full text-violet-600 dark:text-violet-400">
                        <Volume2 className="w-4 h-4 mr-1" /> Dengarkan lagi
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handlePrevWord} disabled={currentWordIndex === 0} variant="outline" className="flex-1 border-violet-200 dark:border-violet-800">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Sebelumnya
                </Button>
                <Button onClick={handleNextWord} className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
                  {currentWordIndex === words.length - 1 ? "Selanjutnya" : "Selanjutnya"}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ─── PRONUNCIATION ─────────────────────────────────────────────────
  if (step === "pronunciation") {
    const w = words[pronIndex];
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-cyan-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-cyan-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Pronunciation</Badge>
            <span>{pronIndex + 1}/{words.length}</span>
          </div>
          <div className="h-2 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden mb-6">
            <motion.div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${((pronIndex + 1) / words.length) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>

          <FadeIn>
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground mb-6">Dengarkan dan ucapkan</p>
              <h2 className="text-5xl font-bold text-foreground mb-3">{w.word}</h2>
              {w.ipa && <p className="text-xl text-muted-foreground mb-2">/{w.ipa}/</p>}
              {w.cara_baca && <p className="text-base text-blue-500 mb-6">"{w.cara_baca}"</p>}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => playPronunciation(w.word)}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg mb-8"
              >
                <Volume2 className="w-8 h-8 text-white" />
              </motion.button>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 max-w-sm mx-auto mb-8">
                <p className="text-sm text-muted-foreground mb-1">Arti:</p>
                <p className="font-semibold text-foreground">{w.meaning_id}</p>
              </div>

              <Button onClick={handlePronNext} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8">
                {pronIndex < words.length - 1 ? "Selanjutnya" : "Selanjutnya"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  // ─── FILL-IN-THE-BLANK ─────────────────────────────────────────────
  if (step === "fill_blank") {
    const w = fbWords[fbIndex];
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-teal-50/50 dark:from-green-950/20 dark:via-emerald-950/10 dark:to-teal-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Fill in the Blank</Badge>
            <span>{fbIndex + 1}/{fbWords.length}</span>
          </div>
          <div className="h-2 bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden mb-6">
            <motion.div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${((fbIndex + 1) / fbWords.length) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>

          <FadeIn>
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-green-100 dark:border-green-900/30 shadow-lg p-8 text-center mb-6">
              <p className="text-sm text-muted-foreground mb-4">Tuliskan arti dari kata ini:</p>
              <h2 className="text-4xl font-bold text-foreground mb-2">{w.word}</h2>
              {w.ipa && <p className="text-muted-foreground">/{w.ipa}/</p>}
              <Button variant="ghost" size="sm" onClick={() => playPronunciation(w.word)} className="mt-3">
                <Volume2 className="w-4 h-4 mr-1" /> Dengarkan
              </Button>
            </div>

            <div className="space-y-4">
              <input
                ref={inputRef}
                type="text"
                value={fbAnswer}
                onChange={(e) => setFbAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fbAnswer && !fbCorrect && handleFbSubmit()}
                placeholder="Ketik artinya..."
                disabled={fbCorrect !== null}
                className="w-full px-4 py-3 rounded-xl border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900 text-foreground text-center text-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              />

              {fbCorrect === null ? (
                <Button onClick={handleFbSubmit} disabled={!fbAnswer} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                  Cek Jawaban
                </Button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  {fbCorrect ? (
                    <p className="text-green-600 dark:text-green-400 font-medium">Benar!</p>
                  ) : (
                    <p className="text-red-600 dark:text-red-400 font-medium">Jawaban: {w.meaning_id}</p>
                  )}
                </motion.div>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  // ─── LISTENING ─────────────────────────────────────────────────────
  if (step === "listening") {
    const w = listenWords[listenIndex];
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-yellow-50/50 dark:from-orange-950/20 dark:via-amber-950/10 dark:to-yellow-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Listening</Badge>
            <span>{listenIndex + 1}/{listenWords.length}</span>
          </div>
          <div className="h-2 bg-orange-100 dark:bg-orange-900/30 rounded-full overflow-hidden mb-6">
            <motion.div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${((listenIndex + 1) / listenWords.length) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>

          <FadeIn>
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-6">Dengarkan dan ketik kata yang kamu dengar</p>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => playPronunciation(w.word)}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto shadow-lg mb-8"
              >
                <Headphones className="w-10 h-10 text-white" />
              </motion.button>

              <div className="space-y-4 max-w-sm mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  value={listenInput}
                  onChange={(e) => setListenInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && listenInput && !listenCorrect && handleListenSubmit()}
                  placeholder="Ketik yang kamu dengar..."
                  disabled={listenCorrect !== null}
                  className="w-full px-4 py-3 rounded-xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 text-foreground text-center text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                  autoFocus
                />

                {listenCorrect === null ? (
                  <Button onClick={handleListenSubmit} disabled={!listenInput} className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white">
                    Cek Jawaban
                  </Button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    {listenCorrect ? (
                      <p className="text-green-600 dark:text-green-400 font-medium">Benar!</p>
                    ) : (
                      <div>
                        <p className="text-red-600 dark:text-red-400 font-medium mb-1">Jawaban: {w.word}</p>
                        <p className="text-sm text-muted-foreground">{w.meaning_id}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  // ─── WRITING ───────────────────────────────────────────────────────
  if (step === "writing") {
    const w = writingWords[writingIndex];
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50/50 via-rose-50/30 to-fuchsia-50/50 dark:from-pink-950/20 dark:via-rose-950/10 dark:to-fuchsia-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">Writing</Badge>
            <span>{writingIndex + 1}/{writingWords.length}</span>
          </div>
          <div className="h-2 bg-pink-100 dark:bg-pink-900/30 rounded-full overflow-hidden mb-6">
            <motion.div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${((writingIndex + 1) / writingWords.length) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>

          <FadeIn>
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-pink-100 dark:border-pink-900/30 shadow-lg p-8 text-center mb-6">
              <Lightbulb className="w-8 h-8 text-pink-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">Tulis kata dalam bahasa Inggris untuk arti ini:</p>
              <h2 className="text-3xl font-bold text-foreground mb-2">{w.meaning_id}</h2>
              {w.ipa && <p className="text-sm text-muted-foreground">/{w.ipa}/</p>}
            </div>

            <div className="space-y-4">
              <input
                ref={inputRef}
                type="text"
                value={writingInput}
                onChange={(e) => setWritingInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && writingInput && !writingAccepted && handleWritingSubmit()}
                placeholder="Ketik kata dalam bahasa Inggris..."
                disabled={writingAccepted !== null}
                className="w-full px-4 py-3 rounded-xl border border-pink-200 dark:border-pink-800 bg-white dark:bg-gray-900 text-foreground text-center text-lg focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                autoFocus
              />

              {writingAccepted === null ? (
                <Button onClick={handleWritingSubmit} disabled={!writingInput} className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white">
                  Cek Jawaban
                </Button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  {writingAccepted ? (
                    <p className="text-green-600 dark:text-green-400 font-medium">Benar!</p>
                  ) : (
                    <p className="text-red-600 dark:text-red-400 font-medium">Jawaban: {w.word}</p>
                  )}
                </motion.div>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  // ─── COMPLETE ──────────────────────────────────────────────────────
  if (step === "complete") {
    const score = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <FadeIn>
            <div className="text-center py-16">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <h1 className="text-3xl font-bold text-foreground mb-2">Selesai!</h1>
              <p className="text-muted-foreground mb-8">Kamu sudah menyelesaikan semua aktivitas</p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="rounded-xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 p-4">
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{words.length}</p>
                  <p className="text-xs text-muted-foreground">Kata Dipelajari</p>
                </div>
                <div className="rounded-xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 p-4">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{score}%</p>
                  <p className="text-xs text-muted-foreground">Skor Total</p>
                </div>
              </div>

              {/* Activity breakdown */}
              <div className="rounded-xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 p-4 mb-8 text-left max-w-sm mx-auto space-y-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Aktivitas selesai:</p>
                {[
                  { label: "Vocabulary", icon: BookOpen, color: "text-violet-500", count: words.length },
                  { label: "Pronunciation", icon: Volume2, color: "text-blue-500", count: words.length },
                  { label: "Fill in the Blank", icon: Pen, color: "text-green-500", count: fbWords.length, score: fbScore },
                  { label: "Listening", icon: Headphones, color: "text-orange-500", count: listenWords.length, score: listenScore },
                  { label: "Writing", icon: Type, color: "text-pink-500", count: writingWords.length, score: writingScore },
                ].map((a) => (
                  <div key={a.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <a.icon className={`w-4 h-4 ${a.color}`} />
                      <span className="text-foreground">{a.label}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {a.score !== undefined ? `${a.score}/${a.count}` : `${a.count}`}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Link href={`/learn/${courseId}`} className="flex-1">
                  <Button variant="outline" className="w-full border-violet-200 dark:border-violet-800">Kembali ke Course</Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">Beranda</Button>
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
