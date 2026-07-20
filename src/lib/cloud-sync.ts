"use client";

import { createClient } from "@/utils/supabase/client";
import type { GamificationState } from "@/lib/gamification";
import type { CardReview } from "@/lib/spaced-repetition";
import { getSavedIds, setSavedIds } from "@/lib/saved-words";

const client = () => createClient() as any;

// ─── Sync Gamification to Cloud ─────────────────────────────────────────

export async function syncGamificationToCloud(state: GamificationState): Promise<void> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return;

  const { error } = await client()
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

  if (error) {
    console.error("Failed to sync gamification:", error);
  }
}

// ─── Load Gamification from Cloud ───────────────────────────────────────

export async function loadGamificationFromCloud(): Promise<GamificationState | null> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return null;

  const { data: profile } = await client()
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    totalXp: profile.total_xp || 0,
    streak: profile.streak || 0,
    lastActiveDate: profile.last_active_date || "",
    dailyXp: profile.daily_xp || 0,
    dailyXpDate: profile.daily_xp_date || "",
    masteredWords: profile.mastered_words || 0,
    viewedWords: profile.viewed_words || 0,
    completedSessions: profile.completed_sessions || 0,
    lastSessionDate: profile.last_session_date || "",
    levelTitle: "",
    currentLevel: 0,
    xpToNextLevel: 0,
    currentXpInLevel: 0,
  };
}

// ─── Update Single XP Value to Cloud ────────────────────────────────────

export async function updateXpToCloud(field: string, value: number): Promise<void> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return;

  await client()
    .from("user_profiles")
    .update({ [field]: value })
    .eq("id", user.id);
}

// ─── Sync Saved Words (Bidirectional) ──────────────────────────────────

export async function syncSavedWordsToCloud(): Promise<void> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return;

  const localIds = getSavedIds();

  // Fetch cloud data
  const { data: cloudRows } = await client()
    .from("user_saved_words")
    .select("word_id")
    .eq("user_id", user.id);

  const cloudIds = ((cloudRows || []) as any[]).map((s) => s.word_id as number);
  const cloudSet = new Set(cloudIds);

  // Push: local words not in cloud
  const toInsert = localIds.filter((id) => !cloudSet.has(id));
  if (toInsert.length > 0) {
    await client()
      .from("user_saved_words")
      .insert(toInsert.map((word_id) => ({ user_id: user.id, word_id })));
  }

  // Pull: cloud words not in local
  const localSet = new Set(localIds);
  const toPull = cloudIds.filter((id) => !localSet.has(id));
  if (toPull.length > 0) {
    setSavedIds([...localIds, ...toPull]);
  }
}

export async function loadSavedWordsFromCloud(): Promise<number[]> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return [];

  const { data } = await client()
    .from("user_saved_words")
    .select("word_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return ((data || []) as any[]).map((s) => s.word_id);
}

export async function toggleSavedWordInCloud(wordId: number, save: boolean): Promise<void> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return;

  if (save) {
    await client()
      .from("user_saved_words")
      .upsert({ user_id: user.id, word_id: wordId });
  } else {
    await client()
      .from("user_saved_words")
      .delete()
      .eq("user_id", user.id)
      .eq("word_id", wordId);
  }
}

// ─── Sync Spaced Repetition (Bidirectional) ────────────────────────────

/**
 * Determine the status string for user_words based on SM-2 card data.
 */
function cardStatus(card: CardReview): "new" | "learning" | "mastered" {
  if (card.repetitions >= 5 && card.easinessFactor >= 2.0) return "mastered";
  if (card.repetitions >= 1) return "learning";
  return "new";
}

/**
 * Push local spaced repetition cards to cloud and pull cloud data.
 * Merges bidirectionally: newer updated_at wins per card.
 */
export async function syncSpacedRepetitionToCloud(
  localCards: CardReview[]
): Promise<CardReview[]> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return localCards;

  // Fetch all cloud cards for this user
  const { data: cloudRows } = await client()
    .from("user_words")
    .select("word_id, easiness_factor, interval_days, repetitions, last_review_date, next_review_date, updated_at")
    .eq("user_id", user.id);

  const cloudCards: CardReview[] = ((cloudRows || []) as any[]).map((row) => ({
    wordId: row.word_id,
    easinessFactor: row.easiness_factor ?? 2.5,
    interval: row.interval_days ?? 0,
    repetitions: row.repetitions ?? 0,
    lastReviewDate: row.last_review_date || "",
    nextReviewDate: row.next_review_date || "",
    createdAt: row.updated_at || "",
  }));

  // Build maps for merge
  const localMap = new Map(localCards.map((c) => [c.wordId, c]));
  const cloudMap = new Map(cloudCards.map((c) => [c.wordId, c]));

  const allWordIds = new Set([...localMap.keys(), ...cloudMap.keys()]);

  const merged: CardReview[] = [];
  const toUpsert: any[] = [];

  for (const wordId of allWordIds) {
    const local = localMap.get(wordId);
    const cloud = cloudMap.get(wordId);

    let winner: CardReview;

    if (!local) {
      // Cloud only → use cloud
      winner = cloud!;
    } else if (!cloud) {
      // Local only → use local, push to cloud
      winner = local;
      toUpsert.push(buildUpsertRow(user.id, local));
    } else {
      // Both exist → compare by lastReviewDate (more reliable than updatedAt for SR)
      // The card with the more recent review wins
      if (local.lastReviewDate >= cloud.lastReviewDate) {
        winner = local;
        toUpsert.push(buildUpsertRow(user.id, local));
      } else {
        winner = cloud;
      }
    }

    merged.push(winner);
  }

  // Batch upsert to cloud
  if (toUpsert.length > 0) {
    // Supabase handles upsert in batches natively
    const { error } = await client()
      .from("user_words")
      .upsert(toUpsert, { onConflict: "user_id,word_id" });

    if (error) {
      console.error("Failed to sync spaced repetition:", error);
    }
  }

  return merged;
}

/**
 * Load all spaced repetition cards from cloud for the current user.
 */
export async function loadSpacedRepetitionFromCloud(): Promise<CardReview[]> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return [];

  const { data: rows } = await client()
    .from("user_words")
    .select("word_id, easiness_factor, interval_days, repetitions, last_review_date, next_review_date, created_at, updated_at")
    .eq("user_id", user.id);

  return ((rows || []) as any[]).map((row) => ({
    wordId: row.word_id,
    easinessFactor: row.easiness_factor ?? 2.5,
    interval: row.interval_days ?? 0,
    repetitions: row.repetitions ?? 0,
    lastReviewDate: row.last_review_date || "",
    nextReviewDate: row.next_review_date || "",
    createdAt: row.created_at || "",
  }));
}

function buildUpsertRow(userId: string, card: CardReview) {
  return {
    user_id: userId,
    word_id: card.wordId,
    status: cardStatus(card),
    mastery: Math.min(100, Math.round((card.repetitions / 8) * 100)),
    easiness_factor: card.easinessFactor,
    interval_days: card.interval,
    repetitions: card.repetitions,
    last_review_date: card.lastReviewDate || null,
    next_review_date: card.nextReviewDate || null,
  };
}
