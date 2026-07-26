"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";

interface LevelSelectProps {
  defaultLevel: string;
  onSelect: (level: string) => void;
}

const levels = [
  {
    id: "basic",
    emoji: "🌱",
    title: "Pemula",
    subtitle: '"I know basic words"',
    description: "Kata dasar sehari-hari",
    gradient: "from-green-500 to-emerald-500",
    shadowColor: "shadow-green-500/20",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800/50",
    textColor: "text-green-600 dark:text-green-400",
  },
  {
    id: "intermediate",
    emoji: "🌿",
    title: "Menengah",
    subtitle: '"I can have conversations"',
    description: "Kata sehari-hari + kerja",
    gradient: "from-amber-500 to-orange-500",
    shadowColor: "shadow-amber-500/20",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800/50",
    textColor: "text-amber-600 dark:text-amber-400",
    popular: true,
  },
  {
    id: "advanced",
    emoji: "🌳",
    title: "Mahir",
    subtitle: '"I\'m almost fluent"',
    description: "Academic & advanced vocab",
    gradient: "from-red-500 to-rose-500",
    shadowColor: "shadow-red-500/20",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800/50",
    textColor: "text-red-600 dark:text-red-400",
  },
];

export function LevelSelect({ defaultLevel, onSelect }: LevelSelectProps) {
  const [selected, setSelected] = useState(defaultLevel);

  const handleContinue = () => {
    // Save level preference
    try {
      localStorage.setItem("engli-default-level", selected);
    } catch {}
    onSelect(selected);
  };

  return (
    <div className="text-center space-y-6 py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold">Ayo pilih levelmu</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sesuaikan dengan kemampuan bahasa Inggrismu
        </p>
      </motion.div>

      <div className="space-y-3">
        {levels.map((level, i) => {
          const isSelected = selected === level.id;
          return (
            <motion.button
              key={level.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
              onClick={() => setSelected(level.id)}
              className={`w-full text-left relative overflow-hidden rounded-2xl border-2 p-4 transition-all duration-200 ${
                isSelected
                  ? `${level.borderColor} ${level.bgColor} shadow-lg ${level.shadowColor}`
                  : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              {/* Popular badge */}
              {level.popular && !isSelected && (
                <span className="absolute top-2 right-2 text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                  ★ POPULER
                </span>
              )}
              {level.popular && isSelected && (
                <span className="absolute top-2 right-2 text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                  ★ POPULER
                </span>
              )}

              <div className="flex items-center gap-4">
                {/* Emoji */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${level.gradient} flex items-center justify-center text-2xl shrink-0 shadow-sm`}
                >
                  {level.emoji}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">{level.title}</h3>
                    {isSelected && (
                      <div className={`w-5 h-5 rounded-full ${level.gradient} flex items-center justify-center`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    {level.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {level.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <button
          onClick={handleContinue}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-base hover:opacity-90 transition-all shadow-lg shadow-primary/25 active:scale-[0.98]"
        >
          Lanjut
        </button>
      </motion.div>
    </div>
  );
}
