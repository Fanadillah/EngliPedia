"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, Bell, Volume2, LogOut, User, Sparkles, Mail, Calendar } from "lucide-react";
import { ProfileEmptyIllustration } from "@/components/illustrations";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { useAuth } from "@/components/auth/auth-context";
import { loadGamificationFromCloud } from "@/lib/cloud-sync";
import { loadState, xpProgress, LEVEL_TITLES } from "@/lib/gamification";
import type { GamificationState } from "@/lib/gamification";
import { motion } from "motion/react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [cloudData, setCloudData] = useState<GamificationState | null>(null);

  useEffect(() => {
    if (user) {
      loadGamificationFromCloud().then((cloudData) => {
        const local = loadState();
        if (cloudData) {
          setCloudData({
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
          setCloudData(local);
        }
      });
    } else {
      setCloudData(null);
    }
  }, [user]);

  const stats = cloudData || loadState();
  const levelInfo = xpProgress(stats.totalXp);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="p-4 space-y-4 max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Profil</h1>
        </div>

        {user ? (
          <>
            {/* User info card */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {user.email?.charAt(0).toUpperCase() || <User className="w-8 h-8" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold truncate">
                    {user.user_metadata?.full_name || "Pengguna"}
                  </h2>
                  <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    Bergabung {new Date(user.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Level & XP Progress */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-primary/5 via-primary/5 to-secondary/5 rounded-2xl border border-primary/10 p-4 space-y-3"
              >
                {/* Level header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm text-white font-bold text-lg">
                      {levelInfo.currentLevel}
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        Level {levelInfo.currentLevel}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {levelInfo.levelTitle}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {levelInfo.currentXpInLevel.toLocaleString()} / {levelInfo.xpToNextLevel.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-primary font-medium">
                      {stats.totalXp.toLocaleString()} total XP
                    </p>
                  </div>
                </div>

                {/* XP Progress Bar */}
                <div className="h-2.5 bg-muted rounded-full overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, (levelInfo.currentXpInLevel / levelInfo.xpToNextLevel) * 100)}%`,
                    }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                      style={{ backgroundSize: "200% 100%" }}
                    />
                  </div>
                </div>

                {/* Next level preview */}
                {levelInfo.currentLevel < 25 && (
                  <p className="text-[10px] text-muted-foreground text-center">
                    {levelInfo.currentXpInLevel > 0
                      ? `${Math.round((levelInfo.currentXpInLevel / levelInfo.xpToNextLevel) * 100)}% menuju Level ${levelInfo.currentLevel + 1} — ${LEVEL_TITLES[levelInfo.currentLevel + 1] || `Level ${levelInfo.currentLevel + 1}`}`
                      : `Butuh ${levelInfo.xpToNextLevel.toLocaleString()} XP untuk naik ke Level ${levelInfo.currentLevel + 1}`}
                  </p>
                )}
              </motion.div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center p-3 rounded-xl bg-muted"
                >
                  <p className="text-lg font-bold">{stats.streak}</p>
                  <p className="text-[10px] text-muted-foreground">🔥 Streak</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-center p-3 rounded-xl bg-muted"
                >
                  <p className="text-lg font-bold">{stats.masteredWords}</p>
                  <p className="text-[10px] text-muted-foreground">🏆 Dikuasai</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center p-3 rounded-xl bg-muted"
                >
                  <p className="text-lg font-bold">{stats.completedSessions}</p>
                  <p className="text-[10px] text-muted-foreground">📚 Sesi</p>
                </motion.div>
              </div>

              {/* Logout */}
              <Button
                variant="outline"
                onClick={async () => {
                  await signOut();
                  router.refresh();
                }}
                className="w-full rounded-xl border-rose-200 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </div>
          </>
        ) : (
          /* Not logged in */
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex justify-center mb-6 text-primary/30">
              <ProfileEmptyIllustration className="w-44 h-44" />
            </div>
            <h2 className="text-xl font-bold text-foreground/80 text-center">
              Belum Masuk
            </h2>
            <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
              Masuk untuk menyimpan progress belajarmu dan sinkronisasi ke cloud
            </p>
            <div className="flex items-center gap-3 mt-8">
              <Link href="/auth/login">
                <Button className="rounded-xl gap-2">
                  <LogIn className="w-4 h-4" />
                  Masuk
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Progress sementara disimpan secara lokal
            </p>
          </div>
        )}

        {/* Settings */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground px-1">Pengaturan</h2>
          
          <div className="bg-card rounded-2xl border border-border divide-y divide-border/50">
            <div className="p-4">
              <DarkModeToggle variant="toggle" />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">Pengingat Harian</span>
              </div>
              <div className="w-10 h-6 rounded-full bg-muted-foreground/20 relative cursor-pointer">
                <div className="w-5 h-5 rounded-full bg-card shadow-sm absolute top-0.5 left-0.5" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <span className="text-sm font-medium">Kecepatan Audio</span>
                  <p className="text-[11px] text-muted-foreground">Normal (1x)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
