import { describe, it, expect } from "vitest";
import { gcd, lcm, simplify } from "../shared/math-utils";
import { generateDiffFrac } from "./diff-frac";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateDiffFrac
// ---------------------------------------------------------------------------
describe("generateDiffFrac", () => {
  it("returns 12 problems", () => {
    const problems = generateDiffFrac(42, "add");
    expect(problems).toHaveLength(12);
  });

  it("addition: answer equals sum of fractions simplified", () => {
    for (const seed of seeds) {
      const problems = generateDiffFrac(seed, "add");
      for (const p of problems) {
        expect(p.op).toBe("+");
        const commonDen = lcm(p.aDen, p.bDen);
        const aConv = p.aNum * (commonDen / p.aDen);
        const bConv = p.bNum * (commonDen / p.bDen);
        const rawNum = aConv + bConv;
        const [sNum, sDen] = simplify(rawNum, commonDen);
        expect(p.ansNum).toBe(sNum);
        expect(p.ansDen).toBe(sDen);
      }
    }
  });

  it("answer is in lowest terms", () => {
    for (const seed of seeds) {
      const problems = generateDiffFrac(seed, "mixed");
      for (const p of problems) {
        expect(gcd(p.ansNum, p.ansDen)).toBe(1);
      }
    }
  });

  it("answer numerator and denominator are positive", () => {
    for (const seed of seeds) {
      const problems = generateDiffFrac(seed, "mixed");
      for (const p of problems) {
        expect(p.ansNum).toBeGreaterThan(0);
        expect(p.ansDen).toBeGreaterThan(0);
      }
    }
  });

  it("mixed number parts are correct when present", () => {
    for (const seed of seeds) {
      const problems = generateDiffFrac(seed, "mixed");
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

  it("denominators are between 2 and 10", () => {
    for (const seed of seeds) {
      const problems = generateDiffFrac(seed, "mixed");
      for (const p of problems) {
        expect(p.aDen).toBeGreaterThanOrEqual(2);
        expect(p.aDen).toBeLessThanOrEqual(10);
        expect(p.bDen).toBeGreaterThanOrEqual(2);
        expect(p.bDen).toBeLessThanOrEqual(10);
      }
    }
  });

  it("input denominators are different", () => {
    for (const seed of seeds) {
      const problems = generateDiffFrac(seed, "add");
      for (const p of problems) {
        expect(p.aDen).not.toBe(p.bDen);
      }
    }
  });

  it("numerators are proper fractions (less than denominator)", () => {
    for (const seed of seeds) {
      const problems = generateDiffFrac(seed, "mixed");
      for (const p of problems) {
        expect(p.aNum).toBeGreaterThanOrEqual(1);
        expect(p.aNum).toBeLessThan(p.aDen);
        expect(p.bNum).toBeGreaterThanOrEqual(1);
        expect(p.bNum).toBeLessThan(p.bDen);
      }
    }
  });

  it("op is + for add mode and - for sub mode", () => {
    for (const seed of seeds) {
      const addProblems = generateDiffFrac(seed, "add");
      for (const p of addProblems) {
        expect(p.op).toBe("+");
      }
      const subProblems = generateDiffFrac(seed, "sub");
      for (const p of subProblems) {
        expect(p.op).toBe("−");
      }
    }
  });

  it("mixed mode produces both + and - operations", () => {
    let hasAdd = false;
    let hasSub = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateDiffFrac(seed, "mixed");
      for (const p of problems) {
        if (p.op === "+") hasAdd = true;
        if (p.op === "−") hasSub = true;
      }
    }
    expect(hasAdd).toBe(true);
    expect(hasSub).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateDiffFrac(42, "mixed");
    const b = generateDiffFrac(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateDiffFrac(1, "add");
    const b = generateDiffFrac(2, "add");
    const aNums = a.map((p) => p.ansNum);
    const bNums = b.map((p) => p.ansNum);
    expect(aNums).not.toEqual(bNums);
  });
});
