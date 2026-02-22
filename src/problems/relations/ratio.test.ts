import { describe, it, expect } from "vitest";
import { generateRatio } from "./ratio";
import { gcd } from "../shared/math-utils";

const seeds = [1, 2, 42, 100, 999];

describe("generateRatio", () => {
  it("returns 12 problems", () => {
    const problems = generateRatio(42, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("simplify mode: answer is the simplified ratio", () => {
    for (const seed of seeds) {
      const problems = generateRatio(seed, "simplify");
      for (const p of problems) {
        expect(p.question).toContain("最も簡単な整数の比");
        // Parse the answer "a：b"
        const [aStr, bStr] = p.answer.split("：");
        const a = Number(aStr);
        const b = Number(bStr);
        expect(gcd(a, b)).toBe(1);
      }
    }
  });

  it("fill mode: answer is a number (the blank)", () => {
    for (const seed of seeds) {
      const problems = generateRatio(seed, "fill");
      for (const p of problems) {
        expect(p.question).toContain("□");
        const ans = Number(p.answer);
        expect(Number.isInteger(ans)).toBe(true);
        expect(ans).toBeGreaterThan(0);
      }
    }
  });

  it("mixed mode produces both simplify and fill types", () => {
    let hasSimplify = false;
    let hasFill = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateRatio(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("最も簡単な整数の比")) hasSimplify = true;
        if (p.question.includes("□")) hasFill = true;
      }
    }
    expect(hasSimplify).toBe(true);
    expect(hasFill).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateRatio(42, "mixed");
    const b = generateRatio(42, "mixed");
    expect(a).toEqual(b);
  });
});
