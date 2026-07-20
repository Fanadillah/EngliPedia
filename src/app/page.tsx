"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Flame,
  Search,
  Volume2,
  ChevronRight,
  Sparkles,
  Zap,
  Trophy,
  Headphones,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Word } from "@/types/word";
import { OrganicBlobs } from "@/components/ui/organic-blobs";
import { AnimatedWord, FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui/motion-components";
import { ProgressRing } from "@/components/ui/progress-ring";
import { motion } from "motion/react";
import { loadState, checkStreak } from "@/lib/gamification";
import { getDailyLearningTasks } from "@/lib/learning";
import { useToast } from "@/components/ui/toast-provider";

import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";

const motivationalQuotes = [
  "Siap belajar hari ini?",
  "Setiap kata adalah langkah baru!",
  "Vocabulary = Kekuatan!",
  "Satu kata sehari, jago dalam setahun!",
  "Yuk tingkatkan kosakatamu!",
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [wordOfDay, setWordOfDay] = useState<Word | null>(null);
  const [randomWords, setRandomWords] = useState<Word[]>([]);
  const [gamification, setGamification] = useState(loadState());
  const [dailyTask, setDailyTask] = useState<{
    nextLesson: { lesson: any; unit: any; course: any } | null;
    dueWordsCount: number;
  } | null>(null);
  const [quote] = useState(
    () => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  );
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
    loadWords();
    loadDailyLearning();
    
    // Check streak on visit
    const prevState = loadState(); // Baca state SEBELUM update
    const newState = checkStreak();
    setGamification(newState);
    
    // Show daily login toast (bandingkan dengan state sebelum update)
    const today = new Date().toISOString().slice(0, 10);
    if (prevState.lastActiveDate !== today && newState.streak > 0) {
      const isFirstVisit = !prevState.lastActiveDate;
      showToast({
        type: isFirstVisit ? "success" : "streak",
        message: isFirstVisit
          ? "🎉 Selamat datang di Englipedia!"
          : `🔥 Streak ${newState.streak} hari! Lanjutkan!`,
        xpAmount: isFirstVisit ? 10 : undefined,
      });
    }
  }, []); // eslint-disable-line

  const loadWords = async () => {
    const supabase = createClient();
    // Word of the day: pick a random word with IPA + meaning
    const { data: wotd } = await supabase
      .from("words")
      .select("*")
      .not("ipa", "eq", "")
      .not("meaning_id", "eq", "")
      .not("example", "eq", "")
      .gte("frequency", 5)
      .order("id", { ascending: false })
      .limit(50);

    if (wotd && wotd.length > 0) {
      const dayIndex = new Date().getDate() % wotd.length;
      setWordOfDay(wotd[dayIndex]);
    }

    // Random words for discovery
    const { data: randoms } = await supabase
      .from("words")
      .select("*")
      .not("meaning_id", "eq", "")
      .not("ipa", "eq", "")
      .gte("frequency", 4)
      .order("id", { ascending: false })
      .limit(200);

    if (randoms && randoms.length > 0) {
      const shuffled = [...randoms].sort(() => Math.random() - 0.5);
      setRandomWords(shuffled.slice(0, 6));
    }
  };

  const loadDailyLearning = async () => {
    try {
      const tasks = await getDailyLearningTasks();
      setDailyTask({
        nextLesson: tasks.nextLesson,
        dueWordsCount: tasks.dueWordsCount,
      });
    } catch (error) {
      console.error("Failed to load daily tasks:", error);
    }
  };

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <div className="text-primary animate-pulse text-2xl font-bold tracking-wide">
          Englipedia
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background relative">
      {/* Organic background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <OrganicBlobs variant="hero" className="w-full h-full object-cover opacity-70" />
      </div>
      <div className="p-4 space-y-6 max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto relative z-10">
          {/* Greeting */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Englipedia</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{quote}</p>
              </div>
              <DarkModeToggle variant="icon" />
            </div>
          </div>

          {/* Search */}
          <Link href="/search">
            <div className="flex items-center gap-3 p-3.5 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <Search className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">Cari kata Inggris atau Indonesia...</span>
            </div>
          </Link>

          {/* Daily Learning */}
          {dailyTask && (dailyTask.nextLesson || dailyTask.dueWordsCount > 0) && (
            <FadeIn>
              <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-[1px]">
                <div className="bg-card rounded-[15px] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">Hari Ini</h3>
                  </div>

                  <div className="space-y-2">
                    {dailyTask.nextLesson && (
                      <Link href={`/learn/${dailyTask.nextLesson.course.id}/${dailyTask.nextLesson.lesson.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {dailyTask.nextLesson.lesson.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {dailyTask.nextLesson.unit.title} • {dailyTask.nextLesson.course.title}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-violet-500" />
                        </div>
                      </Link>
                    )}

                    {dailyTask.dueWordsCount > 0 && (
                      <Link href="/flashcard">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                            <RotateCcw className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              Review {dailyTask.dueWordsCount} kata
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Kata yang perlu diulang
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-orange-500" />
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* Word of the Day */}
          {wordOfDay && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-[1px]">
              <div className="bg-card rounded-[23px] p-5 space-y-4">
                <FadeIn>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary/10 text-primary border-0 text-xs font-medium px-2.5 py-1">
                      <Zap className="w-3 h-3 mr-1" />
                      Kata Hari Ini
                    </Badge>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => speak(wordOfDay.word)}
                      className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                      <Volume2 className="w-4 h-4 text-primary" />
                    </motion.button>
                  </div>
                </FadeIn>

                <div className="text-center py-2">
                  <h2 className="text-4xl font-bold tracking-tight text-foreground">
                    <AnimatedWord>{wordOfDay.word}</AnimatedWord>
                  </h2>
                  {wordOfDay.ipa && (
                    <SlideUp delay={0.15}>
                      <p className="text-sm font-mono text-muted-foreground mt-1.5">
                        {wordOfDay.ipa}
                      </p>
                    </SlideUp>
                  )}
                  {wordOfDay.cara_baca && (
                    <SlideUp delay={0.25}>
                      <p className="text-sm font-medium text-primary mt-2 bg-primary/5 inline-block px-3 py-1 rounded-full">
                        &quot;{wordOfDay.cara_baca}&quot;
                      </p>
                    </SlideUp>
                  )}
                </div>

                <FadeIn delay={0.35}>
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">
                      {wordOfDay.meaning_id}
                    </p>
                  </div>
                </FadeIn>

                {wordOfDay.example && (
                  <FadeIn delay={0.45}>
                    <div className="bg-muted rounded-xl p-3.5">
                      <p className="text-xs text-muted-foreground mb-1 font-medium">Contoh:</p>
                      <p className="text-sm text-card-foreground/80 italic leading-relaxed">
                        &quot;{wordOfDay.example}&quot;
                      </p>
                    </div>
                  </FadeIn>
                )}

                <FadeIn delay={0.55}>
                  <Link href={`/word/${wordOfDay.id}`}>
                    <Button
                      variant="outline"
                      className="w-full border-primary/20 text-primary hover:bg-primary/5 rounded-xl"
                    >
                      Pelajari Kata Ini
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </FadeIn>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <StaggerContainer className="grid grid-cols-4 gap-2.5">
            <StaggerItem>
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="bg-card rounded-2xl border border-border p-3.5 text-center"
              >
                <ProgressRing
                  value={Math.min(gamification.streak, 30)}
                  maxValue={30}
                  size={56}
                  strokeWidth={4}
                  color="#F97316"
                  bgColor="rgba(249,115,22,0.1)"
                >
                  <Flame className="w-4 h-4 text-orange-500" />
                </ProgressRing>
                <p className="text-sm font-bold text-orange-600 mt-1.5">{gamification.streak}</p>
                <p className="text-[9px] text-orange-400 font-medium leading-tight">Hari<br/>Streak</p>
              </motion.div>
            </StaggerItem>
            <StaggerItem>
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="bg-card rounded-2xl border border-border p-3.5 text-center"
              >
                <ProgressRing
                  value={Math.min(gamification.masteredWords, 500)}
                  maxValue={500}
                  size={56}
                  strokeWidth={4}
                  color="#10B981"
                  bgColor="rgba(16,185,129,0.1)"
                >
                  <Trophy className="w-4 h-4 text-emerald-500" />
                </ProgressRing>
                <p className="text-sm font-bold text-emerald-600 mt-1.5">{gamification.masteredWords}</p>
                <p className="text-[9px] text-emerald-400 font-medium leading-tight">Kata<br/>Dikuasai</p>
              </motion.div>
            </StaggerItem>
            <StaggerItem>
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="bg-card rounded-2xl border border-border p-3.5 text-center"
              >
                <ProgressRing
                  value={gamification.currentXpInLevel}
                  maxValue={gamification.xpToNextLevel}
                  size={56}
                  strokeWidth={4}
                  color="#8B5CF6"
                  bgColor="rgba(139,92,246,0.1)"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </ProgressRing>
                <p className="text-sm font-bold text-primary mt-1.5">{gamification.totalXp.toLocaleString()}</p>
                <p className="text-[9px] text-primary/60 font-medium leading-tight">{gamification.totalXp > 0 ? `Lv.${gamification.currentLevel}` : "Total XP"}</p>
              </motion.div>
            </StaggerItem>
            <StaggerItem>
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="bg-card rounded-2xl border border-border p-3.5 text-center"
              >
                <ProgressRing
                  value={Math.min(gamification.viewedWords, 100)}
                  maxValue={100}
                  size={56}
                  strokeWidth={4}
                  color="#3B82F6"
                  bgColor="rgba(59,130,246,0.1)"
                >
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </ProgressRing>
                <p className="text-sm font-bold text-blue-600 mt-1.5">{gamification.viewedWords.toLocaleString()}</p>
                <p className="text-[9px] text-blue-400 font-medium leading-tight">Kata<br/>Dilihat</p>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/flashcard">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-[1px] cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-primary to-primary/90 rounded-[15px] p-5 text-white group-hover:from-primary group-hover:to-secondary transition-all duration-300">
                  <Headphones className="w-8 h-8 mb-3 opacity-90" />
                  <p className="font-semibold text-base">Flashcard</p>
                  <p className="text-xs text-white/70 mt-0.5">Hafal kosakata baru</p>
                </div>
              </motion.div>
            </Link>
            <Link href="/search">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 p-[1px] cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-secondary to-secondary/90 rounded-[15px] p-5 text-white group-hover:from-secondary group-hover:to-primary transition-all duration-300">
                  <Search className="w-8 h-8 mb-3 opacity-90" />
                  <p className="font-semibold text-base">Jelajahi</p>
                  <p className="text-xs text-white/70 mt-0.5">Temukan kata baru</p>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Random Words Discovery */}
          {randomWords.length > 0 && (
            <div className="space-y-3">
              <FadeIn>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base">Kata Acak</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadWords}
                    className="text-xs text-primary font-medium"
                  >
                    Muat Ulang
                  </motion.button>
                </div>
              </FadeIn>
              <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {randomWords.map((w) => (
                  <StaggerItem key={w.id}>
                    <Link href={`/word/${w.id}`}>
                      <motion.div
                        whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-card rounded-xl border border-border p-3 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm truncate">{w.word}</span>
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            onClick={(e) => {
                              e.preventDefault();
                              speak(w.word);
                            }}
                            className="p-1 rounded-full hover:bg-muted shrink-0"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-primary" />
                          </motion.button>
                        </div>
                        <p className="text-xs text-primary font-medium truncate mt-0.5">
                          {w.meaning_id}
                        </p>
                      </motion.div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>
  );
}
