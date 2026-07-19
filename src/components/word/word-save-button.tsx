"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { isSaved, toggleSaved } from "@/lib/saved-words";

interface WordSaveButtonProps {
  wordId: number;
  className?: string;
  onSave?: (id: number, saved: boolean) => void;
}

/**
 * Animated save/favorite button with heart icon.
 * Persists to localStorage via saved-words library.
 */
export function WordSaveButton({ wordId, className, onSave }: WordSaveButtonProps) {
  const [saved, setSaved] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setSaved(isSaved(wordId));
    setInitialized(true);
  }, [wordId]);

  const toggleSave = () => {
    if (!initialized) return;
    setAnimating(true);
    const newState = toggleSaved(wordId);
    setSaved(newState);
    onSave?.(wordId, newState);
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      onClick={toggleSave}
      className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${
        saved
          ? "text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50"
          : "text-muted-foreground bg-muted hover:bg-muted/80 hover:text-foreground"
      } ${className || ""}`}
      aria-label={saved ? "Hapus dari favorit" : "Simpan kata"}
    >
      <AnimatePresence mode="wait">
        {animating ? (
          <motion.div
            key="burst"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.8, 1], rotate: [0, -15, 0] }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Heart
              className="w-4 h-4"
              fill={saved ? "currentColor" : "none"}
            />
          </motion.div>
        ) : (
          <motion.div
            key="static"
            initial={{ scale: 1 }}
            animate={{ scale: 1 }}
          >
            <Heart
              className="w-4 h-4"
              fill={saved ? "currentColor" : "none"}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
