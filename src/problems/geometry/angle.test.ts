import { describe, it, expect } from "vitest";
import { generateAngle } from "./angle";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateAngle
// ---------------------------------------------------------------------------
describe("generateAngle", () => {
  it("returns 10 problems", () => {
    const problems = generateAngle(42);
    expect(problems).toHaveLength(10);
  });

  it("all answers are positive and at most 360", () => {
    for (const seed of seeds) {
      const problems = generateAngle(seed);
      for (const p of problems) {
        expect(p.answer).toBeGreaterThan(0);
        expect(p.answer).toBeLessThanOrEqual(360);
      }
    }
  });

  it("display contains degree symbols", () => {
    for (const seed of seeds) {
      const problems = generateAngle(seed);
      for (const p of problems) {
        expect(p.display).toContain("°");
      }
    }
  });

  it("answers are integers", () => {
    for (const seed of seeds) {
      const problems = generateAngle(seed);
      for (const p of problems) {
        expect(Number.isInteger(p.answer)).toBe(true);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateAngle(42);
    const b = generateAngle(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateAngle(1);
    const b = generateAngle(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
