"use client";

// ─── IndexedDB Offline Cache ────────────────────────────────────────────
// Menyimpan data word yang pernah dibuka user agar bisa diakses offline.
// Silent fail — error IndexedDB tidak akan nge-break app.

const DB_NAME = "engli-offline-cache";
const DB_VERSION = 1;
const STORE_NAME = "words";

interface CachedWord {
  id: number;
  word: string;
  ipa: string | null;
  cara_baca: string | null;
  arti: string | null;
  contoh_kalimat: string | null;
  arti_contoh: string | null;
  sinonim: string | null;
  level: string;
  data: Record<string, unknown>; // full word record
  cached_at: number; // timestamp
}

function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("cached_at", "cached_at", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn("[OfflineCache] IndexedDB open error:", request.error);
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Save a word entry to IndexedDB.
 * Silent fail if IndexedDB is unavailable.
 */
export async function cacheWord(word: Record<string, unknown>): Promise<void> {
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const entry: CachedWord = {
      id: word.id as number,
      word: word.word as string,
      ipa: (word.ipa as string) ?? null,
      cara_baca: (word.cara_baca as string) ?? null,
      arti: (word.arti as string) ?? null,
      contoh_kalimat: (word.contoh_kalimat as string) ?? null,
      arti_contoh: (word.arti_contoh as string) ?? null,
      sinonim: (word.sinonim as string) ?? null,
      level: (word.level as string) || "basic",
      data: word,
      cached_at: Date.now(),
    };
    store.put(entry);
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  } catch {
    // Silent fail
  }
}

/**
 * Get a cached word by ID.
 * Returns null if not found or IndexedDB unavailable.
 */
export async function getCachedWord(id: number): Promise<Record<string, unknown> | null> {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => {
        const result = request.result as CachedWord | undefined;
        db.close();
        resolve(result?.data ?? null);
      };
      request.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Get all cached words (for offline flashcard/search).
 */
export async function getAllCachedWords(): Promise<Record<string, unknown>[]> {
  try {
    const db = await openDB();
    if (!db) return [];
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const entries = (request.result as CachedWord[]) || [];
        db.close();
        resolve(entries.map((e) => e.data));
      };
      request.onerror = () => {
        db.close();
        resolve([]);
      };
    });
  } catch {
    return [];
  }
}

/**
 * Check if we're currently offline.
 */
export function isOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}
