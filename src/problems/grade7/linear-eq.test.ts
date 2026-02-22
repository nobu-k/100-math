import { describe, it, expect } from "vitest";
import { generateLinearEq } from "./linear-eq";

const seeds = [1, 2, 42, 100, 999];

describe("generateLinearEq", () => {
  it("returns 12 problems", () => {
    const problems = generateLinearEq(42, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("defaults to mixed mode", () => {
    const a = generateLinearEq(42);
    const b = generateLinearEq(42, "mixed");
    expect(a).toEqual(b);
  });

  it("is deterministic with the same seed", () => {
    const a = generateLinearEq(42, "mixed");
    const b = generateLinearEq(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateLinearEq(1, "mixed");
    const b = generateLinearEq(2, "mixed");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("basic mode: all problems have equation strings", () => {
    for (const seed of seeds) {
      const problems = generateLinearEq(seed, "basic");
      for (const p of problems) {
        expect(p.equation).toBeDefined();
        expect(typeof p.equation).toBe("string");
        expect(p.equation).toContain("=");
      }
    }
  });

  it("advanced mode returns 12 problems", () => {
    const problems = generateLinearEq(42, "advanced");
    expect(problems).toHaveLength(12);
  });

  it("each problem has an integer answer", () => {
    for (const seed of seeds) {
      const problems = generateLinearEq(seed, "mixed");
      for (const p of problems) {
        expect(typeof p.answer).toBe("number");
        expect(Number.isInteger(p.answer)).toBe(true);
      }
    }
  });

  it("basic mode: answers are in range [-8, 8]", () => {
    for (const seed of seeds) {
      const problems = generateLinearEq(seed, "basic");
      for (const p of problems) {
        expect(p.answer).toBeGreaterThanOrEqual(-8);
        expect(p.answer).toBeLessThanOrEqual(8);
      }
    }
  });

  it("each problem has isFraction property", () => {
    for (const seed of seeds) {
      const problems = generateLinearEq(seed, "mixed");
      for (const p of problems) {
        expect(typeof p.isFraction).toBe("boolean");
      }
    }
  });

  it("mixed mode produces problems containing x", () => {
    for (const seed of seeds) {
      const problems = generateLinearEq(seed, "mixed");
      for (const p of problems) {
        expect(p.equation).toContain("x");
      }
    }
  });
});
