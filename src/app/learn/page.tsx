"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui/motion-components";
import { motion } from "motion/react";
import { getCourses, enrollInCourse } from "@/lib/learning";
import type { CourseWithProgress } from "@/types/learning";
import { useAuth } from "@/components/auth/auth-context";
import { useToast } from "@/components/ui/toast-provider";

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  elementary: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const difficultyLabels: Record<string, string> = {
  beginner: "Pemula",
  elementary: "Dasar",
  intermediate: "Menengah",
  advanced: "Lanjut",
};

export default function LearnPage() {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      showToast({ type: "info", message: "Login untuk mulai belajar" });
      return;
    }

    const success = await enrollInCourse(courseId);
    if (success) {
      showToast({ type: "success", message: "Berhasil mendaftar!", xpAmount: 10 });
      loadCourses();
    }
  };

  const getProgressPercent = (course: CourseWithProgress) => {
    if (course.total_lessons === 0) return 0;
    return Math.round((course.completed_lessons / course.total_lessons) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <FadeIn>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Belajar</h1>
                <p className="text-sm text-muted-foreground">Pilih course dan mulai belajar</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <FadeIn delay={0.1}>
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Belum ada course tersedia
              </h3>
              <p className="text-muted-foreground">
                Course akan segera hadir. Sabar ya!
              </p>
            </div>
          </FadeIn>
        ) : (
          <StaggerContainer className="space-y-4">
            {courses.map((course) => (
              <StaggerItem key={course.id}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {course.is_enrolled ? (
                    <Link href={`/learn/${course.id}`}>
                      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 shadow-sm hover:shadow-md transition-shadow">
                        {/* Gradient accent */}
                        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${course.color}`} />

                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center shadow-md`}>
                                <GraduationCap className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-foreground">{course.title}</h3>
                                <Badge className={`text-xs ${difficultyColors[course.difficulty]}`}>
                                  {difficultyLabels[course.difficulty]}
                                </Badge>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {course.description}
                          </p>

                          {/* Progress bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                {course.completed_lessons}/{course.total_lessons} lesson selesai
                              </span>
                              <span className="font-medium text-violet-600 dark:text-violet-400">
                                {getProgressPercent(course)}%
                              </span>
                            </div>
                            <div className="h-2 bg-violet-100 dark:bg-violet-900/30 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${getProgressPercent(course)}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 shadow-sm">
                      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${course.color}`} />

                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center shadow-md`}>
                              <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground">{course.title}</h3>
                              <Badge className={`text-xs ${difficultyColors[course.difficulty]}`}>
                                {difficultyLabels[course.difficulty]}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                          {course.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {course.total_lessons} lesson
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleEnroll(course.id)}
                            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                          >
                            <Sparkles className="w-4 h-4 mr-1" />
                            Mulai Belajar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
