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
  created_at: string;
}

export interface Unit {
  id: string;
  course_id: string;
  title: string;
  description: string;
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
  status: "not_started" | "in_progress" | "completed";
}
