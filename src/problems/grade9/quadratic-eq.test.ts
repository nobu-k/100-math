import { describe, it, expect } from "vitest";
import { generateQuadEq } from "./quadratic-eq";

const seeds = [1, 2, 42, 100, 999];

describe("generateQuadEq", () => {
  it("returns 12 problems", () => {
    const problems = generateQuadEq(42, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("is deterministic with the same seed", () => {
    const a = generateQuadEq(42, "mixed");
    const b = generateQuadEq(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateQuadEq(1, "mixed");
    const b = generateQuadEq(2, "mixed");
    const aAnswers = a.map((p) => p.answerDisplay);
    const bAnswers = b.map((p) => p.answerDisplay);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("each problem has non-empty equation, solutions, and answerDisplay", () => {
    for (const seed of seeds) {
      const problems = generateQuadEq(seed, "mixed");
      for (const p of problems) {
        expect(p.equation.length).toBeGreaterThan(0);
        expect(p.solutions.length).toBeGreaterThan(0);
        expect(p.answerDisplay.length).toBeGreaterThan(0);
      }
    }
  });

  it("each problem has a valid type", () => {
    for (const seed of seeds) {
      const problems = generateQuadEq(seed, "mixed");
      for (const p of problems) {
        expect(["factoring", "formula"]).toContain(p.type);
      }
    }
  });

  it("factoring mode only produces factoring type", () => {
    for (const seed of seeds) {
      const problems = generateQuadEq(seed, "factoring");
      for (const p of problems) {
        expect(p.type).toBe("factoring");
      }
    }
  });

  it("formula mode only produces formula type", () => {
    for (const seed of seeds) {
      const problems = generateQuadEq(seed, "formula");
      for (const p of problems) {
        expect(p.type).toBe("formula");
      }
    }
  });

  it("mixed mode produces both types", () => {
    let hasFactoring = false;
    let hasFormula = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50, 100, 200]) {
      const problems = generateQuadEq(seed, "mixed");
      for (const p of problems) {
        if (p.type === "factoring") hasFactoring = true;
        if (p.type === "formula") hasFormula = true;
      }
    }
    expect(hasFactoring).toBe(true);
    expect(hasFormula).toBe(true);
  });

  it("equation contains = sign", () => {
    for (const seed of seeds) {
      const problems = generateQuadEq(seed, "mixed");
      for (const p of problems) {
        expect(p.equation).toContain("=");
      }
    }
  });

  it("answerDisplay starts with x =", () => {
    for (const seed of seeds) {
      const problems = generateQuadEq(seed, "mixed");
      for (const p of problems) {
        expect(p.answerDisplay).toMatch(/^x = /);
      }
    }
  });

  it("equation contains x squared term", () => {
    for (const seed of seeds) {
      const problems = generateQuadEq(seed, "mixed");
      for (const p of problems) {
        expect(p.equation).toMatch(/x²/);
      }
    }
  });
});
