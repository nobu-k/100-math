import { describe, it, expect } from "vitest";
import { generateUnitConv3 } from "./unit-conv3";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateUnitConv3
// ---------------------------------------------------------------------------
describe("generateUnitConv3", () => {
  it("returns 10 problems", () => {
    const problems = generateUnitConv3(42, "length");
    expect(problems).toHaveLength(10);
  });

  it("length mode: questions involve length units (km, m, cm)", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv3(seed, "length");
      for (const p of problems) {
        const hasLength = p.question.includes("km") || p.question.includes("cm") || p.question.includes("m");
        expect(hasLength).toBe(true);
        const hasWeight = p.question.includes("kg") || p.question.includes("g") || p.question.includes("t");
        expect(hasWeight).toBe(false);
      }
    }
  });

  it("weight mode: questions involve weight units (kg, g, t)", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv3(seed, "weight");
      for (const p of problems) {
        const hasWeight = p.question.includes("kg") || p.question.includes("g") || p.question.includes("t");
        expect(hasWeight).toBe(true);
      }
    }
  });

  it("mixed mode produces both length and weight problems", () => {
    let hasLength = false;
    let hasWeight = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateUnitConv3(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("km") || p.question.includes("cm")) hasLength = true;
        if (p.question.includes("kg") || p.question.includes("t")) hasWeight = true;
      }
    }
    expect(hasLength).toBe(true);
    expect(hasWeight).toBe(true);
  });

  it("every problem has a non-empty question and answer", () => {
    for (const seed of seeds) {
      for (const ut of ["length", "weight", "mixed"] as const) {
        const problems = generateUnitConv3(seed, ut);
        for (const p of problems) {
          expect(p.question.length).toBeGreaterThan(0);
          expect(p.answer.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("length conversion: km+m to m is correct", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv3(seed, "length");
      for (const p of problems) {
        // Check km+m → m pattern
        const match = p.question.match(/^(\d+)km (\d+)m ＝ □m$/);
        if (match) {
          const km = Number(match[1]);
          const m = Number(match[2]);
          expect(p.answer).toBe(`${km * 1000 + m}`);
        }
      }
    }
  });

  it("weight conversion: kg+g to g is correct", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv3(seed, "weight");
      for (const p of problems) {
        const match = p.question.match(/^(\d+)kg (\d+)g ＝ □g$/);
        if (match) {
          const kg = Number(match[1]);
          const g = Number(match[2]);
          expect(p.answer).toBe(`${kg * 1000 + g}`);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateUnitConv3(42, "mixed");
    const b = generateUnitConv3(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateUnitConv3(1, "length");
    const b = generateUnitConv3(2, "length");
    const aQuestions = a.map((p) => p.question);
    const bQuestions = b.map((p) => p.question);
    expect(aQuestions).not.toEqual(bQuestions);
  });
});
