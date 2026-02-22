import { describe, it, expect } from "vitest";
import { generateFactoring } from "./factoring";

const seeds = [1, 2, 42, 100, 999];

describe("generateFactoring", () => {
  it("returns 12 problems", () => {
    const problems = generateFactoring(42, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("is deterministic with the same seed", () => {
    const a = generateFactoring(42, "mixed");
    const b = generateFactoring(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateFactoring(1, "mixed");
    const b = generateFactoring(2, "mixed");
    const aExprs = a.map((p) => p.expr);
    const bExprs = b.map((p) => p.expr);
    expect(aExprs).not.toEqual(bExprs);
  });

  it("each problem has non-empty expr and answerExpr", () => {
    for (const seed of seeds) {
      const problems = generateFactoring(seed, "mixed");
      for (const p of problems) {
        expect(p.expr.length).toBeGreaterThan(0);
        expect(p.answerExpr.length).toBeGreaterThan(0);
      }
    }
  });

  it("common mode: answer contains x( factor", () => {
    for (const seed of seeds) {
      const problems = generateFactoring(seed, "common");
      for (const p of problems) {
        expect(p.answerExpr).toMatch(/^x\(/);
      }
    }
  });

  it("formula mode: answer contains parentheses with factored form", () => {
    for (const seed of seeds) {
      const problems = generateFactoring(seed, "formula");
      for (const p of problems) {
        expect(p.answerExpr).toContain("(");
        expect(p.answerExpr).toContain(")");
      }
    }
  });

  it("mixed mode produces both common and formula problems", () => {
    let hasCommon = false;
    let hasFormula = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50, 100, 200]) {
      const problems = generateFactoring(seed, "mixed");
      for (const p of problems) {
        if (p.answerExpr.startsWith("x(")) {
          hasCommon = true;
        } else if (p.answerExpr.includes("(x")) {
          hasFormula = true;
        }
      }
    }
    expect(hasCommon).toBe(true);
    expect(hasFormula).toBe(true);
  });

  it("expr contains x-related terms", () => {
    for (const seed of seeds) {
      const problems = generateFactoring(seed, "mixed");
      for (const p of problems) {
        expect(p.expr).toMatch(/x/);
      }
    }
  });

  it("all expressions within each seed are unique", () => {
    for (const seed of seeds) {
      const problems = generateFactoring(seed, "mixed");
      const exprs = problems.map((p) => p.expr);
      const unique = new Set(exprs);
      expect(unique.size).toBe(exprs.length);
    }
  });
});
