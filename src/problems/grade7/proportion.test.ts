import { describe, it, expect } from "vitest";
import { generateProportion } from "./proportion";

const seeds = [1, 2, 42, 100, 999];

describe("generateProportion", () => {
  it("returns 10 problems", () => {
    const problems = generateProportion(42, "mixed");
    expect(problems).toHaveLength(10);
  });

  it("defaults to mixed mode and mixed task", () => {
    const a = generateProportion(42);
    const b = generateProportion(42, "mixed", "mixed");
    expect(a).toEqual(b);
  });

  it("is deterministic with the same seed", () => {
    const a = generateProportion(42, "mixed");
    const b = generateProportion(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateProportion(1, "mixed");
    const b = generateProportion(2, "mixed");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("direct mode: all problems have type direct", () => {
    for (const seed of seeds) {
      const problems = generateProportion(seed, "direct");
      for (const p of problems) {
        expect(p.type).toBe("direct");
      }
    }
  });

  it("inverse mode: all problems have type inverse", () => {
    for (const seed of seeds) {
      const problems = generateProportion(seed, "inverse");
      for (const p of problems) {
        expect(p.type).toBe("inverse");
      }
    }
  });

  it("mixed mode produces both direct and inverse problems", () => {
    let hasDirect = false;
    let hasInverse = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateProportion(seed, "mixed");
      for (const p of problems) {
        if (p.type === "direct") hasDirect = true;
        if (p.type === "inverse") hasInverse = true;
      }
    }
    expect(hasDirect).toBe(true);
    expect(hasInverse).toBe(true);
  });

  it("find-formula task: answer equals the proportionality constant", () => {
    for (const seed of seeds) {
      const problems = generateProportion(seed, "direct", "find-formula");
      for (const p of problems) {
        expect(p.task).toBe("find-formula");
        expect(p.answer).toBe(p.constant);
      }
    }
  });

  it("find-value task for direct: answer equals constant * evalX", () => {
    for (const seed of seeds) {
      const problems = generateProportion(seed, "direct", "find-value");
      for (const p of problems) {
        expect(p.task).toBe("find-value");
        expect(p.answer).toBe(p.constant * p.evalX!);
      }
    }
  });

  it("direct: given y = a * givenX for find-formula problems", () => {
    for (const seed of seeds) {
      const problems = generateProportion(seed, "direct", "find-formula");
      for (const p of problems) {
        expect(p.givenY).toBe(p.constant * p.givenX!);
      }
    }
  });

  it("inverse find-formula: answer equals constant", () => {
    for (const seed of seeds) {
      const problems = generateProportion(seed, "inverse", "find-formula");
      for (const p of problems) {
        expect(p.task).toBe("find-formula");
        expect(p.answer).toBe(p.constant);
      }
    }
  });

  it("constant is a nonzero integer", () => {
    for (const seed of seeds) {
      const problems = generateProportion(seed, "mixed");
      for (const p of problems) {
        expect(p.constant).not.toBe(0);
        expect(Number.isInteger(p.constant)).toBe(true);
      }
    }
  });

  it("each problem has question and answerDisplay strings", () => {
    for (const seed of seeds) {
      const problems = generateProportion(seed, "mixed");
      for (const p of problems) {
        expect(typeof p.question).toBe("string");
        expect(p.question.length).toBeGreaterThan(0);
        expect(typeof p.answerDisplay).toBe("string");
        expect(p.answerDisplay.length).toBeGreaterThan(0);
      }
    }
  });
});
