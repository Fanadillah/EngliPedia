"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  X,
  Volume2,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Word } from "@/types/word";
import { useRouter } from "next/navigation";
import { SearchEmptyIllustration } from "@/components/illustrations";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { SkeletonSearchList } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "motion/react";

// ─── Constants ──────────────────────────────────────────────────────────

const ALPHABET = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PAGE_SIZE = 20;
const LEVEL_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "basic", label: "Dasar" },
  { value: "intermediate", label: "Menengah" },
  { value: "advanced", label: "Lanjut" },
] as const;

const POS_OPTIONS = ["", "noun", "verb", "adjective", "adverb", "pronoun", "preposition", "conjunction"] as const;

const FREQ_OPTIONS = [
  { value: "", label: "Semua", min: 0, max: Infinity },
  { value: "rare", label: "Jarang", min: 0, max: 10 },
  { value: "common", label: "Umum", min: 10, max: 100 },
  { value: "popular", label: "Populer", min: 100, max: Infinity },
] as const;

const LEVEL_STYLE: Record<string, { gradient: string; dot: string; label: string }> = {
  basic: { gradient: "from-green-500 to-emerald-500", dot: "bg-green-400", label: "Dasar" },
  intermediate: { gradient: "from-amber-500 to-orange-500", dot: "bg-yellow-400", label: "Menengah" },
  advanced: { gradient: "from-red-500 to-rose-500", dot: "bg-red-400", label: "Lanjut" },
};

// ─── Component ──────────────────────────────────────────────────────────

