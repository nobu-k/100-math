import { describe, it, expect } from "vitest";
import { generateCalcTrick } from "./calc-trick";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateCalcTrick
// ---------------------------------------------------------------------------
describe("generateCalcTrick", () => {
  it("returns 8 problems", () => {
    const problems = generateCalcTrick(42);
    expect(problems).toHaveLength(8);
  });

  it("questions mention くふうして計算しなさい", () => {
    for (const seed of seeds) {
      const problems = generateCalcTrick(seed);
      for (const p of problems) {
        expect(p.question).toContain("くふうして計算しなさい");
      }
    }
  });

  it("answers are valid positive integers", () => {
    for (const seed of seeds) {
      const problems = generateCalcTrick(seed);
      for (const p of problems) {
        const ansNum = Number(p.answer);
        expect(Number.isNaN(ansNum)).toBe(false);
        expect(Number.isInteger(ansNum)).toBe(true);
        expect(ansNum).toBeGreaterThan(0);
      }
    }
  });

  it("25 * N problems: answer is correct", () => {
    for (const seed of seeds) {
      const problems = generateCalcTrick(seed);
      for (const p of problems) {
        const match25 = p.question.match(/^25 × (\d+)/);
        if (match25) {
          const n = Number(match25[1]);
          expect(p.answer).toBe(`${25 * n}`);
          // n should be a multiple of 4
          expect(n % 4).toBe(0);
        }
      }
    }
  });

  it("99 * N problems: answer is correct", () => {
    for (const seed of seeds) {
      const problems = generateCalcTrick(seed);
      for (const p of problems) {
        const match99 = p.question.match(/^99 × (\d+)/);
        if (match99) {
          const n = Number(match99[1]);
          expect(p.answer).toBe(`${99 * n}`);
        }
      }
    }
  });

  it("101 * N problems: answer is correct", () => {
    for (const seed of seeds) {
      const problems = generateCalcTrick(seed);
      for (const p of problems) {
        const match101 = p.question.match(/^101 × (\d+)/);
        if (match101) {
          const n = Number(match101[1]);
          expect(p.answer).toBe(`${101 * n}`);
        }
      }
    }
  });

  it("distributive property problems: a*(b+c) = a*b + a*c", () => {
    for (const seed of seeds) {
      const problems = generateCalcTrick(seed);
      for (const p of problems) {
        const matchDist = p.question.match(
          /^(\d+) × (\d+) ＋ (\d+) × (\d+)/,
        );
        if (matchDist) {
          const a1 = Number(matchDist[1]);
          const b = Number(matchDist[2]);
          const a2 = Number(matchDist[3]);
          const c = Number(matchDist[4]);
          expect(a1).toBe(a2); // same factor
          expect(p.answer).toBe(`${a1 * (b + c)}`);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateCalcTrick(42);
    const b = generateCalcTrick(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateCalcTrick(1);
    const b = generateCalcTrick(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
