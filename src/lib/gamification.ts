"use client";

// ─── Types ──────────────────────────────────────────────────────────────

export interface GamificationState {
  totalXp: number;
  streak: number;
  lastActiveDate: string; // ISO date string (YYYY-MM-DD)
  dailyXp: number;
  dailyXpDate: string; // ISO date string (YYYY-MM-DD)
  masteredWords: number;
  viewedWords: number; // total distinct words viewed
  completedSessions: number;
  lastSessionDate: string;
  levelTitle: string;
  currentLevel: number;
  xpToNextLevel: number;
  currentXpInLevel: number;
}

export interface XpEvent {
  action: XpAction;
  xp: number;
  message: string;
  timestamp: number;
}

export type XpAction =
  | "view_word"
  | "learn_flashcard"
  | "master_word"
  | "daily_login"
  | "streak_milestone"
  | "complete_session"
  | "save_word";

// ─── Constants ──────────────────────────────────────────────────────────

const STORAGE_KEY = "engli-gamification";

const XP_REWARDS: Record<XpAction, { xp: number; message: string }> = {
  view_word: { xp: 5, message: "Melihat kata" },
  learn_flashcard: { xp: 10, message: "Belajar dengan flashcard" },
  master_word: { xp: 25, message: "Menguasai kata" },
  daily_login: { xp: 10, message: "Login harian" },
  streak_milestone: { xp: 50, message: "Pencapaian streak!" },
  complete_session: { xp: 30, message: "Menyelesaikan sesi belajar" },
  save_word: { xp: 3, message: "Menyimpan kata favorit" },
};

const DAILY_VIEW_CAP = 50; // max XP from viewing words per day
const STREAK_MILESTONES = [7, 14, 21, 30, 60, 90, 180, 365];

export const LEVEL_TITLES: Record<number, string> = {
  1: "Word Explorer",
  2: "Vocabulary Seeker",
  3: "Language Apprentice",
  4: "Word Collector",
  5: "Phrase Hunter",
  6: "Sentence Builder",
  7: "Grammar Novice",
  8: "Language Learner",
  9: "Fluent Beginner",
  10: "Intermediate Starter",
  11: "Word Master",
  12: "Language Adept",
  13: "Vocabulary Virtuoso",
  14: "Phrase Master",
  15: "Sentence Architect",
  16: "Grammarian",
  17: "Language Expert",
  18: "Almost Fluent",
  19: "Word Sage",
  20: "Fluent Speaker",
  21: "Language Master",
  22: "Vocabulary Legend",
  23: "Phrase Legend",
  24: "Sentence Legend",
  25: "Englipedia Master",
};

// ─── Level Calculation ──────────────────────────────────────────────────

/**
 * XP needed cumulatively to reach a given level.
 * Formula: 50 * level * (level - 1)
 */
export function cumulativeXpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

/**
 * Calculate level from total XP.
 */
export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (cumulativeXpForLevel(level + 1) <= totalXp) {
    level++;
  }
  return Math.min(level, 25);
}

/**
 * Get XP progress within current level.
 */
export function xpProgress(totalXp: number): {
  currentLevel: number;
  currentXpInLevel: number;
  xpToNextLevel: number;
  levelTitle: string;
} {
  const currentLevel = levelFromXp(totalXp);
  const currentLevelXp = cumulativeXpForLevel(currentLevel);
  const nextLevelXp = cumulativeXpForLevel(currentLevel + 1);
  return {
    currentLevel,
    currentXpInLevel: totalXp - currentLevelXp,
    xpToNextLevel: nextLevelXp - currentLevelXp,
    levelTitle: LEVEL_TITLES[currentLevel] || `Level ${currentLevel}`,
  };
}

// ─── Storage ────────────────────────────────────────────────────────────

const defaultState: GamificationState = {
  totalXp: 0,
  streak: 0,
  lastActiveDate: "",
  dailyXp: 0,
  dailyXpDate: "",
  masteredWords: 0,
  viewedWords: 0,
  completedSessions: 0,
  lastSessionDate: "",
  levelTitle: "Word Explorer",
  currentLevel: 1,
  xpToNextLevel: 100,
  currentXpInLevel: 0,
};

export function loadState(): GamificationState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Recalculate level display data
      const progress = xpProgress(parsed.totalXp || 0);
      return {
        ...defaultState,
        ...parsed,
        ...progress,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return defaultState;
}

