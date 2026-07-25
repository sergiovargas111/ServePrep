export type FlashcardCategory =
  "menu_term" | "allergen" | "wine_pairing" | "cooking_temp";

export interface Flashcard {
  id: string;
  category: FlashcardCategory;
  term: string;
  answer: string;
}
