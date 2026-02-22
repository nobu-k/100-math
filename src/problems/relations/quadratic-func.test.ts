import { describe, it, expect } from "vitest";
import { generateQuadFunc } from "./quadratic-func";

const seeds = [1, 2, 42, 100, 999];

describe("generateQuadFunc", () => {
  it("returns 10 problems", () => {
    const problems = generateQuadFunc(42, "mixed");
    expect(problems).toHaveLength(10);
  });

  it("is deterministic with the same seed", () => {
    const a = generateQuadFunc(42, "mixed");
    const b = generateQuadFunc(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateQuadFunc(1, "mixed");
    const b = generateQuadFunc(2, "mixed");
    const aAnswers = a.map((p) => p.answerDisplay);
    const bAnswers = b.map((p) => p.answerDisplay);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("each problem has non-empty question and answerDisplay", () => {
    for (const seed of seeds) {
      const problems = generateQuadFunc(seed, "mixed");
      for (const p of problems) {
        expect(p.question.length).toBeGreaterThan(0);
        expect(p.answerDisplay.length).toBeGreaterThan(0);
      }
    }
  });

  it("each problem has a valid type", () => {
    const validTypes = ["value", "rate-of-change", "graph"];
    for (const seed of seeds) {
      const problems = generateQuadFunc(seed, "mixed");
      for (const p of problems) {
        expect(validTypes).toContain(p.type);
      }
    }
  });

  it("value mode only produces value problems", () => {
    for (const seed of seeds) {
      const problems = generateQuadFunc(seed, "value");
      for (const p of problems) {
        expect(p.type).toBe("value");
      }
    }
  });

  it("rate-of-change mode only produces rate-of-change problems", () => {
    for (const seed of seeds) {
      const problems = generateQuadFunc(seed, "rate-of-change");
      for (const p of problems) {
        expect(p.type).toBe("rate-of-change");
      }
    }
  });

  it("graph mode only produces graph problems", () => {
    for (const seed of seeds) {
      const problems = generateQuadFunc(seed, "graph");
      for (const p of problems) {
        expect(p.type).toBe("graph");
      }
    }
  });

  it("mixed mode produces multiple types", () => {
    const typesFound = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50, 100]) {
      const problems = generateQuadFunc(seed, "mixed");
      for (const p of problems) {
        typesFound.add(p.type);
      }
    }
    expect(typesFound.size).toBeGreaterThanOrEqual(2);
  });

  it("value problems reference y = ax² or y = x²", () => {
    for (const seed of seeds) {
      const problems = generateQuadFunc(seed, "value");
      for (const p of problems) {
        expect(p.question).toMatch(/x²/);
      }
    }
  });

  it("rate-of-change problems ask about change rate", () => {
    for (const seed of seeds) {
      const problems = generateQuadFunc(seed, "rate-of-change");
      for (const p of problems) {
        expect(p.question).toMatch(/変化の割合/);
      }
    }
  });

  it("rate-of-change answers are integers", () => {
    for (const seed of seeds) {
      const problems = generateQuadFunc(seed, "rate-of-change");
      for (const p of problems) {
        expect(Number.isInteger(p.answer)).toBe(true);
      }
    }
  });
});
