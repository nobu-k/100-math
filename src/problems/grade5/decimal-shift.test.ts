import { describe, it, expect } from "vitest";
import { generateDecimalShift } from "./decimal-shift";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateDecimalShift
// ---------------------------------------------------------------------------
describe("generateDecimalShift", () => {
  it("returns 10 problems", () => {
    const problems = generateDecimalShift(42);
    expect(problems).toHaveLength(10);
  });

  it("multiplication: answer = number * multiplier", () => {
    for (const seed of seeds) {
      const problems = generateDecimalShift(seed);
      for (const p of problems) {
        if (p.question.includes("倍は")) {
          const match = p.question.match(/([\d.]+)の(\d+)倍は/);
          expect(match).not.toBeNull();
          const n = Number(match![1]);
          const mul = Number(match![2]);
          const expected = n * mul;
          const expectedStr = expected % 1 === 0
            ? String(expected)
            : Number(expected.toFixed(5)).toString();
          expect(p.answer).toBe(expectedStr);
        }
      }
    }
  });

  it("division: answer = number / divisor", () => {
    for (const seed of seeds) {
      const problems = generateDecimalShift(seed);
      for (const p of problems) {
        if (p.question.includes("1/")) {
          const match = p.question.match(/([\d.]+)の1\/(\d+)は/);
          expect(match).not.toBeNull();
          const n = Number(match![1]);
          const div = Number(match![2]);
          const expected = n / div;
          const expectedStr = Number(expected.toFixed(5)).toString();
          expect(p.answer).toBe(expectedStr);
        }
      }
    }
  });

  it("multiplier/divisor is 10, 100, or 1000", () => {
    for (const seed of seeds) {
      const problems = generateDecimalShift(seed);
      for (const p of problems) {
        if (p.question.includes("倍は")) {
          const match = p.question.match(/の(\d+)倍は/);
          expect([10, 100, 1000]).toContain(Number(match![1]));
        } else {
          const match = p.question.match(/の1\/(\d+)は/);
          expect([10, 100, 1000]).toContain(Number(match![1]));
        }
      }
    }
  });

  it("produces both multiplication and division types", () => {
    let hasMul = false;
    let hasDiv = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateDecimalShift(seed);
      for (const p of problems) {
        if (p.question.includes("倍は")) hasMul = true;
        if (p.question.includes("1/")) hasDiv = true;
      }
    }
    expect(hasMul).toBe(true);
    expect(hasDiv).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateDecimalShift(42);
    const b = generateDecimalShift(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateDecimalShift(1);
    const b = generateDecimalShift(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
