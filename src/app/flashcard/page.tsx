import { FlashcardDeck } from "@/components/flashcard/flashcard-deck";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function FlashcardContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") as "normal" | "mistakes" | null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="p-4 space-y-4 max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {mode === "mistakes" ? "Ulangi Kesalahan" : "Flashcard"}
          </h1>
        </div>

        <FlashcardDeck mode={mode || "normal"} />
      </div>
    </div>
  );
}

export default function FlashcardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <FlashcardContent />
    </Suspense>
  );
}
