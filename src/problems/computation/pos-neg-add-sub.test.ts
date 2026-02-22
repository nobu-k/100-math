import { describe, it, expect } from "vitest";
import { generatePosNegAddSub } from "./pos-neg-add-sub";

const seeds = [1, 2, 42, 100, 999];

describe("generatePosNegAddSub", () => {
  it("returns 15 problems", () => {
    const problems = generatePosNegAddSub(42);
    expect(problems).toHaveLength(15);
  });

  it("defaults to 2 terms without decimals", () => {
    const problems = generatePosNegAddSub(42);
    for (const p of problems) {
      expect(p.terms).toHaveLength(2);
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generatePosNegAddSub(42);
    const b = generatePosNegAddSub(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generatePosNegAddSub(1);
    const b = generatePosNegAddSub(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("3-term mode: each problem has 3 terms", () => {
    const problems = generatePosNegAddSub(42, 3);
    for (const p of problems) {
      expect(p.terms).toHaveLength(3);
    }
  });

  it("answer equals sum of terms", () => {
    for (const seed of seeds) {
      const problems = generatePosNegAddSub(seed, 2);
      for (const p of problems) {
        const expectedAnswer =
          Math.round(p.terms.reduce((a, b) => a + b, 0) * 10) / 10;
        expect(p.answer).toBeCloseTo(expectedAnswer, 5);
      }
    }
  });

  it("answer is within [-30, 30]", () => {
    for (const seed of seeds) {
      const problems = generatePosNegAddSub(seed);
      for (const p of problems) {
        expect(Math.abs(p.answer)).toBeLessThanOrEqual(30);
      }
    }
  });

  it("terms are nonzero", () => {
    for (const seed of seeds) {
      const problems = generatePosNegAddSub(seed);
      for (const p of problems) {
        for (const t of p.terms) {
          expect(t).not.toBe(0);
        }
      }
    }
  });

  it("terms are in range [-10, 10]", () => {
    for (const seed of seeds) {
      const problems = generatePosNegAddSub(seed, 2, false);
      for (const p of problems) {
        for (const t of p.terms) {
          expect(t).toBeGreaterThanOrEqual(-10);
          expect(t).toBeLessThanOrEqual(10);
        }
      }
    }
  });

  it("with decimals: some terms may have decimal places", () => {
    let hasDecimal = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 42, 50, 100]) {
      const problems = generatePosNegAddSub(seed, 2, true);
      for (const p of problems) {
        for (const t of p.terms) {
          if (t !== Math.floor(t)) hasDecimal = true;
        }
      }
    }
    expect(hasDecimal).toBe(true);
  });
});
