"use client";

// ─── Types ──────────────────────────────────────────────────────────────

export type ReviewGrade = "again" | "hard" | "good" | "easy";

export interface CardReview {
  wordId: number;
  easinessFactor: number;    // SM-2 EF, minimum 1.3
  interval: number;          // days until next review
  repetitions: number;       // consecutive correct reviews
  lastReviewDate: string;    // ISO date string (YYYY-MM-DD)
  nextReviewDate: string;    // ISO date string (YYYY-MM-DD)
  createdAt: string;         // when first added to SR system
}

export interface DueStats {
  total: number;
  dueToday: number;
  newWords: number;
}

// ─── Constants ──────────────────────────────────────────────────────────

const STORAGE_KEY = "engli-spaced-repetition";
const DEFAULT_EF = 2.5;
const MIN_EF = 1.3;
const MAX_INTERVAL = 365; // cap at 1 year

// ─── SM-2 Algorithm ────────────────────────────────────────────────────

const GRADE_MULTIPLIERS: Record<ReviewGrade, number> = {
  again: 0,
  hard: 1.2,
  good: 1.0,
  easy: 1.3,
};

const GRADE_EF_DELTAS: Record<ReviewGrade, number> = {
  again: 0,
  hard: -0.15,
  good: 0,
  easy: 0.15,
};

/**
 * Calculate the next review interval and EF using SM-2 algorithm.
 */
function calculateNextReview(card: CardReview | null, grade: ReviewGrade): {
  interval: number;
  easinessFactor: number;
  repetitions: number;
} {
  const isNew = !card;
  const ef = isNew ? DEFAULT_EF : card.easinessFactor;
  const reps = isNew ? 0 : card.repetitions;
  const mult = GRADE_MULTIPLIERS[grade];
  const efDelta = GRADE_EF_DELTAS[grade];

  // Update EF
  let newEF = ef + efDelta;
  if (newEF < MIN_EF) newEF = MIN_EF;

  let newInterval: number;
  let newReps: number;

  if (grade === "again") {
    // Failed: reset
    newInterval = 0; // Review again today
    newReps = 0;
  } else if (grade === "hard") {
    // Hard: start fresh but with bonus
    newInterval = Math.max(1, Math.round(1 * mult));
    newReps = reps + 1;
  } else if (isNew || reps === 0) {
    // First review of a new word
    // Easy gets 4 days, good gets 1 day
    newInterval = grade === "easy" ? 4 : 1;
    newReps = 1;
  } else if (reps === 1) {
    // Second review
    newInterval = 6;
    newReps = 2;
  } else {
    // Subsequent reviews: interval * EF * grade_multiplier
    newInterval = Math.round(card!.interval * newEF * mult);
    newReps = reps + 1;
  }

  // Cap interval
  newInterval = Math.min(newInterval, MAX_INTERVAL);

  return { interval: newInterval, easinessFactor: newEF, repetitions: newReps };
}

// ─── Storage ────────────────────────────────────────────────────────────

function loadAllCards(): CardReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAllCards(cards: CardReview[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // Ignore storage errors
  }
}

// ─── Cloud Sync (debounced) ────────────────────────────────────────────

let _syncTimeout: ReturnType<typeof setTimeout> | null = null;

function triggerCloudSync() {
  if (typeof window === "undefined") return;
  if (_syncTimeout) clearTimeout(_syncTimeout);
  _syncTimeout = setTimeout(async () => {
    try {
      const { syncSpacedRepetitionToCloud } = await import("@/lib/cloud-sync");
      const cards = loadAllCards();
      const merged = await syncSpacedRepetitionToCloud(cards);
      // Write back merged result (cloud may have newer data)
      saveAllCards(merged);
    } catch {
      // Queue for retry when online — convert to snake_case for DB columns
      try {
        const { enqueue } = await import("@/lib/sync-queue");
        const cards = loadAllCards();
        const dbRows = cards.map((c) => ({
          word_id: c.wordId,
          easiness_factor: c.easinessFactor,
          interval_days: c.interval,
          repetitions: c.repetitions,
          last_review_date: c.lastReviewDate || null,
          next_review_date: c.nextReviewDate || null,
        }));
        enqueue({
          table: "user_words",
          operation: "upsert",
          payload: dbRows,
          timestamp: Date.now(),
        });
      } catch {
        // Last resort silent fail
      }
    }
  }, 2000); // 2s debounce
}

// ─── Public API ─────────────────────────────────────────────────────────

/**
 * Get all cards in the SR system.
 */
export function getCards(): CardReview[] {
  return loadAllCards();
}

/**
 * Get a single card by word ID.
 */
export function getCard(wordId: number): CardReview | null {
  const cards = loadAllCards();
  return cards.find((c) => c.wordId === wordId) || null;
}

/**
 * Record a review for a word and get updated card data.
 * Returns the updated card. Triggers cloud sync.
 */
