import { describe, it, expect } from "vitest";
import { generateSampling } from "./sampling";

const seeds = [1, 2, 42, 100, 999];

describe("generateSampling", () => {
  it("returns 8 problems", () => {
    const problems = generateSampling(42, "mixed");
    expect(problems).toHaveLength(8);
  });

  it("is deterministic with the same seed", () => {
    const a = generateSampling(42, "mixed");
    const b = generateSampling(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateSampling(1, "mixed");
    const b = generateSampling(2, "mixed");
    const aAnswers = a.map((p) => p.answerDisplay);
    const bAnswers = b.map((p) => p.answerDisplay);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("each problem has non-empty question and answerDisplay", () => {
    for (const seed of seeds) {
      const problems = generateSampling(seed, "mixed");
      for (const p of problems) {
        expect(p.question.length).toBeGreaterThan(0);
        expect(p.answerDisplay.length).toBeGreaterThan(0);
      }
    }
  });

  it("each problem has a valid type", () => {
    for (const seed of seeds) {
      const problems = generateSampling(seed, "mixed");
      for (const p of problems) {
        expect(["concept", "estimation"]).toContain(p.type);
      }
    }
  });

  it("concept mode only produces concept problems", () => {
    for (const seed of seeds) {
      const problems = generateSampling(seed, "concept");
      for (const p of problems) {
        expect(p.type).toBe("concept");
      }
    }
  });

  it("estimation mode only produces estimation problems", () => {
    for (const seed of seeds) {
      const problems = generateSampling(seed, "estimation");
      for (const p of problems) {
        expect(p.type).toBe("estimation");
      }
    }
  });

  it("mixed mode produces both types", () => {
    let hasConcept = false;
    let hasEstimation = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50, 100, 200]) {
      const problems = generateSampling(seed, "mixed");
      for (const p of problems) {
        if (p.type === "concept") hasConcept = true;
        if (p.type === "estimation") hasEstimation = true;
      }
    }
    expect(hasConcept).toBe(true);
    expect(hasEstimation).toBe(true);
  });

  it("concept answers are either full survey or sample survey", () => {
    for (const seed of seeds) {
      const problems = generateSampling(seed, "concept");
      for (const p of problems) {
        expect(["全数調査", "標本調査"]).toContain(p.answer);
      }
    }
  });

  it("estimation answers are positive numbers", () => {
    for (const seed of seeds) {
      const problems = generateSampling(seed, "estimation");
      for (const p of problems) {
        expect(typeof p.answer).toBe("number");
        expect(p.answer as number).toBeGreaterThan(0);
      }
    }
  });

  it("estimation answerDisplay starts with approximate marker", () => {
    for (const seed of seeds) {
      const problems = generateSampling(seed, "estimation");
      for (const p of problems) {
        expect(p.answerDisplay).toMatch(/^約/);
      }
    }
  });

  it("concept questions mention survey types", () => {
    for (const seed of seeds) {
      const problems = generateSampling(seed, "concept");
      for (const p of problems) {
        expect(p.question).toMatch(/全数調査.*標本調査/);
      }
    }
  });
});
