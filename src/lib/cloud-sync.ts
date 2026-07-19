"use client";

import { createClient } from "@/utils/supabase/client";
import type { GamificationState } from "@/lib/gamification";
import { getSavedIds } from "@/lib/saved-words";

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

// ─── Sync Saved Words to Cloud ──────────────────────────────────────────

export async function syncSavedWordsToCloud(): Promise<void> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return;

  const localIds = getSavedIds();
  if (localIds.length === 0) return;

  const { data: existing } = await client()
    .from("user_saved_words")
    .select("word_id")
    .eq("user_id", user.id);

  const existingIds = new Set((existing || []).map((s: any) => s.word_id));
  const newWords = localIds.filter((id) => !existingIds.has(id));
  if (newWords.length === 0) return;

  const { error } = await client()
    .from("user_saved_words")
    .insert(newWords.map((word_id) => ({ user_id: user.id, word_id })));

  if (error) {
    console.error("Failed to sync saved words:", error);
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

// ─── Load Saved Words from Cloud ────────────────────────────────────────

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

// ─── Update Single XP Value to Cloud ────────────────────────────────────

export async function updateXpToCloud(field: string, value: number): Promise<void> {
  const { data: { user } } = await client().auth.getUser();
  if (!user) return;

  await client()
    .from("user_profiles")
    .update({ [field]: value })
    .eq("id", user.id);
}

// ─── Toggle Saved Word in Cloud ─────────────────────────────────────────

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
