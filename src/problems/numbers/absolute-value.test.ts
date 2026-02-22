import { describe, it, expect } from "vitest";
import { generateAbsoluteValue } from "./absolute-value";

const seeds = [1, 2, 42, 100, 999];

describe("generateAbsoluteValue", () => {
  it("find mode returns 10 problems", () => {
    const problems = generateAbsoluteValue(42, "find");
    expect(problems).toHaveLength(10);
  });

  it("list mode returns 6 problems", () => {
    const problems = generateAbsoluteValue(42, "list");
    expect(problems).toHaveLength(6);
  });

  it("equation mode returns 8 problems", () => {
    const problems = generateAbsoluteValue(42, "equation");
    expect(problems).toHaveLength(8);
  });

  it("defaults to find mode", () => {
    const problems = generateAbsoluteValue(42);
    for (const p of problems) {
      expect(p.mode).toBe("find");
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateAbsoluteValue(42, "find");
    const b = generateAbsoluteValue(42, "find");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateAbsoluteValue(1, "find");
    const b = generateAbsoluteValue(2, "find");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("find mode: answer equals Math.abs(number)", () => {
    for (const seed of seeds) {
      const problems = generateAbsoluteValue(seed, "find");
      for (const p of problems) {
        expect(p.answer).toBe(Math.abs(p.number!));
        expect(p.answer).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("find mode: numbers are in range [-10, 10]", () => {
    for (const seed of seeds) {
      const problems = generateAbsoluteValue(seed, "find");
      for (const p of problems) {
        expect(p.number).toBeGreaterThanOrEqual(-10);
        expect(p.number).toBeLessThanOrEqual(10);
      }
    }
  });

  it("list mode: threshold is between 2 and 6", () => {
    for (const seed of seeds) {
      const problems = generateAbsoluteValue(seed, "list");
      for (const p of problems) {
        expect(p.threshold).toBeGreaterThanOrEqual(2);
        expect(p.threshold).toBeLessThanOrEqual(6);
      }
    }
  });

  it("list mode: listAnswer contains all integers from -threshold to threshold", () => {
    for (const seed of seeds) {
      const problems = generateAbsoluteValue(seed, "list");
      for (const p of problems) {
        const expected: number[] = [];
        for (let x = -p.threshold!; x <= p.threshold!; x++) {
          expected.push(x);
        }
        expect(p.listAnswer).toEqual(expected);
      }
    }
  });

  it("equation mode: eqAnswers are [val, -val]", () => {
    for (const seed of seeds) {
      const problems = generateAbsoluteValue(seed, "equation");
      for (const p of problems) {
        expect(p.eqValue).toBeGreaterThanOrEqual(1);
        expect(p.eqValue).toBeLessThanOrEqual(10);
        expect(p.eqAnswers).toEqual([p.eqValue, -p.eqValue!]);
      }
    }
  });
});
