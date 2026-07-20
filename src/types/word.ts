export interface Word {
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
}

export interface UserWord {
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
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  streak: number;
  total_words: number;
  mastered_words: number;
  created_at: string;
}
