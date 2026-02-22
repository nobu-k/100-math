import { describe, it, expect } from "vitest";
import { generateMonoMulDiv } from "./mono-mul-div";

const seeds = [1, 2, 42, 100, 999];

describe("generateMonoMulDiv", () => {
  it("returns 12 problems", () => {
    const problems = generateMonoMulDiv(42, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("is deterministic with the same seed", () => {
    const a = generateMonoMulDiv(42, "mixed");
    const b = generateMonoMulDiv(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateMonoMulDiv(1, "mixed");
    const b = generateMonoMulDiv(2, "mixed");
    const aAnswers = a.map((p) => p.answerExpr);
    const bAnswers = b.map((p) => p.answerExpr);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("mul mode only produces multiplication expressions", () => {
    for (const seed of seeds) {
      const problems = generateMonoMulDiv(seed, "mul");
      for (const p of problems) {
        expect(p.expr).toContain("×");
        expect(p.expr).not.toContain("÷");
      }
    }
  });

  it("div mode only produces division expressions", () => {
    for (const seed of seeds) {
      const problems = generateMonoMulDiv(seed, "div");
      for (const p of problems) {
        expect(p.expr).toContain("÷");
        expect(p.expr).not.toContain("×");
      }
    }
  });

  it("mixed mode produces both multiplication and division", () => {
    let hasMul = false;
    let hasDiv = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateMonoMulDiv(seed, "mixed");
      for (const p of problems) {
        if (p.expr.includes("×")) hasMul = true;
        if (p.expr.includes("÷")) hasDiv = true;
      }
    }
    expect(hasMul).toBe(true);
    expect(hasDiv).toBe(true);
  });

  it("every problem has non-empty expr and answerExpr", () => {
    for (const seed of seeds) {
      const problems = generateMonoMulDiv(seed, "mixed");
      for (const p of problems) {
        expect(p.expr.length).toBeGreaterThan(0);
        expect(p.answerExpr.length).toBeGreaterThan(0);
      }
    }
  });

  it("answerExpr is not '0' (zero coefficients are filtered out)", () => {
    for (const seed of seeds) {
      const problems = generateMonoMulDiv(seed, "mixed");
      for (const p of problems) {
        expect(p.answerExpr).not.toBe("0");
      }
    }
  });
});
