import { describe, it, expect } from "vitest";
import { generateDivision } from "./division";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateDivision
// ---------------------------------------------------------------------------
describe("generateDivision", () => {
  it("returns 15 problems", () => {
    const problems = generateDivision(42, "mixed");
    expect(problems).toHaveLength(15);
  });

  it("dividend = divisor * quotient + remainder for every problem", () => {
    for (const seed of seeds) {
      for (const mode of ["none", "yes", "mixed"] as const) {
        const problems = generateDivision(seed, mode);
        for (const p of problems) {
          expect(p.dividend).toBe(p.divisor * p.quotient + p.remainder);
        }
      }
    }
  });

  it("none mode: all remainders are 0", () => {
    for (const seed of seeds) {
      const problems = generateDivision(seed, "none");
      for (const p of problems) {
        expect(p.remainder).toBe(0);
      }
    }
  });

  it("yes mode: all remainders are > 0", () => {
    for (const seed of seeds) {
      const problems = generateDivision(seed, "yes");
      for (const p of problems) {
        expect(p.remainder).toBeGreaterThan(0);
      }
    }
  });

  it("mixed mode produces both remainder and non-remainder problems", () => {
    let hasRemainder = false;
    let hasNoRemainder = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateDivision(seed, "mixed");
      for (const p of problems) {
        if (p.remainder > 0) hasRemainder = true;
        if (p.remainder === 0) hasNoRemainder = true;
      }
    }
    expect(hasRemainder).toBe(true);
    expect(hasNoRemainder).toBe(true);
  });

  it("divisor is between 2 and 9", () => {
    for (const seed of seeds) {
      const problems = generateDivision(seed, "mixed");
      for (const p of problems) {
        expect(p.divisor).toBeGreaterThanOrEqual(2);
        expect(p.divisor).toBeLessThanOrEqual(9);
      }
    }
  });

  it("quotient is between 1 and 9", () => {
    for (const seed of seeds) {
      const problems = generateDivision(seed, "mixed");
      for (const p of problems) {
        expect(p.quotient).toBeGreaterThanOrEqual(1);
        expect(p.quotient).toBeLessThanOrEqual(9);
      }
    }
  });

  it("remainder is less than divisor", () => {
    for (const seed of seeds) {
      const problems = generateDivision(seed, "yes");
      for (const p of problems) {
        expect(p.remainder).toBeLessThan(p.divisor);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateDivision(42, "mixed");
    const b = generateDivision(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateDivision(1, "mixed");
    const b = generateDivision(2, "mixed");
    const aDividends = a.map((p) => p.dividend);
    const bDividends = b.map((p) => p.dividend);
    expect(aDividends).not.toEqual(bDividends);
  });
});
