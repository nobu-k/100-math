import { describe, it, expect } from "vitest";
import { generateMixedCalc } from "./mixed-calc";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateMixedCalc
// ---------------------------------------------------------------------------
describe("generateMixedCalc", () => {
  it("returns 12 problems", () => {
    const problems = generateMixedCalc(42, false);
    expect(problems).toHaveLength(12);
  });

  it("returns 12 problems with parentheses mode", () => {
    const problems = generateMixedCalc(42, true);
    expect(problems).toHaveLength(12);
  });

  it("every problem has a non-empty display and an integer answer", () => {
    for (const seed of seeds) {
      for (const withParen of [true, false]) {
        const problems = generateMixedCalc(seed, withParen);
        for (const p of problems) {
          expect(p.display.length).toBeGreaterThan(0);
          expect(Number.isInteger(p.answer)).toBe(true);
        }
      }
    }
  });

  it("without parentheses: no display contains parentheses", () => {
    for (const seed of seeds) {
      const problems = generateMixedCalc(seed, false);
      for (const p of problems) {
        expect(p.display).not.toContain("(");
        expect(p.display).not.toContain(")");
      }
    }
  });

  it("with parentheses: at least some problems contain parentheses across seeds", () => {
    let hasParen = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateMixedCalc(seed, true);
      for (const p of problems) {
        if (p.display.includes("(")) hasParen = true;
      }
    }
    expect(hasParen).toBe(true);
  });

  it("answers are non-negative", () => {
    for (const seed of seeds) {
      for (const withParen of [true, false]) {
        const problems = generateMixedCalc(seed, withParen);
        for (const p of problems) {
          expect(p.answer).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateMixedCalc(42, true);
    const b = generateMixedCalc(42, true);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateMixedCalc(1, false);
    const b = generateMixedCalc(2, false);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
