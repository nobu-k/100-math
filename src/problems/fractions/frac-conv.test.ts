import { describe, it, expect } from "vitest";
import { generateFracConv } from "./frac-conv";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateFracConv
// ---------------------------------------------------------------------------
describe("generateFracConv", () => {
  it("returns 10 problems", () => {
    const problems = generateFracConv(42, "both");
    expect(problems).toHaveLength(10);
  });

  it("to-mixed: improperNum/den => whole + partNum/den", () => {
    for (const seed of seeds) {
      const problems = generateFracConv(seed, "to-mixed");
      for (const p of problems) {
        expect(p.direction).toBe("to-mixed");
        expect(p.fromNum).toBeDefined();
        expect(p.fromDen).toBeDefined();
        expect(p.toWhole).toBeDefined();
        expect(p.toNum).toBeDefined();
        expect(p.toDen).toBeDefined();
        // Check: whole * den + partNum = improperNum
        expect(p.toWhole! * p.toDen! + p.toNum!).toBe(p.fromNum!);
        expect(p.toDen).toBe(p.fromDen);
        // partNum < den
        expect(p.toNum!).toBeLessThan(p.toDen!);
        expect(p.toNum!).toBeGreaterThanOrEqual(1);
        expect(p.toWhole!).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("to-improper: whole + partNum/den => improperNum/den", () => {
    for (const seed of seeds) {
      const problems = generateFracConv(seed, "to-improper");
      for (const p of problems) {
        expect(p.direction).toBe("to-improper");
        expect(p.fromWhole).toBeDefined();
        expect(p.fromNum).toBeDefined();
        expect(p.fromDen).toBeDefined();
        expect(p.toNum).toBeDefined();
        expect(p.toDen).toBeDefined();
        // Check: whole * den + partNum = improperNum
        expect(p.fromWhole! * p.fromDen! + p.fromNum!).toBe(p.toNum!);
        expect(p.toDen).toBe(p.fromDen);
      }
    }
  });

  it("both mode produces both directions", () => {
    let hasToMixed = false;
    let hasToImproper = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateFracConv(seed, "both");
      for (const p of problems) {
        if (p.direction === "to-mixed") hasToMixed = true;
        if (p.direction === "to-improper") hasToImproper = true;
      }
    }
    expect(hasToMixed).toBe(true);
    expect(hasToImproper).toBe(true);
  });

  it("denominators are between 2 and 10", () => {
    for (const seed of seeds) {
      const problems = generateFracConv(seed, "both");
      for (const p of problems) {
        const den = p.fromDen ?? p.toDen!;
        expect(den).toBeGreaterThanOrEqual(2);
        expect(den).toBeLessThanOrEqual(10);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateFracConv(42, "both");
    const b = generateFracConv(42, "both");
    expect(a).toEqual(b);
  });
});
