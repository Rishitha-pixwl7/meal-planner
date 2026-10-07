import { useState } from "react";
import type { GroceryItem } from "../types";
import { prettyQty } from "../utils";

interface Props {
  items: GroceryItem[];
  onToggle: (item: GroceryItem) => void;
}

export default function GroceryList({ items, onToggle }: Props) {
  const [copied, setCopied] = useState(false);
  const left = items.filter((i) => !i.checked).length;

  async function copy() {
    const text = items.map((i) => `- ${i.name} (${prettyQty(i.quantity, i.unit)})`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <aside className="grocery-panel" aria-label="Grocery list">
      <div className="toolbar">
        <h2>Grocery list</h2>
        {items.length > 0 && <span className="label">{left} to buy</span>}
      </div>

      {items.length === 0 ? (
        <p className="muted">Add some meals and your shopping list appears here.</p>
      ) : (
        <ul className="grocery">
          {items.map((item) => (
            <li key={item.key} className={item.checked ? "done" : ""}>
              <label>
                <input type="checkbox" checked={item.checked} onChange={() => onToggle(item)} />
                <span className="item">{item.name}</span>
                <span className="qty money">{prettyQty(item.quantity, item.unit)}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <button className="btn" onClick={copy}>
          {copied ? "Copied" : "Copy list"}
        </button>
      )}
    </aside>
  );
}
