import { describe, it, expect } from "vitest";
import {
  gcd,
  simplify,
  generateFracMul,
  generateFracDiv,
  generateRatio,
  generateCircleArea,
  generateProportion,
} from "./generators";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// gcd / simplify helpers
// ---------------------------------------------------------------------------
describe("gcd", () => {
  it("computes greatest common divisor", () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(7, 13)).toBe(1);
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(18, 24)).toBe(6);
    expect(gcd(100, 100)).toBe(100);
  });

  it("handles negative inputs", () => {
    expect(gcd(-12, 8)).toBe(4);
    expect(gcd(12, -8)).toBe(4);
  });
});

describe("simplify", () => {
  it("reduces fractions to lowest terms", () => {
    expect(simplify(4, 8)).toEqual([1, 2]);
    expect(simplify(6, 9)).toEqual([2, 3]);
    expect(simplify(7, 3)).toEqual([7, 3]);
    expect(simplify(12, 4)).toEqual([3, 1]);
  });
});

// ---------------------------------------------------------------------------
// generateFracMul
// ---------------------------------------------------------------------------
describe("generateFracMul", () => {
  it("returns 12 problems", () => {
    const problems = generateFracMul(42);
    expect(problems).toHaveLength(12);
  });

  it("answer equals (aNum*bNum)/(aDen*bDen) simplified", () => {
    for (const seed of seeds) {
      const problems = generateFracMul(seed);
      for (const p of problems) {
        const rawNum = p.aNum * p.bNum;
        const rawDen = p.aDen * p.bDen;
        const [sNum, sDen] = simplify(rawNum, rawDen);
        expect(p.ansNum).toBe(sNum);
        expect(p.ansDen).toBe(sDen);
      }
    }
  });

  it("answer is in lowest terms", () => {
    for (const seed of seeds) {
      const problems = generateFracMul(seed);
      for (const p of problems) {
        expect(gcd(p.ansNum, p.ansDen)).toBe(1);
      }
    }
  });

  it("mixed number parts are correct when present", () => {
    for (const seed of seeds) {
      const problems = generateFracMul(seed);
      for (const p of problems) {
        if (p.ansWhole !== undefined && p.ansPartNum !== undefined) {
          expect(p.ansWhole).toBe(Math.floor(p.ansNum / p.ansDen));
          expect(p.ansPartNum).toBe(p.ansNum % p.ansDen);
          expect(p.ansWhole).toBeGreaterThan(0);
          expect(p.ansPartNum).toBeGreaterThan(0);
        }
      }
    }
  });

  it("denominators are at least 2", () => {
    for (const seed of seeds) {
      const problems = generateFracMul(seed);
      for (const p of problems) {
        expect(p.aDen).toBeGreaterThanOrEqual(2);
        expect(p.bDen).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("numerators are at least 1", () => {
    for (const seed of seeds) {
      const problems = generateFracMul(seed);
      for (const p of problems) {
        expect(p.aNum).toBeGreaterThanOrEqual(1);
        expect(p.bNum).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateFracMul(42);
    const b = generateFracMul(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateFracMul(1);
    const b = generateFracMul(2);
    const aNums = a.map((p) => p.ansNum);
    const bNums = b.map((p) => p.ansNum);
    expect(aNums).not.toEqual(bNums);
  });
});

// ---------------------------------------------------------------------------
// generateFracDiv
// ---------------------------------------------------------------------------
describe("generateFracDiv", () => {
  it("returns 12 problems", () => {
    const problems = generateFracDiv(42);
    expect(problems).toHaveLength(12);
  });

  it("answer equals (aNum*bDen)/(aDen*bNum) simplified (reciprocal multiply)", () => {
    for (const seed of seeds) {
      const problems = generateFracDiv(seed);
      for (const p of problems) {
        // a/b ÷ c/d = (a*d)/(b*c)
        const rawNum = p.aNum * p.bDen;
        const rawDen = p.aDen * p.bNum;
        const [sNum, sDen] = simplify(rawNum, rawDen);
        expect(p.ansNum).toBe(sNum);
        expect(p.ansDen).toBe(sDen);
      }
    }
  });

  it("answer is in lowest terms", () => {
    for (const seed of seeds) {
      const problems = generateFracDiv(seed);
      for (const p of problems) {
        expect(gcd(p.ansNum, p.ansDen)).toBe(1);
      }
    }
  });

  it("mixed number parts are correct when present", () => {
    for (const seed of seeds) {
      const problems = generateFracDiv(seed);
      for (const p of problems) {
        if (p.ansWhole !== undefined && p.ansPartNum !== undefined) {
          expect(p.ansWhole).toBe(Math.floor(p.ansNum / p.ansDen));
          expect(p.ansPartNum).toBe(p.ansNum % p.ansDen);
          expect(p.ansWhole).toBeGreaterThan(0);
          expect(p.ansPartNum).toBeGreaterThan(0);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateFracDiv(42);
    const b = generateFracDiv(42);
    expect(a).toEqual(b);
  });
});

// ---------------------------------------------------------------------------
// generateRatio
// ---------------------------------------------------------------------------
describe("generateRatio", () => {
  it("returns 12 problems", () => {
    const problems = generateRatio(42, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("simplify mode: answer is the simplified ratio", () => {
    for (const seed of seeds) {
      const problems = generateRatio(seed, "simplify");
      for (const p of problems) {
        expect(p.question).toContain("最も簡単な整数の比");
        // Parse the answer "a：b"
        const [aStr, bStr] = p.answer.split("：");
        const a = Number(aStr);
        const b = Number(bStr);
        expect(gcd(a, b)).toBe(1);
      }
    }
  });

  it("fill mode: answer is a number (the blank)", () => {
    for (const seed of seeds) {
      const problems = generateRatio(seed, "fill");
      for (const p of problems) {
        expect(p.question).toContain("□");
        const ans = Number(p.answer);
        expect(Number.isInteger(ans)).toBe(true);
        expect(ans).toBeGreaterThan(0);
      }
    }
  });

  it("mixed mode produces both simplify and fill types", () => {
    let hasSimplify = false;
    let hasFill = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateRatio(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("最も簡単な整数の比")) hasSimplify = true;
        if (p.question.includes("□")) hasFill = true;
      }
    }
    expect(hasSimplify).toBe(true);
    expect(hasFill).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateRatio(42, "mixed");
    const b = generateRatio(42, "mixed");
    expect(a).toEqual(b);
  });
});

// ---------------------------------------------------------------------------
// generateCircleArea
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// generateProportion
// ---------------------------------------------------------------------------
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
