"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Word } from "@/types/word";
import { getSavedIds, removeSaved } from "@/lib/saved-words";
import {
  Heart, Volume2, Search, Trash2, ArrowLeft,
  ArrowUpDown, SortAsc, TrendingUp, Filter,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BookEmptyIllustration } from "@/components/illustrations";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// ─── Types ──────────────────────────────────────────────────────────────

type LevelFilter = "all" | "basic" | "intermediate" | "advanced";
type SortMode = "saved" | "alpha" | "frequency";

interface FilterOption {
  value: LevelFilter;
  label: string;
}

interface SortOption {
  value: SortMode;
  label: string;
  icon: typeof ArrowUpDown;
}

// ─── Constants ──────────────────────────────────────────────────────────

const FILTERS: FilterOption[] = [
  { value: "all", label: "Semua" },
  { value: "basic", label: "Dasar" },
  { value: "intermediate", label: "Menengah" },
  { value: "advanced", label: "Lanjut" },
];

const SORTS: SortOption[] = [
  { value: "saved", label: "Terbaru", icon: Heart },
  { value: "alpha", label: "A-Z", icon: SortAsc },
  { value: "frequency", label: "Populer", icon: TrendingUp },
];

const LEVEL_CONFIG: Record<string, { label: string; gradient: string; dot: string }> = {
  basic: { label: "Dasar", gradient: "from-green-500 to-emerald-500", dot: "bg-green-400" },
  intermediate: { label: "Menengah", gradient: "from-amber-500 to-orange-500", dot: "bg-yellow-400" },
  advanced: { label: "Lanjut", gradient: "from-red-500 to-rose-500", dot: "bg-red-400" },
};

// ─── Component ──────────────────────────────────────────────────────────

