"use client";

import { motion } from "motion/react";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Sparkles, Volume2 } from "lucide-react";

interface WotdCardProps {
  word: {
    word: string;
    meaning_id: string;
    ipa?: string;
    frequency?: number;
  };
  masteryValue?: number;
}

export function WotdCard({ word, masteryValue = 0 }: WotdCardProps) {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
      style={{ background: gradient }}
    >
      {/* Decorative Sparkles */}
      <div className="absolute top-2 right-2 opacity-50">
        <Sparkles className="w-5 h-5 animate-pulse" />
      </div>
      
      <div className="flex justify-between items-start mb-6">
        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          WOTD Premium
        </div>
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
