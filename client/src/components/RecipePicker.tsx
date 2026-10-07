import { useState } from "react";
import type { Meal, Recipe } from "../types";
import { DAYS, cuisinesIn, money } from "../utils";
import CuisineFilter from "./CuisineFilter";
import Modal from "./Modal";

interface Props {
  day: number;
  meal: Meal;
  recipes: Recipe[];
  currentId?: number;
  onChoose: (recipeId: number | null) => void;
  onClose: () => void;
}

export default function RecipePicker({ day, meal, recipes, currentId, onChoose, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [onlyThisMeal, setOnlyThisMeal] = useState(true);
  const [cuisine, setCuisine] = useState("All");

  const forThisMeal = recipes.filter((r) => !onlyThisMeal || r.meals.includes(meal));
  const shown = forThisMeal
    .filter((r) => cuisine === "All" || (r.cuisine || "Other") === cuisine)
    .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.costCents - b.costCents);

  return (
    <Modal title={`${DAYS[day]} · ${meal}`} onClose={onClose}>
      <input className="search" placeholder="Search recipes…" autoFocus value={query} onChange={(e) => setQuery(e.target.value)} />
      <CuisineFilter cuisines={cuisinesIn(forThisMeal)} value={cuisine} onChange={setCuisine} />

      <div className="recipe-list">
        {shown.length === 0 && <p className="muted">No recipes match. Try another filter, or add a recipe on the Recipes tab.</p>}
        {shown.map((r) => (
          <button key={r.id} className={r.id === currentId ? "recipe-opt current" : "recipe-opt"} onClick={() => onChoose(r.id)}>
            <span className="row">
              <strong>{r.name}</strong>
              <span className="money">{money(r.costCents)}</span>
            </span>
            <span className="row muted small">
              <span>
                {r.minutes} min · {r.ingredients.length} ingredients
              </span>
              <span className="chips">
                {r.cuisine && <span className="chip neutral">{r.cuisine}</span>}
                {r.costCents < 125 && <span className="chip">under $1.25</span>}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="dialog-foot">
        <label className="check">
          <input type="checkbox" checked={onlyThisMeal} onChange={(e) => setOnlyThisMeal(e.target.checked)} /> Only {meal} recipes
        </label>
        {currentId !== undefined && (
          <button className="btn danger" onClick={() => onChoose(null)}>
            Remove meal
          </button>
        )}
      </div>
    </Modal>
  );
}
