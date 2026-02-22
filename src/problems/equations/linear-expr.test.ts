import { describe, it, expect } from "vitest";
import { generateLinearExpr } from "./linear-expr";

const seeds = [1, 2, 42, 100, 999];

describe("generateLinearExpr", () => {
  it("returns 12 problems", () => {
    const problems = generateLinearExpr(42, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("defaults to mixed mode", () => {
    const a = generateLinearExpr(42);
    const b = generateLinearExpr(42, "mixed");
    expect(a).toEqual(b);
  });

  it("is deterministic with the same seed", () => {
    const a = generateLinearExpr(42, "mixed");
    const b = generateLinearExpr(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateLinearExpr(1, "mixed");
    const b = generateLinearExpr(2, "mixed");
    const aExprs = a.map((p) => p.answerExpr);
    const bExprs = b.map((p) => p.answerExpr);
    expect(aExprs).not.toEqual(bExprs);
  });

  it("add-sub mode returns 12 problems", () => {
    const problems = generateLinearExpr(42, "add-sub");
    expect(problems).toHaveLength(12);
  });

  it("mul-div mode returns 12 problems", () => {
    const problems = generateLinearExpr(42, "mul-div");
    expect(problems).toHaveLength(12);
  });

  it("each problem has expr, answerCoeff, answerConst, and answerExpr", () => {
    for (const seed of seeds) {
      const problems = generateLinearExpr(seed, "mixed");
      for (const p of problems) {
        expect(p.expr).toBeDefined();
        expect(typeof p.expr).toBe("string");
        expect(typeof p.answerCoeff).toBe("number");
        expect(typeof p.answerConst).toBe("number");
        expect(typeof p.answerExpr).toBe("string");
      }
    }
  });

  it("answerCoeff and answerConst are not both zero", () => {
    for (const seed of seeds) {
      const problems = generateLinearExpr(seed, "mixed");
      for (const p of problems) {
        expect(p.answerCoeff !== 0 || p.answerConst !== 0).toBe(true);
      }
    }
  });

  it("answerExpr contains x when answerCoeff is nonzero", () => {
    for (const seed of seeds) {
      const problems = generateLinearExpr(seed, "mixed");
      for (const p of problems) {
        if (p.answerCoeff !== 0) {
          expect(p.answerExpr).toContain("x");
        }
      }
    }
  });
});
