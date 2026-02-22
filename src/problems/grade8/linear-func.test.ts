import { describe, it, expect } from "vitest";
import { generateLinearFunc } from "./linear-func";

const seeds = [1, 2, 42, 100, 999];

describe("generateLinearFunc", () => {
  it("returns 12 problems", () => {
    const problems = generateLinearFunc(42, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("is deterministic with the same seed", () => {
    const a = generateLinearFunc(42, "mixed");
    const b = generateLinearFunc(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateLinearFunc(1, "mixed");
    const b = generateLinearFunc(2, "mixed");
    const aAnswers = a.map((p) => p.answerDisplay);
    const bAnswers = b.map((p) => p.answerDisplay);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("slope-intercept mode only produces slope-intercept problems", () => {
    for (const seed of seeds) {
      const problems = generateLinearFunc(seed, "slope-intercept");
      for (const p of problems) {
        expect(p.type).toBe("slope-intercept");
      }
    }
  });

  it("two-points mode only produces two-points problems", () => {
    for (const seed of seeds) {
      const problems = generateLinearFunc(seed, "two-points");
      for (const p of problems) {
        expect(p.type).toBe("two-points");
      }
    }
  });

  it("rate-of-change mode only produces rate-of-change problems", () => {
    for (const seed of seeds) {
      const problems = generateLinearFunc(seed, "rate-of-change");
      for (const p of problems) {
        expect(p.type).toBe("rate-of-change");
      }
    }
  });

  it("mixed mode produces multiple problem types", () => {
    const typesSeen = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateLinearFunc(seed, "mixed");
      for (const p of problems) {
        typesSeen.add(p.type);
      }
    }
    expect(typesSeen.size).toBeGreaterThanOrEqual(2);
  });

  it("slope (answerA) is never zero", () => {
    for (const seed of seeds) {
      const problems = generateLinearFunc(seed, "mixed");
      for (const p of problems) {
        expect(p.answerA).not.toBe(0);
      }
    }
  });

  it("rate-of-change problems have a singleAnswer matching answerA", () => {
    for (const seed of seeds) {
      const problems = generateLinearFunc(seed, "rate-of-change");
      for (const p of problems) {
        expect(p.singleAnswer).toBe(p.answerA);
      }
    }
  });

  it("answerDisplay contains y = for non-rate-of-change types", () => {
    for (const seed of seeds) {
      const problems = generateLinearFunc(seed, "mixed");
      for (const p of problems) {
        if (p.type !== "rate-of-change") {
          expect(p.answerDisplay).toContain("y =");
          expect(p.answerDisplay).toContain("x");
        }
      }
    }
  });

  it("every problem has a non-empty question string", () => {
    for (const seed of seeds) {
      const problems = generateLinearFunc(seed, "mixed");
      for (const p of problems) {
        expect(p.question.length).toBeGreaterThan(0);
      }
    }
  });
});
