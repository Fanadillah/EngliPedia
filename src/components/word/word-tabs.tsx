"use client";

import { useState, useEffect } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/utils/supabase/client";
import { BookOpen, MessageSquareQuote, Link2, Volume2, Copy, Check } from "lucide-react";
import { motion } from "motion/react";
import type { Word } from "@/types/word";

interface WordTabsProps {
  word: Word;
  speak: (text: string, lang?: string) => void;
  level: { label: string; gradient: string; dot: string; text: string };
}

export function WordTabs({ word, speak, level }: WordTabsProps) {
  const [relatedWords, setRelatedWords] = useState<Word[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [parent] = useAutoAnimate<HTMLDivElement>();

  useEffect(() => {
    if (!word.word) return;
    // Fetch related words at same level
    const loadRelated = async () => {
      setLoadingRelated(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("words")
        .select("id, word, ipa, meaning_id, level, cara_baca")
        .eq("level", word.level)
        .neq("id", word.id)
        .limit(5)
        .order("frequency", { ascending: false });

      if (data) setRelatedWords(data);
      setLoadingRelated(false);
    };
    loadRelated();
  }, [word.id, word.level, word.word]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tabs defaultValue="detail" className="w-full">
      <TabsList className="w-full bg-muted rounded-2xl p-1">
        <TabsTrigger value="detail" className="flex-1 rounded-xl gap-1.5 py-2 text-xs sm:text-sm">
          <BookOpen className="w-4 h-4" />
          <span>Detail</span>
        </TabsTrigger>
        <TabsTrigger value="contoh" className="flex-1 rounded-xl gap-1.5 py-2 text-xs sm:text-sm">
          <MessageSquareQuote className="w-4 h-4" />
          <span>Contoh</span>
        </TabsTrigger>
        <TabsTrigger value="terkait" className="flex-1 rounded-xl gap-1.5 py-2 text-xs sm:text-sm">
          <Link2 className="w-4 h-4" />
          <span>Terkait</span>
        </TabsTrigger>
      </TabsList>

      {/* Detail Tab */}
      <TabsContent value="detail" className="mt-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          ref={parent}
          className="bg-card rounded-2xl border border-border p-5 space-y-4"
        >
          {/* Part of Speech */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Part of Speech</p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                {word.pos || "-"}
              </span>
            </div>
          </div>

          {/* Arti dalam Bahasa Indonesia */}            <div className="border-t border-border/50 pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Arti (Indonesia)</p>
            <p className="text-base font-semibold text-card-foreground">{word.meaning_id || "-"}</p>
          </div>

          {/* Definition */}
          {word.definition && (
            <div className="border-t border-border/50 pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Definisi (English)</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{word.definition}</p>
            </div>
          )}

          {/* Copy button */}
          <div className="border-t border-border/50 pt-4 flex justify-end">
            <button
              onClick={() => copyToClipboard(`${word.word} — ${word.meaning_id}`)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin kata</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </TabsContent>

      {/* Contoh Tab */}
      <TabsContent value="contoh" className="mt-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {word.example ? (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contoh Kalimat</p>
                <button
                  onClick={() => speak(word.example)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Dengarkan
                </button>
              </div>
              <p className="text-sm text-card-foreground/80 leading-relaxed italic border-l-2 border-primary/30 pl-4">
                &ldquo;{word.example}&rdquo;
              </p>
              {word.example_id && (
                <p className="text-xs text-muted-foreground border-t border-border/50 pt-2">
                  <span className="font-medium">Arti contoh:</span> {word.example_id}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <MessageSquareQuote className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Belum ada contoh kalimat untuk kata ini</p>
            </div>
          )}

          {/* Additional example input */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-5 text-center">
            <p className="text-xs text-muted-foreground">
              Punya contoh kalimat sendiri?&nbsp;
              <button className="text-primary font-semibold hover:underline">Tambahkan</button>
            </p>
          </div>
        </motion.div>
      </TabsContent>

      {/* Terkait Tab */}
      <TabsContent value="terkait" className="mt-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          ref={parent}
        >
          {loadingRelated ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
                  <div className="h-4 w-24 bg-muted rounded mb-2" />
                  <div className="h-3 w-16 bg-muted/50 rounded" />
                </div>
              ))}
            </div>
          ) : relatedWords.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
                Kata lain level {level.label}
              </p>
              {relatedWords.map((rw, idx) => (
                <motion.a
                  key={rw.id}
                  href={`/word/${rw.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between bg-card rounded-xl border border-border p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-card-foreground">{rw.word}</p>
                    {rw.ipa && <p className="text-xs text-muted-foreground font-mono">{rw.ipa}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground/80">{rw.meaning_id || "-"}</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-gradient-to-r ${level.gradient} mt-1`}>
                      <span className={`w-1 h-1 rounded-full ${level.dot}`} />
                      {level.label}
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <Link2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Tidak ada kata terkait ditemukan</p>
            </div>
          )}
        </motion.div>
      </TabsContent>
    </Tabs>
  );
}
