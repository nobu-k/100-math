import { describe, it, expect } from "vitest";
import { generatePythagorean } from "./pythagorean";

const seeds = [1, 2, 42, 100, 999];

describe("generatePythagorean", () => {
  it("returns 6 problems", () => {
    const problems = generatePythagorean(42, "mixed");
    expect(problems).toHaveLength(6);
  });

  it("is deterministic with the same seed", () => {
    const a = generatePythagorean(42, "mixed");
    const b = generatePythagorean(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generatePythagorean(1, "mixed");
    const b = generatePythagorean(2, "mixed");
    const aAnswers = a.map((p) => p.answerDisplay);
    const bAnswers = b.map((p) => p.answerDisplay);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("each problem has non-empty question and answerDisplay", () => {
    for (const seed of seeds) {
      const problems = generatePythagorean(seed, "mixed");
      for (const p of problems) {
        expect(p.question.length).toBeGreaterThan(0);
        expect(p.answerDisplay.length).toBeGreaterThan(0);
      }
    }
  });

  it("each problem has a valid type", () => {
    const validTypes = ["basic", "special", "applied"];
    for (const seed of seeds) {
      const problems = generatePythagorean(seed, "mixed");
      for (const p of problems) {
        expect(validTypes).toContain(p.type);
      }
    }
  });

  it("basic mode only produces basic problems", () => {
    for (const seed of seeds) {
      const problems = generatePythagorean(seed, "basic");
      for (const p of problems) {
        expect(p.type).toBe("basic");
      }
    }
  });

  it("special mode only produces special problems", () => {
    for (const seed of seeds) {
      const problems = generatePythagorean(seed, "special");
      for (const p of problems) {
        expect(p.type).toBe("special");
      }
    }
  });

  it("applied mode only produces applied problems", () => {
    for (const seed of seeds) {
      const problems = generatePythagorean(seed, "applied");
      for (const p of problems) {
        expect(p.type).toBe("applied");
      }
    }
  });

  it("mixed mode produces multiple types", () => {
    const typesFound = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50, 100]) {
      const problems = generatePythagorean(seed, "mixed");
      for (const p of problems) {
        typesFound.add(p.type);
      }
    }
    expect(typesFound.size).toBeGreaterThanOrEqual(2);
  });

  it("answerDisplay contains numeric or root expressions", () => {
    for (const seed of seeds) {
      const problems = generatePythagorean(seed, "mixed");
      for (const p of problems) {
        // Answers should contain numbers (and possibly root symbols)
        expect(p.answerDisplay).toMatch(/[0-9]/);
      }
    }
  });

  it("basic problems mention right triangles in their questions", () => {
    for (const seed of seeds) {
      const problems = generatePythagorean(seed, "basic");
      for (const p of problems) {
        expect(p.question).toMatch(/直角三角形/);
      }
    }
  });
});
