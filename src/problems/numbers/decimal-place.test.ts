import { describe, it, expect } from "vitest";
import { generateDecimalPlace } from "./decimal-place";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateDecimalPlace
// ---------------------------------------------------------------------------
describe("generateDecimalPlace", () => {
  it("returns 10 problems", () => {
    const problems = generateDecimalPlace(42, "count");
    expect(problems).toHaveLength(10);
  });

  it("count mode: questions involve 0.1 counting", () => {
    for (const seed of seeds) {
      const problems = generateDecimalPlace(seed, "count");
      for (const p of problems) {
        expect(p.question).toContain("0.1");
      }
    }
  });

  it("multiply mode: questions involve multiplication or 1/10", () => {
    for (const seed of seeds) {
      const problems = generateDecimalPlace(seed, "multiply");
      for (const p of problems) {
        const hasMul = p.question.includes("倍") || p.question.includes("1/10");
        expect(hasMul).toBe(true);
      }
    }
  });

  it("mixed mode produces both count and multiply types", () => {
    let hasCount = false;
    let hasMultiply = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateDecimalPlace(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("0.1が") || p.question.includes("は0.1が"))
          hasCount = true;
        if (p.question.includes("倍") || p.question.includes("1/10"))
          hasMultiply = true;
      }
    }
    expect(hasCount).toBe(true);
    expect(hasMultiply).toBe(true);
  });

  it("count mode: 0.1 * count = value relationship", () => {
    for (const seed of seeds) {
      const problems = generateDecimalPlace(seed, "count");
      for (const p of problems) {
        const countMatch = p.question.match(/0\.1が(\d+)個で□/);
        if (countMatch) {
          const count = Number(countMatch[1]);
          expect(p.answer).toBe(`${count / 10}`);
        }
        const valMatch = p.question.match(/^(.+)は0\.1が□個$/);
        if (valMatch) {
          const val = Number(valMatch[1]);
          const count = Number(p.answer);
          expect(val).toBeCloseTo(count / 10, 5);
        }
      }
    }
  });

  it("answers are valid numbers", () => {
    for (const seed of seeds) {
      for (const mode of ["count", "multiply", "mixed"] as const) {
        const problems = generateDecimalPlace(seed, mode);
        for (const p of problems) {
          const ansNum = Number(p.answer);
          expect(Number.isNaN(ansNum)).toBe(false);
          expect(ansNum).toBeGreaterThan(0);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateDecimalPlace(42, "mixed");
    const b = generateDecimalPlace(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateDecimalPlace(1, "count");
    const b = generateDecimalPlace(2, "count");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
