import { describe, it, expect } from "vitest";
import { generateAreaFormula } from "./area-formula";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateAreaFormula
// ---------------------------------------------------------------------------
describe("generateAreaFormula", () => {
  it("returns 10 problems", () => {
    const problems = generateAreaFormula(42, "triangle");
    expect(problems).toHaveLength(10);
  });

  it("triangle: area = base * height / 2", () => {
    for (const seed of seeds) {
      const problems = generateAreaFormula(seed, "triangle");
      for (const p of problems) {
        expect(p.question).toContain("三角形");
        const match = p.question.match(/底辺(\d+)cm、高さ(\d+)cm/);
        expect(match).not.toBeNull();
        const base = Number(match![1]);
        const height = Number(match![2]);
        const area = (base * height) / 2;
        expect(p.answer).toBe(`${area}cm²`);
        // base should be even for integer area
        expect(base % 2).toBe(0);
      }
    }
  });

  it("parallelogram: area = base * height", () => {
    for (const seed of seeds) {
      const problems = generateAreaFormula(seed, "parallelogram");
      for (const p of problems) {
        expect(p.question).toContain("平行四辺形");
        const match = p.question.match(/底辺(\d+)cm、高さ(\d+)cm/);
        expect(match).not.toBeNull();
        const base = Number(match![1]);
        const height = Number(match![2]);
        expect(p.answer).toBe(`${base * height}cm²`);
      }
    }
  });

  it("trapezoid: area = (upper + lower) * height / 2", () => {
    for (const seed of seeds) {
      const problems = generateAreaFormula(seed, "trapezoid");
      for (const p of problems) {
        expect(p.question).toContain("台形");
        const match = p.question.match(/上底(\d+)cm、下底(\d+)cm、高さ(\d+)cm/);
        expect(match).not.toBeNull();
        const upper = Number(match![1]);
        const lower = Number(match![2]);
        const height = Number(match![3]);
        const area = (upper + lower) * height / 2;
        expect(p.answer).toBe(`${area}cm²`);
        // area should be an integer
        expect(Number.isInteger(area)).toBe(true);
      }
    }
  });

  it("mixed mode produces all three shape types", () => {
    let hasTriangle = false;
    let hasParallelogram = false;
    let hasTrapezoid = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateAreaFormula(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("三角形")) hasTriangle = true;
        if (p.question.includes("平行四辺形")) hasParallelogram = true;
        if (p.question.includes("台形")) hasTrapezoid = true;
      }
    }
    expect(hasTriangle).toBe(true);
    expect(hasParallelogram).toBe(true);
    expect(hasTrapezoid).toBe(true);
  });

  it("all areas are positive integers", () => {
    for (const seed of seeds) {
      for (const shape of ["triangle", "parallelogram", "trapezoid"] as const) {
        const problems = generateAreaFormula(seed, shape);
        for (const p of problems) {
          const areaMatch = p.answer.match(/(\d+)cm²/);
          expect(areaMatch).not.toBeNull();
          const area = Number(areaMatch![1]);
          expect(area).toBeGreaterThan(0);
          expect(Number.isInteger(area)).toBe(true);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateAreaFormula(42, "mixed");
    const b = generateAreaFormula(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateAreaFormula(1, "triangle");
    const b = generateAreaFormula(2, "triangle");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
