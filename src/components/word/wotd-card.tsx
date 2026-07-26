"use client";

import { motion, useMotionValue, useTransform } from "motion/react";
import { Volume2, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { Word } from "@/types/word";

interface WotdCardProps {
  word: Word;
  masteryValue?: number;
  onNext?: () => void;
  onPrev?: () => void;
}

export function WotdCard({ word, onNext, onPrev }: WotdCardProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100 && onPrev) onPrev();
    else if (info.offset.x < -100 && onNext) onNext();
  };

  return (
    <div className="relative group">
      {/* Navigation Buttons (Visible on Hover/Touch) */}
      {onPrev && (
        <button
          onClick={onPrev}
          className="absolute -left-4 top-1/2 -translate-y-1/2 p-2 bg-background border border-purple-500/30 rounded-full shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5 text-purple-400" />
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          className="absolute -right-4 top-1/2 -translate-y-1/2 p-2 bg-background border border-purple-500/30 rounded-full shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5 text-purple-400" />
        </button>
      )}

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, opacity }}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full">
            Kata Hari Ini
          </div>
          <button
            onClick={(e) => { e.preventDefault(); speak(word.word); }}
            className="p-2 rounded-full hover:bg-purple-500/10 transition-colors"
          >
            <Volume2 className="w-5 h-5 text-purple-400" />
          </button>
        </div>

        <Link href={`/word/${word.id}`} className="block">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-1">{word.word}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
              <span>{word.ipa}</span>
              <span className="text-purple-400 font-sans font-medium">"{word.cara_baca}"</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-lg font-medium text-foreground">{word.meaning_id}</p>
            {word.example && (
              <p className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-purple-500/30 pl-3">
                "{word.example}"
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between text-purple-400 text-sm font-semibold group-hover:gap-2 transition-all">
            <span>Pelajari selengkapnya</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
