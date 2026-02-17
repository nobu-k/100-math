import { describe, it, expect } from "vitest";
import { generateCounting } from "./counting";

const seeds = [1, 2, 42, 100, 999];

describe("generateCounting", () => {
  it("returns 8 problems", () => {
    const problems = generateCounting(42);
    expect(problems).toHaveLength(8);
  });

  it("is deterministic with the same seed", () => {
    const a = generateCounting(42);
    const b = generateCounting(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateCounting(1);
    const b = generateCounting(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("answer ends with 通り", () => {
    for (const seed of seeds) {
      const problems = generateCounting(seed);
      for (const p of problems) {
        expect(p.answer).toMatch(/^\d+通り$/);
      }
    }
  });

  it("answer values are positive integers", () => {
    for (const seed of seeds) {
      const problems = generateCounting(seed);
      for (const p of problems) {
        const num = Number(p.answer.replace("通り", ""));
        expect(Number.isInteger(num)).toBe(true);
        expect(num).toBeGreaterThan(0);
      }
    }
  });

  it("permutation answers are factorials of 3-5", () => {
    const validFactorials = [6, 24, 120]; // 3!, 4!, 5!
    for (const seed of seeds) {
      const problems = generateCounting(seed);
      for (const p of problems) {
        if (p.question.includes("並べ方") || p.question.includes("1列に並ぶ")) {
          const num = Number(p.answer.replace("通り", ""));
          expect(validFactorials).toContain(num);
        }
      }
    }
  });

  it("combination answers are correct C(n,r) values", () => {
    const factorial = (n: number): number => {
      let r = 1;
      for (let i = 2; i <= n; i++) r *= i;
      return r;
    };
    const combFn = (n: number, r: number) =>
      factorial(n) / (factorial(r) * factorial(n - r));

    // All valid C(n,r) for n=4-6, r=2-3
    const validCombs = new Set<number>();
    for (let n = 4; n <= 6; n++) {
      for (let r = 2; r <= 3; r++) {
        if (r <= n - 2 + 1) validCombs.add(combFn(n, r));
      }
    }

    for (const seed of seeds) {
      const problems = generateCounting(seed);
      for (const p of problems) {
        if (p.question.includes("選ぶ")) {
          const num = Number(p.answer.replace("通り", ""));
          expect(validCombs.has(num)).toBe(true);
        }
      }
    }
  });
});
