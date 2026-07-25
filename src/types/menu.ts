import { z } from "zod";

export const menuDishSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.string()),
  allergens: z.array(z.string()),
  price: z.string(),
});

export type MenuDish = z.infer<typeof menuDishSchema>;
