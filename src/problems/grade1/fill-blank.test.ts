import { describe, it, expect } from "vitest";
import { generateFillBlank } from "./fill-blank";

const seeds = [1, 2, 42, 100, 999];

describe("generateFillBlank", () => {
  it("returns 12 problems", () => {
    const problems = generateFillBlank(42, 10, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("addition problems: left + right = result, blank filled correctly", () => {
    for (const seed of seeds) {
      const problems = generateFillBlank(seed, 20, "add");
      for (const p of problems) {
        expect(p.op).toBe("+");
        const left = p.left ?? p.answer;
        const right = p.right ?? p.answer;
        expect(left + right).toBe(p.result);
      }
    }
  });

  it("subtraction problems: left - right = result, blank filled correctly", () => {
    for (const seed of seeds) {
      const problems = generateFillBlank(seed, 20, "sub");
      for (const p of problems) {
        expect(p.op).toBe("−");
        const left = p.left ?? p.answer;
        const right = p.right ?? p.answer;
        expect(left - right).toBe(p.result);
      }
    }
  });

  it("mixed mode produces both add and sub", () => {
    let hasAdd = false;
    let hasSub = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateFillBlank(seed, 10, "mixed");
      for (const p of problems) {
        if (p.op === "+") hasAdd = true;
        if (p.op === "−") hasSub = true;
      }
    }
    expect(hasAdd).toBe(true);
    expect(hasSub).toBe(true);
  });

  it("exactly one of left/right is null (the blank)", () => {
    for (const seed of seeds) {
      const problems = generateFillBlank(seed, 10, "mixed");
      for (const p of problems) {
        const nullCount = (p.left === null ? 1 : 0) + (p.right === null ? 1 : 0);
        expect(nullCount).toBe(1);
      }
    }
  });

  it("all values are within range", () => {
    for (const seed of seeds) {
      const problems = generateFillBlank(seed, 10, "mixed");
      for (const p of problems) {
        const left = p.left ?? p.answer;
        const right = p.right ?? p.answer;
        expect(left).toBeGreaterThanOrEqual(1);
        expect(left).toBeLessThanOrEqual(10);
        expect(right).toBeGreaterThanOrEqual(1);
        expect(right).toBeLessThanOrEqual(10);
        expect(p.result).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateFillBlank(42, 10, "mixed");
    const b = generateFillBlank(42, 10, "mixed");
    expect(a).toEqual(b);
  });
});
