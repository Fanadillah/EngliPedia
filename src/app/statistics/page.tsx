"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Sparkles, Flame, Trophy, BookOpen, Eye, Brain, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { loadState, xpProgress, LEVEL_TITLES, cumulativeXpForLevel } from "@/lib/gamification";
import { loadGamificationFromCloud } from "@/lib/cloud-sync";
import { useAuth } from "@/components/auth/auth-context";
import type { GamificationState } from "@/lib/gamification";
import { getSavedIds } from "@/lib/saved-words";
import { createClient } from "@/utils/supabase/client";

// ─── SVG Mini Chart ─────────────────────────────────────────────────────

function MiniBar({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-16 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="text-[10px] font-semibold tabular-nums w-10 shrink-0">{value}</span>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
  bgGradient,
  delay,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  sublabel?: string;
  color: string;
  bgGradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl ${bgGradient} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold tabular-nums">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        {sublabel && <p className="text-[9px] text-muted-foreground/60">{sublabel}</p>}
      </div>
    </motion.div>
  );
}

// ─── Level Ladder Item ──────────────────────────────────────────────────

function LevelLadderItem({
  level,
  title,
  xpRequired,
  current,
  levelXp,
}: {
  level: number;
  title: string;
  xpRequired: number;
  current: boolean;
  levelXp: number;
}) {
  const isPast = levelXp >= xpRequired;
  const isLocked = !isPast && !current;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
        current
          ? "bg-primary/10 border border-primary/20"
          : isPast
          ?          "bg-emerald-50/50 dark:bg-emerald-950/20"
          :          "bg-muted/30"
      }`}
    >
      {/* Level number */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
          current
            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm"
            : isPast
            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {level}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isLocked ? "text-muted-foreground" : "text-card-foreground"}`}>
          {title}
        </p>
        <p className={`text-[10px] ${isLocked ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
          {xpRequired.toLocaleString()} XP
        </p>
      </div>

      {/* Status */}
      {current && (
        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
          Current
        </span>
      )}
      {isPast && !current && (
        <span className="text-[10px] text-emerald-500 shrink-0">✅</span>
      )}
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────

export default function StatisticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<GamificationState>(loadState());
  const [savedCount, setSavedCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);

  useEffect(() => {
    // Load saved count
    setSavedCount(getSavedIds().length);
  }, []);

  useEffect(() => {
    if (user) {
      loadGamificationFromCloud().then((cloudData) => {
        const local = loadState();
        if (cloudData) {
          // Merge: take max of local and cloud for each field
          setStats({
            ...local,
            totalXp: Math.max(local.totalXp, cloudData.totalXp),
            streak: Math.max(local.streak, cloudData.streak),
            masteredWords: Math.max(local.masteredWords, cloudData.masteredWords),
            viewedWords: Math.max(local.viewedWords, cloudData.viewedWords),
            completedSessions: Math.max(local.completedSessions, cloudData.completedSessions),
            lastActiveDate: cloudData.lastActiveDate || local.lastActiveDate,
            dailyXp: Math.max(local.dailyXp, cloudData.dailyXp),
            dailyXpDate: cloudData.dailyXpDate || local.dailyXpDate,
            lastSessionDate: cloudData.lastSessionDate || local.lastSessionDate,
          });
        } else {
          setStats(local);
        }
      });
    } else {
      setStats(loadState());
    }
  }, [user]);

  useEffect(() => {
    // Get total word count from DB
    const supabase = createClient();
    supabase
      .from("words")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setTotalWords(count || 0));
  }, []);

  const levelInfo = xpProgress(stats.totalXp);
  const xpPercent = levelInfo.xpToNextLevel > 0
    ? Math.min(100, (levelInfo.currentXpInLevel / levelInfo.xpToNextLevel) * 100)
    : 0;

  const nextMilestone = [7, 14, 21, 30, 60, 90, 180, 365].find((m) => m > stats.streak) || 365;
  const streakProgress = Math.min(100, (stats.streak / nextMilestone) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="p-4 space-y-4 max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto pb-24">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">Statistik</h1>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Sparkles}
            label="Total XP"
            value={stats.totalXp.toLocaleString()}
            sublabel={`Level ${levelInfo.currentLevel}`}
            color="text-violet-500"
            bgGradient="bg-violet-50 dark:bg-violet-950/30"
            delay={0}
          />
          <StatCard
            icon={Flame}
            label="Streak"
            value={`${stats.streak} hari`}
            sublabel={stats.streak >= 7 ? `🔥 ${Math.floor(stats.streak / 7)} minggu!` : undefined}
            color="text-orange-500"
            bgGradient="bg-orange-50 dark:bg-orange-950/30"
            delay={0.05}
          />
          <StatCard
            icon={Eye}
            label="Kata Dilihat"
            value={stats.viewedWords.toLocaleString()}
            color="text-blue-500"
            bgGradient="bg-blue-50 dark:bg-blue-950/30"
            delay={0.1}
          />
          <StatCard
            icon={Trophy}
            label="Kata Dikuasai"
            value={stats.masteredWords.toLocaleString()}
            color="text-emerald-500"
            bgGradient="bg-emerald-50 dark:bg-emerald-950/30"
            delay={0.15}
          />
          <StatCard
            icon={Brain}
            label="Sesi Belajar"
            value={stats.completedSessions.toLocaleString()}
            color="text-amber-500"
            bgGradient="bg-amber-50 dark:bg-amber-950/30"
            delay={0.2}
          />
          <StatCard
            icon={BookOpen}
            label="Kata Tersimpan"
            value={savedCount.toLocaleString()}
            sublabel={totalWords > 0 ? `dari ${totalWords.toLocaleString()} total` : undefined}
            color="text-rose-500"
            bgGradient="bg-rose-50 dark:bg-rose-950/30"
            delay={0.25}
          />
        </div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm text-white font-bold text-lg">
                {levelInfo.currentLevel}
              </div>
              <div>
                <p className="text-sm font-bold">Level {levelInfo.currentLevel}</p>
                <p className="text-[11px] text-muted-foreground">{levelInfo.levelTitle}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-muted-foreground">
                {levelInfo.currentXpInLevel.toLocaleString()} / {levelInfo.xpToNextLevel.toLocaleString()} XP
              </p>
              <p className="text-[10px] text-primary font-medium">{stats.totalXp.toLocaleString()} total</p>
            </div>
          </div>

          <div className="h-3 bg-muted rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                style={{ backgroundSize: "200% 100%" }}
              />
            </div>
          </div>

          {levelInfo.currentLevel < 25 && (
            <p className="text-[11px] text-muted-foreground text-center">
              {levelInfo.currentXpInLevel > 0
                ? `${Math.round(xpPercent)}% menuju Level ${levelInfo.currentLevel + 1}`
                : `Butuh ${levelInfo.xpToNextLevel.toLocaleString()} XP untuk naik level`}
            </p>
          )}
          {levelInfo.currentLevel >= 25 && (
            <p className="text-[11px] text-amber-500 font-semibold text-center">🌟 Level maksimum tercapai!</p>
          )}
        </motion.div>

        {/* Streak Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="text-sm font-bold">Streak Progress</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {stats.streak} / {nextMilestone} hari
            </span>
          </div>

          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${streakProgress}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>🔥 {stats.streak} hari</span>
            <span>🎯 {nextMilestone} hari</span>
          </div>

          {/* Milestone dots */}
          <div className="flex items-center justify-between pt-1">
            {[7, 14, 21, 30, 60, 90].map((m) => {
              const reached = stats.streak >= m;
              return (
                <div key={m} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      reached                      ? "bg-orange-400" : "bg-muted-foreground/20"
                    }`}
                  />
                  <span className={`text-[8px] ${reached ? "text-orange-500 font-semibold" : "text-muted-foreground/50"}`}>
                    {m}d
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Activity Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-2xl border border-border p-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-500" />
            <h2 className="text-sm font-bold">Aktivitas Belajar</h2>
          </div>

          <div className="space-y-2.5">
            <MiniBar
              value={stats.viewedWords}
              max={Math.max(stats.viewedWords, 100)}
              label="Dilihat"
              color="bg-blue-400"
            />
            <MiniBar
              value={stats.masteredWords}
              max={Math.max(stats.masteredWords, stats.viewedWords, 50)}
              label="Dikuasai"
              color="bg-emerald-400"
            />
            <MiniBar
              value={stats.completedSessions}
              max={Math.max(stats.completedSessions, 20)}
              label="Sesi"
              color="bg-amber-400"
            />
            <MiniBar
              value={savedCount}
              max={Math.max(savedCount, 20)}
              label="Tersimpan"
              color="bg-rose-400"
            />
          </div>

          {/* XP Distribution */}
          <div className="border-t border-border/50 pt-3 mt-3">
            <p className="text-[11px] font-semibold text-muted-foreground mb-2">Estimasi XP Distribution</p>
            <div className="flex h-2.5 rounded-full overflow-hidden">
              {[
                { value: stats.viewedWords * 5, color: "bg-blue-400" },
                { value: stats.masteredWords * 25, color: "bg-emerald-400" },
                { value: stats.completedSessions * 30, color: "bg-amber-400" },
                { value: savedCount * 3, color: "bg-rose-400" },
              ]
                .sort((a, b) => b.value - a.value)
                .filter((x) => x.value > 0)
                .map((item, i, arr) => {
                  const total = arr.reduce((s, x) => s + x.value, 0);
                  const pct = total > 0 ? (item.value / total) * 100 : 0;
                  return <div key={i} className={`${item.color}`} style={{ width: `${pct}%` }} />;
                })}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              {[
                { label: "View", value: stats.viewedWords * 5, color: "bg-blue-400" },
                { label: "Master", value: stats.masteredWords * 25, color: "bg-emerald-400" },
                { label: "Session", value: stats.completedSessions * 30, color: "bg-amber-400" },
                { label: "Save", value: savedCount * 3, color: "bg-rose-400" },
              ]
                .filter((x) => x.value > 0)
                .map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-[10px] text-muted-foreground">
                      {item.label}: ~{item.value.toLocaleString()} XP
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>

        {/* Level Ladder */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-5 space-y-2"
        >
          <div className="flex items-center gap-2 pb-1">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-bold">Level Progression</h2>
          </div>

          <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
            {Array.from({ length: 25 }, (_, i) => i + 1).map((lvl) => (
              <LevelLadderItem
                key={lvl}
                level={lvl}
                title={LEVEL_TITLES[lvl] || `Level ${lvl}`}
                xpRequired={cumulativeXpForLevel(lvl)}
                current={lvl === levelInfo.currentLevel}
                levelXp={stats.totalXp}
              />
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
