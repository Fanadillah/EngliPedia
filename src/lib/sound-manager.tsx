"use client";

/**
 * Sound Manager — Context + Provider untuk sound effects via Howler.js
 *
 * - Lazy-load Howl instances setelah mount
 * - Play by name (silent fail)
 * - Mute/unmute dengan localStorage persistence
 * - Error handling: silent fail, app tetap jalan
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { Howl, Howler } from "howler";

// ─── Sound Names ────────────────────────────────────────────────────────

export type SoundName =
  | "correct"
  | "incorrect"
  | "wrong"
  | "xpGain"
  | "achievement"
  | "streak"
  | "flip"
  | "swipe"
  | "popup"
  | "click"
  | "sessionComplete"
  | "sessionDone"
  | "tap"
  | "pageTransition";

// ─── Sound Map ──────────────────────────────────────────────────────────

const SOUND_FILES: Record<SoundName, string> = {
  correct: "/sounds/correct.mp3",
  incorrect: "/sounds/incorrect.mp3",
  xpGain: "/sounds/xp-gain.mp3",
  achievement: "/sounds/achievement.mp3",
  streak: "/sounds/streak.mp3",
  flip: "/sounds/flip.mp3",
  swipe: "/sounds/swipe.mp3",
  popup: "/sounds/popup.mp3",
  click: "/sounds/click.mp3",
  sessionComplete: "/sounds/session-complete.mp3",
  sessionDone: "/sounds/session-done.mp3",
  tap: "/sounds/tap.mp3",
  wrong: "/sounds/wrong.mp3",
  pageTransition: "/sounds/page-transition.mp3",
};

// ─── Context ────────────────────────────────────────────────────────────

interface SoundContextType {
  muted: boolean;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  playSound: (name: SoundName) => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

const MUTED_KEY = "engli-sound-enabled";

// ─── Provider ───────────────────────────────────────────────────────────

let globalHowls: Map<SoundName, Howl> | null = null;

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MUTED_KEY);
      if (stored !== null) setMutedState(stored === "true");
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || globalHowls) return;

    const howls = new Map<SoundName, Howl>();
    for (const [name, src] of Object.entries(SOUND_FILES)) {
      howls.set(
        name as SoundName,
        new Howl({
          src: [src],
          preload: true,
          volume: 0.6,
          onloaderror: () => {},
          onplayerror: () => {},
        })
      );
    }
    globalHowls = howls;
  }, []);

  const setMuted = useCallback((val: boolean) => {
    setMutedState(val);
    try { localStorage.setItem(MUTED_KEY, String(val)); } catch {}
    Howler.mute(val);
  }, []);

  const toggleMute = useCallback(() => setMuted(!muted), [muted, setMuted]);

  const playSound = useCallback((name: SoundName) => {
      if (muted || !globalHowls) return;
      const howl = globalHowls.get(name);
      if (howl) {
        try { howl.play(); } catch {}
      }
    }, [muted]);

  return (
    <SoundContext.Provider value={{ muted, setMuted, toggleMute, playSound }}>
      {children}
    </SoundContext.Provider>
  );
}

// ─── Hook & Export ──────────────────────────────────────────────────────

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}

export function playSound(name: SoundName) {
  if (globalHowls) {
    try { globalHowls.get(name)?.play(); } catch {}
  }
}
