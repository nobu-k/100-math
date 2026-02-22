import { describe, it, expect } from "vitest";
import { generateParallelAngle } from "./parallel-angle";

const seeds = [1, 2, 42, 100, 999];

describe("generateParallelAngle", () => {
  it("returns 10 problems", () => {
    const problems = generateParallelAngle(42, "mixed");
    expect(problems).toHaveLength(10);
  });

  it("is deterministic with the same seed", () => {
    const a = generateParallelAngle(42, "mixed");
    const b = generateParallelAngle(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateParallelAngle(1, "mixed");
    const b = generateParallelAngle(2, "mixed");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("vertical mode only produces vertical problems", () => {
    for (const seed of seeds) {
      const problems = generateParallelAngle(seed, "vertical");
      for (const p of problems) {
        expect(p.type).toBe("vertical");
      }
    }
  });

  it("corresponding mode only produces corresponding problems", () => {
    for (const seed of seeds) {
      const problems = generateParallelAngle(seed, "corresponding");
      for (const p of problems) {
        expect(p.type).toBe("corresponding");
      }
    }
  });

  it("alternate mode only produces alternate problems", () => {
    for (const seed of seeds) {
      const problems = generateParallelAngle(seed, "alternate");
      for (const p of problems) {
        expect(p.type).toBe("alternate");
      }
    }
  });

  it("mixed mode produces multiple types", () => {
    const typesSeen = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateParallelAngle(seed, "mixed");
      for (const p of problems) {
        typesSeen.add(p.type);
      }
    }
    expect(typesSeen.size).toBeGreaterThanOrEqual(2);
  });

  it("givenAngle is between 30 and 150", () => {
    for (const seed of seeds) {
      const problems = generateParallelAngle(seed, "mixed");
      for (const p of problems) {
        expect(p.givenAngle).toBeGreaterThanOrEqual(30);
        expect(p.givenAngle).toBeLessThanOrEqual(150);
      }
    }
  });

  it("answer is a positive integer no greater than 180", () => {
    for (const seed of seeds) {
      const problems = generateParallelAngle(seed, "mixed");
      for (const p of problems) {
        expect(p.answer).toBeGreaterThan(0);
        expect(p.answer).toBeLessThanOrEqual(180);
        expect(Number.isInteger(p.answer)).toBe(true);
      }
    }
  });

  it("vertical angles equal the given angle", () => {
    for (const seed of seeds) {
      const problems = generateParallelAngle(seed, "vertical");
      for (const p of problems) {
        expect(p.answer).toBe(p.givenAngle);
      }
    }
  });

  it("answerDisplay ends with degree symbol", () => {
    for (const seed of seeds) {
      const problems = generateParallelAngle(seed, "mixed");
      for (const p of problems) {
        expect(p.answerDisplay).toMatch(/°$/);
      }
    }
  });
});
