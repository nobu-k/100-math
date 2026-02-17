import { describe, it, expect } from "vitest";
import { generatePatternTable } from "./pattern-table";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generatePatternTable
// ---------------------------------------------------------------------------
describe("generatePatternTable", () => {
  it("returns 6 problems", () => {
    const problems = generatePatternTable(42);
    expect(problems).toHaveLength(6);
  });

  it("each problem has 6 x-values [1..6]", () => {
    for (const seed of seeds) {
      const problems = generatePatternTable(seed);
      for (const p of problems) {
        expect(p.xValues).toEqual([1, 2, 3, 4, 5, 6]);
      }
    }
  });

  it("each problem has exactly 2 blanks (null values) in yValues", () => {
    for (const seed of seeds) {
      const problems = generatePatternTable(seed);
      for (const p of problems) {
        const blanks = p.yValues.filter((y) => y === null);
        expect(blanks).toHaveLength(2);
        expect(p.answers).toHaveLength(2);
      }
    }
  });

  it("first and last y-values are never blank", () => {
    for (const seed of seeds) {
      const problems = generatePatternTable(seed);
      for (const p of problems) {
        expect(p.yValues[0]).not.toBeNull();
        expect(p.yValues[5]).not.toBeNull();
      }
    }
  });

  it("y = a * x + b relationship holds for all values", () => {
    for (const seed of seeds) {
      const problems = generatePatternTable(seed);
      for (const p of problems) {
        // Reconstruct full y-values
        const fullY: number[] = [];
        let ansIdx = 0;
        for (const y of p.yValues) {
          if (y !== null) {
            fullY.push(y);
          } else {
            fullY.push(p.answers[ansIdx++]);
          }
        }

        // Derive a and b from first two known values
        // y = a*x + b => from x=1: fullY[0] = a + b, x=2: fullY[1] = 2a + b
        const a = fullY[1] - fullY[0];
        const b = fullY[0] - a;

        for (let i = 0; i < 6; i++) {
          expect(fullY[i]).toBe(a * (i + 1) + b);
        }
      }
    }
  });

  it("rule string matches pattern", () => {
    for (const seed of seeds) {
      const problems = generatePatternTable(seed);
      for (const p of problems) {
        expect(p.rule).toMatch(/y ＝ \d+ × x/);
      }
    }
  });

  it("labels are non-empty strings", () => {
    for (const seed of seeds) {
      const problems = generatePatternTable(seed);
      for (const p of problems) {
        expect(p.label.length).toBeGreaterThan(0);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generatePatternTable(42);
    const b = generatePatternTable(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generatePatternTable(1);
    const b = generatePatternTable(2);
    const aAnswers = a.map((p) => p.answers);
    const bAnswers = b.map((p) => p.answers);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
