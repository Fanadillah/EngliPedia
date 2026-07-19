import { FlashcardDeck } from "@/components/flashcard/flashcard-deck";

export default function FlashcardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="p-4 space-y-4 max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Flashcard</h1>
        </div>

        <FlashcardDeck />
      </div>
    </div>
  );
}
