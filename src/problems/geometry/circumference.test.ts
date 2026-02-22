import { describe, it, expect } from "vitest";
import { generateCircumference } from "./circumference";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateCircumference
// ---------------------------------------------------------------------------
describe("generateCircumference", () => {
  it("returns 10 problems", () => {
    const problems = generateCircumference(42, "forward");
    expect(problems).toHaveLength(10);
  });

  it("forward: circumference = diameter * 3.14", () => {
    for (const seed of seeds) {
      const problems = generateCircumference(seed, "forward");
      for (const p of problems) {
        expect(p.question).toContain("円周は");
        const match = p.question.match(/直径(\d+)cm/);
        expect(match).not.toBeNull();
        const d = Number(match![1]);
        const expected = Number((d * 3.14).toFixed(2)).toString();
        expect(p.answer).toBe(`${expected}cm`);
      }
    }
  });

  it("reverse: diameter = circumference / 3.14", () => {
    for (const seed of seeds) {
      const problems = generateCircumference(seed, "reverse");
      for (const p of problems) {
        expect(p.question).toContain("直径は");
        const match = p.question.match(/円周が([\d.]+)cm/);
        expect(match).not.toBeNull();
        const circ = Number(match![1]);
        const dAnswer = p.answer.match(/(\d+)cm/);
        expect(dAnswer).not.toBeNull();
        const d = Number(dAnswer![1]);
        // Verify: d * 3.14 should equal the circumference
        const expectedCirc = Number((d * 3.14).toFixed(2)).toString();
        expect(String(circ)).toBe(expectedCirc);
      }
    }
  });

  it("forward: diameter is between 1 and 20", () => {
    for (const seed of seeds) {
      const problems = generateCircumference(seed, "forward");
      for (const p of problems) {
        const match = p.question.match(/直径(\d+)cm/);
        const d = Number(match![1]);
        expect(d).toBeGreaterThanOrEqual(1);
        expect(d).toBeLessThanOrEqual(20);
      }
    }
  });

  it("reverse: diameter is between 2 and 21", () => {
    for (const seed of seeds) {
      const problems = generateCircumference(seed, "reverse");
      for (const p of problems) {
        const dMatch = p.answer.match(/(\d+)cm/);
        const d = Number(dMatch![1]);
        expect(d).toBeGreaterThanOrEqual(2);
        expect(d).toBeLessThanOrEqual(21);
      }
    }
  });

  it("mixed mode produces both forward and reverse types", () => {
    let hasForward = false;
    let hasReverse = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateCircumference(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("円周は")) hasForward = true;
        if (p.question.includes("直径は")) hasReverse = true;
      }
    }
    expect(hasForward).toBe(true);
    expect(hasReverse).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateCircumference(42, "mixed");
    const b = generateCircumference(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateCircumference(1, "forward");
    const b = generateCircumference(2, "forward");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
