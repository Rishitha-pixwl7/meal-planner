import { describe, expect, it } from "vitest";
import { mergeIngredients } from "./grocery.js";

describe("mergeIngredients", () => {
  it("adds up the same ingredient across meals", () => {
    const list = mergeIngredients([
      [{ name: "eggs", quantity: 2, unit: "" }],
      [{ name: "eggs", quantity: 1, unit: "" }],
    ]);
    expect(list).toEqual([{ key: "eggs|", name: "eggs", unit: "", quantity: 3 }]);
  });

  it("keeps different units separate", () => {
    const list = mergeIngredients([
      [{ name: "rice", quantity: 0.5, unit: "cup" }],
      [{ name: "rice", quantity: 4, unit: "oz" }],
    ]);
    expect(list).toHaveLength(2);
  });

  it("sorts alphabetically and rounds to 2 decimals", () => {
    const list = mergeIngredients([
      [
        { name: "salsa", quantity: 0.1, unit: "cup" },
        { name: "beans", quantity: 0.33, unit: "can" },
      ],
      [
        { name: "salsa", quantity: 0.2, unit: "cup" },
        { name: "beans", quantity: 0.33, unit: "can" },
      ],
    ]);
    expect(list.map((i) => i.name)).toEqual(["beans", "salsa"]);
    expect(list[1].quantity).toBe(0.3);
  });

  it("returns an empty list when nothing is planned", () => {
    expect(mergeIngredients([])).toEqual([]);
  });
});
