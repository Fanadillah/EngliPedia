export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "elementary" | "intermediate" | "advanced";
  theme: string;
  icon: string;
  color: string;
  sort_order: number;
  is_published: boolean;
  estimated_duration: string;
  learning_objectives: string[];
  created_at: string;
}

export interface Unit {
  id: string;
  course_id: string;
  title: string;
  description: string;
  learning_objectives: string[];
  target_words: number;
  target_description: string;
  sort_order: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  lesson_type: "vocabulary" | "grammar" | "listening" | "writing" | "review";
  sort_order: number;
  created_at: string;
}

export interface LessonWord {
  id: string;
  lesson_id: string;
  word_id: number;
  sort_order: number;
  created_at: string;
}

export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: "not_started" | "in_progress" | "completed";
  words_learned: number;
  quiz_score: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserUnitProgress {
  id: string;
  user_id: string;
  unit_id: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserCourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  is_active: boolean;
  enrolled_at: string;
  created_at: string;
}

export interface CourseWithProgress extends Course {
  total_lessons: number;
  completed_lessons: number;
  is_enrolled: boolean;
}

export interface UnitWithProgress extends Unit {
  lessons: LessonWithProgress[];
  completed_lessons: number;
  total_lessons: number;
}

export interface LessonWithProgress extends Lesson {
  word_count: number;
  exercise_count: number;
  status: "not_started" | "in_progress" | "completed";
}

export interface UserMistake {
  id: string;
  user_id: string;
  word_id: number;
  mistake_count: number;
  context: string;
  last_mistake_at: string;
  created_at: string;
}

export interface UserMistakeWithWord extends UserMistake {
  word?: {
    word: string;
    ipa: string;
    meaning_id: string;
    cara_baca: string;
  };
}

export interface UserDailyGoal {
  id: string;
  user_id: string;
  daily_xp_goal: number;
  daily_words_goal: number;
  daily_lessons_goal: number;
  created_at: string;
  updated_at: string;
}

export interface UserDailyTask {
  id: string;
  user_id: string;
  task_date: string;
  task_type: "learn_words" | "review_words" | "complete_lesson" | "practice_quiz" | "daily_challenge";
  task_description: string;
  target_count: number;
  current_count: number;
  is_completed: boolean;
  lesson_id: string | null;
  created_at: string;
}

// ─── Grammar Lesson Content ────────────────────────────────────────────

export interface LessonContent {
  id: string;
  lesson_id: string;
  content_type: "explanation" | "example" | "exercise";
  sort_order: number;
  title: string;
  content: ExplanationContent | ExampleContent | ExerciseContent;
  created_at: string;
}

export interface ExplanationContent {
  text: string;
  pattern: string;
  notes: string[];
}

export interface ExampleContent {
  sentence: string;
  translation: string;
  highlight: string[];
}

export interface ExerciseContent {
  type: "fill_blank" | "mcq" | "reorder";
  question: string;
  answer: string;
  options?: string[];
  hint?: string;
}
