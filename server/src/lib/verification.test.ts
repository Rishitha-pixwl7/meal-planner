import { describe, expect, it } from "vitest";
import { codeMatches, cooldownSecondsLeft, generateCode, hashCode } from "./verification.js";

describe("verification codes", () => {
  it("generates 6 digits", () => {
    for (let i = 0; i < 50; i++) expect(generateCode()).toMatch(/^\d{6}$/);
  });

  it("matches only the right code", () => {
    const stored = hashCode("123456", "secret");
    expect(codeMatches("123456", stored, "secret")).toBe(true);
    expect(codeMatches("123457", stored, "secret")).toBe(false);
    expect(codeMatches("123456", stored, "other-secret")).toBe(false);
  });

  it("never stores the plain code", () => {
    expect(hashCode("123456", "secret")).not.toContain("123456");
  });
});

describe("cooldownSecondsLeft", () => {
  it("is 0 when no code was sent", () => {
    expect(cooldownSecondsLeft(null)).toBe(0);
  });
  it("counts down from 60 seconds", () => {
    const now = Date.now();
    expect(cooldownSecondsLeft(new Date(now - 15_000), now)).toBe(45);
    expect(cooldownSecondsLeft(new Date(now - 61_000), now)).toBe(0);
  });
});
