"use client";

import { useState } from "react";
import type { Flashcard, FlashcardCategory } from "@/types/flashcard";
import {
  createInitialSchedule,
  isDue,
  reviewCard,
  type CardSchedule,
  type ReviewRating,
} from "@/lib/spaced-repetition";

const RATING_OPTIONS: {
  rating: ReviewRating;
  label: string;
  className: string;
}[] = [
  { rating: "again", label: "Again", className: "bg-red-600 hover:bg-red-500" },
  {
    rating: "hard",
    label: "Hard",
    className: "bg-amber-600 hover:bg-amber-500",
  },
  {
    rating: "good",
    label: "Good",
    className: "bg-green-600 hover:bg-green-500",
  },
  { rating: "easy", label: "Easy", className: "bg-blue-600 hover:bg-blue-500" },
];

const CATEGORY_LABELS: Record<FlashcardCategory, string> = {
  menu_term: "Menu Term",
  allergen: "Allergen",
  wine_pairing: "Wine Pairing",
  cooking_temp: "Cooking Temp",
};

export default function FlashcardSession({ cards }: { cards: Flashcard[] }) {
  // Fixed for the lifetime of the session so "due" checks stay consistent
  // between renders instead of drifting against the wall clock.
  const [sessionStart] = useState(() => new Date());
  const [schedules, setSchedules] = useState<Record<string, CardSchedule>>(
    () => {
      const initial: Record<string, CardSchedule> = {};
      for (const card of cards) {
        initial[card.id] = createInitialSchedule(sessionStart);
      }
      return initial;
    },
  );
  const [revealed, setRevealed] = useState(false);

  const dueCards = cards.filter((card) =>
    isDue(schedules[card.id], sessionStart),
  );
  const laterCards = cards.filter(
    (card) => !isDue(schedules[card.id], sessionStart),
  );
  const currentCard = dueCards[0] ?? null;

  function handleRate(rating: ReviewRating) {
    if (!currentCard) return;
    setSchedules((prev) => ({
      ...prev,
      [currentCard.id]: reviewCard(prev[currentCard.id], rating, sessionStart),
    }));
    setRevealed(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {dueCards.length} due · {laterCards.length} scheduled for later
      </p>

      {currentCard ? (
        <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <span className="text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            {CATEGORY_LABELS[currentCard.category]}
          </span>
          <p className="text-lg">{currentCard.term}</p>
          {revealed ? (
            <>
              <p className="text-zinc-700 dark:text-zinc-300">
                {currentCard.answer}
              </p>
              <div className="flex flex-wrap gap-2">
                {RATING_OPTIONS.map(({ rating, label, className }) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRate(rating)}
                    className={`rounded-md px-4 py-2 text-white transition-colors ${className}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="self-start rounded-md border border-zinc-200 px-4 py-2 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              Reveal answer
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <p className="text-lg font-medium">
            No cards due right now — nice work. Check back once your scheduled
            cards come due.
          </p>
        </div>
      )}

      {laterCards.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Scheduled for later
          </h2>
          <ul className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            {laterCards.map((card) => (
              <li key={card.id} className="flex justify-between gap-4">
                <span>{card.term}</span>
                <span>
                  due{" "}
                  {new Date(schedules[card.id].dueDate).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
