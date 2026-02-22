import { describe, it, expect } from "vitest";
import { generateProbability } from "./probability";

const seeds = [1, 2, 42, 100, 999];

describe("generateProbability", () => {
  it("returns 10 problems", () => {
    const problems = generateProbability(42, "mixed");
    expect(problems).toHaveLength(10);
  });

  it("is deterministic with the same seed", () => {
    const a = generateProbability(42, "mixed");
    const b = generateProbability(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateProbability(1, "mixed");
    const b = generateProbability(2, "mixed");
    const aAnswers = a.map((p) => p.answerDisplay);
    const bAnswers = b.map((p) => p.answerDisplay);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("basic mode only produces basic problems", () => {
    for (const seed of seeds) {
      const problems = generateProbability(seed, "basic");
      for (const p of problems) {
        expect(p.type).toBe("basic");
      }
    }
  });

  it("two-dice mode only produces two-dice problems", () => {
    for (const seed of seeds) {
      const problems = generateProbability(seed, "two-dice");
      for (const p of problems) {
        expect(p.type).toBe("two-dice");
      }
    }
  });

  it("mixed mode produces both basic and two-dice types", () => {
    let hasBasic = false;
    let hasTwoDice = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateProbability(seed, "mixed");
      for (const p of problems) {
        if (p.type === "basic") hasBasic = true;
        if (p.type === "two-dice") hasTwoDice = true;
      }
    }
    expect(hasBasic).toBe(true);
    expect(hasTwoDice).toBe(true);
  });

  it("numerator and denominator are positive integers", () => {
    for (const seed of seeds) {
      const problems = generateProbability(seed, "mixed");
      for (const p of problems) {
        expect(p.ansNum).toBeGreaterThan(0);
        expect(p.ansDen).toBeGreaterThan(0);
        expect(Number.isInteger(p.ansNum)).toBe(true);
        expect(Number.isInteger(p.ansDen)).toBe(true);
      }
    }
  });

  it("probability fractions are in simplified form", () => {
    const gcd = (a: number, b: number): number => {
      a = Math.abs(a);
      b = Math.abs(b);
      while (b) {
        [a, b] = [b, a % b];
      }
      return a;
    };

    for (const seed of seeds) {
      const problems = generateProbability(seed, "mixed");
      for (const p of problems) {
        expect(gcd(p.ansNum, p.ansDen)).toBe(1);
      }
    }
  });

  it("probability is at most 1 (numerator <= denominator)", () => {
    for (const seed of seeds) {
      const problems = generateProbability(seed, "mixed");
      for (const p of problems) {
        expect(p.ansNum).toBeLessThanOrEqual(p.ansDen);
      }
    }
  });

  it("answerDisplay is fraction or integer string", () => {
    for (const seed of seeds) {
      const problems = generateProbability(seed, "mixed");
      for (const p of problems) {
        if (p.ansDen === 1) {
          expect(p.answerDisplay).toBe(`${p.ansNum}`);
        } else {
          expect(p.answerDisplay).toBe(`${p.ansNum}/${p.ansDen}`);
        }
      }
    }
  });

  it("every problem has a non-empty question", () => {
    for (const seed of seeds) {
      const problems = generateProbability(seed, "mixed");
      for (const p of problems) {
        expect(p.question.length).toBeGreaterThan(0);
      }
    }
  });
});
