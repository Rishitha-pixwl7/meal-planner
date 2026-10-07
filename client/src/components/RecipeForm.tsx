import { useState, type FormEvent } from "react";
import type { Meal, Recipe, RecipeInput } from "../types";
import { CUISINES, MEALS } from "../utils";
import Modal from "./Modal";

interface Props {
  initial?: Recipe;
  onSave: (input: RecipeInput) => Promise<void>;
  onClose: () => void;
}

interface Row {
  name: string;
  quantity: string;
  unit: string;
}

export default function RecipeForm({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [cost, setCost] = useState(initial ? (initial.costCents / 100).toFixed(2) : "1.50");
  const [minutes, setMinutes] = useState(String(initial?.minutes ?? 15));
  const [meals, setMeals] = useState<Meal[]>(initial?.meals ?? ["dinner"]);
  const [cuisine, setCuisine] = useState(initial?.cuisine || "Other");
  const cuisineOptions = CUISINES.includes(cuisine) ? CUISINES : [...CUISINES, cuisine];
  const [rows, setRows] = useState<Row[]>(
    initial?.ingredients.map((i) => ({ name: i.name, quantity: String(i.quantity), unit: i.unit })) ?? [{ name: "", quantity: "1", unit: "" }],
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateRow = (idx: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const toggleMeal = (m: Meal) => setMeals((ms) => (ms.includes(m) ? ms.filter((x) => x !== m) : [...ms, m]));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const ingredients = rows
      .filter((r) => r.name.trim())
      .map((r) => ({ name: r.name.trim(), quantity: Number(r.quantity), unit: r.unit.trim() }));

    if (!meals.length) return setError("Pick at least one meal this recipe is good for.");
    if (!ingredients.length) return setError("Add at least one ingredient.");
    if (ingredients.some((i) => !(i.quantity > 0))) return setError("Every ingredient needs an amount above 0.");

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        costCents: Math.round(Number(cost) * 100),
        minutes: Number(minutes),
        meals,
        cuisine,
        ingredients,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
      setSaving(false);
    }
  }

  return (
    <Modal title={initial ? "Edit recipe" : "New recipe"} onClose={onClose}>
      <form className="stack form-scroll" onSubmit={submit}>
        <label htmlFor="r-name">
          Name
          <input id="r-name" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tuna pasta salad" />
        </label>

        <div className="grid2">
          <label htmlFor="r-cuisine">
            Cuisine
            <select id="r-cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
              {cuisineOptions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label htmlFor="r-cost">
            Cost per serving ($)
            <input id="r-cost" type="number" min="0" step="0.05" required value={cost} onChange={(e) => setCost(e.target.value)} />
          </label>
          <label htmlFor="r-mins">
            Minutes
            <input id="r-mins" type="number" min="1" required value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </label>
        </div>

        <fieldset className="meals-field">
          <legend className="label">Good for</legend>
          {MEALS.map((m) => (
            <label key={m} className="check">
              <input type="checkbox" checked={meals.includes(m)} onChange={() => toggleMeal(m)} /> {m}
            </label>
          ))}
        </fieldset>

        <fieldset className="ing-field">
          <legend className="label">Ingredients for one serving</legend>
          {rows.map((row, idx) => (
            <div className="ing-row" key={idx}>
              <input aria-label="Ingredient" placeholder="rice" value={row.name} onChange={(e) => updateRow(idx, { name: e.target.value })} />
              <input aria-label="Amount" type="number" min="0" step="any" value={row.quantity} onChange={(e) => updateRow(idx, { quantity: e.target.value })} />
              <input aria-label="Unit" placeholder="cup" value={row.unit} onChange={(e) => updateRow(idx, { unit: e.target.value })} />
              <button type="button" className="btn icon" aria-label="Remove ingredient" onClick={() => setRows((rs) => rs.filter((_, i) => i !== idx))} disabled={rows.length === 1}>
                ×
              </button>
            </div>
          ))}
          <button type="button" className="link small" onClick={() => setRows((rs) => [...rs, { name: "", quantity: "1", unit: "" }])}>
            + Add ingredient
          </button>
          <span className="hint">Leave the unit empty for whole items, like 1 apple.</span>
        </fieldset>

        {error && <p className="error">{error}</p>}
        <button className="btn primary" disabled={saving}>
          {saving ? "Saving…" : "Save recipe"}
        </button>
      </form>
    </Modal>
  );
}
