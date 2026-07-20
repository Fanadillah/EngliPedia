"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Headphones,
  Pen,
  BookOpen,
  Type,
  CheckCircle2,
  Volume2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-components";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/utils/supabase/client";
import { awardXp } from "@/lib/gamification";
import type { Word } from "@/types/word";

// ─── Types ──────────────────────────────────────────────────────────────

type PracticeMode = "multiple_choice" | "dictation" | "sentence_mcq" | "sentence_blank";
type Phase = "select" | "practice" | "result";

interface Question {
  type: PracticeMode;
  word: Word;
  audio: string;
  correctAnswer: string;
  options?: string[];
  sentence?: string;
  sentenceTranslation?: string;
}

const modes: { id: PracticeMode; icon: typeof Headphones; title: string; description: string; color: string; bgColor: string; iconColor: string }[] = [
  {
    id: "multiple_choice",
    icon: Headphones,
    title: "Pilihan Ganda",
    description: "Dengar kata, pilih arti yang benar",
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    iconColor: "text-orange-500",
  },
  {
    id: "dictation",
    icon: Pen,
    title: "Dictation",
    description: "Dengar kata, ketik apa yang kamu dengar",
    color: "from-amber-500 to-yellow-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    iconColor: "text-amber-500",
  },
  {
    id: "sentence_mcq",
    icon: BookOpen,
    title: "Dengar Kalimat",
    description: "Dengar kalimat, pilih terjemahannya",
    color: "from-yellow-500 to-orange-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    iconColor: "text-yellow-600",
  },
  {
    id: "sentence_blank",
    icon: Type,
    title: "Isi Kata",
    description: "Dengar kalimat, isi kata yang kosong",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    iconColor: "text-orange-600",
  },
];

const difficulties = [
  { id: "easy", label: "Mudah", description: "Kata umum (frekuensi tinggi)" },
  { id: "medium", label: "Sedang", description: "Semua kata" },
  { id: "hard", label: "Sulit", description: "Kata jarang + kalimat" },
] as const;

// ─── Helpers ────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/[.,!?;'"]/g, "");
}

// ─── Component ──────────────────────────────────────────────────────────

