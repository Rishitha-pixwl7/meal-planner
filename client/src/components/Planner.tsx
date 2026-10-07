import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import type { GroceryItem, Meal, PlanEntry, Recipe, User } from "../types";
import { addWeeks, mondayOf, weekCostCents, weekLabel } from "../utils";
import BudgetBar from "./BudgetBar";
import GroceryList from "./GroceryList";
import RecipePicker from "./RecipePicker";
import WeekGrid from "./WeekGrid";

interface Props {
  user: User;
  onUserChange: (u: User) => void;
}

export default function Planner({ user, onUserChange }: Props) {
  const [week, setWeek] = useState(() => mondayOf(new Date()));
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [entries, setEntries] = useState<PlanEntry[]>([]);
  const [grocery, setGrocery] = useState<GroceryItem[]>([]);
  const [picking, setPicking] = useState<{ day: number; meal: Meal } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.recipes.list().then(setRecipes).catch((e) => setError(e.message));
  }, []);

  const loadWeek = useCallback(async () => {
    try {
      const [plan, list] = await Promise.all([api.plan.get(week), api.grocery.get(week)]);
      setEntries(plan);
      setGrocery(list);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load this week");
    } finally {
      setLoading(false);
    }
  }, [week]);

  useEffect(() => {
    setLoading(true);
    loadWeek();
  }, [loadWeek]);

  async function setMeal(day: number, meal: Meal, recipeId: number | null) {
    setPicking(null);
    try {
      await api.plan.set(week, day, meal, recipeId);
      await loadWeek();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save that meal");
    }
  }

  async function clearWeek() {
    if (!window.confirm("Remove every meal from this week?")) return;
    await api.plan.clear(week);
    await loadWeek();
  }

  async function toggleItem(item: GroceryItem) {
    // optimistic update, rolled back on failure
    setGrocery((list) => list.map((i) => (i.key === item.key ? { ...i, checked: !i.checked } : i)));
    try {
      await api.grocery.toggle(week, item.key, !item.checked);
    } catch {
      setGrocery((list) => list.map((i) => (i.key === item.key ? { ...i, checked: item.checked } : i)));
    }
  }

  async function saveBudget(budgetCents: number) {
    const updated = await api.setBudget(budgetCents);
    onUserChange(updated);
  }

  const currentRecipeId = picking ? entries.find((e) => e.day === picking.day && e.meal === picking.meal)?.recipeId : undefined;
  const isThisWeek = week === mondayOf(new Date());

  return (
    <>
      <header className="planner-head">
        <div>
          <p className="label">{isThisWeek ? "This week" : "Week of"}</p>
          <div className="week-nav">
            <button className="btn icon" aria-label="Previous week" onClick={() => setWeek(addWeeks(week, -1))}>
              ‹
            </button>
            <h1>{weekLabel(week)}</h1>
            <button className="btn icon" aria-label="Next week" onClick={() => setWeek(addWeeks(week, 1))}>
              ›
            </button>
          </div>
          {!isThisWeek && (
            <button className="link small" onClick={() => setWeek(mondayOf(new Date()))}>
              Back to this week
            </button>
          )}
        </div>
        <BudgetBar spentCents={weekCostCents(entries, recipes)} budgetCents={user.budgetCents} onBudgetChange={saveBudget} />
      </header>

      {error && <p className="error">{error}</p>}

      <div className="main">
        <section aria-label="Meals">
          <div className="toolbar">
            <h2>Meals</h2>
            <button className="btn danger" onClick={clearWeek} disabled={!entries.length}>
              Clear week
            </button>
          </div>
          {loading ? <p className="muted">Loading…</p> : <WeekGrid week={week} entries={entries} recipes={recipes} onPick={(day, meal) => setPicking({ day, meal })} />}
        </section>

        <GroceryList items={grocery} onToggle={toggleItem} />
      </div>

      {picking && (
        <RecipePicker
          day={picking.day}
          meal={picking.meal}
          recipes={recipes}
          currentId={currentRecipeId}
          onChoose={(id) => setMeal(picking.day, picking.meal, id)}
          onClose={() => setPicking(null)}
        />
      )}
    </>
  );
}
