import { NextResponse } from "next/server";
import { fetchRestaurantMenu, PerplexityMenuError } from "@/lib/perplexity";

// Temporary manual-testing route for the Perplexity menu lookup — not wired
// into any UI or database yet. Remove or gate behind auth before shipping.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurant = searchParams.get("restaurant");
  const location = searchParams.get("location");

  if (!restaurant || !location) {
    return NextResponse.json(
      { error: "Provide both ?restaurant= and ?location= query params" },
      { status: 400 },
    );
  }

  try {
    const result = await fetchRestaurantMenu(restaurant, location);
    return NextResponse.json({
      restaurant,
      location,
      cached: result.cached,
      fetchedAt: result.fetchedAt,
      dishes: result.dishes,
    });
  } catch (error) {
    if (error instanceof PerplexityMenuError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    throw error;
  }
}
