"use client";

// ─── Types ──────────────────────────────────────────────────────────────

export interface SyncQueueItem {
  id: string;
  table: string;
  operation: "upsert" | "insert" | "update" | "delete";
  payload: any;
  timestamp: number;
  retries: number;
}

// ─── Constants ──────────────────────────────────────────────────────────

const QUEUE_KEY = "engli-sync-queue";
const MAX_RETRIES = 3;
const DRAIN_INTERVAL = 30_000; // 30 seconds

// ─── Queue Storage ──────────────────────────────────────────────────────

function loadQueue(): SyncQueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: SyncQueueItem[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Ignore
  }
}

/**
 * Add a failed sync operation to the retry queue.
 */
export function enqueue(item: Omit<SyncQueueItem, "id" | "retries">): void {
  const queue = loadQueue();
  queue.push({
    ...item,
    id: `${item.table}-${item.operation}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    retries: 0,
  });
  saveQueue(queue);
}

// ─── Drain ──────────────────────────────────────────────────────────────

let _drainInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the automatic drain interval.
 * Call once on app init (e.g., in AuthProvider).
 */
export function startDrain(): void {
  if (typeof window === "undefined") return;
  if (_drainInterval) return;

  _drainInterval = setInterval(() => {
    if (navigator.onLine) {
      drainQueue();
    }
  }, DRAIN_INTERVAL);

  // Also drain on online event
  window.addEventListener("online", drainQueue);
}

/**
 * Stop the drain interval.
 */
export function stopDrain(): void {
  if (_drainInterval) {
    clearInterval(_drainInterval);
    _drainInterval = null;
  }
}

/**
 * Process all pending items in the queue.
 */
export async function drainQueue(): Promise<void> {
  const queue = loadQueue();
  if (queue.length === 0) return;

  const { createClient } = await import("@/utils/supabase/client");
  const supabase = createClient() as any;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const remaining: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      switch (item.operation) {
        case "upsert": {
          // Inject user_id for user_profiles if missing
          let payload = item.payload;
          if (item.table === "user_profiles" && !payload.id) {
            payload = { ...payload, id: user.id };
          }
          // Inject user_id for user_words (array) if missing
          if (item.table === "user_words" && Array.isArray(payload)) {
            payload = payload.map((row: Record<string, unknown>) =>
              row.user_id ? row : { ...row, user_id: user.id }
            );
          }
          const conflictMap: Record<string, string> = {
            user_words: "user_id,word_id",
            user_lesson_progress: "user_id,lesson_id",
            user_unit_progress: "user_id,unit_id",
            user_course_progress: "user_id,course_id",
            user_mistakes: "user_id,word_id",
          };
          const onConflict = conflictMap[item.table] || "id";
          const { error } = await supabase
            .from(item.table)
            .upsert(payload, { onConflict });
          if (error) throw error;
          break;
        }
        case "insert": {
          const { error } = await supabase
            .from(item.table)
            .insert(item.payload);
          if (error) throw error;
          break;
        }
        case "update": {
          const { id: _id, ...fields } = item.payload;
          const { error } = await supabase
            .from(item.table)
            .update(fields)
            .eq("id", _id);
          if (error) throw error;
          break;
        }
        case "delete": {
          const { id: _did, ...filters } = item.payload;
          void _did;
          let query = supabase.from(item.table).delete();
          for (const [key, val] of Object.entries(filters)) {
            query = query.eq(key, val);
          }
          const { error } = await query;
          if (error) throw error;
          break;
        }
      }
      // Success — don't re-add
    } catch {
      // Failed — re-add with incremented retry count
      if (item.retries + 1 < MAX_RETRIES) {
        remaining.push({ ...item, retries: item.retries + 1 });
      }
      // else: drop silently after max retries
    }
  }

  saveQueue(remaining);
}

/**
 * Get the number of pending items in the queue.
 */
export function getQueueSize(): number {
  return loadQueue().length;
}
