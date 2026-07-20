"use client";

import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { FadeIn } from "@/components/ui/motion-components";
import type { ExampleContent } from "@/types/learning";

interface Props {
  content: ExampleContent;
  title: string;
  playAudio: (text: string) => void;
}

export function GrammarExample({ content, title, playAudio }: Props) {
  const renderSentence = () => {
    if (!content.highlight || content.highlight.length === 0) {
      return <span>{content.sentence}</span>;
    }

    const parts: { text: string; highlighted: boolean }[] = [];
    let remaining = content.sentence;

    for (const word of content.highlight) {
      const regex = new RegExp(`(${word})`, "i");
      const match = remaining.match(regex);
      if (match) {
        const idx = remaining.toLowerCase().indexOf(word.toLowerCase());
        if (idx > 0) {
          parts.push({ text: remaining.slice(0, idx), highlighted: false });
        }
        parts.push({ text: match[0], highlighted: true });
        remaining = remaining.slice(idx + match[0].length);
      }
    }
    if (remaining) {
      parts.push({ text: remaining, highlighted: false });
    }

    return (
      <>
        {parts.map((p, i) =>
          p.highlighted ? (
            <span key={i} className="font-bold text-indigo-600 dark:text-indigo-400 underline decoration-indigo-300 dark:decoration-indigo-700">{p.text}</span>
          ) : (
            <span key={i}>{p.text}</span>
          )
        )}
      </>
    );
  };

  return (
    <FadeIn>
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-900/30 shadow-lg p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{title}</p>

        <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-4 mb-3">
          <p className="text-lg font-medium text-foreground mb-1">{renderSentence()}</p>
          <p className="text-sm text-muted-foreground">{content.translation}</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => playAudio(content.sentence)}
          className="text-indigo-600 dark:text-indigo-400"
        >
          <Volume2 className="w-4 h-4 mr-1" /> Dengarkan
        </Button>
      </div>
    </FadeIn>
  );
}
