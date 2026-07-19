"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, Flame, Star, Zap, Shield, Crown, Target, BookOpen } from "lucide-react";
import { TrophyEmptyIllustration } from "@/components/illustrations";
import { motion } from "motion/react";
import { loadState } from "@/lib/gamification";
import { LEVEL_TITLES } from "@/lib/gamification";
import { Confetti } from "@/components/ui/confetti";

// Badge definitions
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: typeof Sparkles;
  condition: (state: ReturnType<typeof loadState>) => boolean;
  color: string;
  bgColor: string;
}

const badges: Badge[] = [
  {
    id: "first-word",
    name: "First Step",
    description: "Lihat kata pertamamu",
    icon: Star,
    condition: (s) => s.viewedWords >= 1,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    id: "ten-words",
    name: "Curious Mind",
    description: "Lihat 10 kata berbeda",
    icon: BookOpen,
    condition: (s) => s.viewedWords >= 10,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: "streak-3",
    name: "Getting Started",
    description: "Streak 3 hari berturut-turut",
    icon: Flame,
    condition: (s) => s.streak >= 3,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    id: "streak-7",
    name: "Weekly Warrior",
    description: "Streak 7 hari berturut-turut",
    icon: Flame,
    condition: (s) => s.streak >= 7,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
  {
    id: "streak-30",
    name: "Monthly Master",
    description: "Streak 30 hari berturut-turut",
    icon: Crown,
    condition: (s) => s.streak >= 30,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    id: "xp-100",
    name: "Eager Learner",
    description: "Kumpulkan 100 XP",
    icon: Zap,
    condition: (s) => s.totalXp >= 100,
    color: "text-violet-500",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    id: "xp-500",
    name: "Dedicated Student",
    description: "Kumpulkan 500 XP",
    icon: Zap,
    condition: (s) => s.totalXp >= 500,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    id: "xp-1000",
    name: "XP Hunter",
    description: "Kumpulkan 1.000 XP",
    icon: Trophy,
    condition: (s) => s.totalXp >= 1000,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    id: "level-5",
    name: "Loyal Explorer",
    description: "Capai Level 5",
    icon: Shield,
    condition: (s) => s.currentLevel >= 5,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  {
    id: "level-10",
    name: "Language Adept",
    description: "Capai Level 10",
    icon: Crown,
    condition: (s) => s.currentLevel >= 10,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
  },
  {
    id: "first-master",
    name: "First Mastery",
    description: "Kuasi kata pertamamu",
    icon: Target,
    condition: (s) => s.masteredWords >= 1,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/30",
  },
  {
    id: "session-1",
    name: "Study Session",
    description: "Selesaikan sesi belajar pertamamu",
    icon: BookOpen,
    condition: (s) => s.completedSessions >= 1,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
  },
];

const BADGE_TRACKING_KEY = "engli-earned-badges";

function loadEarnedBadgeIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BADGE_TRACKING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEarnedBadgeIds(ids: string[]) {
  try {
    localStorage.setItem(BADGE_TRACKING_KEY, JSON.stringify(ids));
  } catch {
    // Ignore
  }
}

export default function AchievementsPage() {
  const [state, setState] = useState(loadState());
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiBadge, setConfettiBadge] = useState<string | null>(null);

  useEffect(() => {
    const currentState = loadState();
    setState(currentState);

    // Detect newly earned badges
    const previouslyEarned = loadEarnedBadgeIds();
    const currentlyEarned = badges
      .filter((b) => b.condition(currentState))
      .map((b) => b.id);
    const newlyEarned = currentlyEarned.filter((id) => !previouslyEarned.includes(id));

    if (newlyEarned.length > 0) {
      // Save earned badge IDs
      saveEarnedBadgeIds(currentlyEarned);
      // Trigger confetti for the first new badge
      const badge = badges.find((b) => b.id === newlyEarned[0]);
      if (badge) {
        setConfettiBadge(badge.name);
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setConfettiBadge(null);
        }, 3500);
      }
    } else if (previouslyEarned.length === 0 && currentlyEarned.length > 0) {
      // First visit with earned badges - just save without confetti
      saveEarnedBadgeIds(currentlyEarned);
    }
  }, []);

  const earnedBadges = badges.filter((b) => b.condition(state));
  const lockedBadges = badges.filter((b) => !b.condition(state));
  const xpPercent = state.xpToNextLevel > 0 ? (state.currentXpInLevel / state.xpToNextLevel) * 100 : 0;
  const progressPercent = Math.min(100, xpPercent);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <Confetti active={showConfetti} particleCount={80} duration={3000} />
      <div className="p-4 space-y-4 max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Pencapaian</h1>
          {state.totalXp > 0 && (
            <span className="text-xs text-muted-foreground">
              {earnedBadges.length} / {badges.length} badge
            </span>
          )}
        </div>

        {/* XP Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/5 to-secondary/5 border border-primary/10 p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  Level {state.currentLevel} &middot; {LEVEL_TITLES[state.currentLevel] || `Level ${state.currentLevel}`}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {state.levelTitle}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-muted-foreground">
                {state.currentXpInLevel.toLocaleString()} / {state.xpToNextLevel.toLocaleString()} XP
              </p>
              <p className="text-[10px] text-primary font-medium">
                Total {state.totalXp.toLocaleString()} XP
              </p>
            </div>
          </div>

          {/* Progress bar with animated fill */}
          <div className="h-3 bg-muted rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
            {/* Shimmer */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
            </div>
          </div>

          {/* Quick stats row */}
          <div className="flex items-center justify-around pt-1">
            <div className="text-center">
              <p className="text-xs font-bold">{state.totalXp}</p>
              <p className="text-[10px] text-muted-foreground">Total XP</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold">{state.streak}</p>
              <p className="text-[10px] text-muted-foreground">Streak</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold">{state.viewedWords}</p>
              <p className="text-[10px] text-muted-foreground">Kata Dilihat</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold">{state.completedSessions}</p>
              <p className="text-[10px] text-muted-foreground">Sesi</p>
            </div>
          </div>
        </motion.div>

        {/* Badges Grid */}
        {state.totalXp > 0 ? (
          <>
            {/* Earned badges */}
            {earnedBadges.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-muted-foreground px-1 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Badge Diraih
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {earnedBadges.map((badge, idx) => {
                    const Icon = badge.icon;
                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-card rounded-xl border border-border p-3.5 text-center hover:shadow-sm transition-shadow"
                      >
                        <div className={`w-10 h-10 rounded-xl ${badge.bgColor} flex items-center justify-center mx-auto mb-2`}>
                          <Icon className={`w-5 h-5 ${badge.color}`} />
                        </div>
                        <p className="text-xs font-semibold">{badge.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{badge.description}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Locked badges */}
            {lockedBadges.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-muted-foreground px-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                  Badge Terkunci
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {lockedBadges.map((badge, idx) => {
                    const Icon = badge.icon;
                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="bg-muted/30 rounded-xl border border-border/30 p-3.5 text-center opacity-50"
                      >
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2">
                          <Icon className="w-5 h-5 text-muted-foreground/30" />
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground">{badge.name}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5">{badge.description}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex justify-center mb-6 text-primary/30">
              <TrophyEmptyIllustration className="w-44 h-44" />
            </div>
            <h2 className="text-xl font-bold text-foreground/80 text-center">
              Mulai petualanganmu!
            </h2>
            <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
              Belajar kata pertama untuk membuka badge dan pencapaian pertamamu
            </p>
            <Link href="/search">
              <Button className="rounded-xl gap-2 mt-8">
                <Trophy className="w-4 h-4" />
                Mulai Belajar
              </Button>
            </Link>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
