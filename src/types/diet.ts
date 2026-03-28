import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string(),
  amount: z.string(),
});

export const mealSchema = z.object({
  name: z.string(),
  prepTimeMinutes: z.number().int().min(1),
  steps: z.array(z.string()).min(1),
  ingredients: z.array(ingredientSchema).min(1),
});

export const daySchema = z.object({
  day: z.number().int().min(1).max(7),
  meals: z.array(mealSchema).min(3),
});

export const shoppingItemSchema = z.object({
  item: z.string(),
  amount: z.string(),
});

export const shoppingListSchema = z
  .object({
    Biedronka: z.array(shoppingItemSchema).optional(),
    Lidl: z.array(shoppingItemSchema).optional(),
    Żabka: z.array(shoppingItemSchema).optional(),
  })
  .transform((s) => ({
    Biedronka: s.Biedronka ?? [],
    Lidl: s.Lidl ?? [],
    Żabka: s.Żabka ?? [],
  }));

export const dietPayloadSchema = z.object({
  summary: z.string().optional(),
  days: z.array(daySchema).length(7),
  shoppingList: shoppingListSchema,
});

export type DietPayload = z.infer<typeof dietPayloadSchema>;
export type Meal = z.infer<typeof mealSchema>;
