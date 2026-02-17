import { describe, it, expect } from "vitest";
import { generateFracDecimal } from "./frac-decimal";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateFracDecimal
// ---------------------------------------------------------------------------
describe("generateFracDecimal", () => {
  it("returns 10 problems", () => {
    const problems = generateFracDecimal(42, "to-decimal");
    expect(problems).toHaveLength(10);
  });

  it("to-decimal: answer equals num/den as a decimal", () => {
    for (const seed of seeds) {
      const problems = generateFracDecimal(seed, "to-decimal");
      for (const p of problems) {
        expect(p.question).toContain("小数で表しなさい");
        const match = p.question.match(/(\d+)\/(\d+)/);
        expect(match).not.toBeNull();
        const num = Number(match![1]);
        const den = Number(match![2]);
        const decimal = num / den;
        expect(Number(p.answer)).toBeCloseTo(decimal, 10);
      }
    }
  });

  it("to-fraction: answer equals the fraction representation", () => {
    for (const seed of seeds) {
      const problems = generateFracDecimal(seed, "to-fraction");
      for (const p of problems) {
        expect(p.question).toContain("分数で表しなさい");
        const qMatch = p.question.match(/([\d.]+)\s*を分数/);
        expect(qMatch).not.toBeNull();
        const decimal = Number(qMatch![1]);
        const aMatch = p.answer.match(/(\d+)\/(\d+)/);
        expect(aMatch).not.toBeNull();
        const ansNum = Number(aMatch![1]);
        const ansDen = Number(aMatch![2]);
        expect(ansNum / ansDen).toBeCloseTo(decimal, 10);
      }
    }
  });

  it("mixed mode produces both directions", () => {
    let hasToDecimal = false;
    let hasToFraction = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateFracDecimal(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("小数で表しなさい")) hasToDecimal = true;
        if (p.question.includes("分数で表しなさい")) hasToFraction = true;
      }
    }
    expect(hasToDecimal).toBe(true);
    expect(hasToFraction).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateFracDecimal(42, "mixed");
    const b = generateFracDecimal(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateFracDecimal(1, "to-decimal");
    const b = generateFracDecimal(2, "to-decimal");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
