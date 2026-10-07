import { describe, expect, it } from "vitest";
import { addWeeks, mondayOf, money, prettyQty, weekCostCents } from "./utils";

describe("mondayOf", () => {
  it("returns the same day for a Monday", () => {
    expect(mondayOf(new Date(2026, 9, 5))).toBe("2026-10-05");
  });
  it("goes back to Monday from a Sunday", () => {
    expect(mondayOf(new Date(2026, 9, 11))).toBe("2026-10-05");
  });
});

describe("addWeeks", () => {
  it("crosses month boundaries", () => {
    expect(addWeeks("2026-10-26", 1)).toBe("2026-11-02");
    expect(addWeeks("2026-11-02", -1)).toBe("2026-10-26");
  });
});

describe("weekCostCents", () => {
  it("adds up the cost of planned meals", () => {
    const recipes = [
      { id: 1, name: "A", costCents: 150, minutes: 5, meals: [], cuisine: "", ingredients: [] },
      { id: 2, name: "B", costCents: 225, minutes: 5, meals: [], cuisine: "", ingredients: [] },
    ];
    const entries = [
      { day: 0, meal: "lunch" as const, recipeId: 1 },
      { day: 1, meal: "lunch" as const, recipeId: 1 },
      { day: 1, meal: "dinner" as const, recipeId: 2 },
    ];
    expect(weekCostCents(entries, recipes)).toBe(525);
  });
});

describe("formatting", () => {
  it("formats money", () => expect(money(1234)).toBe("$12.34"));
  it("pluralises units", () => {
    expect(prettyQty(2, "slice")).toBe("2 slices");
    expect(prettyQty(3, "oz")).toBe("3 oz");
    expect(prettyQty(0.333, "can")).toBe("0.33 can");
    expect(prettyQty(2, "")).toBe("2");
  });
});
