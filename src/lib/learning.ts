"use client";

import { createClient } from "@/utils/supabase/client";
import type { Course, Unit, Lesson, CourseWithProgress, UnitWithProgress, LessonWithProgress, LessonContent } from "@/types/learning";
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
  const exerciseCounts = new Map<string, number>();

  if (lessonIds.length > 0) {
    // Get word counts per lesson using a simpler approach
    const { data: lessonWords } = await client()
      .from("lesson_words")
      .select("lesson_id, id")
      .in("lesson_id", lessonIds);

    for (const lw of (lessonWords || []) as any[]) {
      wordCounts.set(lw.lesson_id, (wordCounts.get(lw.lesson_id) || 0) + 1);
    }

    // Get exercise counts for grammar lessons
    const grammarLessonIds = (lessons || [])
      .filter((l: any) => l.lesson_type === "grammar")
      .map((l: any) => l.id);

    if (grammarLessonIds.length > 0) {
      const { data: contentRows } = await client()
        .from("lesson_content")
        .select("lesson_id, id")
        .in("lesson_id", grammarLessonIds)
        .eq("content_type", "exercise");

      for (const row of (contentRows || []) as any[]) {
        exerciseCounts.set(row.lesson_id, (exerciseCounts.get(row.lesson_id) || 0) + 1);
      }
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
        exercise_count: exerciseCounts.get(lesson.id) || 0,
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

  const result = await client()
    .from("user_lesson_progress")
    .upsert({
      user_id: user.id,
      lesson_id: lessonId,
      status,
      words_learned: wordsLearned,
      quiz_score: quizScore,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    }, { onConflict: "user_id,lesson_id" });

  if (result.error) {
    const { enqueue } = await import("@/lib/sync-queue");
    enqueue({
      table: "user_lesson_progress",
      operation: "upsert",
      payload: {
        user_id: user.id,
        lesson_id: lessonId,
        status,
        words_learned: wordsLearned,
        quiz_score: quizScore,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      },
      timestamp: Date.now(),
    });
  }

  if (status === "completed") {
    await checkUnitCompletion(lessonId);
  }
}

export async function updateUnitProgress(
  unitId: string,
  isCompleted: boolean
): Promise<void> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return;

  const result = await client()
    .from("user_unit_progress")
    .upsert({
      user_id: user.id,
      unit_id: unitId,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    }, { onConflict: "user_id,unit_id" });

  if (result.error) {
    const { enqueue } = await import("@/lib/sync-queue");
    enqueue({
      table: "user_unit_progress",
      operation: "upsert",
      payload: {
        user_id: user.id,
        unit_id: unitId,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      },
      timestamp: Date.now(),
    });
  }

  if (isCompleted) {
    await checkCourseCompletion(unitId);
  }
}

async function checkUnitCompletion(lessonId: string): Promise<void> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return;

  const { data: lesson } = await client()
    .from("lessons")
    .select("unit_id")
    .eq("id", lessonId)
    .single();

  if (!lesson) return;

  const unitId = (lesson as any).unit_id;

  const { count: totalLessons } = await client()
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("unit_id", unitId);

  const { count: completedLessons } = await client()
    .from("user_lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed")
    .in("lesson_id",
      ((await client()
        .from("lessons")
        .select("id")
        .eq("unit_id", unitId)) as any).data?.map((l: any) => l.id) || []
    );

  if ((totalLessons || 0) > 0 && (completedLessons || 0) >= (totalLessons || 0)) {
    await updateUnitProgress(unitId, true);
  }
}

async function checkCourseCompletion(unitId: string): Promise<void> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return;

  const { data: unit } = await client()
    .from("units")
    .select("course_id")
    .eq("id", unitId)
    .single();

  if (!unit) return;

  const courseId = (unit as any).course_id;

  const { count: totalUnits } = await client()
    .from("units")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  const { count: completedUnits } = await client()
    .from("user_unit_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_completed", true)
    .in("unit_id",
      ((await client()
        .from("units")
        .select("id")
        .eq("course_id", courseId)) as any).data?.map((u: any) => u.id) || []
    );

  if ((totalUnits || 0) > 0 && (completedUnits || 0) >= (totalUnits || 0)) {
    await client()
      .from("user_course_progress")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("course_id", courseId);
  }
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

// ─── Mistakes (Review Wrong Answers) ──────────────────────────────────

