"use client";

import { useState } from "react";
import FlashcardSession from "@/components/quiz-engine/flashcard-session";
import { searchRestaurantMenu } from "@/lib/actions/menu-search-actions";
import { dishesToFlashcards } from "@/lib/menu-to-flashcards";
import type { CardSchedule } from "@/lib/spaced-repetition";
import type { Flashcard } from "@/types/flashcard";
import type { MenuDish } from "@/types/menu";

export default function MenuQuizClient({
  staticCards,
  initialSchedules,
  isSignedIn = false,
}: {
  staticCards: Flashcard[];
  initialSchedules?: Record<string, CardSchedule>;
  isSignedIn?: boolean;
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [dishes, setDishes] = useState<MenuDish[] | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [manualDishName, setManualDishName] = useState("");
  const [manualDishes, setManualDishes] = useState<MenuDish[]>([]);

  function startSessionWith(newDishes: MenuDish[]) {
    setDishes(newDishes);
    setSessionKey((key) => key + 1);
  }

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const restaurantName = String(formData.get("restaurantName") ?? "");
    const location = String(formData.get("location") ?? "");

    setIsSearching(true);
    setSearchError(null);

    const result = await searchRestaurantMenu({ restaurantName, location });

    setIsSearching(false);
    if (result.success) {
      setManualDishes([]);
      startSessionWith(result.dishes);
    } else {
      setSearchError(result.error);
    }
  }

  function handleAddManualDish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = manualDishName.trim();
    if (!name) return;

    setManualDishes((prev) => [
      ...prev,
      { name, ingredients: [], allergens: [], price: "" },
    ]);
    setManualDishName("");
  }

  const cards = dishes ? dishesToFlashcards(dishes) : staticCards;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-lg font-semibold tracking-tight">
          Study a real restaurant&apos;s menu
        </h2>
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="flex flex-1 flex-col gap-1 text-sm">
            Restaurant name
            <input
              type="text"
              name="restaurantName"
              required
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            Location
            <input
              type="text"
              name="location"
              required
              placeholder="City, State"
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <button
            type="submit"
            disabled={isSearching}
            className="rounded-md bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isSearching ? "Searching…" : "Search"}
          </button>
        </form>

        {isSearching && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Searching the web for this menu — this can take a few seconds.
          </p>
        )}

        {searchError && (
          <div className="flex flex-col gap-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <p className="text-sm text-red-700 dark:text-red-400">
              {searchError} Add dishes manually instead:
            </p>
            <form
              onSubmit={handleAddManualDish}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <input
                type="text"
                value={manualDishName}
                onChange={(event) => setManualDishName(event.target.value)}
                placeholder="Dish name"
                className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <button
                type="submit"
                className="rounded-md border border-zinc-200 px-4 py-2 text-sm transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                Add Dish
              </button>
            </form>

            {manualDishes.length > 0 && (
              <div className="flex flex-col gap-2">
                <ul className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {manualDishes.map((dish, index) => (
                    <li key={`${dish.name}-${index}`}>{dish.name}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => startSessionWith(manualDishes)}
                  className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Study These {manualDishes.length} Dish
                  {manualDishes.length === 1 ? "" : "es"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <FlashcardSession
        key={dishes ? `dishes-${sessionKey}` : "static"}
        cards={cards}
        initialSchedules={initialSchedules}
        isSignedIn={isSignedIn}
      />
    </div>
  );
}
