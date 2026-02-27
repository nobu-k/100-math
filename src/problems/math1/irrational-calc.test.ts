import { describe, it, expect } from "vitest";
import { generateIrrationalCalc } from "./irrational-calc";
import { simplifyRoot } from "../shared/latex-format";

const seeds = [1, 2, 42, 100, 999];

describe("generateIrrationalCalc", () => {
  it("returns 12 problems by default", () => {
    const problems = generateIrrationalCalc(42, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("is deterministic with the same seed", () => {
    const a = generateIrrationalCalc(42, "mixed");
    const b = generateIrrationalCalc(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateIrrationalCalc(1, "mixed");
    const b = generateIrrationalCalc(2, "mixed");
    const aExprs = a.map((p) => p.expr);
    const bExprs = b.map((p) => p.expr);
    expect(aExprs).not.toEqual(bExprs);
  });

  it("each problem has non-empty expr and answerExpr", () => {
    for (const seed of seeds) {
      const problems = generateIrrationalCalc(seed, "mixed");
      for (const p of problems) {
        expect(p.expr.length).toBeGreaterThan(0);
        expect(p.answerExpr.length).toBeGreaterThan(0);
      }
    }
  });

  it("simplify mode: answers contain √ or are integers", () => {
    for (const seed of seeds) {
      const problems = generateIrrationalCalc(seed, "simplify");
      for (const p of problems) {
        expect(p.answerExpr).toMatch(/√|\d/);
      }
    }
  });

  it("rationalize mode: answers don't have √ in denominator", () => {
    for (const seed of seeds) {
      const problems = generateIrrationalCalc(seed, "rationalize");
      for (const p of problems) {
        expect(p.answerExpr).not.toMatch(/\/√/);
      }
    }
  });

  it("expand mode: answers are simplified expressions", () => {
    for (const seed of seeds) {
      const problems = generateIrrationalCalc(seed, "expand");
      for (const p of problems) {
        expect(p.expr).toContain("(");
        expect(p.answerExpr.length).toBeGreaterThan(0);
      }
    }
  });

  it("mixed mode produces all three types", () => {
    let hasSimplify = false;
    let hasRationalize = false;
    let hasExpand = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50, 100, 200]) {
      const problems = generateIrrationalCalc(seed, "mixed");
      for (const p of problems) {
        if (p.expr.includes("/")) hasRationalize = true;
        if (p.expr.includes("(") && (p.expr.includes("²") || p.expr.includes(")("))) hasExpand = true;
        if (!p.expr.includes("/") && !p.expr.includes("(")) hasSimplify = true;
      }
    }
    expect(hasSimplify).toBe(true);
    expect(hasRationalize).toBe(true);
    expect(hasExpand).toBe(true);
  });

  it("simplify: single root simplification is correct", () => {
    const [o12, i12] = simplifyRoot(12);
    expect(o12).toBe(2);
    expect(i12).toBe(3);

    const [o18, i18] = simplifyRoot(18);
    expect(o18).toBe(3);
    expect(i18).toBe(2);

    const [o50, i50] = simplifyRoot(50);
    expect(o50).toBe(5);
    expect(i50).toBe(2);
  });

  it("all expressions within each seed are unique", () => {
    for (const seed of seeds) {
      const problems = generateIrrationalCalc(seed, "mixed");
      const exprs = problems.map((p) => p.expr);
      const unique = new Set(exprs);
      expect(unique.size).toBe(exprs.length);
    }
  });

  it("generates requested count of problems", () => {
    const p6 = generateIrrationalCalc(42, "mixed", 6);
    expect(p6).toHaveLength(6);
    const p8 = generateIrrationalCalc(42, "simplify", 8);
    expect(p8).toHaveLength(8);
  });
});
