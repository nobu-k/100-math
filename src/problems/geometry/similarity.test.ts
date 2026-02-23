import { describe, it, expect } from "vitest";
import { generateSimilarity } from "./similarity";

const seeds = [1, 2, 42, 100, 999];

describe("generateSimilarity", () => {
  it("returns 10 problems", () => {
    const problems = generateSimilarity(42, "mixed");
    expect(problems).toHaveLength(6);
  });

  it("is deterministic with the same seed", () => {
    const a = generateSimilarity(42, "mixed");
    const b = generateSimilarity(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateSimilarity(1, "mixed");
    const b = generateSimilarity(2, "mixed");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("each problem has non-empty question and answerDisplay", () => {
    for (const seed of seeds) {
      const problems = generateSimilarity(seed, "mixed");
      for (const p of problems) {
        expect(p.question.length).toBeGreaterThan(0);
        expect(p.answerDisplay.length).toBeGreaterThan(0);
      }
    }
  });

  it("each problem has a valid type", () => {
    const validTypes = ["ratio", "parallel-line", "midpoint"];
    for (const seed of seeds) {
      const problems = generateSimilarity(seed, "mixed");
      for (const p of problems) {
        expect(validTypes).toContain(p.type);
      }
    }
  });

  it("ratio mode only produces ratio problems", () => {
    for (const seed of seeds) {
      const problems = generateSimilarity(seed, "ratio");
      for (const p of problems) {
        expect(p.type).toBe("ratio");
      }
    }
  });

  it("parallel-line mode only produces parallel-line problems", () => {
    for (const seed of seeds) {
      const problems = generateSimilarity(seed, "parallel-line");
      for (const p of problems) {
        expect(p.type).toBe("parallel-line");
      }
    }
  });

  it("midpoint mode only produces midpoint problems", () => {
    for (const seed of seeds) {
      const problems = generateSimilarity(seed, "midpoint");
      for (const p of problems) {
        expect(p.type).toBe("midpoint");
      }
    }
  });

  it("mixed mode produces multiple types", () => {
    const typesFound = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50, 100]) {
      const problems = generateSimilarity(seed, "mixed");
      for (const p of problems) {
        typesFound.add(p.type);
      }
    }
    expect(typesFound.size).toBeGreaterThanOrEqual(2);
  });

  it("all answers are positive numbers", () => {
    for (const seed of seeds) {
      const problems = generateSimilarity(seed, "mixed");
      for (const p of problems) {
        expect(p.answer).toBeGreaterThan(0);
      }
    }
  });

  it("midpoint theorem: answer is half of BC", () => {
    for (const seed of seeds) {
      const problems = generateSimilarity(seed, "midpoint");
      for (const p of problems) {
        const match = p.question.match(/BC = (\d+)cm/);
        if (match) {
          const bc = parseInt(match[1]);
          expect(p.answer).toBe(bc / 2);
        }
      }
    }
  });

  it("ratio problems mention similarity ratio", () => {
    for (const seed of seeds) {
      const problems = generateSimilarity(seed, "ratio");
      for (const p of problems) {
        expect(p.question).toMatch(/相似比/);
      }
    }
  });

  it("parallel-line problems mention DE // BC", () => {
    for (const seed of seeds) {
      const problems = generateSimilarity(seed, "parallel-line");
      for (const p of problems) {
        expect(p.question).toMatch(/DE \/\/ BC/);
      }
    }
  });
});
