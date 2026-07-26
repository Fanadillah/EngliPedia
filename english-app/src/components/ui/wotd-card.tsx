"use client";

import { motion } from "motion/react";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Sparkles, Volume2, ChevronLeft, ChevronRight } from "lucide-react";

interface WotdCardProps {
  word: {
    word: string;
    meaning_id: string;
    ipa?: string;
    frequency?: number;
  };
  masteryValue?: number;
  onNext?: () => void;
  onPrev?: () => void;
}

export function WotdCard({ word, masteryValue = 0, onNext, onPrev }: WotdCardProps) {
  // Hash function untuk gradient deterministic
  const getGradient = (w: string) => {
    let hash = 0;
    for (let i = 0; i < w.length; i++) {
      hash = w.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${(hue + 60) % 360}, 70%, 60%))`;
  };

  const gradient = getGradient(word.word);

  return (
    <motion.div
      key={word.word}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
      style={{ background: gradient }}
    >
      {/* Navigation Buttons */}
      <div className="absolute top-4 left-4 flex gap-2 z-20">
        <button 
          onClick={onPrev} 
          className="p-3 rounded-full bg-white/40 hover:bg-white/60 backdrop-blur-md transition-all border border-white/30 shadow-lg hover:scale-105 active:scale-95"
          aria-label="Previous word"
        >
            <ChevronLeft className="w-7 h-7 text-white" />
        </button>
        <button 
          onClick={onNext} 
          className="p-3 rounded-full bg-white/40 hover:bg-white/60 backdrop-blur-md transition-all border border-white/30 shadow-lg hover:scale-105 active:scale-95"
          aria-label="Next word"
        >
            <ChevronRight className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Label */}
      <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white/90 border border-white/20">
        Word of the Day
      </div>

      {/* Decorative Sparkles */}
      <div className="absolute top-12 right-4 opacity-50">
        <Sparkles className="w-5 h-5 animate-pulse" />
      </div>
      
      <div className="flex justify-end items-start mb-6">
        <div className="flex items-center gap-2">
            <ProgressRing 
                value={masteryValue} 
                maxValue={100} 
                size={40} 
                strokeWidth={3}
                color="white" 
                bgColor="rgba(255,255,255,0.3)" 
            />
        </div>
      </div>

      <h2 className="text-4xl font-black tracking-tight mb-2">
        {word.word.split('').map((char: string, i: number) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="inline-block"
          >
            {char}
          </motion.span>
        ))}
      </h2>
      
      <p className="text-white/90 text-lg mb-6 font-medium">{word.meaning_id}</p>

      <div className="flex gap-2">
        <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium">
          {word.word.length} letters
        </div>
        <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium">
          Freq Score: {word.frequency || 5}
        </div>
      </div>
    </motion.div>
  );
}