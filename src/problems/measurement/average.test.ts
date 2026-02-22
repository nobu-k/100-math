import { describe, it, expect } from "vitest";
import { generateAverage } from "./average";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateAverage
// ---------------------------------------------------------------------------
describe("generateAverage", () => {
  it("returns 8 problems", () => {
    const problems = generateAverage(42, 4);
    expect(problems).toHaveLength(8);
  });

  it("the average of the values equals the answer", () => {
    for (const seed of seeds) {
      for (const count of [3, 4, 5]) {
        const problems = generateAverage(seed, count);
        for (const p of problems) {
          // Parse numbers from the question
          const nums = p.question.replace(/の平均は？/, "").split("、").map(Number);
          expect(nums).toHaveLength(count);
          const sum = nums.reduce((a, b) => a + b, 0);
          const avg = sum / count;
          expect(avg).toBe(Number(p.answer));
        }
      }
    }
  });

  it("answer is an integer between 50 and 99", () => {
    for (const seed of seeds) {
      const problems = generateAverage(seed, 4);
      for (const p of problems) {
        const ans = Number(p.answer);
        expect(Number.isInteger(ans)).toBe(true);
        expect(ans).toBeGreaterThanOrEqual(50);
        expect(ans).toBeLessThanOrEqual(99);
      }
    }
  });

  it("all individual values are between 1 and 100", () => {
    for (const seed of seeds) {
      const problems = generateAverage(seed, 5);
      for (const p of problems) {
        const nums = p.question.replace(/の平均は？/, "").split("、").map(Number);
        for (const n of nums) {
          expect(n).toBeGreaterThanOrEqual(1);
          expect(n).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateAverage(42, 4);
    const b = generateAverage(42, 4);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateAverage(1, 4);
    const b = generateAverage(2, 4);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
