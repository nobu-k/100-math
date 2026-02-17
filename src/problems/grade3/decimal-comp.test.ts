import { describe, it, expect } from "vitest";
import { generateDecimalComp } from "./decimal-comp";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateDecimalComp
// ---------------------------------------------------------------------------
describe("generateDecimalComp", () => {
  it("returns 15 problems", () => {
    const problems = generateDecimalComp(42, 10);
    expect(problems).toHaveLength(15);
  });

  it("answer matches actual comparison", () => {
    for (const seed of seeds) {
      for (const maxVal of [5, 10, 20]) {
        const problems = generateDecimalComp(seed, maxVal);
        for (const p of problems) {
          const left = parseFloat(p.left);
          const right = parseFloat(p.right);
          if (left > right) expect(p.answer).toBe("＞");
          else if (left < right) expect(p.answer).toBe("＜");
          else expect(p.answer).toBe("＝");
        }
      }
    }
  });

  it("first two problems have equal pairs", () => {
    for (const seed of seeds) {
      const problems = generateDecimalComp(seed, 10);
      expect(problems[0].left).toBe(problems[0].right);
      expect(problems[1].left).toBe(problems[1].right);
    }
  });

  it("values are formatted to 1 decimal place", () => {
    for (const seed of seeds) {
      const problems = generateDecimalComp(seed, 10);
      for (const p of problems) {
        expect(p.left).toMatch(/^\d+\.\d$/);
        expect(p.right).toMatch(/^\d+\.\d$/);
      }
    }
  });

  it("values are positive", () => {
    for (const seed of seeds) {
      const problems = generateDecimalComp(seed, 10);
      for (const p of problems) {
        expect(parseFloat(p.left)).toBeGreaterThan(0);
        expect(parseFloat(p.right)).toBeGreaterThan(0);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateDecimalComp(42, 10);
    const b = generateDecimalComp(42, 10);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateDecimalComp(1, 10);
    const b = generateDecimalComp(2, 10);
    const aLefts = a.map((p) => p.left);
    const bLefts = b.map((p) => p.left);
    expect(aLefts).not.toEqual(bLefts);
  });
});
