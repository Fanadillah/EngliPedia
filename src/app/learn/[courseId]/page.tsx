"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronRight,
  ClipboardCheck,
  Play,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-components";
import { getCourseContent, getNextLesson } from "@/lib/learning";
import type { UnitWithProgress } from "@/types/learning";
import type { Course } from "@/types/learning";
import { createClient } from "@/utils/supabase/client";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [units, setUnits] = useState<UnitWithProgress[]>([]);
  const [nextLesson, setNextLesson] = useState<{ lesson: { id: string; title: string }; unit: { title: string } } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadContent = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      setCourse(courseData);

      const [unitsData, nextLessonData] = await Promise.all([
        getCourseContent(courseId),
        getNextLesson(courseId),
      ]);

      setUnits(unitsData);
      setNextLesson(nextLessonData);
    } catch (error) {
      console.error("Failed to load course:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <Play className="w-5 h-5 text-violet-500" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getUnitProgress = (unit: UnitWithProgress) => {
    if (unit.total_lessons === 0) return 0;
    return Math.round((unit.completed_lessons / unit.total_lessons) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="space-y-4">
            <div className="h-8 w-32 bg-muted/50 animate-pulse rounded" />
            <div className="h-32 bg-muted/50 animate-pulse rounded-2xl" />
            <div className="h-24 bg-muted/50 animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Course tidak ditemukan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <FadeIn>
          {/* Back button */}
          <Link
            href="/learn"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>

          {/* Course header */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 shadow-sm mb-6">
            <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${course.color}`} />
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center shadow-lg`}>
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{course.title}</h1>
                  <Badge className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                    {course.difficulty}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{course.description}</p>

              {nextLesson && (
                <Link href={`/learn/${courseId}/${nextLesson.lesson.id}`}>
                  <Button className="w-full mt-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
                    <Play className="w-4 h-4 mr-2" />
                    Lanjutkan: {nextLesson.lesson.title}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Units and Lessons */}
        <StaggerContainer className="space-y-4">
          {units.map((unit, unitIndex) => (
            <StaggerItem key={unit.id}>
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900/30 shadow-sm overflow-hidden">
                {/* Unit header */}
                <div className="p-4 border-b border-violet-50 dark:border-violet-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                          {unitIndex + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{unit.title}</h3>
                        <p className="text-xs text-muted-foreground">{unit.description}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {unit.completed_lessons}/{unit.total_lessons}
                    </span>
                  </div>

                  {/* Unit progress bar */}
                  {unit.total_lessons > 0 && (
                    <div className="mt-3 h-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${getUnitProgress(unit)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Lessons list */}
                <div className="divide-y divide-violet-50 dark:divide-violet-900/20">
                  {unit.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/learn/${courseId}/${lesson.id}`}
                      className="flex items-center gap-3 p-4 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors"
                    >
                      {getStatusIcon(lesson.status)}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {lesson.title}
                          {lesson.lesson_type === "grammar" && (
                            <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Grammar</span>
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {lesson.lesson_type === "grammar"
                            ? `${lesson.exercise_count} latihan`
                            : `${lesson.word_count} kata`}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>

                {/* Unit Review — show when all lessons completed */}
                {unit.completed_lessons === unit.total_lessons && unit.total_lessons > 0 && (
                  <Link href={`/review/${unit.id}`}>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 transition-colors border-t border-amber-200 dark:border-amber-800/30">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                        <ClipboardCheck className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Unit Review</p>
                        <p className="text-xs text-amber-600/70 dark:text-amber-400/60">Uji pemahaman dari semua lesson</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-500" />
                    </div>
                  </Link>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
}
