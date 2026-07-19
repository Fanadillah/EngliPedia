"use client";

import { useState, useRef, useCallback } from "react";
import { Volume2 } from "lucide-react";
import { motion } from "motion/react";

interface PronunciationWaveProps {
  text: string;
  lang?: string;
  rate?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Pronunciation button with animated waveform bars.
 * Click to speak, bars animate while audio plays.
 */
export function PronunciationWave({
  text,
  lang = "en-US",
  rate = 0.8,
  label = "Dengarkan",
  size = "md",
  className,
}: PronunciationWaveProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const speakingRef = useRef(false);

  const speak = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    if (speakingRef.current) {
      window.speechSynthesis.cancel();
      speakingRef.current = false;
      setIsPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;

    utterance.onstart = () => {
      speakingRef.current = true;
      setIsPlaying(true);
    };
    utterance.onend = () => {
      speakingRef.current = false;
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      speakingRef.current = false;
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [text, lang, rate]);

  const barHeights = size === "sm" ? [30, 60, 100, 80, 45] : [25, 55, 100, 75, 40, 65, 35];

  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      {/* Waveform bars */}
      <div className={`flex items-center gap-[3px] ${size === "sm" ? "h-5" : "h-7"}`} aria-hidden="true">
        {barHeights.map((h, i) => (
          <motion.div
            key={i}
            className="w-[3px] rounded-full bg-primary"
            animate={
              isPlaying
                ? {
                    height: [
                      `${h * 0.3}%`,
                      `${h * 0.8}%`,
                      `${h}%`,
                      `${h * 0.5}%`,
                      `${h * 0.8}%`,
                      `${h * 0.3}%`,
                    ],
                    opacity: [0.5, 0.8, 1, 0.6, 0.9, 0.5],
                  }
                : { height: "30%", opacity: 0.25 }
            }
            transition={{
              duration: 0.8,
              repeat: isPlaying ? Infinity : 0,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "bottom" }}
          />
        ))}
      </div>

      {/* Speak button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={speak}
        className={`flex items-center gap-1.5 font-semibold transition-colors rounded-xl ${
          isPlaying
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
        } ${size === "sm" ? "text-[11px] px-2 py-1" : "text-sm px-3.5 py-2"}`}
        aria-label={isPlaying ? "Stop" : `Dengarkan pronunciation ${text}`}
      >
        <Volume2 className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
        {isPlaying ? "Memutar..." : label}
      </motion.button>
    </div>
  );
}
