import { describe, it, expect } from "vitest";
import { generateSimEq } from "./simultaneous-eq";

const seeds = [1, 2, 42, 100, 999];

describe("generateSimEq", () => {
  it("returns 12 problems", () => {
    const problems = generateSimEq(42, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("is deterministic with the same seed", () => {
    const a = generateSimEq(42, "mixed");
    const b = generateSimEq(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateSimEq(1, "mixed");
    const b = generateSimEq(2, "mixed");
    const aAnswers = a.map((p) => `${p.answerX},${p.answerY}`);
    const bAnswers = b.map((p) => `${p.answerX},${p.answerY}`);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("answerX is in range -5 to 5", () => {
    for (const seed of seeds) {
      const problems = generateSimEq(seed, "mixed");
      for (const p of problems) {
        expect(p.answerX).toBeGreaterThanOrEqual(-5);
        expect(p.answerX).toBeLessThanOrEqual(5);
      }
    }
  });

  it("answerY is in range -5 to 5", () => {
    for (const seed of seeds) {
      const problems = generateSimEq(seed, "mixed");
      for (const p of problems) {
        expect(p.answerY).toBeGreaterThanOrEqual(-5);
        expect(p.answerY).toBeLessThanOrEqual(5);
      }
    }
  });

  it("substitution mode produces at least one 'y =' form equation", () => {
    for (const seed of seeds) {
      const problems = generateSimEq(seed, "substitution");
      for (const p of problems) {
        const hasYEquals = p.eq1.startsWith("y =") || p.eq2.startsWith("y =");
        expect(hasYEquals).toBe(true);
      }
    }
  });

  it("addition mode produces standard form equations with '='", () => {
    for (const seed of seeds) {
      const problems = generateSimEq(seed, "addition");
      for (const p of problems) {
        expect(p.eq1).toContain("=");
        expect(p.eq2).toContain("=");
      }
    }
  });

  it("mixed mode produces problems with varied equation forms", () => {
    let hasSubstitution = false;
    let hasAddition = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateSimEq(seed, "mixed");
      for (const p of problems) {
        if (p.eq1.startsWith("y =")) hasSubstitution = true;
        else hasAddition = true;
      }
    }
    expect(hasSubstitution).toBe(true);
    expect(hasAddition).toBe(true);
  });

  it("every problem has non-empty eq1 and eq2", () => {
    for (const seed of seeds) {
      const problems = generateSimEq(seed, "mixed");
      for (const p of problems) {
        expect(p.eq1.length).toBeGreaterThan(0);
        expect(p.eq2.length).toBeGreaterThan(0);
      }
    }
  });

  it("answerX and answerY are integers", () => {
    for (const seed of seeds) {
      const problems = generateSimEq(seed, "mixed");
      for (const p of problems) {
        expect(Number.isInteger(p.answerX)).toBe(true);
        expect(Number.isInteger(p.answerY)).toBe(true);
      }
    }
  });
});