export default function SearchPage() {
  const router = useRouter();

  // Search & filter state
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState("");
  const [level, setLevel] = useState("");
  const [pos, setPos] = useState("");
  const [freqRange, setFreqRange] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Data state
  const [words, setWords] = useState<Word[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);

  // Refs
  const sentinelRef = useRef<HTMLDivElement>(null);
  const prevFilterKey = useRef("");

  // ── Build filter key for dependency tracking ───────────────────────

  const filterKey = JSON.stringify({ query, letter, level, pos, freqRange });

  // ── Load words ─────────────────────────────────────────────────────

  const buildQuery = useCallback((pageNum: number) => {
    const supabase = createClient();
    let qb = supabase
      .from("words")
      .select("*", { count: "exact" })
      .not("meaning_id", "eq", "");

    if (query.trim()) {
      qb = qb.or(
        `word.ilike.%${query}%,meaning_id.ilike.%${query}%,cara_baca.ilike.%${query}%`
      );
    }

    if (letter === "#") {
      qb = qb.not("word", "match", "^[a-zA-Z]");
    } else if (letter) {
      qb = qb.ilike("word", `${letter}%`);
    }

    if (level) {
      qb = qb.eq("level", level);
    }

    if (pos) {
      qb = qb.eq("pos", pos);
    }

    // Frequency range
    if (freqRange) {
      const opt = FREQ_OPTIONS.find((o) => o.value === freqRange);
      if (opt) {
        if (opt.min > 0) qb = qb.gte("frequency", opt.min);
        if (opt.max < Infinity) qb = qb.lte("frequency", opt.max);
      }
    }

    return qb
      .order("word", { ascending: true })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);
  }, [query, letter, level, pos, freqRange]);

  // Load initial / reset
  const loadInitial = useCallback(async () => {
    setLoading(true);
    setWords([]);
    setPage(0);
    setAllLoaded(false);

    const qb = buildQuery(0);
    const { data, count } = await qb;

    setWords((data || []) as Word[]);
    setTotal(count || 0);
    setAllLoaded((data || []).length < PAGE_SIZE);
    setLoading(false);
  }, [buildQuery]);

  // Load more (infinite scroll)
  const loadMore = useCallback(async () => {
    if (loadingMore || allLoaded) return;
    setLoadingMore(true);

    const nextPage = page + 1;
    const qb = buildQuery(nextPage);
    const { data } = await qb;

    const newWords = (data || []) as Word[];
    setWords((prev) => [...prev, ...newWords]);
    setPage(nextPage);
    setAllLoaded(newWords.length < PAGE_SIZE);
    setLoadingMore(false);
  }, [loadingMore, allLoaded, page, buildQuery]);

  // Reset when filters change
  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      loadInitial();
    }
  }, [filterKey, loadInitial]);

  // ── Infinite scroll with IntersectionObserver ──────────────────────

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && !allLoaded) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, loadingMore, allLoaded, loadMore]);

  // ── Handlers ───────────────────────────────────────────────────────

  const speak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  const resetFilters = () => {
    setQuery("");
    setLetter("");
    setLevel("");
    setPos("");
    setFreqRange("");
    setPage(0);
  };

  const hasFilters = query || letter || level || pos || freqRange;

  const [listRef] = useAutoAnimate<HTMLDivElement>();
  const filterCount = [query, letter, level, pos, freqRange].filter(Boolean).length;

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="p-4 pb-3 space-y-3">
            {/* Title + Filter Toggle */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Jelajahi Kata</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`rounded-xl transition-all ${
                  showFilters || hasFilters ? "bg-primary/10 text-primary" : ""
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 mr-1.5" />
                Filter
                {filterCount > 0 && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
                    {filterCount}
                  </span>
                )}
                {showFilters ? (
                  <ChevronUp className="w-3.5 h-3.5 ml-1" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 ml-1" />
                )}
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari kata Inggris atau Indonesia..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 pr-9 h-11 rounded-xl bg-muted border-0 focus-visible:bg-card transition-colors"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 pt-1">
                    {/* Level */}
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Level
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {LEVEL_OPTIONS.map((l) => (
                          <button
                            key={l.value}
                            onClick={() => setLevel(l.value === level ? "" : l.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              level === l.value
                                ? "bg-primary text-white shadow-sm"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* POS */}
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Tipe Kata
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {POS_OPTIONS.map((p) => (
                          <button
                            key={p}
                            onClick={() => setPos(p === pos ? "" : p)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${
                              pos === p
                                ? "bg-primary text-white shadow-sm"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {p || "Semua"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Frequency Range */}
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Popularitas
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {FREQ_OPTIONS.map((f) => (
                          <button
                            key={f.value}
                            onClick={() => setFreqRange(f.value === freqRange ? "" : f.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              freqRange === f.value
                                ? "bg-primary text-white shadow-sm"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset */}
                    {hasFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-xs text-muted-foreground"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reset Semua
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Alphabet Strip */}
          <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-1 min-w-max">
              {ALPHABET.map((a) => (
                <button
                  key={a}
                  onClick={() => setLetter(letter === a ? "" : a)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    letter === a
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Results info */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                  Mencari...
                </span>
              ) : total > 0 ? (
                <>
                  <span className="font-semibold text-foreground">{total.toLocaleString()}</span> kata
                  {hasFilters && " ditemukan"}
                </>
              ) : hasFilters ? (
                "Tidak ada hasil"
              ) : (
                ""
              )}
            </p>
          </div>

          {/* Word List */}
          {loading ? (
            <SkeletonSearchList count={8} />
          ) : words.length > 0 ? (
            <div ref={listRef} className="space-y-2.5">
              {words.map((w, idx) => {
                const levelStyle = LEVEL_STYLE[w.level] || LEVEL_STYLE.basic;
                const freqPercent = Math.min((w.frequency / 500) * 100, 100);
                const freqColor =
                  w.frequency > 100
                    ? "bg-emerald-400"
                    : w.frequency > 30
                    ? "bg-amber-400"
                    : "bg-muted-foreground/40";

                return (
                  <motion.div
                    key={`${w.id}-${idx}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                    onClick={() => router.push(`/word/${w.id}`)}
                    className="group relative bg-card rounded-2xl border border-border p-4 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    {/* Gradient accent on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="relative flex items-start gap-4">
                      {/* Level indicator bar */}
                      <div className={`w-1 h-14 rounded-full bg-gradient-to-b ${levelStyle.gradient} shrink-0 mt-0.5`} />

                      {/* Word content */}
                      <div className="flex-1 min-w-0">
                        {/* Top row: word + badges */}
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-base text-card-foreground truncate group-hover:text-primary transition-colors">
                            {w.word}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold text-white bg-gradient-to-r ${levelStyle.gradient} shrink-0`}>
                            <span className={`w-1 h-1 rounded-full ${levelStyle.dot}`} />
                            {levelStyle.label}
                          </span>
                          {w.pos && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground capitalize shrink-0 hidden sm:inline">
                              {w.pos}
                            </span>
                          )}
                        </div>

                        {/* Arti */}
                        <p className="text-sm text-primary font-medium truncate">
                          {w.meaning_id}
                        </p>

                        {/* Detail row: IPA + Cara Baca + Frequency */}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {w.ipa && (
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {w.ipa}
                            </span>
                          )}
                          {w.cara_baca && (
                            <span className="text-[11px] text-muted-foreground/80 bg-muted px-1.5 py-0.5 rounded-md">
                              {w.cara_baca}
                            </span>
                          )}

                          {/* Frequency bar */}
                          <div className="flex items-center gap-1.5 ml-auto">
                            <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${freqColor}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${freqPercent}%` }}
                                transition={{ duration: 0.6, delay: idx * 0.02 }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground tabular-nums">
                              {w.frequency}
                            </span>
                          </div>
                        </div>

                        {/* Definition preview */}
                        {w.definition && (
                          <p className="text-[11px] text-muted-foreground italic mt-1.5 line-clamp-1 group-hover:text-foreground/80 transition-colors">
                            {w.definition.length > 100
                              ? w.definition.slice(0, 100) + "..."
                              : w.definition}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => speak(e, w.word)}
                          className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                          aria-label="Dengarkan"
                        >
                          <Volume2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-4" />

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-3 h-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    Memuat lebih banyak...
                  </div>
                </div>
              )}

              {/* All loaded indicator */}
              {allLoaded && words.length > 0 && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-px h-4 bg-border" />
                    <span>
                      Menampilkan {words.length} dari {total.toLocaleString()} kata
                    </span>
                    <div className="w-px h-4 bg-border" />
                  </div>
                </div>
              )}
            </div>
          ) : hasFilters ? (
            <div className="text-center py-16 px-4">
              <div className="flex justify-center mb-6 text-primary/40">
                <SearchEmptyIllustration className="w-40 h-40" />
              </div>
              <p className="text-lg font-semibold text-foreground/80">
                Hmm, kata tidak ditemukan
              </p>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
                Coba periksa ejaan, ubah filter, atau gunakan kata yang lebih umum
              </p>
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="rounded-xl"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset Filter
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/word/${Math.floor(Math.random() * 10000) + 1}`)}
                  className="rounded-xl text-primary"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Feeling Lucky?
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="flex justify-center mb-6 text-primary/30">
                <SearchEmptyIllustration className="w-36 h-36" />
              </div>
              <p className="text-lg font-semibold text-foreground/80">
                Mulai cari kata
              </p>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
                Gunakan kolom pencarian atau pilih huruf di atas untuk mulai menjelajahi kosakata
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
