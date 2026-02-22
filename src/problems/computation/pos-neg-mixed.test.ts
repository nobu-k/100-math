import { describe, it, expect } from "vitest";
import { generatePosNegMixed } from "./pos-neg-mixed";

const seeds = [1, 2, 42, 100, 999];

describe("generatePosNegMixed", () => {
  it("returns 10 problems", () => {
    const problems = generatePosNegMixed(42);
    expect(problems).toHaveLength(10);
  });

  it("is deterministic with the same seed", () => {
    const a = generatePosNegMixed(42);
    const b = generatePosNegMixed(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generatePosNegMixed(1);
    const b = generatePosNegMixed(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("each problem has expr and answer", () => {
    for (const seed of seeds) {
      const problems = generatePosNegMixed(seed);
      for (const p of problems) {
        expect(typeof p.expr).toBe("string");
        expect(p.expr.length).toBeGreaterThan(0);
        expect(typeof p.answer).toBe("number");
      }
    }
  });

  it("answer is within [-50, 50]", () => {
    for (const seed of seeds) {
      const problems = generatePosNegMixed(seed);
      for (const p of problems) {
        expect(Math.abs(p.answer)).toBeLessThanOrEqual(50);
      }
    }
  });

  it("with includePower=true (default), some expressions contain power notation", () => {
    let hasPower = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 42, 50, 100]) {
      const problems = generatePosNegMixed(seed, true);
      for (const p of problems) {
        if (p.expr.includes("²")) hasPower = true;
      }
    }
    expect(hasPower).toBe(true);
  });

  it("with includePower=false, no expressions contain squared notation", () => {
    for (const seed of seeds) {
      const problems = generatePosNegMixed(seed, false);
      for (const p of problems) {
        expect(p.expr).not.toContain("²");
      }
    }
  });

  it("expressions contain arithmetic operators", () => {
    for (const seed of seeds) {
      const problems = generatePosNegMixed(seed);
      for (const p of problems) {
        const hasOp =
          p.expr.includes("×") ||
          p.expr.includes("÷") ||
          p.expr.includes("+") ||
          p.expr.includes("−");
        expect(hasOp).toBe(true);
      }
    }
  });

  it("answer is an integer", () => {
    for (const seed of seeds) {
      const problems = generatePosNegMixed(seed);
      for (const p of problems) {
        expect(Number.isInteger(p.answer)).toBe(true);
      }
    }
  });
});
