import type { Flashcard } from "@/types/flashcard";
import type { MenuDish } from "@/types/menu";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function dishesToFlashcards(dishes: MenuDish[]): Flashcard[] {
  return dishes.map((dish, index): Flashcard => {
    const answerParts: string[] = [];
    if (dish.ingredients.length > 0) {
      answerParts.push(`Ingredients: ${dish.ingredients.join(", ")}`);
    }
    if (dish.allergens.length > 0) {
      answerParts.push(`Allergens: ${dish.allergens.join(", ")}`);
    }

    return {
      id: `dish-${index}-${slugify(dish.name)}`,
      category: "menu_term",
      term: dish.name,
      answer:
        answerParts.length > 0
          ? answerParts.join(" · ")
          : "No ingredient or allergen info available.",
    };
  });
}
