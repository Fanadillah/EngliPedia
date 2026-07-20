"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { Word } from "@/types/word";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Volume2,
  BookOpen,
  MessageSquareQuote,
  BookMarked,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import Link from "next/link";
import { ErrorStateIllustration } from "@/components/illustrations";
import { AnimatedWord, FadeIn } from "@/components/ui/motion-components";
import { PronunciationWave } from "@/components/ui/pronunciation-wave";
import { WordSaveButton } from "@/components/word/word-save-button";
import { WordTabs } from "@/components/word/word-tabs";
import { InfoBar } from "@/components/word/info-bar";
import { motion } from "motion/react";
import { awardXp, getXpEventMessage } from "@/lib/gamification";
import { useToast } from "@/components/ui/toast-provider";
import { getCardForWord, getMasteryLevel, getMasteryStatus } from "@/lib/spaced-repetition";

export default function WordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [masteryLevel, setMasteryLevel] = useState(0);
  const [masteryStatus, setMasteryStatus] = useState<"new" | "learning" | "reviewing" | "mastered">("new");
  const { showToast } = useToast();

  useEffect(() => {
    loadWord();
    setXpAwarded(false);
  }, [params.id]); // eslint-disable-line

  const loadWord = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("words")
      .select("*")
      .eq("id", Number(params.id))
      .single<Word>();

    if (data) {
      setWord(data);

      // Load SM-2 mastery data for this word
      const card = getCardForWord(data.id);
      if (card) {
        setMasteryLevel(getMasteryLevel(card));
        setMasteryStatus(getMasteryStatus(card));
      } else {
        setMasteryLevel(0);
        setMasteryStatus("new");
      }

      // Award XP for viewing a word (only once per word view)
      if (!xpAwarded) {
        const today = new Date().toISOString().slice(0, 10);
        const prev = JSON.parse(localStorage.getItem("engli-gamification") || "{}");
        const viewedToday = prev.dailyXpDate === today ? (prev.dailyXp || 0) : 0;
        if (viewedToday < 50) {
          const newState = awardXp("view_word");
          setXpAwarded(true);
          showToast({
            type: "xp",
            message: getXpEventMessage("view_word"),
            xpAmount: 5,
          });
        }
      }
    }
    setLoading(false);
  };

  const speak = (text: string, lang = "en-US") => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  const levelConfig: Record<string, { label: string; gradient: string; dot: string; text: string }> = {
    basic: { label: "Dasar", gradient: "from-green-500 to-emerald-500", dot: "bg-green-400", text: "text-green-600" },
    intermediate: { label: "Menengah", gradient: "from-amber-500 to-orange-500", dot: "bg-yellow-400", text: "text-yellow-600" },
    advanced: { label: "Lanjut", gradient: "from-red-500 to-rose-500", dot: "bg-red-400", text: "text-red-600" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto p-4 space-y-4">
          <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
          <div className="bg-card rounded-3xl p-8 space-y-4">
            <div className="h-10 w-40 bg-muted rounded-lg animate-pulse mx-auto" />
            <div className="h-5 w-28 bg-muted rounded mx-auto" />
            <div className="h-10 w-32 bg-muted rounded-full mx-auto" />
          </div>
          <div className="h-24 bg-muted rounded-2xl animate-pulse" />
          <div className="h-24 bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col items-center justify-center gap-4 px-4">
        <div className="flex justify-center text-primary/30">
          <ErrorStateIllustration className="w-40 h-40" />
        </div>
        <p className="text-lg font-semibold text-foreground/80">Kata tidak ditemukan</p>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Mungkin kata ini belum ada di database kami. Coba cari kata yang lain.
        </p>
        <div className="flex items-center gap-3 mt-2">
          <Button onClick={() => router.back()} variant="outline" className="rounded-xl">
            Kembali
          </Button>
          <Link href="/search">
            <Button className="rounded-xl">
              <Search className="w-4 h-4 mr-1.5" />
              Cari Kata
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const level = levelConfig[word.level] || levelConfig.basic;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
            <div className="flex gap-1.5">
              <WordSaveButton wordId={word.id} />
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg"
                onClick={() => router.push(`/word/${Math.max(1, word.id - 1)}`)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg"
                onClick={() => router.push(`/word/${word.id + 1}`)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Hero Word Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-[1px]"
          >
            <div className="bg-card rounded-[23px] p-6 space-y-4">
              {/* Level badge + Mastery badge */}
              <FadeIn>
                <div className="flex justify-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${level.gradient}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${level.dot}`} />
                    {level.label}
                  </span>
                  {masteryStatus === "mastered" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                      Dikuasai
                    </span>
                  )}
                  {masteryStatus === "reviewing" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                      Reviewing
                    </span>
                  )}
                  {masteryStatus === "learning" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                      Learning
                    </span>
                  )}
                </div>
              </FadeIn>

              {/* Word */}
              <div className="text-center space-y-2">
                <h1 className="text-5xl font-bold tracking-tight text-foreground">
                  <AnimatedWord>{word.word}</AnimatedWord>
                </h1>
                {word.ipa && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-base font-mono text-muted-foreground"
                  >
                    {word.ipa}
                  </motion.p>
                )}
              </div>

              {/* Pronunciation Wave */}
              <FadeIn delay={0.3}>
                <div className="flex justify-center">
                  <PronunciationWave text={word.word} size="lg" />
                </div>
              </FadeIn>

              {/* Cara baca */}
              {word.cara_baca && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center gap-2 bg-muted rounded-xl px-4 py-2">
                    <span className="text-xs text-muted-foreground">Cara baca:</span>
                    <span className="font-bold text-card-foreground">{word.cara_baca}</span>
                    <PronunciationWave text={word.cara_baca.replace(/-/g, " ")} size="sm" />
                  </div>
                </motion.div>
              )}

              {/* Mastery Progress */}
              {masteryLevel > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Progress Mastery</span>
                    <span className="font-bold text-foreground">{masteryLevel}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${masteryLevel}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className={`h-full rounded-full ${
                        masteryStatus === "mastered"
                          ? "bg-gradient-to-r from-emerald-500 to-green-500"
                          : masteryStatus === "reviewing"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                          : "bg-gradient-to-r from-amber-500 to-orange-500"
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    {masteryStatus === "mastered" && "Kata ini sudah dikuasai! 🏆"}
                    {masteryStatus === "reviewing" && "Terus review untuk meningkatkan retensi"}
                    {masteryStatus === "learning" && "Kata ini sedang dipelajari"}
                    {masteryStatus === "new" && "Belum ada data review"}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Tabs: Detail | Contoh | Terkait */}
          <WordTabs word={word} speak={speak} level={level} />

          {/* Info Bar */}
          <InfoBar word={word} level={level} />

        </div>
      </div>
    </div>
  );
}
