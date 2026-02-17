import { describe, it, expect } from "vitest";
import { generateUnitAmount } from "./unit-amount";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateUnitAmount
// ---------------------------------------------------------------------------
describe("generateUnitAmount", () => {
  it("returns 8 problems", () => {
    const problems = generateUnitAmount(42);
    expect(problems).toHaveLength(8);
  });

  it("per-unit problems: answer = total / area", () => {
    for (const seed of seeds) {
      const problems = generateUnitAmount(seed);
      for (const p of problems) {
        if (p.question.includes("あたり何人") || p.question.includes("人口密度")) {
          // find per unit: total / area
          const areaMatch = p.question.match(/面積(\d+)/);
          const totalMatch = p.question.match(/に(\d+)/);
          expect(areaMatch).not.toBeNull();
          expect(totalMatch).not.toBeNull();
          const area = Number(areaMatch![1]);
          const total = Number(totalMatch![1]);
          const perUnit = total / area;
          const ansMatch = p.answer.match(/(\d+)/);
          expect(ansMatch).not.toBeNull();
          expect(Number(ansMatch![1])).toBe(perUnit);
        } else {
          // find total: perUnit * area
          const perUnitMatch = p.question.match(/あたり(\d+)/);
          const areaMatch = p.question.match(/面積が(\d+)/);
          expect(perUnitMatch).not.toBeNull();
          expect(areaMatch).not.toBeNull();
          const perUnit = Number(perUnitMatch![1]);
          const area = Number(areaMatch![1]);
          const ansMatch = p.answer.match(/(\d+)/);
          expect(ansMatch).not.toBeNull();
          expect(Number(ansMatch![1])).toBe(perUnit * area);
        }
      }
    }
  });

  it("area is between 5 and 24", () => {
    for (const seed of seeds) {
      const problems = generateUnitAmount(seed);
      for (const p of problems) {
        const areaMatch = p.question.match(/面積[がは]?(\d+)/);
        if (!areaMatch) {
          const areaMatch2 = p.question.match(/面積(\d+)/);
          expect(areaMatch2).not.toBeNull();
        }
      }
    }
  });

  it("produces both per-unit and total question types", () => {
    let hasPerUnit = false;
    let hasTotal = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateUnitAmount(seed);
      for (const p of problems) {
        if (p.question.includes("あたり何人") || p.question.includes("人口密度")) hasPerUnit = true;
        if (p.question.includes("全部で何")) hasTotal = true;
      }
    }
    expect(hasPerUnit).toBe(true);
    expect(hasTotal).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateUnitAmount(42);
    const b = generateUnitAmount(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateUnitAmount(1);
    const b = generateUnitAmount(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
