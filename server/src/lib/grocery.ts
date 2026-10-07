export interface IngredientLike {
  name: string;
  quantity: number;
  unit: string;
}

export interface GroceryItem {
  key: string; // "name|unit"
  name: string;
  unit: string;
  quantity: number;
}

export const itemKey = (name: string, unit: string) => `${name}|${unit}`;

// Same name + unit are summed; different units stay separate (no cups -> oz conversion).
export function mergeIngredients(meals: IngredientLike[][]): GroceryItem[] {
  const merged = new Map<string, GroceryItem>();

  for (const ingredients of meals) {
    for (const { name, quantity, unit } of ingredients) {
      const key = itemKey(name, unit);
      const existing = merged.get(key);
      if (existing) existing.quantity += quantity;
      else merged.set(key, { key, name, unit, quantity });
    }
  }

  return [...merged.values()]
    .map((item) => ({ ...item, quantity: Math.round(item.quantity * 100) / 100 }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
