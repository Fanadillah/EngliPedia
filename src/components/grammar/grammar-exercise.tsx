"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { FadeIn } from "@/components/ui/motion-components";
import { motion } from "motion/react";
import { useState } from "react";
import type { ExerciseContent } from "@/types/learning";

interface Props {
  content: ExerciseContent;
  title: string;
  onAnswer: (correct: boolean) => void;
  answered: boolean;
}

export function GrammarExercise({ content, title, onAnswer, answered }: Props) {
  const [input, setInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  const checkAnswer = () => {
    let isCorrect = false;

    if (content.type === "fill_blank" || content.type === "reorder") {
      isCorrect = input.toLowerCase().trim() === content.answer.toLowerCase().trim();
    } else if (content.type === "mcq") {
      isCorrect = selectedOption === content.answer;
    }

    setResult(isCorrect ? "correct" : "wrong");
    onAnswer(isCorrect);
  };

  const normalize = (s: string) => s.toLowerCase().trim().replace(/[.,!?;'"]/g, "");

  return (
    <FadeIn>
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-900/30 shadow-lg p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{title}</p>
        <p className="text-base font-medium text-foreground mb-4">{content.question}</p>

        {/* Fill in the blank */}
        {content.type === "fill_blank" && (
          <div className="space-y-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && input && !answered && checkAnswer()}
              placeholder="Ketik jawabanmu..."
              disabled={answered}
              className="w-full px-4 py-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 text-foreground text-center text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>
        )}

        {/* MCQ */}
        {content.type === "mcq" && content.options && (
          <div className="grid grid-cols-1 gap-2">
            {content.options.map((opt) => (
              <button
                key={opt}
                onClick={() => !answered && setSelectedOption(opt)}
                disabled={answered}
                className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                  answered && opt === content.answer
                    ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : answered && opt === selectedOption
                    ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                    : selectedOption === opt
                    ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400"
                    : "border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Hint */}
        {content.hint && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Lightbulb className="w-3 h-3" />
            {showHint ? "Sembunyikan hint" : "Tampilkan hint"}
          </button>
        )}
        {showHint && content.hint && (
          <p className="mt-2 text-xs text-muted-foreground bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-2">{content.hint}</p>
        )}

        {/* Submit */}
        {!answered && (
          <Button
            onClick={checkAnswer}
            disabled={content.type === "fill_blank" ? !input : !selectedOption}
            className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            Cek Jawaban
          </Button>
        )}

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center gap-2">
            {result === "correct" ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p className="text-green-600 dark:text-green-400 font-medium">Benar!</p>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-600 dark:text-red-400 font-medium">Jawaban: {content.answer}</p>
              </>
            )}
          </motion.div>
        )}
      </div>
    </FadeIn>
  );
}
