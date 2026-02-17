import { describe, it, expect } from "vitest";
import { generateFracCompare } from "./frac-compare";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateFracCompare
// ---------------------------------------------------------------------------
describe("generateFracCompare", () => {
  it("returns 15 problems", () => {
    const problems = generateFracCompare(42);
    expect(problems).toHaveLength(15);
  });

  it("answer matches the actual comparison of fraction values", () => {
    for (const seed of seeds) {
      const problems = generateFracCompare(seed);
      for (const p of problems) {
        const aVal = p.aNum / p.aDen;
        const bVal = p.bNum / p.bDen;
        if (Math.abs(aVal - bVal) < 1e-10) {
          expect(p.answer).toBe("＝");
        } else if (aVal > bVal) {
          expect(p.answer).toBe("＞");
        } else {
          expect(p.answer).toBe("＜");
        }
      }
    }
  });

  it("first two problems have equal fractions", () => {
    for (const seed of seeds) {
      const problems = generateFracCompare(seed);
      expect(problems[0].answer).toBe("＝");
      expect(problems[1].answer).toBe("＝");
    }
  });

  it("all fractions are proper (numerator < denominator)", () => {
    for (const seed of seeds) {
      const problems = generateFracCompare(seed);
      for (const p of problems) {
        expect(p.aNum).toBeGreaterThanOrEqual(1);
        expect(p.aNum).toBeLessThan(p.aDen);
        expect(p.bNum).toBeGreaterThanOrEqual(1);
        expect(p.bNum).toBeLessThan(p.bDen);
      }
    }
  });

  it("denominators are at least 2", () => {
    for (const seed of seeds) {
      const problems = generateFracCompare(seed);
      for (const p of problems) {
        expect(p.aDen).toBeGreaterThanOrEqual(2);
        expect(p.bDen).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("answer is one of the three valid symbols", () => {
    for (const seed of seeds) {
      const problems = generateFracCompare(seed);
      for (const p of problems) {
        expect(["＞", "＜", "＝"]).toContain(p.answer);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateFracCompare(42);
    const b = generateFracCompare(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateFracCompare(1);
    const b = generateFracCompare(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
