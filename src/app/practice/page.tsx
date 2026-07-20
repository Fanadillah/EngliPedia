"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Brain,
  Headphones,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-components";
import { motion } from "motion/react";
import { getMistakes } from "@/lib/learning";
import { useAuth } from "@/components/auth/auth-context";

const practiceModes = [
  {
    href: "/flashcard",
    icon: BookOpen,
    title: "Flashcard",
    description: "Hafal kosakata baru dengan spaced repetition",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    iconColor: "text-violet-500",
  },
  {
    href: "/quiz",
    icon: Brain,
    title: "Quiz",
    description: "Uji pemahaman kosakatamu",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-500",
  },
];

export default function PracticePage() {
  const [mistakesCount, setMistakesCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) loadMistakes();
  }, [user]);

  const loadMistakes = async () => {
    try {
      const mistakes = await getMistakes();
      setMistakesCount(mistakes.length);
    } catch (error) {
      console.error("Failed to load mistakes:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <FadeIn>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Latihan</h1>
                <p className="text-sm text-muted-foreground">Pilih jenis latihan yang mau kamu kerjakan</p>
              </div>
            </div>
          </div>
        </FadeIn>

        <StaggerContainer className="space-y-4">
          {practiceModes.map((mode) => (
            <StaggerItem key={mode.href}>
              <Link href={mode.href}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${mode.color}`} />
                  <div className="p-5 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${mode.bgColor} flex items-center justify-center`}>
                      <mode.icon className={`w-7 h-7 ${mode.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground">{mode.title}</h3>
                      <p className="text-sm text-muted-foreground">{mode.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}

          {/* Review Mistakes */}
          {user && mistakesCount > 0 && (
            <StaggerItem>
              <Link href="/flashcard?mode=mistakes">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-900/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                      <AlertTriangle className="w-7 h-7 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground">Ulangi Kesalahan</h3>
                        <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs">
                          {mistakesCount} kata
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Review kata yang sering kamu salah</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>
          )}

          {/* Listening */}
          <StaggerItem>
            <Link href="/listening">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-orange-100 dark:border-orange-900/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                <div className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                    <Headphones className="w-7 h-7 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground">Listening</h3>
                    <p className="text-sm text-muted-foreground">Dengar dan pahami kosakata</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </motion.div>
            </Link>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </div>
  );
}
