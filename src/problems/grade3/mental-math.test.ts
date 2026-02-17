import { describe, it, expect } from "vitest";
import { generateMentalMath } from "./mental-math";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateMentalMath
// ---------------------------------------------------------------------------
describe("generateMentalMath", () => {
  it("returns 20 problems", () => {
    const problems = generateMentalMath(42, "mixed");
    expect(problems).toHaveLength(20);
  });

  it("add mode: all operations are +", () => {
    for (const seed of seeds) {
      const problems = generateMentalMath(seed, "add");
      for (const p of problems) {
        expect(p.op).toBe("+");
      }
    }
  });

  it("sub mode: all operations are minus", () => {
    for (const seed of seeds) {
      const problems = generateMentalMath(seed, "sub");
      for (const p of problems) {
        expect(p.op).toBe("−");
      }
    }
  });

  it("mixed mode produces both add and sub", () => {
    let hasAdd = false;
    let hasSub = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateMentalMath(seed, "mixed");
      for (const p of problems) {
        if (p.op === "+") hasAdd = true;
        if (p.op === "−") hasSub = true;
      }
    }
    expect(hasAdd).toBe(true);
    expect(hasSub).toBe(true);
  });

  it("answer is correct for addition", () => {
    for (const seed of seeds) {
      const problems = generateMentalMath(seed, "add");
      for (const p of problems) {
        expect(p.answer).toBe(p.left + p.right);
      }
    }
  });

  it("answer is correct for subtraction", () => {
    for (const seed of seeds) {
      const problems = generateMentalMath(seed, "sub");
      for (const p of problems) {
        expect(p.answer).toBe(p.left - p.right);
      }
    }
  });

  it("left is between 10 and 99", () => {
    for (const seed of seeds) {
      for (const mode of ["add", "sub", "mixed"] as const) {
        const problems = generateMentalMath(seed, mode);
        for (const p of problems) {
          expect(p.left).toBeGreaterThanOrEqual(10);
          expect(p.left).toBeLessThanOrEqual(99);
        }
      }
    }
  });

  it("right is at least 1", () => {
    for (const seed of seeds) {
      const problems = generateMentalMath(seed, "mixed");
      for (const p of problems) {
        expect(p.right).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("addition results do not exceed 200", () => {
    for (const seed of seeds) {
      const problems = generateMentalMath(seed, "add");
      for (const p of problems) {
        expect(p.answer).toBeLessThanOrEqual(200);
      }
    }
  });

  it("subtraction results are non-negative", () => {
    for (const seed of seeds) {
      const problems = generateMentalMath(seed, "sub");
      for (const p of problems) {
        expect(p.answer).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateMentalMath(42, "mixed");
    const b = generateMentalMath(42, "mixed");
    expect(a).toEqual(b);
  });
});
