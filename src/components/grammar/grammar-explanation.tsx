"use client";

import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";
import { FadeIn } from "@/components/ui/motion-components";
import type { ExplanationContent } from "@/types/learning";

interface Props {
  content: ExplanationContent;
  title: string;
}

export function GrammarExplanation({ content, title }: Props) {
  return (
    <FadeIn>
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-900/30 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-indigo-50 dark:border-indigo-900/20">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
          </div>

          {/* Pattern */}
          <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">Pola Kalimat</p>
            <p className="text-lg font-mono font-bold text-indigo-700 dark:text-indigo-300">{content.pattern}</p>
          </div>

          {/* Explanation text */}
          <p className="text-sm text-foreground leading-relaxed">{content.text}</p>
        </div>

        {/* Notes */}
        {content.notes.length > 0 && (
          <div className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Catatan Penting</p>
            <div className="space-y-2">
              {content.notes.map((note, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Badge className="mt-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 shrink-0 text-[10px]">
                    {i + 1}
                  </Badge>
                  <p className="text-sm text-foreground">{note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
