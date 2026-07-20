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
          last_reviewed: string;
          next_review: string;
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
          last_reviewed?: string;
          next_review?: string;
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
          last_reviewed?: string;
          next_review?: string;
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
    };
  };
}
