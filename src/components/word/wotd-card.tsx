"use client";

import { motion } from "motion/react";
import { Volume2, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Word } from "@/types/word";

interface WotdCardProps {
  word: Word;
  masteryValue?: number; // Keep for compatibility if needed
  onNext?: () => void;
  onPrev?: () => void;
}

export function WotdCard({ word }: WotdCardProps) {
  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          Kata Hari Ini
        </div>
        <button
          onClick={(e) => { e.preventDefault(); speak(word.word); }}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <Volume2 className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <Link href={`/word/${word.id}`} className="block">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-1">{word.word}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
            <span>{word.ipa}</span>
            <span className="text-primary font-sans font-medium">"{word.cara_baca}"</span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-lg font-medium text-foreground">{word.meaning_id}</p>
          {word.example && (
            <p className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-border pl-3">
              "{word.example}"
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between text-primary text-sm font-semibold group-hover:gap-2 transition-all">
          <span>Pelajari selengkapnya</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </Link>
    </motion.div>
  );
}
