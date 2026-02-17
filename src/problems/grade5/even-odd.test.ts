import { describe, it, expect } from "vitest";
import { generateEvenOdd } from "./even-odd";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateEvenOdd
// ---------------------------------------------------------------------------
describe("generateEvenOdd", () => {
  it("returns 15 problems", () => {
    const problems = generateEvenOdd(42, 100);
    expect(problems).toHaveLength(15);
  });

  it("even answers contain only even numbers from the list", () => {
    for (const seed of seeds) {
      const problems = generateEvenOdd(seed, 100);
      for (const p of problems) {
        for (const n of p.evenAnswers) {
          expect(n % 2).toBe(0);
          expect(p.numbers).toContain(n);
        }
      }
    }
  });

  it("odd answers contain only odd numbers from the list", () => {
    for (const seed of seeds) {
      const problems = generateEvenOdd(seed, 100);
      for (const p of problems) {
        for (const n of p.oddAnswers) {
          expect(n % 2).toBe(1);
          expect(p.numbers).toContain(n);
        }
      }
    }
  });

  it("even and odd answers together account for all numbers", () => {
    for (const seed of seeds) {
      const problems = generateEvenOdd(seed, 50);
      for (const p of problems) {
        const combined = [...p.evenAnswers, ...p.oddAnswers].sort((a, b) => a - b);
        // Each number should appear in even or odd; note duplicates are possible
        expect(combined.length).toBe(p.numbers.length);
      }
    }
  });

  it("answers are sorted in ascending order", () => {
    for (const seed of seeds) {
      const problems = generateEvenOdd(seed, 100);
      for (const p of problems) {
        for (let i = 1; i < p.evenAnswers.length; i++) {
          expect(p.evenAnswers[i]).toBeGreaterThanOrEqual(p.evenAnswers[i - 1]);
        }
        for (let i = 1; i < p.oddAnswers.length; i++) {
          expect(p.oddAnswers[i]).toBeGreaterThanOrEqual(p.oddAnswers[i - 1]);
        }
      }
    }
  });

  it("each problem has 8-12 numbers", () => {
    for (const seed of seeds) {
      const problems = generateEvenOdd(seed, 100);
      for (const p of problems) {
        expect(p.numbers.length).toBeGreaterThanOrEqual(8);
        expect(p.numbers.length).toBeLessThanOrEqual(12);
      }
    }
  });

  it("numbers are between 1 and range", () => {
    for (const seed of seeds) {
      for (const range of [50, 100, 200]) {
        const problems = generateEvenOdd(seed, range);
        for (const p of problems) {
          for (const n of p.numbers) {
            expect(n).toBeGreaterThanOrEqual(1);
            expect(n).toBeLessThanOrEqual(range);
          }
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateEvenOdd(42, 100);
    const b = generateEvenOdd(42, 100);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateEvenOdd(1, 100);
    const b = generateEvenOdd(2, 100);
    const aNums = a.map((p) => p.numbers);
    const bNums = b.map((p) => p.numbers);
    expect(aNums).not.toEqual(bNums);
  });
});
