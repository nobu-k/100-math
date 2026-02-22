import { describe, it, expect } from "vitest";
import { generateLargeNum4 } from "./large-num4";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateLargeNum4
// ---------------------------------------------------------------------------
describe("generateLargeNum4", () => {
  it("returns 10 problems", () => {
    const problems = generateLargeNum4(42, "read");
    expect(problems).toHaveLength(10);
  });

  it("read mode: questions or answers involve 億 or 兆", () => {
    for (const seed of seeds) {
      const problems = generateLargeNum4(seed, "read");
      for (const p of problems) {
        const hasLargeUnit =
          p.question.includes("億") ||
          p.question.includes("兆") ||
          p.answer.includes("億") ||
          p.answer.includes("兆");
        expect(hasLargeUnit).toBe(true);
      }
    }
  });

  it("position mode: questions ask about unit counts", () => {
    for (const seed of seeds) {
      const problems = generateLargeNum4(seed, "position");
      for (const p of problems) {
        expect(p.question).toContain("が□個");
        const ans = Number(p.answer);
        expect(Number.isInteger(ans)).toBe(true);
        expect(ans).toBeGreaterThanOrEqual(1);
        expect(ans).toBeLessThanOrEqual(9);
      }
    }
  });

  it("mixed mode produces both read and position types", () => {
    let hasRead = false;
    let hasPosition = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateLargeNum4(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("が□個")) hasPosition = true;
        else hasRead = true;
      }
    }
    expect(hasRead).toBe(true);
    expect(hasPosition).toBe(true);
  });

  it("answers are valid non-empty strings", () => {
    for (const seed of seeds) {
      for (const mode of ["read", "position", "mixed"] as const) {
        const problems = generateLargeNum4(seed, mode);
        for (const p of problems) {
          expect(p.answer.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateLargeNum4(42, "mixed");
    const b = generateLargeNum4(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateLargeNum4(1, "read");
    const b = generateLargeNum4(2, "read");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
