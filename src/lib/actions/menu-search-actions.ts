"use server";

import { z } from "zod";
import { fetchRestaurantMenu, PerplexityMenuError } from "@/lib/perplexity";
import type { MenuDish } from "@/types/menu";

const searchSchema = z.object({
  restaurantName: z.string().min(1),
  location: z.string().min(1),
});

export type MenuSearchResult =
  { success: true; dishes: MenuDish[] } | { success: false; error: string };

export async function searchRestaurantMenu(input: {
  restaurantName: string;
  location: string;
}): Promise<MenuSearchResult> {
  const parsed = searchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Enter a restaurant name and location.",
    };
  }

  try {
    const result = await fetchRestaurantMenu(
      parsed.data.restaurantName,
      parsed.data.location,
    );
    if (result.dishes.length === 0) {
      return {
        success: false,
        error: "No menu found for that restaurant.",
      };
    }
    return { success: true, dishes: result.dishes };
  } catch (error) {
    if (error instanceof PerplexityMenuError) {
      return {
        success: false,
        error: "Couldn't fetch that menu. Try manual entry instead.",
      };
    }
    throw error;
  }
}
