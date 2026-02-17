import { describe, it, expect } from "vitest";
import { generateVolume } from "./volume";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateVolume
// ---------------------------------------------------------------------------
describe("generateVolume", () => {
  it("returns 10 problems", () => {
    const problems = generateVolume(42, "cube");
    expect(problems).toHaveLength(10);
  });

  it("cube: volume = side^3", () => {
    for (const seed of seeds) {
      const problems = generateVolume(seed, "cube");
      for (const p of problems) {
        expect(p.question).toContain("立方体");
        const match = p.question.match(/一辺(\d+)cm/);
        expect(match).not.toBeNull();
        const side = Number(match![1]);
        expect(p.answer).toBe(`${side * side * side}cm³`);
      }
    }
  });

  it("rect: volume = a * b * c", () => {
    for (const seed of seeds) {
      const problems = generateVolume(seed, "rect");
      for (const p of problems) {
        expect(p.question).toContain("直方体");
        const match = p.question.match(/たて(\d+)cm、よこ(\d+)cm、高さ(\d+)cm/);
        expect(match).not.toBeNull();
        const a = Number(match![1]);
        const b = Number(match![2]);
        const c = Number(match![3]);
        expect(p.answer).toBe(`${a * b * c}cm³`);
      }
    }
  });

  it("cube side is between 1 and 10", () => {
    for (const seed of seeds) {
      const problems = generateVolume(seed, "cube");
      for (const p of problems) {
        const match = p.question.match(/一辺(\d+)cm/);
        const side = Number(match![1]);
        expect(side).toBeGreaterThanOrEqual(1);
        expect(side).toBeLessThanOrEqual(10);
      }
    }
  });

  it("rect dimensions are between 2 and 11", () => {
    for (const seed of seeds) {
      const problems = generateVolume(seed, "rect");
      for (const p of problems) {
        const match = p.question.match(/たて(\d+)cm、よこ(\d+)cm、高さ(\d+)cm/);
        const a = Number(match![1]);
        const b = Number(match![2]);
        const c = Number(match![3]);
        expect(a).toBeGreaterThanOrEqual(2);
        expect(a).toBeLessThanOrEqual(11);
        expect(b).toBeGreaterThanOrEqual(2);
        expect(b).toBeLessThanOrEqual(11);
        expect(c).toBeGreaterThanOrEqual(2);
        expect(c).toBeLessThanOrEqual(11);
      }
    }
  });

  it("mixed mode produces both cube and rect types", () => {
    let hasCube = false;
    let hasRect = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateVolume(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("立方体")) hasCube = true;
        if (p.question.includes("直方体")) hasRect = true;
      }
    }
    expect(hasCube).toBe(true);
    expect(hasRect).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateVolume(42, "mixed");
    const b = generateVolume(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateVolume(1, "cube");
    const b = generateVolume(2, "cube");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
