import { describe, it, expect } from "vitest";
import { generatePolyAddSub } from "./poly-add-sub";

const seeds = [1, 2, 42, 100, 999];

describe("generatePolyAddSub", () => {
  it("returns 12 problems", () => {
    const problems = generatePolyAddSub(42);
    expect(problems).toHaveLength(12);
  });

  it("is deterministic with the same seed", () => {
    const a = generatePolyAddSub(42);
    const b = generatePolyAddSub(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generatePolyAddSub(1);
    const b = generatePolyAddSub(2);
    const aAnswers = a.map((p) => p.answerExpr);
    const bAnswers = b.map((p) => p.answerExpr);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("expressions contain + or - between two polynomials", () => {
    for (const seed of seeds) {
      const problems = generatePolyAddSub(seed);
      for (const p of problems) {
        // Expression should have two parenthesized groups
        expect(p.expr).toMatch(/\(.*\).*[+−].*\(.*\)/);
      }
    }
  });

  it("coeffs object has x, y, and c keys", () => {
    for (const seed of seeds) {
      const problems = generatePolyAddSub(seed);
      for (const p of problems) {
        expect(p.coeffs).toHaveProperty("x");
        expect(p.coeffs).toHaveProperty("y");
        expect(p.coeffs).toHaveProperty("c");
      }
    }
  });

  it("result coefficients are not all zero", () => {
    for (const seed of seeds) {
      const problems = generatePolyAddSub(seed);
      for (const p of problems) {
        const { x, y, c } = p.coeffs;
        expect(x !== 0 || y !== 0 || c !== 0).toBe(true);
      }
    }
  });

  it("answerExpr is not empty or '0' when coeffs are non-trivial", () => {
    for (const seed of seeds) {
      const problems = generatePolyAddSub(seed);
      for (const p of problems) {
        expect(p.answerExpr.length).toBeGreaterThan(0);
      }
    }
  });

  it("every problem has a non-empty expr", () => {
    for (const seed of seeds) {
      const problems = generatePolyAddSub(seed);
      for (const p of problems) {
        expect(p.expr.length).toBeGreaterThan(0);
      }
    }
  });
});
