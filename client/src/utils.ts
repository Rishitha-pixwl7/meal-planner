import type { Meal, PlanEntry, Recipe } from "./types";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const MEALS: Meal[] = ["breakfast", "lunch", "dinner"];
export const CUISINES = ["Everyday", "Indian", "Italian", "Mexican", "Asian", "Other"];

export function cuisinesIn(recipes: { cuisine: string }[]): string[] {
  const present = new Set(recipes.map((r) => r.cuisine || "Other"));
  const known = CUISINES.filter((c) => present.has(c));
  const extra = [...present].filter((c) => !CUISINES.includes(c)).sort();
  return [...known, ...extra];
}

export const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const pad = (n: number) => String(n).padStart(2, "0");
const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISODate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export function mondayOf(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceMonday = (d.getDay() + 6) % 7; // getDay(): 0 = Sunday
  d.setDate(d.getDate() - daysSinceMonday);
  return toISODate(d);
}

export function addWeeks(week: string, n: number): string {
  const d = fromISODate(week);
  d.setDate(d.getDate() + 7 * n);
  return toISODate(d);
}

// "2026-10-05" -> "Oct 5 – Oct 11"
export function weekLabel(week: string): string {
  const start = fromISODate(week);
  const end = fromISODate(addWeeks(week, 1));
  end.setDate(end.getDate() - 1);
  const f = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${f(start)} – ${f(end)}`;
}

export function dayDate(week: string, day: number): string {
  const d = fromISODate(week);
  d.setDate(d.getDate() + day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function weekCostCents(entries: PlanEntry[], recipes: Recipe[]): number {
  const cost = new Map(recipes.map((r) => [r.id, r.costCents]));
  return entries.reduce((sum, e) => sum + (cost.get(e.recipeId) ?? 0), 0);
}

export function prettyQty(quantity: number, unit: string): string {
  const n = Math.round(quantity * 100) / 100;
  const noPlural = ["oz", "tbsp", "tsp", "g", "kg", "ml", "l", "lb"];
  const u = unit && n > 1 && !noPlural.includes(unit) ? unit + "s" : unit;
  return u ? `${n} ${u}` : `${n}`;
}