export default function ListeningPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedMode, setSelectedMode] = useState<PracticeMode | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);

  // Practice state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [input, setInput] = useState("");
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(1);

  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Load Words ─────────────────────────────────────────────────────
  const loadWords = async (mode: PracticeMode) => {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase.from("words").select("*");

      if (difficulty === "easy") {
        query = query.gte("frequency", 5);
      } else if (difficulty === "hard") {
        query = query.lte("frequency", 4);
      }

      const { data } = await query.order("random()").limit(20);
      const loadedWords = (data || []) as Word[];

      if (mode === "sentence_mcq" || mode === "sentence_blank") {
        const sentenceWords = loadedWords.filter((w) => w.example && w.example_id);
        setWords(sentenceWords.length >= 4 ? sentenceWords : loadedWords);
      } else {
        setWords(loadedWords);
      }
    } catch (error) {
      console.error("Failed to load words:", error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Generate Questions ─────────────────────────────────────────────
  const generateQuestions = (mode: PracticeMode, wordList: Word[]): Question[] => {
    const questions: Question[] = [];
    const allMeanings = wordList.map((w) => w.meaning_id);
    const count = Math.min(10, wordList.length);

    if (mode === "multiple_choice") {
      const selected = shuffleArray(wordList).slice(0, count);
      for (const w of selected) {
        const distractors = shuffleArray(allMeanings.filter((m) => m !== w.meaning_id)).slice(0, 3);
        questions.push({
          type: "multiple_choice",
          word: w,
          audio: w.word,
          correctAnswer: w.meaning_id,
          options: shuffleArray([w.meaning_id, ...distractors]),
        });
      }
    } else if (mode === "dictation") {
      const selected = shuffleArray(wordList).slice(0, count);
      for (const w of selected) {
        questions.push({
          type: "dictation",
          word: w,
          audio: w.word,
          correctAnswer: w.word,
        });
      }
    } else if (mode === "sentence_mcq") {
      const selected = shuffleArray(wordList.filter((w) => w.example && w.example_id)).slice(0, count);
      for (const w of selected) {
        const others = shuffleArray(
          wordList.filter((x) => x.id !== w.id && x.example_id).map((x) => x.example_id)
        ).slice(0, 3);
        questions.push({
          type: "sentence_mcq",
          word: w,
          audio: w.example,
          correctAnswer: w.example_id,
          options: shuffleArray([w.example_id, ...others]),
          sentence: w.example,
          sentenceTranslation: w.example_id,
        });
      }
    } else if (mode === "sentence_blank") {
      const selected = shuffleArray(wordList.filter((w) => w.example)).slice(0, count);
      for (const w of selected) {
        const blanked = w.example.replace(new RegExp(`\\b${w.word}\\b`, "i"), "______");
        questions.push({
          type: "sentence_blank",
          word: w,
          audio: w.example,
          correctAnswer: w.word,
          sentence: blanked,
          sentenceTranslation: w.example_id,
        });
      }
    }

    return shuffleArray(questions);
  };

  // ─── Start Practice ─────────────────────────────────────────────────
  const startPractice = async (mode: PracticeMode) => {
    setSelectedMode(mode);
    setLoading(true);
    await loadWords(mode);
    setLoading(false);
  };

  useEffect(() => {
    if (words.length > 0 && selectedMode && !loading) {
      const qs = generateQuestions(selectedMode, words);
      if (qs.length === 0) {
        setPhase("select");
        setSelectedMode(null);
        return;
      }
      setQuestions(qs);
      setQIndex(0);
      setScore(0);
      setInput("");
      setCorrect(null);
      setSelectedOption(null);
      setSpeed(1);
      setPhase("practice");

      setTimeout(() => {
        playAudio(qs[0].audio);
      }, 500);
    }
  }, [words, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Audio ──────────────────────────────────────────────────────────
  const playAudio = (text: string, rate?: number) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rate ?? speed;
      speechSynthesis.speak(utterance);
    }
  };

  // ─── Submit Answer ──────────────────────────────────────────────────
  const handleSubmit = () => {
    const q = questions[qIndex];
    if (!q) return;

    let isCorrect = false;
    if (q.type === "multiple_choice" || q.type === "sentence_mcq") {
      isCorrect = selectedOption === q.correctAnswer;
    } else {
      isCorrect = normalize(input) === normalize(q.correctAnswer);
    }

    setCorrect(isCorrect);
    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
      if (qIndex < questions.length - 1) {
        const next = qIndex + 1;
        setQIndex(next);
        setInput("");
        setCorrect(null);
        setSelectedOption(null);
        setTimeout(() => playAudio(questions[next].audio), 300);
      } else {
        awardXp("complete_session");
        setPhase("result");
      }
    }, 1500);
  };

  // ─── Reset ──────────────────────────────────────────────────────────
  const handleBack = () => {
    speechSynthesis.cancel();
    if (phase === "practice" && selectedMode) {
      setPhase("select");
      setSelectedMode(null);
      setQuestions([]);
    } else {
      setPhase("select");
    }
  };

  // ─── SELECT PHASE ──────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-yellow-50/50 dark:from-orange-950/20 dark:via-amber-950/10 dark:to-yellow-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <Link href="/practice" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>

          <FadeIn>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Listening Practice</h1>
                  <p className="text-sm text-muted-foreground">Latihan mendengarkan kosakata</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Difficulty */}
          <FadeIn>
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Tingkat Kesulitan</p>
              <div className="flex gap-2">
                {difficulties.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                      difficulty === d.id
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white dark:bg-gray-900 border-orange-200 dark:border-orange-800 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Mode cards */}
          <StaggerContainer className="space-y-3">
            {modes.map((mode) => (
              <StaggerItem key={mode.id}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => startPractice(mode.id)}
                  className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-orange-100 dark:border-orange-900/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${mode.color}`} />
                  <div className="p-5 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${mode.bgColor} flex items-center justify-center`}>
                      <mode.icon className={`w-7 h-7 ${mode.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground">{mode.title}</h3>
                      <p className="text-sm text-muted-foreground">{mode.description}</p>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Memuat kata...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── PRACTICE PHASE ────────────────────────────────────────────────
  if (phase === "practice") {
    const q = questions[qIndex];
    if (!q) return null;

    const modeInfo = modes.find((m) => m.id === selectedMode)!;

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-yellow-50/50 dark:from-orange-950/20 dark:via-amber-950/10 dark:to-yellow-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
            <button onClick={handleBack} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">{modeInfo.title}</Badge>
            <span>{qIndex + 1}/{questions.length}</span>
            <span className="ml-auto text-orange-600 dark:text-orange-400 font-medium">{score}/{qIndex + (correct !== null ? 1 : 0)}</span>
          </div>
          <div className="h-2 bg-orange-100 dark:bg-orange-900/30 rounded-full overflow-hidden mb-4">
            <motion.div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${((qIndex + 1) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>

          {/* Speed */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[0.75, 1, 1.25].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  speed === s
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
                onClick={() => playAudio(q.audio)}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto shadow-lg mb-6"
              >
                <Headphones className="w-10 h-10 text-white" />
              </motion.button>

              {/* MCQ */}
              {(q.type === "multiple_choice" || q.type === "sentence_mcq") && q.options && (
                <div className="space-y-3 max-w-sm mx-auto">
                  <p className="text-sm text-muted-foreground mb-2">
                    {q.type === "multiple_choice" ? "Pilih arti yang benar:" : "Pilih terjemahan kalimat:"}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => correct === null && setSelectedOption(opt)}
                        disabled={correct !== null}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                          correct !== null && opt === q.correctAnswer
                            ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                            : correct !== null && opt === selectedOption
                            ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                            : selectedOption === opt
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

              {/* Dictation */}
              {q.type === "dictation" && (
                <div className="space-y-4 max-w-sm mx-auto">
                  <p className="text-sm text-muted-foreground">Ketik kata yang kamu dengar:</p>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && input && !correct && handleSubmit()}
                    placeholder="Ketik di sini..."
                    disabled={correct !== null}
                    className="w-full px-4 py-3 rounded-xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 text-foreground text-center text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                    autoFocus
                  />
                </div>
              )}

              {/* Sentence blank */}
              {q.type === "sentence_blank" && (
                <div className="space-y-4 max-w-sm mx-auto">
                  <p className="text-sm text-muted-foreground mb-2">Isi kata yang kosong:</p>
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-orange-200 dark:border-orange-800 p-4 mb-4">
                    <p className="text-lg font-medium text-foreground">{q.sentence}</p>
                    {q.sentenceTranslation && (
                      <p className="text-sm text-muted-foreground mt-2">{q.sentenceTranslation}</p>
                    )}
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && input && !correct && handleSubmit()}
                    placeholder="Ketik kata yang kosong..."
                    disabled={correct !== null}
                    className="w-full px-4 py-3 rounded-xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 text-foreground text-center text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                    autoFocus
                  />
                </div>
              )}

              {/* Submit for text inputs */}
              {(q.type === "dictation" || q.type === "sentence_blank") && (
                <div className="mt-4 max-w-sm mx-auto">
                  {correct === null ? (
                    <Button onClick={handleSubmit} disabled={!input} className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white">
                      Cek Jawaban
                    </Button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                      {correct ? (
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

              {/* Submit for MCQ */}
              {(q.type === "multiple_choice" || q.type === "sentence_mcq") && (
                <div className="mt-4 max-w-sm mx-auto">
                  {correct === null ? (
                    <Button onClick={handleSubmit} disabled={!selectedOption} className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white">
                      Cek Jawaban
                    </Button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                      {correct ? (
                        <p className="text-green-600 dark:text-green-400 font-medium">Benar!</p>
                      ) : (
                        <p className="text-red-600 dark:text-red-400 font-medium">Jawaban: {q.correctAnswer}</p>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Replay */}
              <button
                onClick={() => playAudio(q.audio)}
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

  // ─── RESULT PHASE ──────────────────────────────────────────────────
  if (phase === "result") {
    const percent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const modeInfo = modes.find((m) => m.id === selectedMode)!;

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-yellow-50/50 dark:from-orange-950/20 dark:via-amber-950/10 dark:to-yellow-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <FadeIn>
            <div className="text-center py-16">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <h1 className="text-3xl font-bold text-foreground mb-2">Selesai!</h1>
              <p className="text-muted-foreground mb-2">{modeInfo.title}</p>

              <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm mx-auto">
                <div className="rounded-xl bg-white dark:bg-gray-900 border border-orange-100 dark:border-orange-900/30 p-4">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{score}/{questions.length}</p>
                  <p className="text-xs text-muted-foreground">Benar</p>
                </div>
                <div className="rounded-xl bg-white dark:bg-gray-900 border border-orange-100 dark:border-orange-900/30 p-4">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{percent}%</p>
                  <p className="text-xs text-muted-foreground">Skor</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1 text-sm text-amber-600 dark:text-amber-400 mb-8">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">+10 XP</span>
              </div>

              <div className="flex gap-3 max-w-sm mx-auto">
                <Button onClick={handleBack} variant="outline" className="flex-1 border-orange-200 dark:border-orange-800">
                  Pilih Mode Lain
                </Button>
                <Button onClick={() => startPractice(selectedMode!)} className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white">
                  Coba Lagi
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  return null;
}
