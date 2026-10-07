import { z } from "zod";

export const MEALS = ["breakfast", "lunch", "dinner"] as const;
export const mealSchema = z.enum(MEALS);

export const weekSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "week must look like 2026-10-05");

const emailField = z.string().trim().toLowerCase().email("Enter a valid email address");

export const credentialsSchema = z.object({
  email: emailField,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const emailOnlySchema = z.object({ email: emailField });

export const verifySchema = z.object({
  email: emailField,
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from the email"),
});

export const recipeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  costCents: z.number().int().min(0).max(100_000),
  minutes: z.number().int().min(1).max(24 * 60),
  meals: z.array(mealSchema).min(1, "Pick at least one meal"),
  cuisine: z.string().trim().max(30).default(""),
  ingredients: z
    .array(
      z.object({
        name: z.string().trim().toLowerCase().min(1, "Ingredient name is required"),
        quantity: z.number().positive("Amount must be more than 0"),
        unit: z.string().trim().toLowerCase().max(20).default(""),
      }),
    )
    .min(1, "Add at least one ingredient"),
});

export type RecipeInput = z.infer<typeof recipeSchema>;
