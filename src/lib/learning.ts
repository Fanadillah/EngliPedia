"use client";

import { createClient } from "@/utils/supabase/client";
import type { Course, Unit, Lesson, CourseWithProgress, UnitWithProgress, LessonWithProgress } from "@/types/learning";
import type { Word } from "@/types/word";

const client = () => createClient() as any;

// ─── Get all published courses ─────────────────────────────────────────

export async function getCourses(): Promise<CourseWithProgress[]> {
  const { data: courses } = await client()
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");

  if (!courses) return [];

  // Get user progress if logged in
  const { data: { user } } = await client().auth.getUser();

  const coursesWithProgress: CourseWithProgress[] = [];

  for (const course of courses as Course[]) {
    // Count total lessons in course
    const { count: totalLessons } = await client()
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .in("unit_id",
        ((await client()
          .from("units")
          .select("id")
          .eq("course_id", course.id)) as any).data?.map((u: any) => u.id) || []
      );

    let completedLessons = 0;
    let isEnrolled = false;

    if (user) {
      // Check enrollment
      const { data: enrollment } = await client()
        .from("user_course_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .single();

      isEnrolled = !!enrollment;

      if (isEnrolled) {
        // Count completed lessons
        const { count } = await client()
          .from("user_lesson_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "completed")
          .in("lesson_id",
            ((await client()
              .from("lessons")
              .select("id")
              .in("unit_id",
                ((await client()
                  .from("units")
                  .select("id")
                  .eq("course_id", course.id)) as any).data?.map((u: any) => u.id) || []
              )) as any).data?.map((l: any) => l.id) || []
          );
        completedLessons = count || 0;
      }
    }

    coursesWithProgress.push({
      ...course,
      total_lessons: totalLessons || 0,
      completed_lessons: completedLessons,
      is_enrolled: isEnrolled,
    });
  }

  return coursesWithProgress;
}

// ─── Get units and lessons for a course ────────────────────────────────

export async function getCourseContent(courseId: string): Promise<UnitWithProgress[]> {
  const { data: units } = await client()
    .from("units")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order");

  if (!units) return [];

  const { data: { user } } = await client().auth.getUser();
  const unitIds = (units as Unit[]).map(u => u.id);

  // Get all lessons for these units
  const { data: lessons } = await client()
    .from("lessons")
    .select("*")
    .in("unit_id", unitIds)
    .order("sort_order");

  const lessonsByUnit = new Map<string, Lesson[]>();
  for (const lesson of (lessons || []) as Lesson[]) {
    const list = lessonsByUnit.get(lesson.unit_id) || [];
    list.push(lesson);
    lessonsByUnit.set(lesson.unit_id, list);
  }

  // Get word counts for all lessons
  const lessonIds = (lessons || []).map((l: any) => l.id);
  const wordCounts = new Map<string, number>();

  if (lessonIds.length > 0) {
    // Get word counts per lesson using a simpler approach
    const { data: lessonWords } = await client()
      .from("lesson_words")
      .select("lesson_id, id")
      .in("lesson_id", lessonIds);

    for (const lw of (lessonWords || []) as any[]) {
      wordCounts.set(lw.lesson_id, (wordCounts.get(lw.lesson_id) || 0) + 1);
    }
  }

  // Get user progress for all lessons
  const progressMap = new Map<string, string>(); // lesson_id -> status
  if (user && lessonIds.length > 0) {
    const { data: progress } = await client()
      .from("user_lesson_progress")
      .select("lesson_id, status")
      .eq("user_id", user.id)
      .in("lesson_id", lessonIds);

    for (const p of (progress || []) as any[]) {
      progressMap.set(p.lesson_id, p.status);
    }
  }

  return (units as Unit[]).map((unit) => {
    const unitLessons = lessonsByUnit.get(unit.id) || [];
    const completedCount = unitLessons.filter(l => progressMap.get(l.id) === "completed").length;

    return {
      ...unit,
      lessons: unitLessons.map((lesson) => ({
        ...lesson,
        word_count: wordCounts.get(lesson.id) || 0,
        status: (progressMap.get(lesson.id) || "not_started") as "not_started" | "in_progress" | "completed",
      })),
      completed_lessons: completedCount,
      total_lessons: unitLessons.length,
    };
  });
}

// ─── Get lesson words with full word data ──────────────────────────────

export async function getLessonWords(lessonId: string): Promise<(Word & { sort_order: number })[]> {
  const { data: lessonWords } = await client()
    .from("lesson_words")
    .select("word_id, sort_order")
    .eq("lesson_id", lessonId)
    .order("sort_order");

  if (!lessonWords || lessonWords.length === 0) return [];

  const wordIds = (lessonWords as any[]).map(lw => lw.word_id);
  const sortOrderMap = new Map<number, number>();
  for (const lw of lessonWords as any[]) {
    sortOrderMap.set(lw.word_id, lw.sort_order);
  }

  const { data: words } = await client()
    .from("words")
    .select("*")
    .in("id", wordIds);

  return (words || []).map((word: any) => ({
    ...word,
    sort_order: sortOrderMap.get(word.id) || 0,
  })).sort((a: any, b: any) => a.sort_order - b.sort_order);
}

// ─── Enroll in a course ───────────────────────────────────────────────

export async function enrollInCourse(courseId: string): Promise<boolean> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return false;

  const { error } = await client()
    .from("user_course_progress")
    .upsert({
      user_id: user.id,
      course_id: courseId,
      is_active: true,
    }, { onConflict: "user_id,course_id" });

  return !error;
}

// ─── Update lesson progress ───────────────────────────────────────────

export async function updateLessonProgress(
  lessonId: string,
  status: "not_started" | "in_progress" | "completed",
  wordsLearned: number = 0,
  quizScore: number = 0
): Promise<void> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return;

  await client()
    .from("user_lesson_progress")
    .upsert({
      user_id: user.id,
      lesson_id: lessonId,
      status,
      words_learned: wordsLearned,
      quiz_score: quizScore,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    }, { onConflict: "user_id,lesson_id" });
}

