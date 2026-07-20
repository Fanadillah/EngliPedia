"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  Volume2,
  CheckCircle2,
  BookOpen,
  Pen,
  Headphones,
  Type,
  Lightbulb,
  Trophy,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { FadeIn } from "@/components/ui/motion-components";
import { motion, AnimatePresence } from "motion/react";
import { getLessonWords, getLessonContent, updateLessonProgress, addMistake } from "@/lib/learning";
import { awardXp } from "@/lib/gamification";
import type { Word } from "@/types/word";
import type { LessonContent } from "@/types/learning";
import { createClient } from "@/utils/supabase/client";
import { GrammarExplanation } from "@/components/grammar/grammar-explanation";
import { GrammarExample } from "@/components/grammar/grammar-example";
import { GrammarExercise } from "@/components/grammar/grammar-exercise";

type Step =
  | "intro"
  | "vocabulary"
  | "pronunciation"
  | "fill_blank"
  | "listening"
  | "writing"
  | "grammar_explanation"
  | "grammar_examples"
  | "grammar_practice"
  | "complete";

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type ListeningQuestion = {
  type: "multiple_choice" | "dictation" | "sentence_mcq" | "sentence_blank";
  word: Word & { sort_order: number };
  audio: string;
  correctAnswer: string;
  options?: string[];
  sentence?: string;
  sentenceTranslation?: string;
};

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
  const [listenQuestions, setListenQuestions] = useState<ListeningQuestion[]>([]);
  const [listenQIndex, setListenQIndex] = useState(0);
  const [listenInput, setListenInput] = useState("");
  const [listenCorrect, setListenCorrect] = useState<boolean | null>(null);
  const [listenScore, setListenScore] = useState(0);
  const [listenSpeed, setListenSpeed] = useState(1);
  const [listenSelectedOption, setListenSelectedOption] = useState<string | null>(null);

  // Writing state
  const [writingWords, setWritingWords] = useState<(Word & { sort_order: number })[]>([]);
  const [writingIndex, setWritingIndex] = useState(0);
  const [writingInput, setWritingInput] = useState("");
  const [writingAccepted, setWritingAccepted] = useState<boolean | null>(null);
  const [writingScore, setWritingScore] = useState(0);

  // Grammar state
  const [lessonContent, setLessonContent] = useState<LessonContent[]>([]);
  const [grammarExplanationIndex, setGrammarExplanationIndex] = useState(0);
  const [grammarExampleIndex, setGrammarExampleIndex] = useState(0);
  const [grammarExerciseIndex, setGrammarExerciseIndex] = useState(0);
  const [grammarScore, setGrammarScore] = useState(0);
  const [grammarExerciseAnswered, setGrammarExerciseAnswered] = useState(false);

  // Overall score
  const [totalActivities, setTotalActivities] = useState(0);
  const [completedActivities, setCompletedActivities] = useState(0);
  const [nextLessonInfo, setNextLessonInfo] = useState<{ lessonId: string; title: string } | null>(null);

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

      // Load grammar content if grammar lesson
      if ((lesson?.lesson_type || "vocabulary") === "grammar") {
        const content = await getLessonContent(lessonId);
        setLessonContent(content);
      }

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

  // Find next lesson in course
  useEffect(() => {
    const findNextLesson = async () => {
      const supabase = createClient();
      const { data: currentLesson } = await supabase
        .from("lessons")
        .select("unit_id, sort_order")
        .eq("id", lessonId)
        .single<{ unit_id: string; sort_order: number }>();

      if (!currentLesson) return;

      const { data: nextInUnit } = await supabase
        .from("lessons")
        .select("id, title")
        .eq("unit_id", currentLesson.unit_id)
        .gt("sort_order", currentLesson.sort_order)
        .order("sort_order")
        .limit(1)
        .single<{ id: string; title: string }>();

      if (nextInUnit) {
        setNextLessonInfo({ lessonId: nextInUnit.id, title: nextInUnit.title });
        return;
      }

      const { data: currentUnit } = await supabase
        .from("units")
        .select("course_id, sort_order")
        .eq("id", currentLesson.unit_id)
        .single<{ course_id: string; sort_order: number }>();

      if (!currentUnit) return;

      const { data: nextUnit } = await supabase
        .from("units")
        .select("id")
        .eq("course_id", currentUnit.course_id)
        .gt("sort_order", currentUnit.sort_order)
        .order("sort_order")
        .limit(1)
        .single<{ id: string }>();

      if (!nextUnit) return;

      const { data: firstLesson } = await supabase
        .from("lessons")
        .select("id, title")
        .eq("unit_id", nextUnit.id)
        .order("sort_order")
        .limit(1)
        .single<{ id: string; title: string }>();

      if (firstLesson) {
        setNextLessonInfo({ lessonId: firstLesson.id, title: firstLesson.title });
      }
    };

    findNextLesson();
  }, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Helpers ───────────────────────────────────────────────────────
  const playPronunciation = (text: string, rate?: number) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rate ?? listenSpeed;
      speechSynthesis.speak(utterance);
    }
  };

  // ─── Listening Question Generator ────────────────────────────────
  const normalize = (s: string) => s.toLowerCase().trim().replace(/[.,!?;'"]/g, "");

  const generateListeningQuestions = (): ListeningQuestion[] => {
    const questions: ListeningQuestion[] = [];
    const allMeanings = words.map((w) => w.meaning_id);

    // Multiple Choice: hear word → pick meaning (2 questions)
    const mcqWords = shuffleArray(words).slice(0, 2);
    for (const w of mcqWords) {
      const distractors = shuffleArray(allMeanings.filter((m) => m !== w.meaning_id)).slice(0, 3);
      const options = shuffleArray([w.meaning_id, ...distractors]);
      questions.push({
        type: "multiple_choice",
        word: w,
        audio: w.word,
        correctAnswer: w.meaning_id,
        options,
      });
    }

    // Dictation: hear word → type it (3 questions)
    const dictWords = shuffleArray(words).slice(0, 3);
    for (const w of dictWords) {
      questions.push({
        type: "dictation",
        word: w,
        audio: w.word,
        correctAnswer: w.word,
      });
    }

    // Sentence MCQ: hear sentence → pick meaning (2 questions)
    const sentenceWords = shuffleArray(words.filter((w) => w.example && w.example_id)).slice(0, 2);
    for (const w of sentenceWords) {
      const otherMeanings = shuffleArray(
        words.filter((x) => x.id !== w.id && x.example_id).map((x) => x.example_id)
      ).slice(0, 3);
      const options = shuffleArray([w.example_id, ...otherMeanings]);
      questions.push({
        type: "sentence_mcq",
        word: w,
        audio: w.example,
        correctAnswer: w.example_id,
        options,
        sentence: w.example,
        sentenceTranslation: w.example_id,
      });
    }

    // Sentence Blank: hear sentence → type missing word (1 question)
    const blankWord = shuffleArray(words.filter((w) => w.example)).slice(0, 1)[0];
    if (blankWord) {
      const blankedSentence = blankWord.example.replace(
        new RegExp(`\\b${blankWord.word}\\b`, "i"),
        "______"
      );
      questions.push({
        type: "sentence_blank",
        word: blankWord,
        audio: blankWord.example,
        correctAnswer: blankWord.word,
        sentence: blankedSentence,
        sentenceTranslation: blankWord.example_id,
      });
    }

    return shuffleArray(questions);
  };

  // ─── Intro → Start ──────────────────────────────────────────────
  const handleStartLesson = () => {
    if (lessonType === "grammar") {
      setStep("grammar_explanation");
      setGrammarExplanationIndex(0);
      setGrammarExampleIndex(0);
      setGrammarExerciseIndex(0);
      setGrammarScore(0);
    } else {
      setStep("vocabulary");
      setCurrentWordIndex(0);
      setShowMeaning(false);
    }
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
    const questions = generateListeningQuestions();
    setListenQuestions(questions);
    setListenQIndex(0);
    setListenInput("");
    setListenCorrect(null);
    setListenScore(0);
    setListenSpeed(1);
    setListenSelectedOption(null);
    setTotalActivities((prev) => prev + questions.length);

    setTimeout(() => {
      if (questions.length > 0) playPronunciation(questions[0].audio);
    }, 500);

    setStep("listening");
  };

  const handleListenSubmit = () => {
    const q = listenQuestions[listenQIndex];
    let correct = false;

    if (q.type === "multiple_choice" || q.type === "sentence_mcq") {
      correct = listenSelectedOption === q.correctAnswer;
    } else {
      correct = normalize(listenInput) === normalize(q.correctAnswer);
    }

    setListenCorrect(correct);

    if (correct) {
      setListenScore((prev) => prev + 1);
      setCompletedActivities((prev) => prev + 1);
    } else {
      addMistake(q.word.id, lessonTitle);
    }

    setTimeout(() => {
      if (listenQIndex < listenQuestions.length - 1) {
        const nextIdx = listenQIndex + 1;
        setListenQIndex(nextIdx);
        setListenInput("");
        setListenCorrect(null);
        setListenSelectedOption(null);
        setTimeout(() => playPronunciation(listenQuestions[nextIdx].audio), 300);
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

  // ─── Grammar Flow ──────────────────────────────────────────────────
  const explanations = lessonContent.filter((c) => c.content_type === "explanation");
  const examples = lessonContent.filter((c) => c.content_type === "example");
  const exercises = lessonContent.filter((c) => c.content_type === "exercise");

  const handleGrammarNextExplanation = (currentIdx: number) => {
    if (currentIdx < explanations.length - 1) {
      setGrammarExplanationIndex(currentIdx + 1);
    } else {
      setStep("grammar_examples");
      setGrammarExampleIndex(0);
    }
  };

  const handleGrammarNextExample = (currentIdx: number) => {
    if (currentIdx < examples.length - 1) {
      setGrammarExampleIndex(currentIdx + 1);
    } else {
      setStep("grammar_practice");
      setGrammarExerciseIndex(0);
      setGrammarScore(0);
      setGrammarExerciseAnswered(false);
      setTotalActivities((prev) => prev + exercises.length);
    }
  };

  const handleGrammarExerciseAnswer = (correct: boolean) => {
    setGrammarExerciseAnswered(true);
    if (correct) {
      setGrammarScore((s) => s + 1);
      setCompletedActivities((prev) => prev + 1);
    } else {
      const ex = exercises[grammarExerciseIndex];
      if (ex) addMistake(0, lessonTitle); // 0 for grammar exercises (no word ID)
    }
  };

  const handleGrammarNextExercise = () => {
    if (grammarExerciseIndex < exercises.length - 1) {
      setGrammarExerciseIndex(grammarExerciseIndex + 1);
      setGrammarExerciseAnswered(false);
    } else {
      finishLesson();
    }
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

  if (words.length === 0 && lessonType !== "grammar") {
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
    const isGrammar = lessonType === "grammar";
    const explanationCount = lessonContent.filter((c) => c.content_type === "explanation").length;
    const exampleCount = lessonContent.filter((c) => c.content_type === "example").length;
    const exerciseCount = lessonContent.filter((c) => c.content_type === "exercise").length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <Link href={`/learn/${courseId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <FadeIn>
            <div className="text-center py-16">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isGrammar ? "bg-indigo-100 dark:bg-indigo-900/30" : "bg-violet-100 dark:bg-violet-900/30"}`}>
                {isGrammar ? <BookMarked className="w-10 h-10 text-indigo-500" /> : <BookOpen className="w-10 h-10 text-violet-500" />}
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{lessonTitle}</h1>

              {isGrammar ? (
                <>
                  <p className="text-muted-foreground mb-2">
                    {explanationCount} penjelasan · {exampleCount} contoh · {exerciseCount} latihan
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-8 text-center max-w-sm mx-auto">
                    {[
                      { label: "Penjelasan", count: explanationCount, color: "text-indigo-500" },
                      { label: "Contoh", count: exampleCount, color: "text-blue-500" },
                      { label: "Latihan", count: exerciseCount, color: "text-green-500" },
                    ].map((a) => (
                      <div key={a.label} className="p-3 rounded-lg bg-white/50 dark:bg-gray-900/50">
                        <p className={`text-xl font-bold ${a.color}`}>{a.count}</p>
                        <p className="text-xs text-muted-foreground">{a.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-2">{words.length} kata untuk dipelajari</p>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    {words.slice(0, 5).map((w) => (
                      <Badge key={w.id} className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">{w.word}</Badge>
                    ))}
                    {words.length > 5 && <Badge className="bg-gray-100 text-gray-600">+{words.length - 5}</Badge>}
                  </div>
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
                </>
              )}

              <Button onClick={handleStartLesson} size="lg" className={`px-8 text-white ${isGrammar ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700" : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"}`}>
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
    const q = listenQuestions[listenQIndex];
    if (!q) return null;

    const typeLabel: Record<ListeningQuestion["type"], string> = {
      multiple_choice: "Pilihan Ganda",
      dictation: "Dictation",
      sentence_mcq: "Dengar Kalimat",
      sentence_blank: "Isi Kata",
    };
    const typeColor: Record<ListeningQuestion["type"], string> = {
      multiple_choice: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      dictation: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      sentence_mcq: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      sentence_blank: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-yellow-50/50 dark:from-orange-950/20 dark:via-amber-950/10 dark:to-yellow-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
            <Badge className={typeColor[q.type]}>{typeLabel[q.type]}</Badge>
            <span>{listenQIndex + 1}/{listenQuestions.length}</span>
            <span className="ml-auto text-orange-600 dark:text-orange-400 font-medium">{listenScore}/{listenQIndex + (listenCorrect !== null ? 1 : 0)}</span>
          </div>
          <div className="h-2 bg-orange-100 dark:bg-orange-900/30 rounded-full overflow-hidden mb-4">
            <motion.div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${((listenQIndex + 1) / listenQuestions.length) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>

          {/* Speed control */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[0.75, 1, 1.25].map((s) => (
              <button
                key={s}
                onClick={() => setListenSpeed(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  listenSpeed === s
                    ? "bg-orange-500 text-white"
                    : "bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-800 text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <FadeIn>
            <div className="text-center py-4">
              {/* Play button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => playPronunciation(q.audio)}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto shadow-lg mb-6"
              >
                <Headphones className="w-10 h-10 text-white" />
              </motion.button>

              {/* Question-specific UI */}
              {q.type === "multiple_choice" && q.options && (
                <div className="space-y-3 max-w-sm mx-auto">
                  <p className="text-sm text-muted-foreground mb-2">Pilih arti yang benar:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => listenCorrect === null && setListenSelectedOption(opt)}
                        disabled={listenCorrect !== null}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                          listenCorrect !== null && opt === q.correctAnswer
                            ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                            : listenCorrect !== null && opt === listenSelectedOption
                            ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                            : listenSelectedOption === opt
                            ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                            : "border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {q.type === "sentence_mcq" && q.options && (
                <div className="space-y-3 max-w-sm mx-auto">
                  <p className="text-sm text-muted-foreground mb-2">Pilih terjemahan kalimat yang benar:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => listenCorrect === null && setListenSelectedOption(opt)}
                        disabled={listenCorrect !== null}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                          listenCorrect !== null && opt === q.correctAnswer
                            ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                            : listenCorrect !== null && opt === listenSelectedOption
                            ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                            : listenSelectedOption === opt
                            ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                            : "border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {q.type === "dictation" && (
                <div className="space-y-4 max-w-sm mx-auto">
                  <p className="text-sm text-muted-foreground">Ketik kata yang kamu dengar:</p>
                  <input
                    ref={inputRef}
                    type="text"
                    value={listenInput}
                    onChange={(e) => setListenInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && listenInput && !listenCorrect && handleListenSubmit()}
                    placeholder="Ketik di sini..."
                    disabled={listenCorrect !== null}
                    className="w-full px-4 py-3 rounded-xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 text-foreground text-center text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                    autoFocus
                  />
                </div>
              )}

              {q.type === "sentence_blank" && (
                <div className="space-y-4 max-w-sm mx-auto">
                  <p className="text-sm text-muted-foreground mb-2">Dengar kalimat, isi kata yang kosong:</p>
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-orange-200 dark:border-orange-800 p-4 mb-4">
                    <p className="text-lg font-medium text-foreground">{q.sentence}</p>
                    {q.sentenceTranslation && (
                      <p className="text-sm text-muted-foreground mt-2">{q.sentenceTranslation}</p>
                    )}
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={listenInput}
                    onChange={(e) => setListenInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && listenInput && !listenCorrect && handleListenSubmit()}
                    placeholder="Ketik kata yang kosong..."
                    disabled={listenCorrect !== null}
                    className="w-full px-4 py-3 rounded-xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 text-foreground text-center text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                    autoFocus
                  />
                </div>
              )}

              {/* Submit button for text inputs */}
              {(q.type === "dictation" || q.type === "sentence_blank") && (
                <div className="mt-4 max-w-sm mx-auto">
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
                          <p className="text-red-600 dark:text-red-400 font-medium mb-1">Jawaban: {q.correctAnswer}</p>
                          {q.type === "dictation" && <p className="text-sm text-muted-foreground">{q.word.meaning_id}</p>}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Submit button for MCQ types */}
              {(q.type === "multiple_choice" || q.type === "sentence_mcq") && (
                <div className="mt-4 max-w-sm mx-auto">
                  {listenCorrect === null ? (
                    <Button onClick={handleListenSubmit} disabled={!listenSelectedOption} className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white">
                      Cek Jawaban
                    </Button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                      {listenCorrect ? (
                        <p className="text-green-600 dark:text-green-400 font-medium">Benar!</p>
                      ) : (
                        <p className="text-red-600 dark:text-red-400 font-medium">Jawaban: {q.correctAnswer}</p>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Replay button */}
              <button
                onClick={() => playPronunciation(q.audio)}
                className="mt-4 text-sm text-orange-600 dark:text-orange-400 hover:underline"
              >
                Putar Ulang
              </button>
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

  // ─── GRAMMAR: EXPLANATION ────────────────────────────────────────
  if (step === "grammar_explanation" && explanations.length > 0) {
    const current = explanations[grammarExplanationIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-violet-50/50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-violet-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Grammar</Badge>
            <span>{grammarExplanationIndex + 1}/{explanations.length}</span>
          </div>
          <div className="h-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full overflow-hidden mb-6">
            <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${((grammarExplanationIndex + 1) / explanations.length) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>

          <GrammarExplanation content={current.content as any} title={current.title} />

          <div className="mt-6">
            <Button onClick={() => handleGrammarNextExplanation(grammarExplanationIndex)} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
              {grammarExplanationIndex < explanations.length - 1 ? "Selanjutnya" : "Lihat Contoh"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── GRAMMAR: EXAMPLES ───────────────────────────────────────────
  if (step === "grammar_examples" && examples.length > 0) {
    const current = examples[grammarExampleIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-violet-50/50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-violet-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Contoh</Badge>
            <span>{grammarExampleIndex + 1}/{examples.length}</span>
          </div>
          <div className="h-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full overflow-hidden mb-6">
            <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${((grammarExampleIndex + 1) / examples.length) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>

          <GrammarExample content={current.content as any} title={current.title} playAudio={playPronunciation} />

          <div className="mt-6">
            <Button onClick={() => handleGrammarNextExample(grammarExampleIndex)} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
              {grammarExampleIndex < examples.length - 1 ? "Selanjutnya" : "Mulai Latihan"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── GRAMMAR: PRACTICE ───────────────────────────────────────────
  if (step === "grammar_practice" && exercises.length > 0) {
    const current = exercises[grammarExerciseIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-violet-50/50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-violet-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Latihan</Badge>
            <span>{grammarExerciseIndex + 1}/{exercises.length}</span>
            <span className="ml-auto text-indigo-600 dark:text-indigo-400 font-medium">{grammarScore}/{grammarExerciseIndex + (grammarExerciseAnswered ? 1 : 0)}</span>
          </div>
          <div className="h-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full overflow-hidden mb-6">
            <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${((grammarExerciseIndex + 1) / exercises.length) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>

          <GrammarExercise
            content={current.content as any}
            title={current.title}
            onAnswer={handleGrammarExerciseAnswer}
            answered={grammarExerciseAnswered}
          />

          {grammarExerciseAnswered && (
            <div className="mt-6">
              <Button onClick={handleGrammarNextExercise} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
                {grammarExerciseIndex < exercises.length - 1 ? "Selanjutnya" : "Selesai"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── COMPLETE ──────────────────────────────────────────────────────
  if (step === "complete") {
    const score = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 100;
    const isGrammar = lessonType === "grammar";
    const xpEarned = 30;
    const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
    const gradeColor = score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500";

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-teal-50/50 dark:from-green-950/20 dark:via-emerald-950/10 dark:to-teal-950/20">
        {/* Confetti */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                background: ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"][i % 6],
              }}
              initial={{ top: -10, opacity: 1, rotate: 0 }}
              animate={{
                top: "110%",
                opacity: [1, 1, 0],
                rotate: Math.random() * 720 - 360,
                x: Math.random() * 200 - 100,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <FadeIn>
            <div className="text-center py-8">
              {/* Trophy animation */}
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
                  <Trophy className="w-14 h-14 text-white" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h1 className="text-3xl font-bold text-foreground mb-1">Selesai!</h1>
                <p className="text-muted-foreground mb-6">{lessonTitle}</p>
              </motion.div>

              {/* XP + Score + Grade */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="rounded-2xl bg-white dark:bg-gray-900 border border-amber-100 dark:border-amber-900/30 p-4 shadow-sm">
                    <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">+{xpEarned}</p>
                    <p className="text-[10px] text-muted-foreground">XP Earned</p>
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-gray-900 border border-green-100 dark:border-green-900/30 p-4 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{score}%</p>
                    <p className="text-[10px] text-muted-foreground">Skor</p>
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 p-4 shadow-sm">
                    <Sparkles className="w-5 h-5 text-violet-500 mx-auto mb-1" />
                    <p className={`text-2xl font-bold ${gradeColor}`}>{grade}</p>
                    <p className="text-[10px] text-muted-foreground">Grade</p>
                  </div>
                </div>
              </motion.div>

              {/* Activity breakdown */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <div className="rounded-2xl bg-white dark:bg-gray-900 border border-green-100 dark:border-green-900/30 p-5 mb-8 text-left shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Rincian Aktivitas</p>
                  {isGrammar ? (
                    <div className="space-y-3">
                      {[
                        { icon: BookMarked, label: "Penjelasan", count: explanations.length, color: "text-indigo-500" },
                        { icon: BookOpen, label: "Contoh Kalimat", count: examples.length, color: "text-blue-500" },
                        { icon: Pen, label: "Latihan Benar", count: grammarScore, total: exercises.length, color: "text-green-500" },
                      ].map((a) => (
                        <div key={a.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center`}>
                              <a.icon className={`w-4 h-4 ${a.color}`} />
                            </div>
                            <span className="text-sm text-foreground">{a.label}</span>
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">
                            {a.total !== undefined ? `${a.count}/${a.total}` : a.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[
                        { icon: BookOpen, label: "Vocabulary", count: words.length, color: "text-violet-500" },
                        { icon: Volume2, label: "Pronunciation", count: words.length, color: "text-blue-500" },
                        { icon: Pen, label: "Fill in the Blank", count: fbScore, total: fbWords.length, color: "text-green-500" },
                        { icon: Headphones, label: "Listening", count: listenScore, total: listenQuestions.length, color: "text-orange-500" },
                        { icon: Type, label: "Writing", count: writingScore, total: writingWords.length, color: "text-pink-500" },
                      ].map((a) => (
                        <div key={a.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center`}>
                              <a.icon className={`w-4 h-4 ${a.color}`} />
                            </div>
                            <span className="text-sm text-foreground">{a.label}</span>
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">
                            {a.total !== undefined ? `${a.count}/${a.total}` : a.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Buttons */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                <div className="flex flex-col gap-3">
                  {nextLessonInfo && (
                    <Link href={`/learn/${courseId}/${nextLessonInfo.lessonId}`} className="w-full">
                      <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-12 text-base">
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Selanjutnya: {nextLessonInfo.title}
                      </Button>
                    </Link>
                  )}
                  <div className="flex gap-3">
                    <Link href={`/learn/${courseId}`} className="flex-1">
                      <Button variant="outline" className="w-full border-green-200 dark:border-green-800">Course</Button>
                    </Link>
                    <Link href="/" className="flex-1">
                      <Button variant="outline" className="w-full border-green-200 dark:border-green-800">Beranda</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  return null;
}
