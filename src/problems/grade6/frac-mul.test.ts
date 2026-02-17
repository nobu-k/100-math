import { describe, it, expect } from "vitest";
import { generateFracMul } from "./frac-mul";
import { gcd, simplify } from "../shared/math-utils";

const seeds = [1, 2, 42, 100, 999];

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
