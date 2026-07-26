"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Volume2, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Word } from "@/types/word";

interface FirstWordRevealProps {
  onDone: () => void;
}

export function FirstWordReveal({ onDone }: FirstWordRevealProps) {
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealPhase, setRevealPhase] = useState<
    "word" | "ipa" | "cara_baca" | "meaning" | "complete"
  >("word");
  const [audioSupported, setAudioSupported] = useState(true);

  useEffect(() => {
    setAudioSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    loadWord();
  }, []);

  const loadWord = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("words")
        .select("*")
        .not("meaning_id", "eq", "")
        .not("ipa", "eq", "")
        .gte("frequency", 4)
        .limit(50);

      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setWord(shuffled[0] as Word);
      } else {
        // Fallback word if no data
        setWord({
          id: 0,
          word: "Learn",
          ipa: "/lɜːn/",
          meaning_id: "Belajar",
          cara_baca: "LERN",
          definition: "To gain knowledge or skill",
          example: "I want to learn English.",
          example_id: "Saya ingin belajar bahasa Inggris.",
          pos: "verb",
          frequency: 8,
          level: "basic",
          conjugations: undefined,
          created_at: "",
        } as Word);
      }
    } catch {
      // Fallback
      setWord({
        id: 1,
        word: "Learn",
        ipa: "/lɜːn/",
        meaning_id: "Belajar",
        cara_baca: "LERN",
        definition: "To gain knowledge or skill",
        example: "I want to learn English.",
        example_id: "Saya ingin belajar bahasa Inggris.",
        pos: "verb",
        frequency: 8,
        level: "basic",
        conjugations: undefined,
        created_at: "",
      } as Word);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    if (!audioSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.75;
    window.speechSynthesis.speak(utterance);
  };

  // Auto-reveal stages
  useEffect(() => {
    if (loading || !word) return;

    const timers = [
      setTimeout(() => setRevealPhase("ipa"), 600),
      setTimeout(() => setRevealPhase("cara_baca"), 1200),
      setTimeout(() => setRevealPhase("meaning"), 1800),
      setTimeout(() => setRevealPhase("complete"), 2600),
    ];

    return () => timers.forEach(clearTimeout);
  }, [loading, word]);

  if (loading) {
    return (
      <div className="text-center py-12 space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary mx-auto"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground"
        >
          Menyiapkan kata pertamamu...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6 py-4">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold"
      >
        Kata pertamamu!
      </motion.h2>

      {/* Word Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
        className="bg-card border border-border rounded-3xl p-8 shadow-lg max-w-xs mx-auto space-y-5"
      >
        {/* Word */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
        >
          <h1 className="text-4xl font-bold tracking-tight">{word?.word}</h1>
        </motion.div>

        {/* Audio wave visual */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-1 h-8"
        >
          <motion.span
            animate={{ height: [6, 20, 6] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
            className="w-1.5 bg-primary/40 rounded-full"
          />
          <motion.span
            animate={{ height: [12, 28, 12] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.15 }}
            className="w-1.5 bg-primary/60 rounded-full"
          />
          <motion.span
            animate={{ height: [8, 24, 8] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.3 }}
            className="w-1.5 bg-primary/80 rounded-full"
          />
          <motion.span
            animate={{ height: [14, 30, 14] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.45 }}
            className="w-1.5 bg-primary rounded-full"
          />
          <motion.span
            animate={{ height: [10, 22, 10] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.6 }}
            className="w-1.5 bg-primary/70 rounded-full"
          />
          <motion.span
            animate={{ height: [6, 16, 6] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.75 }}
            className="w-1.5 bg-primary/40 rounded-full"
          />
        </motion.div>

        {/* Listen button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => speak(word?.word || "")}
          className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors mx-auto block"
        >
          <Volume2 className="w-6 h-6 text-primary" />
        </motion.button>

        {/* Revealed info */}
        <div className="space-y-3">
          {/* IPA */}
          {revealPhase === "ipa" || revealPhase === "cara_baca" || revealPhase === "meaning" || revealPhase === "complete" ? (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-mono text-muted-foreground"
            >
              {word?.ipa}
            </motion.p>
          ) : (
            <div className="h-5" />
          )}

          {/* Cara Baca */}
          {(revealPhase === "cara_baca" || revealPhase === "meaning" || revealPhase === "complete") && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium">
                &quot;{word?.cara_baca}&quot;
              </span>
            </motion.div>
          )}

          {/* Meaning */}
          {(revealPhase === "meaning" || revealPhase === "complete") && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-bold text-primary"
            >
              {word?.meaning_id}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Done button */}
      {revealPhase === "complete" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={onDone}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/25 active:scale-[0.98]"
          >
            🎉 Selesai!
          </button>
        </motion.div>
      )}
    </div>
  );
}
