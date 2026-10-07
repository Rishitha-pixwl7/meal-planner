import { useEffect, useState } from "react";
import { money } from "../utils";

interface Props {
  spentCents: number;
  budgetCents: number;
  onBudgetChange: (cents: number) => void;
}

export default function BudgetBar({ spentCents, budgetCents, onBudgetChange }: Props) {
  const [draft, setDraft] = useState(String(budgetCents / 100));
  useEffect(() => setDraft(String(budgetCents / 100)), [budgetCents]);

  function commit() {
    const dollars = Number(draft);
    if (Number.isFinite(dollars) && dollars >= 0) onBudgetChange(Math.round(dollars * 100));
    else setDraft(String(budgetCents / 100));
  }

  const over = budgetCents > 0 && spentCents > budgetCents;
  const pct = budgetCents ? Math.min(100, (spentCents / budgetCents) * 100) : 0;

  return (
    <div className="budget" aria-live="polite">
      <div className="budget-row">
        <span className="label">Planned spend</span>
        <label className="label" htmlFor="budget">
          Budget $
          <input
            id="budget"
            type="number"
            min="0"
            step="5"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          />
        </label>
      </div>
      <div className="budget-row">
        <strong className="money big">{money(spentCents)}</strong>
        <span className={over ? "budget-note over" : "budget-note"}>
          {!budgetCents ? "Set a budget" : over ? `${money(spentCents - budgetCents)} over budget` : `${money(budgetCents - spentCents)} left`}
        </span>
      </div>
      <div className={over ? "bar over" : "bar"}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
