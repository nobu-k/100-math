import { describe, it, expect } from "vitest";
import { generatePosNegMulDiv } from "./pos-neg-mul-div";

const seeds = [1, 2, 42, 100, 999];

describe("generatePosNegMulDiv", () => {
  it("returns 15 problems", () => {
    const problems = generatePosNegMulDiv(42, "mixed");
    expect(problems).toHaveLength(15);
  });

  it("defaults to mixed mode", () => {
    const a = generatePosNegMulDiv(42);
    const b = generatePosNegMulDiv(42, "mixed");
    expect(a).toEqual(b);
  });

  it("is deterministic with the same seed", () => {
    const a = generatePosNegMulDiv(42, "mixed");
    const b = generatePosNegMulDiv(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generatePosNegMulDiv(1, "mixed");
    const b = generatePosNegMulDiv(2, "mixed");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("mul mode: all expressions contain multiplication sign", () => {
    for (const seed of seeds) {
      const problems = generatePosNegMulDiv(seed, "mul");
      for (const p of problems) {
        expect(p.expr).toContain("×");
      }
    }
  });

  it("div mode: all expressions contain division sign", () => {
    for (const seed of seeds) {
      const problems = generatePosNegMulDiv(seed, "div");
      for (const p of problems) {
        expect(p.expr).toContain("÷");
      }
    }
  });

  it("power mode: all expressions contain power notation", () => {
    for (const seed of seeds) {
      const problems = generatePosNegMulDiv(seed, "power");
      for (const p of problems) {
        const hasPower = p.expr.includes("²") || p.expr.includes("³");
        expect(hasPower).toBe(true);
      }
    }
  });

  it("mixed mode produces mul, div, and power expressions", () => {
    let hasMul = false;
    let hasDiv = false;
    let hasPower = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 42, 50, 100]) {
      const problems = generatePosNegMulDiv(seed, "mixed");
      for (const p of problems) {
        if (p.expr.includes("×")) hasMul = true;
        if (p.expr.includes("÷")) hasDiv = true;
        if (p.expr.includes("²") || p.expr.includes("³")) hasPower = true;
      }
    }
    expect(hasMul).toBe(true);
    expect(hasDiv).toBe(true);
    expect(hasPower).toBe(true);
  });

  it("answer is within [-100, 100]", () => {
    for (const seed of seeds) {
      const problems = generatePosNegMulDiv(seed, "mixed");
      for (const p of problems) {
        expect(Math.abs(p.answer)).toBeLessThanOrEqual(100);
      }
    }
  });

  it("div mode: answer is an integer (exact division)", () => {
    for (const seed of seeds) {
      const problems = generatePosNegMulDiv(seed, "div");
      for (const p of problems) {
        expect(Number.isInteger(p.answer)).toBe(true);
      }
    }
  });

  it("each problem has expr and answer", () => {
    for (const seed of seeds) {
      const problems = generatePosNegMulDiv(seed, "mixed");
      for (const p of problems) {
        expect(typeof p.expr).toBe("string");
        expect(typeof p.answer).toBe("number");
      }
    }
  });
});
