import { describe, it, expect } from "vitest";
import { generateDecomposition } from "./decomposition";

const seeds = [1, 2, 42, 100, 999];

describe("generateDecomposition", () => {
  it("returns 12 problems", () => {
    const problems = generateDecomposition(42, 10);
    expect(problems).toHaveLength(12);
  });

  it("given + answer = target for every problem", () => {
    for (const seed of seeds) {
      for (const target of [5, 10, 15, 20]) {
        const problems = generateDecomposition(seed, target);
        for (const p of problems) {
          expect(p.given + p.answer).toBe(target);
          expect(p.target).toBe(target);
        }
      }
    }
  });

  it("given is between 1 and target-1", () => {
    for (const seed of seeds) {
      const problems = generateDecomposition(seed, 10);
      for (const p of problems) {
        expect(p.given).toBeGreaterThanOrEqual(1);
        expect(p.given).toBeLessThanOrEqual(9);
      }
    }
  });

  it("position is left or right", () => {
    const problems = generateDecomposition(42, 10);
    for (const p of problems) {
      expect(["left", "right"]).toContain(p.position);
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateDecomposition(42, 10);
    const b = generateDecomposition(42, 10);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateDecomposition(1, 10);
    const b = generateDecomposition(2, 10);
    const aGivens = a.map((p) => p.given);
    const bGivens = b.map((p) => p.given);
    expect(aGivens).not.toEqual(bGivens);
  });
});
