"use client";

const STORAGE_KEY = "engli-saved-words";

function loadIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveIds(ids: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if a word ID is saved.
 */
export function isSaved(wordId: number): boolean {
  return loadIds().includes(wordId);
}

/**
 * Toggle saved state for a word ID. Returns the new saved state.
 */
export function toggleSaved(wordId: number): boolean {
  const ids = loadIds();
  const index = ids.indexOf(wordId);
  if (index >= 0) {
    ids.splice(index, 1);
    saveIds(ids);
    return false;
  } else {
    ids.push(wordId);
    saveIds(ids);
    return true;
  }
}

/**
 * Overwrite all saved word IDs (used when pulling from cloud).
 */
export function setSavedIds(ids: number[]): void {
  saveIds([...new Set(ids)]);
}

/**
 * Get all saved word IDs.
 */
export function getSavedIds(): number[] {
  return loadIds();
}

/**
 * Get the count of saved words.
 */
export function getSavedCount(): number {
  return loadIds().length;
}

/**
 * Remove a saved word by ID.
 */
export function removeSaved(wordId: number): void {
  const ids = loadIds().filter((id) => id !== wordId);
  saveIds(ids);
}
