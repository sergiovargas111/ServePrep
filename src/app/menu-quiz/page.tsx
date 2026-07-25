import FlashcardSession from "@/components/quiz-engine/flashcard-session";
import { flashcards } from "@/lib/flashcards";

export default function MenuQuizPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Menu Quiz</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Review menu terms, allergens, wine pairings, and cooking temps with
          spaced repetition.
        </p>
      </div>
      <FlashcardSession cards={flashcards} />
    </main>
  );
}
