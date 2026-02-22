import { describe, it, expect } from "vitest";
import { generateProportion } from "./proportion-table";

const seeds = [1, 2, 42, 100, 999];

describe("generateProportion", () => {
  it("returns 6 problems", () => {
    const problems = generateProportion(42, "mixed");
    expect(problems).toHaveLength(6);
  });

  it("direct: y = constant * x for all values", () => {
    for (const seed of seeds) {
      const problems = generateProportion(seed, "direct");
      for (const p of problems) {
        expect(p.label).toBe("比例");
        // Reconstruct full y values
        const fullY: number[] = [];
        let ansIdx = 0;
        for (const y of p.yValues) {
          if (y !== null) {
            fullY.push(y);
          } else {
            fullY.push(p.answers[ansIdx++]);
          }
        }
        // y/x should be constant for all entries
        const ratio = fullY[0] / p.xValues[0];
        for (let i = 1; i < fullY.length; i++) {
          expect(fullY[i] / p.xValues[i]).toBeCloseTo(ratio);
        }
      }
    }
  });

  it("inverse: y = constant / x for all values", () => {
    for (const seed of seeds) {
      const problems = generateProportion(seed, "inverse");
      for (const p of problems) {
        expect(p.label).toBe("反比例");
        // Reconstruct full y values
        const fullY: number[] = [];
        let ansIdx = 0;
        for (const y of p.yValues) {
          if (y !== null) {
            fullY.push(y);
          } else {
            fullY.push(p.answers[ansIdx++]);
          }
        }
        // x*y should be constant for all entries
        const product = fullY[0] * p.xValues[0];
        for (let i = 1; i < fullY.length; i++) {
          expect(fullY[i] * p.xValues[i]).toBe(product);
        }
      }
    }
  });

  it("each problem has exactly 2 blanks", () => {
    for (const seed of seeds) {
      const problems = generateProportion(seed, "mixed");
      for (const p of problems) {
        const blanks = p.yValues.filter((y) => y === null);
        expect(blanks).toHaveLength(2);
        expect(p.answers).toHaveLength(2);
      }
    }
  });

  it("mixed mode produces both direct and inverse", () => {
    let hasDirect = false;
    let hasInverse = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateProportion(seed, "mixed");
      for (const p of problems) {
        if (p.label === "比例") hasDirect = true;
        if (p.label === "反比例") hasInverse = true;
      }
    }
    expect(hasDirect).toBe(true);
    expect(hasInverse).toBe(true);
  });

  it("all y values are positive integers", () => {
    for (const seed of seeds) {
      const problems = generateProportion(seed, "mixed");
      for (const p of problems) {
        let ansIdx = 0;
        for (const y of p.yValues) {
          const val = y !== null ? y : p.answers[ansIdx++];
          expect(val).toBeGreaterThan(0);
          expect(Number.isInteger(val)).toBe(true);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateProportion(42, "mixed");
    const b = generateProportion(42, "mixed");
    expect(a).toEqual(b);
  });
});
