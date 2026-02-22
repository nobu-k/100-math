import { describe, it, expect } from "vitest";
import { generateRounding } from "./rounding";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateRounding
// ---------------------------------------------------------------------------
describe("generateRounding", () => {
  it("returns 10 problems", () => {
    const problems = generateRounding(42, 3);
    expect(problems).toHaveLength(10);
  });

  it("question contains the number and a rounding position", () => {
    for (const seed of seeds) {
      const problems = generateRounding(seed, 3);
      for (const p of problems) {
        expect(p.question).toContain("概数");
        expect(p.question).toMatch(/の位/);
      }
    }
  });

  it("answer is a valid number string", () => {
    for (const seed of seeds) {
      const problems = generateRounding(seed, 3);
      for (const p of problems) {
        const ansNum = Number(p.answer);
        expect(Number.isNaN(ansNum)).toBe(false);
        expect(ansNum).toBeGreaterThan(0);
      }
    }
  });

  it("answer is a multiple of the rounding unit", () => {
    for (const seed of seeds) {
      const problems = generateRounding(seed, 3);
      for (const p of problems) {
        const ansNum = Number(p.answer);
        // Must be a multiple of 10, 100, or 1000
        const isMultipleOf10 =
          ansNum % 10 === 0 || ansNum % 100 === 0 || ansNum % 1000 === 0;
        expect(isMultipleOf10).toBe(true);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateRounding(42, 3);
    const b = generateRounding(42, 3);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateRounding(1, 3);
    const b = generateRounding(2, 3);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
