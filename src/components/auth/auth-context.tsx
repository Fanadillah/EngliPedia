"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { loadState } from "@/lib/gamification";
import { getCards, setCards } from "@/lib/spaced-repetition";
import {
  syncGamificationToCloud,
  syncSavedWordsToCloud,
  syncSpacedRepetitionToCloud,
} from "@/lib/cloud-sync";
import { getSavedIds } from "@/lib/saved-words";
import { startDrain } from "@/lib/sync-queue";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  syncing: boolean;
  syncToCloud: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);

  // Full sync: gamification + saved words + spaced repetition
  const syncToCloud = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      // 1. Gamification
      const gamification = loadState();
      if (gamification.totalXp > 0 || gamification.streak > 0) {
        await syncGamificationToCloud(gamification);
      }

      // 2. Saved words (bidirectional)
      const savedIds = getSavedIds();
      if (savedIds.length > 0) {
        await syncSavedWordsToCloud();
      }

      // 3. Spaced repetition (bidirectional merge)
      const localCards = getCards();
      const merged = await syncSpacedRepetitionToCloud(localCards);
      // syncSpacedRepetitionToCloud already merged — save directly
      setCards(merged);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, []); // stable reference — never changes

  useEffect(() => {
    // Start offline queue drain
    startDrain();

    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const hasSession = !!session?.user;
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
      // Sync if just logged in
      if (hasSession) {
        syncToCloud();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const hasSession = !!session?.user;
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
      // Sync on login/signup events
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && hasSession) {
        syncToCloud();
      }
    });

    return () => subscription.unsubscribe();
  }, [syncToCloud]);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setState({ user: null, session: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, signOut, syncing, syncToCloud }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
