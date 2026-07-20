export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      words: {
        Row: {
          id: number;
          word: string;
          ipa: string;
          pos: string;
          meaning_id: string;
          definition: string;
          example: string;
          example_id: string;
          frequency: number;
          cara_baca: string;
          level: "basic" | "intermediate" | "advanced";
          created_at: string;
        };
        Insert: {
          id?: number;
          word: string;
          ipa?: string;
          pos?: string;
          meaning_id?: string;
          definition?: string;
          example?: string;
          example_id?: string;
          frequency?: number;
          cara_baca?: string;
          level?: "basic" | "intermediate" | "advanced";
          created_at?: string;
        };
        Update: {
          id?: number;
          word?: string;
          ipa?: string;
          pos?: string;
          meaning_id?: string;
          definition?: string;
          example?: string;
          frequency?: number;
          cara_baca?: string;
          level?: "basic" | "intermediate" | "advanced";
          created_at?: string;
        };
      };
      user_words: {
        Row: {
          id: string;
          user_id: string;
          word_id: number;
          status: "new" | "learning" | "mastered";
          mastery: number;
          easiness_factor: number;
          interval_days: number;
          repetitions: number;
          last_review_date: string | null;
          next_review_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          word_id: number;
          status?: "new" | "learning" | "mastered";
          mastery?: number;
          easiness_factor?: number;
          interval_days?: number;
          repetitions?: number;
          last_review_date?: string | null;
          next_review_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          word_id?: number;
          status?: "new" | "learning" | "mastered";
          mastery?: number;
          easiness_factor?: number;
          interval_days?: number;
          repetitions?: number;
          last_review_date?: string | null;
          next_review_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string;
          streak: number;
          total_words: number;
          mastered_words: number;
          total_xp: number;
          last_active_date: string;
          daily_xp: number;
          daily_xp_date: string;
          viewed_words: number;
          completed_sessions: number;
          last_session_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          streak?: number;
          total_words?: number;
          mastered_words?: number;
          total_xp?: number;
          last_active_date?: string;
          daily_xp?: number;
          daily_xp_date?: string;
          viewed_words?: number;
          completed_sessions?: number;
          last_session_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          streak?: number;
          total_words?: number;
          mastered_words?: number;
          total_xp?: number;
          last_active_date?: string;
          daily_xp?: number;
          daily_xp_date?: string;
          viewed_words?: number;
          completed_sessions?: number;
          last_session_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_saved_words: {
        Row: {
          id: string;
          user_id: string;
          word_id: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          word_id: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          word_id?: number;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          difficulty: string;
          theme: string;
          icon: string;
          color: string;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          difficulty?: string;
          theme?: string;
          icon?: string;
          color?: string;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          difficulty?: string;
          theme?: string;
          icon?: string;
          color?: string;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
      };
      units: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          unit_id: string;
          title: string;
          description: string;
          lesson_type: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          unit_id: string;
          title: string;
          description?: string;
          lesson_type?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          unit_id?: string;
          title?: string;
          description?: string;
          lesson_type?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      lesson_words: {
        Row: {
          id: string;
          lesson_id: string;
          word_id: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          word_id: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          word_id?: number;
          sort_order?: number;
          created_at?: string;
        };
      };
      user_lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          status: string;
          words_learned: number;
          quiz_score: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          status?: string;
          words_learned?: number;
          quiz_score?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          status?: string;
          words_learned?: number;
          quiz_score?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_unit_progress: {
        Row: {
          id: string;
          user_id: string;
          unit_id: string;
          is_completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          unit_id: string;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          unit_id?: string;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_course_progress: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          is_active: boolean;
          enrolled_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          is_active?: boolean;
          enrolled_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          is_active?: boolean;
          enrolled_at?: string;
          created_at?: string;
        };
      };
    };
  };
}
