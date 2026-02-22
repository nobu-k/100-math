import { describe, it, expect } from "vitest";
import { generateMushikui } from "./mushikui";

const seeds = [1, 2, 42, 100, 999];

describe("generateMushikui", () => {
  it("returns 12 problems", () => {
    const problems = generateMushikui(42, 100, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("addition problems: left + right = result, answer fills blank correctly", () => {
    for (const seed of seeds) {
      const problems = generateMushikui(seed, 100, "add");
      for (const p of problems) {
        expect(p.op).toBe("+");
        const left = p.left ?? p.answer;
        const right = p.right ?? p.answer;
        const result = p.result ?? p.answer;
        expect(left + right).toBe(result);
      }
    }
  });

  it("subtraction problems: left - right = result, answer fills blank correctly", () => {
    for (const seed of seeds) {
      const problems = generateMushikui(seed, 100, "sub");
      for (const p of problems) {
        expect(p.op).toBe("−");
        const left = p.left ?? p.answer;
        const right = p.right ?? p.answer;
        const result = p.result ?? p.answer;
        expect(left - right).toBe(result);
      }
    }
  });

  it("exactly one of left/right/result is null (the blank)", () => {
    for (const seed of seeds) {
      const problems = generateMushikui(seed, 100, "mixed");
      for (const p of problems) {
        const nullCount =
          (p.left === null ? 1 : 0) +
          (p.right === null ? 1 : 0) +
          (p.result === null ? 1 : 0);
        expect(nullCount).toBe(1);
      }
    }
  });

  it("mixed mode produces both add and sub", () => {
    let hasAdd = false;
    let hasSub = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateMushikui(seed, 100, "mixed");
      for (const p of problems) {
        if (p.op === "+") hasAdd = true;
        if (p.op === "−") hasSub = true;
      }
    }
    expect(hasAdd).toBe(true);
    expect(hasSub).toBe(true);
  });

  it("add mode: all ops are +", () => {
    for (const seed of seeds) {
      const problems = generateMushikui(seed, 100, "add");
      for (const p of problems) {
        expect(p.op).toBe("+");
      }
    }
  });

  it("sub mode: all ops are −", () => {
    for (const seed of seeds) {
      const problems = generateMushikui(seed, 100, "sub");
      for (const p of problems) {
        expect(p.op).toBe("−");
      }
    }
  });

  it("all non-null values are positive", () => {
    for (const seed of seeds) {
      const problems = generateMushikui(seed, 100, "mixed");
      for (const p of problems) {
        if (p.left !== null) expect(p.left).toBeGreaterThanOrEqual(1);
        if (p.right !== null) expect(p.right).toBeGreaterThanOrEqual(1);
        if (p.result !== null) expect(p.result).toBeGreaterThanOrEqual(0);
        expect(p.answer).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateMushikui(42, 100, "mixed");
    const b = generateMushikui(42, 100, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateMushikui(1, 100, "mixed");
    const b = generateMushikui(2, 100, "mixed");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
