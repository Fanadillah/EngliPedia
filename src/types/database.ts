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
          last_reviewed: string;
          next_review: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          word_id: number;
          status?: "new" | "learning" | "mastered";
          mastery?: number;
          last_reviewed?: string;
          next_review?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          word_id?: number;
          status?: "new" | "learning" | "mastered";
          mastery?: number;
          last_reviewed?: string;
          next_review?: string;
          created_at?: string;
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
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          streak?: number;
          total_words?: number;
          mastered_words?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          streak?: number;
          total_words?: number;
          mastered_words?: number;
          created_at?: string;
        };
      };
    };
  };
}
