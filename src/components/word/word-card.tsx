"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2 } from "lucide-react";
import { motion } from "motion/react";
import type { Word } from "@/types/word";

interface WordCardProps {
  word: Word;
  onClick?: () => void;
}

export function WordCard({ word, onClick }: WordCardProps) {
  const levelColors = {
    basic: "bg-success/10 text-success",
    intermediate: "bg-warning/10 text-warning",
    advanced: "bg-destructive/10 text-destructive",
  };

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
    >
      <Card className="border-0 shadow-sm cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{word.word}</h3>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={speak}
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-primary" />
                </motion.button>
              </div>
              <p className="text-sm text-muted-foreground font-mono">{word.ipa}</p>
              <p className="text-sm text-primary font-medium">{word.meaning_id}</p>
              {word.cara_baca && (
                <p className="text-xs text-muted-foreground italic">
                  Cara baca: {word.cara_baca}
                </p>
              )}
            </div>
            <Badge variant="secondary" className={levelColors[word.level]}>
              {word.pos}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