export default function SavedWordsPage() {
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  // Filter & sort state
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("saved");

  // ── Load data ──────────────────────────────────────────────────────

  const loadSavedWords = useCallback(async () => {
    setLoading(true);
    const ids = getSavedIds();
    setSavedIds(ids);

    if (ids.length === 0) {
      setWords([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data } = await supabase
      .from("words")
      .select("id, word, ipa, pos, meaning_id, definition, example, example_id, frequency, cara_baca, level")
      .in("id", ids);

    const wordsData = (data || []) as Word[];
    // Preserve saved order as default
    const ordered = wordsData.sort((a, b) => {
      return ids.indexOf(a.id) - ids.indexOf(b.id);
    });

    setWords(ordered);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSavedWords();
  }, [loadSavedWords]);

  // ── Filter & sort logic ────────────────────────────────────────────

  const filteredWords = useMemo(() => {
    let result = [...words];

    // Filter by level
    if (levelFilter !== "all") {
      result = result.filter((w) => w.level === levelFilter);
    }

    // Sort
    switch (sortMode) {
      case "saved":
        // Preserve the order they were saved
        result.sort((a, b) => savedIds.indexOf(a.id) - savedIds.indexOf(b.id));
        break;
      case "alpha":
        result.sort((a, b) => a.word.localeCompare(b.word));
        break;
      case "frequency":
        result.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));
        break;
    }

    return result;
  }, [words, levelFilter, sortMode, savedIds]);

  // ── Handlers ───────────────────────────────────────────────────────

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const handleRemove = (wordId: number) => {
    setRemoving(wordId);
    setTimeout(() => {
      removeSaved(wordId);
      setSavedIds((prev) => prev.filter((id) => id !== wordId));
      setWords((prev) => prev.filter((w) => w.id !== wordId));
      setRemoving(null);
    }, 300);
  };

  const filterCount = filteredWords.length;
  const hasActiveFilter = levelFilter !== "all" || sortMode !== "saved";

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="p-4 space-y-4 max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold">Kata Tersimpan</h1>
          </div>
          {savedIds.length > 0 && !loading && (
            <span className="text-xs text-muted-foreground bg-card px-3 py-1.5 rounded-full border border-border">
              {filterCount} / {savedIds.length} kata
            </span>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-28 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted/50 rounded" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state (no saved words at all) */}
        {!loading && savedIds.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="flex justify-center mb-6 text-primary/30">
              <BookEmptyIllustration className="w-44 h-44" />
            </div>
            <h2 className="text-xl font-bold text-foreground/80 text-center">
              Belum ada kata tersimpan
            </h2>
            <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
              Simpan kata favoritmu dengan menekan ikon hati di halaman detail kata
            </p>
            <Link href="/search">
              <Button className="rounded-xl gap-2 mt-8">
                <Search className="w-4 h-4" />
                Cari Kata
              </Button>
            </Link>
          </div>
        )}

        {/* Filter & Sort bar */}
        {!loading && savedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Level filter chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
              <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0 mr-1" />
              {FILTERS.map((f) => {
                const isActive = levelFilter === f.value;
                return (
                  <motion.button
                    key={f.value}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setLevelFilter(f.value)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? f.value === "all"
                          ? "bg-primary text-white shadow-sm"
                          : `text-white bg-gradient-to-r ${LEVEL_CONFIG[f.value].gradient} shadow-sm`
                        : "bg-card text-muted-foreground border border-border hover:border-border/80"
                    }`}
                  >
                    {f.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Sort + reset row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                {SORTS.map((s) => {
                  const isActive = sortMode === s.value;
                  const Icon = s.icon;
                  return (
                    <motion.button
                      key={s.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSortMode(s.value)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {s.label}
                    </motion.button>
                  );
                })}
              </div>

              {hasActiveFilter && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setLevelFilter("all");
                    setSortMode("saved");
                  }}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                >
                  Reset
                </motion.button>
              )}
            </div>

            {/* Separator */}
            <div className="h-px bg-border" />
          </motion.div>
        )}

        {/* Empty filter result */}
        {!loading && savedIds.length > 0 && filteredWords.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Layers className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <h2 className="text-lg font-semibold text-foreground/80 text-center">
              Tidak ada kata dengan filter ini
            </h2>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              Coba ubah filter level atau reset semua filter
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl mt-4"
              onClick={() => {
                setLevelFilter("all");
                setSortMode("saved");
              }}
            >
              Reset Filter
            </Button>
          </motion.div>
        )}

        {/* Saved words list */}
        {!loading && filteredWords.length > 0 && (
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {filteredWords.map((word, idx) => {
                const level = LEVEL_CONFIG[word.level] || LEVEL_CONFIG.basic;
                return (
                  <motion.div
                    key={word.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50, scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      delay: idx * 0.03,
                    }}
                    className={`bg-card rounded-2xl border border-border p-4 hover:shadow-sm transition-all ${
                      removing === word.id ? "opacity-30 scale-95" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Word info */}
                      <Link href={`/word/${word.id}`} className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-card-foreground truncate">{word.word}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold text-white bg-gradient-to-r ${level.gradient} shrink-0`}>
                            <span className={`w-1 h-1 rounded-full ${level.dot}`} />
                            {level.label}
                          </span>
                        </div>
                        <p className="text-sm text-primary font-medium truncate">
                          {word.meaning_id}
                        </p>
                        {word.ipa && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{word.ipa}</p>
                        )}
                        {word.cara_baca && (
                          <p className="text-xs text-muted-foreground/80 mt-0.5">
                            <span className="text-muted-foreground">Baca: </span>
                            {word.cara_baca}
                          </p>
                        )}
                        {/* Sort indicator */}
                        {sortMode === "frequency" && (
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3 h-3 text-muted-foreground/30" />
                            <span className="text-[10px] text-muted-foreground">
                              Frekuensi: {word.frequency?.toLocaleString() || 0}
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => speak(word.word)}
                          className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                          aria-label="Dengarkan"
                        >
                          <Volume2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleRemove(word.id)}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-400 dark:text-rose-300 hover:text-rose-600 dark:hover:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors"
                          aria-label="Hapus dari tersimpan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Frequency bar */}
                    {word.frequency > 0 && sortMode !== "frequency" && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, (word.frequency / 8) * 100)}%`,
                                backgroundColor:
                                  word.frequency >= 6
                                    ? "#10B981"
                                    : word.frequency >= 4
                                    ? "#F59E0B"
                                    : "#9CA3AF",
                              }}
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(100, (word.frequency / 8) * 100)}%`,
                              }}
                              transition={{ duration: 0.8, delay: idx * 0.05 }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {word.frequency.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}
