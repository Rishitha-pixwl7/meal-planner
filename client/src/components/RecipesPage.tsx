import { useEffect, useState } from "react";
import { api } from "../api";
import type { Recipe, RecipeInput } from "../types";
import { cuisinesIn, money, prettyQty } from "../utils";
import CuisineFilter from "./CuisineFilter";
import RecipeForm from "./RecipeForm";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editing, setEditing] = useState<Recipe | "new" | null>(null);
  const [cuisine, setCuisine] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    api.recipes.list().then(setRecipes).catch((e) => setError(e.message));
  }, []);

  async function save(input: RecipeInput) {
    // errors propagate to RecipeForm, which displays them
    if (editing === "new") {
      const created = await api.recipes.create(input);
      setRecipes((rs) => [...rs, created].sort((a, b) => a.name.localeCompare(b.name)));
    } else if (editing) {
      const updated = await api.recipes.update(editing.id, input);
      setRecipes((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));
    }
    setEditing(null);
  }

  async function remove(r: Recipe) {
    if (!window.confirm(`Delete "${r.name}"? It will also be removed from any planned meals.`)) return;
    try {
      await api.recipes.remove(r.id);
      setRecipes((rs) => rs.filter((x) => x.id !== r.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete");
    }
  }

  const shown = recipes.filter((r) => cuisine === "All" || (r.cuisine || "Other") === cuisine);

  return (
    <section className="stack">
      <div className="toolbar">
        <div>
          <p className="label">
            {shown.length} {cuisine === "All" ? "" : cuisine + " "}recipes
          </p>
          <h1>Recipes</h1>
        </div>
        <button className="btn primary" onClick={() => setEditing("new")}>
          + New recipe
        </button>
      </div>

      <CuisineFilter cuisines={cuisinesIn(recipes)} value={cuisine} onChange={setCuisine} />
      {error && <p className="error">{error}</p>}

      <div className="recipe-grid">
        {shown.map((r) => (
          <article key={r.id} className="recipe-card">
            <div className="row">
              <h3>{r.name}</h3>
              <span className="money">{money(r.costCents)}</span>
            </div>
            <p className="muted small">
              {r.cuisine && <span className="chip neutral">{r.cuisine}</span>} {r.minutes} min · {r.meals.join(", ")}
            </p>
            <ul className="ing-list">
              {r.ingredients.map((i, idx) => (
                <li key={idx}>
                  {i.name} <span className="muted">{prettyQty(i.quantity, i.unit)}</span>
                </li>
              ))}
            </ul>
            <div className="row">
              <button className="btn" onClick={() => setEditing(r)}>
                Edit
              </button>
              <button className="btn danger" onClick={() => remove(r)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {editing && <RecipeForm initial={editing === "new" ? undefined : editing} onSave={save} onClose={() => setEditing(null)} />}
    </section>
  );
}