export function saveState(state: Partial<GamificationState>): GamificationState {
  if (typeof window === "undefined") return loadState();
  try {
    const current = loadState();
    const merged = { ...current, ...state };
    // Recalculate level data
    const progress = xpProgress(merged.totalXp);
    merged.currentLevel = progress.currentLevel;
    merged.currentXpInLevel = progress.currentXpInLevel;
    merged.xpToNextLevel = progress.xpToNextLevel;
    merged.levelTitle = progress.levelTitle;

    // Store only serializable data (not derived)
    const toStore = {
      totalXp: merged.totalXp,
      streak: merged.streak,
      lastActiveDate: merged.lastActiveDate,
      dailyXp: merged.dailyXp,
      dailyXpDate: merged.dailyXpDate,
      masteredWords: merged.masteredWords,
      viewedWords: merged.viewedWords,
      completedSessions: merged.completedSessions,
      lastSessionDate: merged.lastSessionDate,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));

    // Trigger cloud sync in background (non-blocking)
    triggerCloudSync(merged);

    return merged;
  } catch {
    return loadState();
  }
}

// Debounced cloud sync — avoids spamming Supabase on rapid updates
let _syncTimeout: ReturnType<typeof setTimeout> | null = null;
function triggerCloudSync(state: GamificationState) {
  if (typeof window === "undefined") return;
  if (_syncTimeout) clearTimeout(_syncTimeout);
  _syncTimeout = setTimeout(async () => {
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient() as any;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("user_profiles")
        .upsert({
          id: user.id,
          email: user.email || "",
          total_xp: state.totalXp,
          streak: state.streak,
          last_active_date: state.lastActiveDate,
          daily_xp: state.dailyXp,
          daily_xp_date: state.dailyXpDate,
          mastered_words: state.masteredWords,
          viewed_words: state.viewedWords,
          completed_sessions: state.completedSessions,
          last_session_date: state.lastSessionDate,
          total_words: state.masteredWords,
        }, { onConflict: "id" });
    } catch {
      // Silent fail — will retry on next save
    }
  }, 2000); // 2s debounce
}

// ─── Actions ────────────────────────────────────────────────────────────

/**
 * Check and update streak. Call on every page visit.
 */
export function checkStreak(): GamificationState {
  const state = loadState();
  const today = new Date().toISOString().slice(0, 10);

  if (state.lastActiveDate === today) {
    // Already checked in today
    return state;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (state.lastActiveDate === yesterday) {
    // Consecutive day
    const newStreak = state.streak + 1;

    // Check for streak milestone bonus
    if (STREAK_MILESTONES.includes(newStreak)) {
      return awardXp("streak_milestone", state);
    }

    return saveState({
      ...state,
      streak: newStreak,
      lastActiveDate: today,
    });
  }

  if (state.lastActiveDate && state.lastActiveDate < yesterday) {
    // Streak broken
    return saveState({
      ...state,
      streak: 1,
      lastActiveDate: today,
    });
  }

  // First ever visit
  return saveState({
    ...state,
    streak: 1,
    lastActiveDate: today,
  });
}

/**
 * Award XP for an action, respecting daily caps.
 */
export function awardXp(action: XpAction, overrides?: Partial<GamificationState>): GamificationState {
  const state = overrides ? { ...loadState(), ...overrides } : loadState();
  const reward = XP_REWARDS[action];
  const today = new Date().toISOString().slice(0, 10);

  // Reset daily XP if it's a new day
  let dailyXp = state.dailyXp;
  let dailyXpDate = state.dailyXpDate;
  if (dailyXpDate !== today) {
    dailyXp = 0;
    dailyXpDate = today;
  }

  // Check daily cap for view_word
  let earned = reward.xp;
  if (action === "view_word") {
    const remaining = DAILY_VIEW_CAP - dailyXp;
    if (remaining <= 0) return state; // Cap reached
    earned = Math.min(reward.xp, remaining);
  }

  const newTotalXp = state.totalXp + earned;
  const oldLevel = levelFromXp(state.totalXp);
  const newLevel = levelFromXp(newTotalXp);

  return saveState({
    ...state,
    totalXp: newTotalXp,
    dailyXp: dailyXp + earned,
    dailyXpDate,
    ...(action === "master_word" ? { masteredWords: (state.masteredWords || 0) + 1 } : {}),
    ...(action === "view_word" ? { viewedWords: (state.viewedWords || 0) + 1 } : {}),
    ...(action === "complete_session" ? {
      completedSessions: (state.completedSessions || 0) + 1,
      lastSessionDate: today,
    } : {}),
    lastActiveDate: today,
  });
}

/**
 * Get a formatted XP event message for toast display.
 */
export function getXpEventMessage(action: XpAction, xpAwarded?: number): string {
  const reward = XP_REWARDS[action];
  const xp = xpAwarded ?? reward.xp;
  return `+${xp} XP • ${reward.message}`;
}
