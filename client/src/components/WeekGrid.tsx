import type { Meal, PlanEntry, Recipe } from "../types";
import { DAYS, MEALS, dayDate, money } from "../utils";

interface Props {
  week: string;
  entries: PlanEntry[];
  recipes: Recipe[];
  onPick: (day: number, meal: Meal) => void;
}

export default function WeekGrid({ week, entries, recipes, onPick }: Props) {
  const recipeById = new Map(recipes.map((r) => [r.id, r]));
  const find = (day: number, meal: Meal) => {
    const entry = entries.find((e) => e.day === day && e.meal === meal);
    return entry ? recipeById.get(entry.recipeId) : undefined;
  };

  return (
    <div className="week">
      <div className="week-head" aria-hidden="true">
        <span />
        {MEALS.map((m) => (
          <span key={m} className="label">
            {m}
          </span>
        ))}
      </div>

      {DAYS.map((dayName, day) => {
        const planned = MEALS.filter((m) => find(day, m)).length;
        return (
          <div className="day" key={dayName}>
            <div className="day-name">
              {dayName}
              <small>
                {dayDate(week, day)} · {planned}/3
              </small>
            </div>
            {MEALS.map((meal) => {
              const recipe = find(day, meal);
              return (
                <button
                  key={meal}
                  className={recipe ? "slot" : "slot empty"}
                  aria-label={`${dayName} ${meal}: ${recipe ? recipe.name : "empty"}`}
                  onClick={() => onPick(day, meal)}
                >
                  <span className="label meal-tag">{meal}</span>
                  {recipe ? (
                    <>
                      <span className="name">{recipe.name}</span>
                      <span className="meta">
                        <span className="money">{money(recipe.costCents)}</span> · {recipe.minutes} min
                      </span>
                    </>
                  ) : (
                    <span>+ Add</span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