// ─── Get next lesson for a course ─────────────────────────────────────

export async function getNextLesson(courseId: string): Promise<{ lesson: Lesson; unit: Unit } | null> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return null;

  // Get all units in order
  const { data: units } = await client()
    .from("units")
    .select("id")
    .eq("course_id", courseId)
    .order("sort_order");

  if (!units || units.length === 0) return null;

  const unitIds = (units as any[]).map(u => u.id);

  // Get all lessons in order
  const { data: lessons } = await client()
    .from("lessons")
    .select("*")
    .in("unit_id", unitIds)
    .order("sort_order");

  if (!lessons || lessons.length === 0) return null;

  const lessonIds = (lessons as any[]).map(l => l.id);

  // Get completed lessons
  const { data: completed } = await client()
    .from("user_lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .in("lesson_id", lessonIds);

  const completedSet = new Set((completed || []).map((c: any) => c.lesson_id));

  // Find first incomplete lesson
  const unitMap = new Map((units as any[]).map(u => [u.id, u]));

  for (const lesson of lessons as any[]) {
    if (!completedSet.has(lesson.id)) {
      return {
        lesson: lesson as Lesson,
        unit: unitMap.get(lesson.unit_id) as Unit,
      };
    }
  }

  return null; // All lessons completed
}

// ─── Get daily learning tasks ─────────────────────────────────────────

export async function getDailyLearningTasks(): Promise<{
  nextLesson: { lesson: Lesson; unit: Unit; course: Course } | null;
  dueWordsCount: number;
  activeCourses: CourseWithProgress[];
}> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return { nextLesson: null, dueWordsCount: 0, activeCourses: [] };

  // Get active courses
  const { data: enrollments } = await client()
    .from("user_course_progress")
    .select("course_id")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const activeCourseIds = (enrollments || []).map((e: any) => e.course_id);

  let activeCourses: CourseWithProgress[] = [];
  let nextLesson: { lesson: Lesson; unit: Unit; course: Course } | null = null;

  if (activeCourseIds.length > 0) {
    // Get course details
    const { data: courses } = await client()
      .from("courses")
      .select("*")
      .in("id", activeCourseIds);

    // For each active course, find the next lesson
    for (const course of (courses || []) as Course[]) {
      const result = await getNextLesson(course.id);
      if (result) {
        nextLesson = { ...result, course };
        break; // Use first course with available lesson
      }
    }

    // Build course progress for sidebar
    activeCourses = await getCourses();
  }

  // Count due flashcard words
  const today = new Date().toISOString().split("T")[0];
  const { count: dueWordsCount } = await client()
    .from("user_words")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .lte("next_review_date", today);

  return {
    nextLesson,
    dueWordsCount: dueWordsCount || 0,
    activeCourses,
  };
}
