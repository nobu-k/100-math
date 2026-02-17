import { describe, it, expect } from "vitest";
import { generateFracDiv } from "./frac-div";
import { gcd, simplify } from "../shared/math-utils";

const seeds = [1, 2, 42, 100, 999];

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
