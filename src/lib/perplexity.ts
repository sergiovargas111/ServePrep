import "server-only";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { menuDishSchema, type MenuDish } from "@/types/menu";

export type { MenuDish };

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";
const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const menuResponseSchema = z.object({
  dishes: z.array(menuDishSchema),
});

const dishesArraySchema = z.array(menuDishSchema);

// Mirrors menuResponseSchema above — kept as a plain object since it's sent
// as a JSON Schema payload to Perplexity, not used for local validation.
const MENU_JSON_SCHEMA = {
  type: "object",
  properties: {
    dishes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          ingredients: { type: "array", items: { type: "string" } },
          allergens: { type: "array", items: { type: "string" } },
          price: { type: "string" },
        },
        required: ["name", "ingredients", "allergens", "price"],
        additionalProperties: false,
      },
    },
  },
  required: ["dishes"],
  additionalProperties: false,
};

export class PerplexityMenuError extends Error {}

export interface MenuLookupResult {
  dishes: MenuDish[];
  cached: boolean;
  fetchedAt: Date;
}

// Cache keys are normalized so "Chipotle" / " chipotle " / "CHIPOTLE" all
// hit the same row instead of creating near-duplicate cache entries.
function normalizeCacheKey(value: string): string {
  return value.trim().toLowerCase();
}

async function fetchRestaurantMenuFromPerplexity(
  restaurantName: string,
  location: string,
): Promise<MenuDish[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new PerplexityMenuError("PERPLEXITY_API_KEY is not set");
  }

  const response = await fetch(PERPLEXITY_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content:
            "You are a menu research assistant. For the restaurant and location the user gives you, search the web for its current menu — including the restaurant's own nutrition, ingredient, or allergen pages if it publishes them (common for chains) — not just a summary menu listing. For each dish, actively look for its ingredient list, allergen info, and price, and only leave a field empty if you genuinely can't find it after searching, rather than leaving it empty by default. Respond with strict JSON only, matching the provided schema, and no commentary outside the JSON.",
        },
        {
          role: "user",
          content: `Restaurant: ${restaurantName}\nLocation: ${location}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "restaurant_menu",
          schema: MENU_JSON_SCHEMA,
        },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new PerplexityMenuError(
      `Perplexity API error ${response.status}: ${body}`,
    );
  }

  const data: unknown = await response.json();
  const content = (data as { choices?: { message?: { content?: unknown } }[] })
    ?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new PerplexityMenuError("Unexpected Perplexity response shape");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(content);
  } catch {
    throw new PerplexityMenuError("Perplexity did not return valid JSON");
  }

  const parsed = menuResponseSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new PerplexityMenuError(
      `Perplexity response did not match the expected schema: ${parsed.error.message}`,
    );
  }

  return parsed.data.dishes;
}

export async function fetchRestaurantMenu(
  restaurantName: string,
  location: string,
): Promise<MenuLookupResult> {
  const cacheKey = {
    restaurantName: normalizeCacheKey(restaurantName),
    location: normalizeCacheKey(location),
  };

  const cached = await prisma.menuCache.findUnique({
    where: { restaurantName_location: cacheKey },
  });

  if (cached) {
    const age = Date.now() - cached.fetchedAt.getTime();
    if (age < CACHE_MAX_AGE_MS) {
      const parsedCache = dishesArraySchema.safeParse(cached.dishes);
      if (parsedCache.success) {
        return {
          dishes: parsedCache.data,
          cached: true,
          fetchedAt: cached.fetchedAt,
        };
      }
      // Cached JSON doesn't match the current schema (e.g. it predates a
      // shape change) — fall through and refetch instead of returning it.
    }
  }

  const dishes = await fetchRestaurantMenuFromPerplexity(
    restaurantName,
    location,
  );

  const saved = await prisma.menuCache.upsert({
    where: { restaurantName_location: cacheKey },
    create: { ...cacheKey, dishes },
    update: { dishes, fetchedAt: new Date() },
  });

  return { dishes, cached: false, fetchedAt: saved.fetchedAt };
}
