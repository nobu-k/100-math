import { describe, it, expect } from "vitest";
import { generateCircleArea } from "./circle-area";

const seeds = [1, 2, 42, 100, 999];

describe("generateCircleArea", () => {
  it("returns 10 problems", () => {
    const problems = generateCircleArea(42, "basic");
    expect(problems).toHaveLength(10);
  });

  it("basic: area = radius^2 * 3.14", () => {
    for (const seed of seeds) {
      const problems = generateCircleArea(seed, "basic");
      for (const p of problems) {
        expect(p.question).toContain("円の面積");
        expect(p.question).not.toContain("半円");
        // Extract radius from question
        const match = p.question.match(/半径(\d+)cm/);
        expect(match).not.toBeNull();
        const radius = Number(match![1]);
        const expected = Number((radius * radius * 3.14).toFixed(2)).toString();
        expect(p.answer).toBe(`${expected}cm²`);
      }
    }
  });

  it("half: area = radius^2 * 3.14 / 2", () => {
    for (const seed of seeds) {
      const problems = generateCircleArea(seed, "half");
      for (const p of problems) {
        expect(p.question).toContain("半円の面積");
        const match = p.question.match(/半径(\d+)cm/);
        expect(match).not.toBeNull();
        const radius = Number(match![1]);
        const expected = Number((radius * radius * 3.14 / 2).toFixed(2)).toString();
        expect(p.answer).toBe(`${expected}cm²`);
      }
    }
  });

  it("mixed mode produces both basic and half types", () => {
    let hasBasic = false;
    let hasHalf = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateCircleArea(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("半円")) hasHalf = true;
        else if (p.question.includes("円の面積")) hasBasic = true;
      }
    }
    expect(hasBasic).toBe(true);
    expect(hasHalf).toBe(true);
  });

  it("radius is between 1 and 15", () => {
    for (const seed of seeds) {
      const problems = generateCircleArea(seed, "basic");
      for (const p of problems) {
        const match = p.question.match(/半径(\d+)cm/);
        const radius = Number(match![1]);
        expect(radius).toBeGreaterThanOrEqual(1);
        expect(radius).toBeLessThanOrEqual(15);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateCircleArea(42, "mixed");
    const b = generateCircleArea(42, "mixed");
    expect(a).toEqual(b);
  });
});
