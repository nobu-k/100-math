import { describe, it, expect } from "vitest";
import { generateSubOneDigit } from "./sub-one-digit";

const seeds = [1, 2, 42, 100, 999];

describe("generateSubOneDigit", () => {
  it("returns the requested number of problems", () => {
    expect(generateSubOneDigit(42, 9, 20)).toHaveLength(20);
  });

  it("caps the count to the available unique pairs", () => {
    // max=5 has 15 unique pairs with 1 ≤ b ≤ a ≤ 5
    expect(generateSubOneDigit(42, 5, 20)).toHaveLength(15);
  });

  it("uses single-digit operands only", () => {
    for (const seed of seeds) {
      for (const p of generateSubOneDigit(seed, 9, 20)) {
        expect(p.a).toBeGreaterThanOrEqual(1);
        expect(p.a).toBeLessThanOrEqual(9);
        expect(p.b).toBeGreaterThanOrEqual(1);
        expect(p.b).toBeLessThanOrEqual(9);
      }
    }
  });

  it("never produces a negative result", () => {
    for (const seed of seeds) {
      for (const p of generateSubOneDigit(seed, 9, 20)) {
        expect(p.answer).toBe(p.a - p.b);
        expect(p.answer).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("has no duplicate problems on a page", () => {
    for (const seed of seeds) {
      const keys = generateSubOneDigit(seed, 9, 20).map((p) => `${p.a}-${p.b}`);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("respects the max minuend", () => {
    for (const seed of seeds) {
      for (const p of generateSubOneDigit(seed, 5, 20)) {
        expect(p.a).toBeLessThanOrEqual(5);
        expect(p.b).toBeLessThanOrEqual(5);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    expect(generateSubOneDigit(42, 9, 20)).toEqual(generateSubOneDigit(42, 9, 20));
  });
});
