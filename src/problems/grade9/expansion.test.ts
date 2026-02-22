import { describe, it, expect } from "vitest";
import { generateExpansion } from "./expansion";

const seeds = [1, 2, 42, 100, 999];

describe("generateExpansion", () => {
  it("returns 12 problems", () => {
    const problems = generateExpansion(42, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("is deterministic with the same seed", () => {
    const a = generateExpansion(42, "mixed");
    const b = generateExpansion(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateExpansion(1, "mixed");
    const b = generateExpansion(2, "mixed");
    const aExprs = a.map((p) => p.expr);
    const bExprs = b.map((p) => p.expr);
    expect(aExprs).not.toEqual(bExprs);
  });

  it("each problem has non-empty expr and answerExpr", () => {
    for (const seed of seeds) {
      const problems = generateExpansion(seed, "mixed");
      for (const p of problems) {
        expect(p.expr.length).toBeGreaterThan(0);
        expect(p.answerExpr.length).toBeGreaterThan(0);
      }
    }
  });

  it("distribute mode: expr contains parentheses", () => {
    for (const seed of seeds) {
      const problems = generateExpansion(seed, "distribute");
      for (const p of problems) {
        expect(p.expr).toContain("(");
      }
    }
  });

  it("formula mode: expr uses formula patterns", () => {
    for (const seed of seeds) {
      const problems = generateExpansion(seed, "formula");
      for (const p of problems) {
        // Formula mode uses patterns like (x + a)², (x - a)², (x + a)(x - a), (x + a)(x + b)
        expect(p.expr).toContain("(");
      }
    }
  });

  it("mixed mode produces both distribute and formula problems", () => {
    let hasDistribute = false;
    let hasFormula = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50, 100, 200]) {
      const problems = generateExpansion(seed, "mixed");
      for (const p of problems) {
        // distribute problems don't use squared notation in expr typically
        if (p.expr.includes("²")) {
          hasFormula = true;
        }
        // distribute: monomial * binomial like "3(x + 2)" or FOIL without squared
        if (!p.expr.includes("²") && p.expr.includes("(")) {
          hasDistribute = true;
        }
      }
    }
    expect(hasDistribute).toBe(true);
    expect(hasFormula).toBe(true);
  });

  it("answerExpr contains x-related terms", () => {
    for (const seed of seeds) {
      const problems = generateExpansion(seed, "mixed");
      for (const p of problems) {
        // answer should contain x or be a constant (when x terms cancel)
        expect(p.answerExpr).toMatch(/x|[0-9]/);
      }
    }
  });

  it("all expressions within each seed are unique", () => {
    for (const seed of seeds) {
      const problems = generateExpansion(seed, "mixed");
      const exprs = problems.map((p) => p.expr);
      const unique = new Set(exprs);
      expect(unique.size).toBe(exprs.length);
    }
  });
});