export function recordReview(wordId: number, grade: ReviewGrade): CardReview {
  const cards = loadAllCards();
  const existing = cards.find((c) => c.wordId === wordId) || null;
  const today = new Date().toISOString().slice(0, 10);

  const { interval, easinessFactor, repetitions } = calculateNextReview(existing, grade);

  // Calculate next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  const nextReviewDate = nextDate.toISOString().slice(0, 10);

  const updatedCard: CardReview = {
    wordId,
    easinessFactor,
    interval,
    repetitions,
    lastReviewDate: today,
    nextReviewDate,
    createdAt: existing?.createdAt || today,
  };

  // Update or insert
  let newCards: CardReview[];
  if (existing) {
    newCards = cards.map((c) => (c.wordId === wordId ? updatedCard : c));
  } else {
    newCards = [...cards, updatedCard];
  }

  saveAllCards(newCards);

  // Trigger cloud sync in background
  triggerCloudSync();

  return updatedCard;
}

/**
 * Remove a word from the SR system.
 */
export function removeCard(wordId: number): void {
  const cards = loadAllCards().filter((c) => c.wordId !== wordId);
  saveAllCards(cards);
}

/**
 * Get words that are due for review today (or overdue).
 */
export function getDueWordIds(): number[] {
  const cards = loadAllCards();
  const today = new Date().toISOString().slice(0, 10);
  return cards
    .filter((c) => c.nextReviewDate <= today)
    .map((c) => c.wordId);
}

/**
 * Get the count of words due for review.
 */
export function getDueCount(): number {
  return getDueWordIds().length;
}

/**
 * Get stats about the SR system.
 */
export function getDueStats(): DueStats {
  const cards = loadAllCards();
  const today = new Date().toISOString().slice(0, 10);
  const dueToday = cards.filter((c) => c.nextReviewDate <= today).length;
  return {
    total: cards.length,
    dueToday,
    newWords: 0, // Computed externally
  };
}

/**
 * Get all cards sorted by due date (most overdue first).
 */
export function getCardsByDueDate(): CardReview[] {
  return loadAllCards().sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
}

/**
 * Replace all local cards with cloud data (used during cloud pull).
 */
export function setCards(cards: CardReview[]): void {
  saveAllCards(cards);
}

/**
 * Merge cloud cards into local: newer lastReviewDate wins per card.
 * Returns the merged set and also saves to localStorage.
 */
export function mergeCloudCards(cloudCards: CardReview[]): CardReview[] {
  const local = loadAllCards();
  const localMap = new Map(local.map((c) => [c.wordId, c]));
  const cloudMap = new Map(cloudCards.map((c) => [c.wordId, c]));

  const allIds = new Set([...localMap.keys(), ...cloudMap.keys()]);
  const merged: CardReview[] = [];

  for (const id of allIds) {
    const localCard = localMap.get(id);
    const cloudCard = cloudMap.get(id);

    if (!localCard) {
      merged.push(cloudCard!);
    } else if (!cloudCard) {
      merged.push(localCard);
    } else {
      // Both exist: newer lastReviewDate wins
      merged.push(
        localCard.lastReviewDate >= cloudCard.lastReviewDate
          ? localCard
          : cloudCard
      );
    }
  }

  saveAllCards(merged);
  return merged;
}

// ─── Mastery System ───────────────────────────────────────────────────

/** Mastery criteria: a word is "mastered" when the user has proven long-term retention */
const MASTERY_MIN_REPETITIONS = 5;
const MASTERY_MIN_EF = 2.0;
const MASTERY_MIN_INTERVAL = 21; // days

/** Check if a single card meets mastery criteria */
export function isMastered(card: CardReview): boolean {
  return (
    card.repetitions >= MASTERY_MIN_REPETITIONS &&
    card.easinessFactor >= MASTERY_MIN_EF &&
    card.interval >= MASTERY_MIN_INTERVAL
  );
}

/** Get the mastery level of a card (0-100) based on SM-2 progress */
export function getMasteryLevel(card: CardReview): number {
  const repScore = Math.min(1, card.repetitions / MASTERY_MIN_REPETITIONS);
  const efScore = Math.min(1, (card.easinessFactor - 1.3) / (MASTERY_MIN_EF - 1.3));
  const intervalScore = Math.min(1, card.interval / MASTERY_MIN_INTERVAL);
  return Math.round((repScore * 0.4 + efScore * 0.3 + intervalScore * 0.3) * 100);
}

/** Get mastery status string for display */
export function getMasteryStatus(card: CardReview): "new" | "learning" | "reviewing" | "mastered" {
  if (isMastered(card)) return "mastered";
  if (card.repetitions >= 3) return "reviewing";
  if (card.repetitions >= 1) return "learning";
  return "new";
}

/** Get count of mastered words */
export function getMasteredCount(): number {
  const cards = loadAllCards();
  return cards.filter(isMastered).length;
}

/** Get IDs of all mastered words */
export function getMasteredWordIds(): number[] {
  const cards = loadAllCards();
  return cards.filter(isMastered).map((c) => c.wordId);
}

/** Get total words in SR system */
export function getTotalReviewWords(): number {
  return loadAllCards().length;
}

/** Get card for a specific word */
export function getCardForWord(wordId: number): CardReview | null {
  const cards = loadAllCards();
  return cards.find((c) => c.wordId === wordId) || null;
}