export async function addMistake(wordId: number, context: string = ""): Promise<void> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return;

  // Check if mistake already exists
  const { data: existing } = await client()
    .from("user_mistakes")
    .select("id, mistake_count")
    .eq("user_id", user.id)
    .eq("word_id", wordId)
    .single();

  if (existing) {
    await client()
      .from("user_mistakes")
      .update({
        mistake_count: existing.mistake_count + 1,
        context,
        last_mistake_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await client()
      .from("user_mistakes")
      .insert({
        user_id: user.id,
        word_id: wordId,
        mistake_count: 1,
        context,
      });
  }
}

export async function removeMistake(wordId: number): Promise<void> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return;

  await client()
    .from("user_mistakes")
    .delete()
    .eq("user_id", user.id)
    .eq("word_id", wordId);
}

export async function getMistakes(): Promise<{ word_id: number; mistake_count: number; context: string }[]> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return [];

  const { data } = await client()
    .from("user_mistakes")
    .select("word_id, mistake_count, context")
    .eq("user_id", user.id)
    .order("mistake_count", { ascending: false });

  return (data || []) as any[];
}

// ─── Daily Goals ──────────────────────────────────────────────────────

export async function getDailyGoal(): Promise<{ xp_goal: number; words_goal: number; lessons_goal: number }> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return { xp_goal: 20, words_goal: 5, lessons_goal: 1 };

  const { data } = await client()
    .from("user_daily_goals")
    .select("daily_xp_goal, daily_words_goal, daily_lessons_goal")
    .eq("user_id", user.id)
    .single();

  if (!data) {
    // Create default goal
    await client()
      .from("user_daily_goals")
      .insert({
        user_id: user.id,
        daily_xp_goal: 20,
        daily_words_goal: 5,
        daily_lessons_goal: 1,
      });
    return { xp_goal: 20, words_goal: 5, lessons_goal: 1 };
  }

  return {
    xp_goal: data.daily_xp_goal || 20,
    words_goal: data.daily_words_goal || 5,
    lessons_goal: data.daily_lessons_goal || 1,
  };
}

export async function updateDailyGoal(goals: { xp_goal?: number; words_goal?: number; lessons_goal?: number }): Promise<void> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return;

  const update: any = {};
  if (goals.xp_goal !== undefined) update.daily_xp_goal = goals.xp_goal;
  if (goals.words_goal !== undefined) update.daily_words_goal = goals.words_goal;
  if (goals.lessons_goal !== undefined) update.daily_lessons_goal = goals.lessons_goal;

  await client()
    .from("user_daily_goals")
    .upsert({
      user_id: user.id,
      ...update,
    }, { onConflict: "user_id" });
}

// ─── Daily Progress (today's progress) ────────────────────────────────

export async function getTodayProgress(): Promise<{
  wordsLearned: number;
  lessonsCompleted: number;
  xpEarned: number;
  reviewCompleted: number;
}> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return { wordsLearned: 0, lessonsCompleted: 0, xpEarned: 0, reviewCompleted: 0 };

  const today = new Date().toISOString().split("T")[0];

  // Count completed lessons today
  const { count: lessonsCompleted } = await client()
    .from("user_lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed")
    .gte("completed_at", today);

  // Count words learned today (from user_words where last_review_date is today)
  const { count: wordsLearned } = await client()
    .from("user_words")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("last_review_date", today);

  // XP from gamification (read from localStorage)
  let xpEarned = 0;
  try {
    const saved = localStorage.getItem("engli-gamification");
    if (saved) {
      const state = JSON.parse(saved);
      const savedDate = state.dailyXpDate;
      if (savedDate === today) {
        xpEarned = state.dailyXp || 0;
      }
    }
  } catch { /* ignore */ }

  // Count review completed today (words reviewed via flashcard)
  const { count: reviewCompleted } = await client()
    .from("user_words")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .not("last_review_date", "is", null)
    .gte("last_review_date", today);

  return {
    wordsLearned: wordsLearned || 0,
    lessonsCompleted: lessonsCompleted || 0,
    xpEarned,
    reviewCompleted: reviewCompleted || 0,
  };
}

// ─── Daily Tasks (Structured) ────────────────────────────────────────

export type DailyTaskItem = {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  href: string;
  completed: boolean;
  count?: number;
  countLabel?: string;
};

