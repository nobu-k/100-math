import { describe, it, expect } from "vitest";
import { generateLiteralExpr } from "./literal-expr";

const seeds = [1, 2, 42, 100, 999];

describe("generateLiteralExpr", () => {
  it("returns 10 problems", () => {
    const problems = generateLiteralExpr(42);
    expect(problems).toHaveLength(10);
  });

  it("is deterministic with the same seed", () => {
    const a = generateLiteralExpr(42);
    const b = generateLiteralExpr(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateLiteralExpr(1);
    const b = generateLiteralExpr(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("answer is a non-negative integer", () => {
    for (const seed of seeds) {
      const problems = generateLiteralExpr(seed);
      for (const p of problems) {
        const ans = Number(p.answer);
        expect(Number.isFinite(ans)).toBe(true);
        expect(Number.isInteger(ans)).toBe(true);
        expect(ans).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("question contains variable assignment and expression", () => {
    for (const seed of seeds) {
      const problems = generateLiteralExpr(seed);
      for (const p of problems) {
        expect(p.question).toContain("のとき、");
        expect(p.question).toContain("の値は？");
      }
    }
  });
});
