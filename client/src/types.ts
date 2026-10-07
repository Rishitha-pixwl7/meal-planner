export type Meal = "breakfast" | "lunch" | "dinner";

export interface User {
  id: number;
  email: string;
  budgetCents: number;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: number;
  name: string;
  costCents: number;
  minutes: number;
  meals: Meal[];
  cuisine: string;
  ingredients: Ingredient[];
}

export type RecipeInput = Omit<Recipe, "id">;

export interface PlanEntry {
  day: number; // 0 = Monday
  meal: Meal;
  recipeId: number;
}

export interface GroceryItem {
  key: string;
  name: string;
  unit: string;
  quantity: number;
  checked: boolean;
}
