import { describe, it, expect } from "vitest";
import { generateParallelogram } from "./parallelogram";

const seeds = [1, 2, 42, 100, 999];

describe("generateParallelogram", () => {
  it("returns 10 problems", () => {
    const problems = generateParallelogram(42, "mixed");
    expect(problems).toHaveLength(6);
  });

  it("is deterministic with the same seed", () => {
    const a = generateParallelogram(42, "mixed");
    const b = generateParallelogram(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateParallelogram(1, "mixed");
    const b = generateParallelogram(2, "mixed");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("sides mode only produces sides problems", () => {
    for (const seed of seeds) {
      const problems = generateParallelogram(seed, "sides");
      for (const p of problems) {
        expect(p.type).toBe("sides");
      }
    }
  });

  it("angles mode only produces angles problems", () => {
    for (const seed of seeds) {
      const problems = generateParallelogram(seed, "angles");
      for (const p of problems) {
        expect(p.type).toBe("angles");
      }
    }
  });

  it("diagonals mode only produces diagonals problems", () => {
    for (const seed of seeds) {
      const problems = generateParallelogram(seed, "diagonals");
      for (const p of problems) {
        expect(p.type).toBe("diagonals");
      }
    }
  });

  it("mixed mode produces multiple types", () => {
    const typesSeen = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateParallelogram(seed, "mixed");
      for (const p of problems) {
        typesSeen.add(p.type);
      }
    }
    expect(typesSeen.size).toBeGreaterThanOrEqual(2);
  });

  it("angles problems have answers between 40 and 140", () => {
    for (const seed of seeds) {
      const problems = generateParallelogram(seed, "angles");
      for (const p of problems) {
        expect(p.answer).toBeGreaterThanOrEqual(40);
        expect(p.answer).toBeLessThanOrEqual(140);
      }
    }
  });

  it("angles problems have answerDisplay with degree symbol", () => {
    for (const seed of seeds) {
      const problems = generateParallelogram(seed, "angles");
      for (const p of problems) {
        expect(p.answerDisplay).toMatch(/°$/);
      }
    }
  });

  it("sides and diagonals problems have answerDisplay with cm", () => {
    for (const seed of seeds) {
      const problems = generateParallelogram(seed, "mixed");
      for (const p of problems) {
        if (p.type === "sides" || p.type === "diagonals") {
          expect(p.answerDisplay).toMatch(/cm$/);
        }
      }
    }
  });

  it("all answers are positive integers", () => {
    for (const seed of seeds) {
      const problems = generateParallelogram(seed, "mixed");
      for (const p of problems) {
        expect(p.answer).toBeGreaterThan(0);
        expect(Number.isInteger(p.answer)).toBe(true);
      }
    }
  });

  it("diagonals answers are even (double of half-diagonal)", () => {
    for (const seed of seeds) {
      const problems = generateParallelogram(seed, "diagonals");
      for (const p of problems) {
        expect(p.answer % 2).toBe(0);
      }
    }
  });
});
