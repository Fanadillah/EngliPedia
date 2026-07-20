"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Flame,
  Trophy,
  Zap,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Award,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-components";
import { motion } from "motion/react";
import { loadState } from "@/lib/gamification";
import { getTodayProgress, getDailyGoal, getMistakes } from "@/lib/learning";
import { getMasteredCount, getTotalReviewWords } from "@/lib/spaced-repetition";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useAuth } from "@/components/auth/auth-context";

export default function ProgressPage() {
  const [gamification, setGamification] = useState(loadState());
  const [todayProgress, setTodayProgress] = useState({
    wordsLearned: 0,
    lessonsCompleted: 0,
    xpEarned: 0,
    reviewCompleted: 0,
  });
  const [dailyGoal, setDailyGoal] = useState({ xp_goal: 20, words_goal: 5, lessons_goal: 1 });
  const [mistakesCount, setMistakesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actualMastered, setActualMastered] = useState(0);
  const [totalReviewed, setTotalReviewed] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    setGamification(loadState());
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load SM-2 mastery data (works for all users, not just logged in)
      setActualMastered(getMasteredCount());
      setTotalReviewed(getTotalReviewWords());

      if (user) {
        const [progress, goal, mistakes] = await Promise.all([
          getTodayProgress(),
          getDailyGoal(),
          getMistakes(),
        ]);
        setTodayProgress(progress);
        setDailyGoal(goal);
        setMistakesCount(mistakes.length);
      }
    } catch (error) {
      console.error("Failed to load progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelTitle = (level: number): string => {
    if (level >= 25) return "English Master";
    if (level >= 20) return "Expert";
    if (level >= 15) return "Advanced";
    if (level >= 10) return "Intermediate";
    if (level >= 5) return "Elementary";
    return "Beginner";
  };

  const getDailyGoalPercent = () => {
    const xpPercent = dailyGoal.xp_goal > 0 ? Math.min(100, (todayProgress.xpEarned / dailyGoal.xp_goal) * 100) : 0;
    return Math.round(xpPercent);
  };

  const getCompletedBadgesCount = () => {
    try {
      const earned = localStorage.getItem("engli-earned-badges");
      return earned ? JSON.parse(earned).length : 0;
    } catch {
      return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <FadeIn>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Progress</h1>
                <p className="text-sm text-muted-foreground">Pantau perkembangan belajarmu</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Level & XP */}
        <FadeIn delay={0.1}>
          <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 mb-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/70 text-sm">Level</p>
                <h2 className="text-3xl font-bold">{gamification.currentLevel}</h2>
                <p className="text-white/80 text-sm">{getLevelTitle(gamification.currentLevel)}</p>
              </div>
              <ProgressRing
                value={gamification.currentXpInLevel}
                maxValue={gamification.xpToNextLevel}
                size={80}
                strokeWidth={6}
                color="#ffffff"
                bgColor="rgba(255,255,255,0.2)"
              >
                <Zap className="w-5 h-5 text-white" />
              </ProgressRing>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">XP</span>
                <span className="text-white">{gamification.totalXp.toLocaleString()} / {(gamification.totalXp + gamification.xpToNextLevel - gamification.currentXpInLevel).toLocaleString()}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${gamification.xpToNextLevel > 0 ? (gamification.currentXpInLevel / gamification.xpToNextLevel) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Stats Grid */}
        <StaggerContainer className="grid grid-cols-2 gap-3 mb-6">
          <StaggerItem>
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 p-4 text-center">
              <ProgressRing
                value={Math.min(gamification.streak, 30)}
                maxValue={30}
                size={56}
                strokeWidth={4}
                color="#F97316"
                bgColor="rgba(249,115,22,0.1)"
              >
                <Flame className="w-4 h-4 text-orange-500" />
              </ProgressRing>
              <p className="text-xl font-bold text-orange-600 mt-2">{gamification.streak}</p>
              <p className="text-xs text-muted-foreground">Hari Streak</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 p-4 text-center">
              <ProgressRing
                value={Math.min(actualMastered, 500)}
                maxValue={500}
                size={56}
                strokeWidth={4}
                color="#10B981"
                bgColor="rgba(16,185,129,0.1)"
              >
                <Trophy className="w-4 h-4 text-emerald-500" />
              </ProgressRing>
              <p className="text-xl font-bold text-emerald-600 mt-2">{actualMastered}</p>
              <p className="text-xs text-muted-foreground">Kata Dikuasai</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 p-4 text-center">
              <ProgressRing
                value={Math.min(gamification.viewedWords, 100)}
                maxValue={100}
                size={56}
                strokeWidth={4}
                color="#3B82F6"
                bgColor="rgba(59,130,246,0.1)"
              >
                <BookOpen className="w-4 h-4 text-blue-500" />
              </ProgressRing>
              <p className="text-xl font-bold text-blue-600 mt-2">{gamification.viewedWords}</p>
              <p className="text-xs text-muted-foreground">Kata Dilihat</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 p-4 text-center">
              <ProgressRing
                value={getCompletedBadgesCount()}
                maxValue={20}
                size={56}
                strokeWidth={4}
                color="#A855F7"
                bgColor="rgba(168,85,247,0.1)"
              >
                <Award className="w-4 h-4 text-purple-500" />
              </ProgressRing>
              <p className="text-xl font-bold text-purple-600 mt-2">{getCompletedBadgesCount()}</p>
              <p className="text-xs text-muted-foreground">Pencapaian</p>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Daily Goal */}
        <FadeIn delay={0.3}>
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-violet-500" />
              <h3 className="font-semibold text-foreground">Target Hari Ini</h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">XP</span>
                  <span className="font-medium text-foreground">{todayProgress.xpEarned} / {dailyGoal.xp_goal}</span>
                </div>
                <div className="h-2 bg-violet-100 dark:bg-violet-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${getDailyGoalPercent()}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lesson selesai</span>
                <span className="font-medium text-foreground">{todayProgress.lessonsCompleted} / {dailyGoal.lessons_goal}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kata di-review</span>
                <span className="font-medium text-foreground">{todayProgress.reviewCompleted} / {dailyGoal.words_goal}</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Mistakes warning */}
        {mistakesCount > 0 && (
          <FadeIn delay={0.4}>
            <Link href="/flashcard?mode=mistakes">
              <div className="rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{mistakesCount} kata perlu di-review</p>
                  <p className="text-xs text-muted-foreground">Kata yang sering kamu salah</p>
                </div>
              </div>
            </Link>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
