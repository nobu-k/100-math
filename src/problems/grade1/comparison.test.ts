import { describe, it, expect } from "vitest";
import { generateComparison } from "./comparison";

const seeds = [1, 2, 42, 100, 999];

describe("generateComparison", () => {
  it("returns 15 problems", () => {
    const problems = generateComparison(42, 20);
    expect(problems).toHaveLength(15);
  });

  it("answer matches the actual comparison", () => {
    for (const seed of seeds) {
      const problems = generateComparison(seed, 50);
      for (const p of problems) {
        if (p.left > p.right) expect(p.answer).toBe("＞");
        else if (p.left < p.right) expect(p.answer).toBe("＜");
        else expect(p.answer).toBe("＝");
      }
    }
  });

  it("first two problems have equal pairs", () => {
    for (const seed of seeds) {
      const problems = generateComparison(seed, 20);
      expect(problems[0].left).toBe(problems[0].right);
      expect(problems[1].left).toBe(problems[1].right);
    }
  });

  it("values are within [1, max]", () => {
    for (const seed of seeds) {
      for (const max of [20, 50, 100]) {
        const problems = generateComparison(seed, max);
        for (const p of problems) {
          expect(p.left).toBeGreaterThanOrEqual(1);
          expect(p.left).toBeLessThanOrEqual(max);
          expect(p.right).toBeGreaterThanOrEqual(1);
          expect(p.right).toBeLessThanOrEqual(max);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateComparison(42, 20);
    const b = generateComparison(42, 20);
    expect(a).toEqual(b);
  });
});
