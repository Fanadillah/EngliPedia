"use client";

import { motion } from "motion/react";
import { BarChart3, Hash, BookOpen, TrendingUp } from "lucide-react";
import type { Word } from "@/types/word";

interface InfoBarProps {
  word: Word;
  level: { label: string; gradient: string; dot: string; text: string };
}

export function InfoBar({ word, level }: InfoBarProps) {
  const items = [
    {
      icon: BarChart3,
      label: "Frekuensi",
      value: word.frequency?.toLocaleString() || "-",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: BookOpen,
      label: "Part of Speech",
      value: word.pos || "-",
      color: "text-violet-500",
      bg: "bg-violet-50 dark:bg-violet-950/30",
    },
    {
      icon: TrendingUp,
      label: "Level",
      value: level.label,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      icon: Hash,
      label: "ID",
      value: `#${word.id}`,              color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="bg-card rounded-2xl border border-border p-4"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + idx * 0.08, duration: 0.3 }}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors"
          >
            <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold text-card-foreground truncate">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