export async function getDailyTasks(): Promise<DailyTaskItem[]> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return [];

  const today = new Date().toISOString().split("T")[0];
  const tasks: DailyTaskItem[] = [];

  // Task 1: Continue Learning (next lesson)
  const { data: enrollments } = await client()
    .from("user_course_progress")
    .select("course_id")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const activeCourseIds = (enrollments || []).map((e: any) => e.course_id);
  let nextLessonHref = "/learn";
  let nextLessonLabel = "Mulai course baru";
  let nextLessonCompleted = false;

  if (activeCourseIds.length > 0) {
    const { data: courses } = await client()
      .from("courses")
      .select("*")
      .in("id", activeCourseIds);

    for (const course of (courses || []) as Course[]) {
      const result = await getNextLesson(course.id);
      if (result) {
        nextLessonHref = `/learn/${course.id}/${result.lesson.id}`;
        nextLessonLabel = result.lesson.title;
        break;
      }
    }

    // Check if all lessons in all active courses are completed
    if (nextLessonLabel === "Mulai course baru") {
      nextLessonCompleted = true;
    }
  }

  // Check today's lesson completion
  const { count: todayLessons } = await client()
    .from("user_lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed")
    .gte("completed_at", today);

  tasks.push({
    id: "lesson",
    label: "Continue Learning",
    description: nextLessonLabel,
    icon: "BookOpen",
    color: "violet",
    href: nextLessonHref,
    completed: (todayLessons || 0) > 0 && nextLessonCompleted,
  });

  // Task 2: Review Due Words (SRS)
  const { count: dueCount } = await client()
    .from("user_words")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .lte("next_review_date", today);

  const dueWordsCount = dueCount || 0;

  // Count words reviewed today
  const { count: reviewedToday } = await client()
    .from("user_words")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("last_review_date", today);

  tasks.push({
    id: "review",
    label: "Review Kata",
    description: dueWordsCount > 0 ? `${dueWordsCount} kata perlu direview` : "Semua kata sudah di-review",
    icon: "RotateCcw",
    color: "orange",
    href: "/flashcard",
    completed: dueWordsCount === 0 || (reviewedToday || 0) >= dueWordsCount,
    count: dueWordsCount,
    countLabel: "kata",
  });

  // Task 3: Practice Quiz
  const { count: quizToday } = await client()
    .from("user_lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed")
    .gte("completed_at", today);

  tasks.push({
    id: "practice",
    label: "Practice Quiz",
    description: "Uji pemahamanmu",
    icon: "Target",
    color: "blue",
    href: "/quiz",
    completed: false, // Quiz is always optional
  });

  // Task 4: Review Mistakes
  const { count: mistakesCount } = await client()
    .from("user_mistakes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  tasks.push({
    id: "mistakes",
    label: "Review Kesalahan",
    description: (mistakesCount || 0) > 0 ? `${mistakesCount} kesalahan perlu diulang` : "Tidak ada kesalahan",
    icon: "AlertTriangle",
    color: "red",
    href: "/practice",
    completed: (mistakesCount || 0) === 0,
    count: mistakesCount || 0,
    countLabel: "kesalahan",
  });

  // Task 5: Daily Challenge (mixed quiz from all learned words)
  const { count: totalLearned } = await client()
    .from("user_words")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Check if daily challenge done today (via localStorage since it's gamification)
  let dailyChallengeDone = false;
  try {
    const saved = localStorage.getItem("engli-gamification");
    if (saved) {
      const state = JSON.parse(saved);
      dailyChallengeDone = state.dailyChallengeDate === today;
    }
  } catch { /* ignore */ }

  tasks.push({
    id: "challenge",
    label: "Daily Challenge",
    description: (totalLearned || 0) >= 5 ? "Quiz campuran dari semua materi" : "Pelajari minimal 5 kata dulu",
    icon: "Zap",
    color: "amber",
    href: "/quiz",
    completed: dailyChallengeDone,
    count: (totalLearned || 0) >= 5 ? 10 : 0,
    countLabel: "soal",
  });

  return tasks;
}

// ─── Lesson Content (Grammar) ─────────────────────────────────────────

export async function getLessonContent(lessonId: string): Promise<LessonContent[]> {
  const { data } = await client()
    .from("lesson_content")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("sort_order");

  return (data || []) as LessonContent[];
}
